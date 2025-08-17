import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import redis
from ..utils.email_utils import send_notification_email
import os


redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

class AdminManageReservationAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        admin_user_id = user_info.get('user_id')
        reservation_id = request.data.get("reservation_id")
        action = request.data.get("action")
        new_data = request.data.get("new_data", {})

        if not all([reservation_id, action]):
            return Response({"error": "reservation_id and action are required"}, status=400)

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER'),
                password=os.environ.get('DB_PASSWORD'),
                database=os.environ.get('DB_NAME'),
                port=int(os.environ.get('DB_PORT')),
                cursorclass=MySQLdb.cursors.DictCursor
            )
            cursor = conn.cursor(MySQLdb.cursors.DictCursor)
            conn.begin()

            cursor.execute("SELECT user_type FROM User WHERE user_id = %s", (admin_user_id,))
            result = cursor.fetchone()
            if not result or result['user_type'] != 'ADMIN':
                conn.rollback()
                return Response({"error": "Only admins can perform this action"}, status=403)

            cursor.execute("SELECT status, user_id, ticket_id FROM Reservation WHERE reservation_id = %s FOR UPDATE", (reservation_id,))
            reservation = cursor.fetchone()
            if not reservation:
                conn.rollback()
                return Response({"error": "Reservation not found"}, status=404)

            current_status = reservation['status']
            user_id = reservation['user_id']
            ticket_id = reservation['ticket_id']
            next_status = current_status
            
            email_info = {}

            # ACTION: Approve a user's cancellation request
            if action == "approve_cancellation":
                if current_status != 'cancellation_pending':
                    conn.rollback()
                    return Response({"error": "This reservation is not pending cancellation."}, status=400)
                
                query = """
                    SELECT 
                        tr.departure_time, p.amount, t.travel_id, u.email,
                        dep_city.city_name AS departure_city,
                        dest_city.city_name AS destination_city
                    FROM Reservation r
                    JOIN Ticket t ON r.ticket_id = t.ticket_id
                    JOIN Travel tr ON t.travel_id = tr.travel_id
                    LEFT JOIN Payment p ON r.reservation_id = p.reservation_id
                    JOIN User u ON r.user_id = u.user_id
                    LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                    LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                    LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                    LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                    WHERE r.reservation_id = %s
                """
                cursor.execute(query, (reservation_id,))
                travel_info = cursor.fetchone()
                
                if not travel_info:
                    conn.rollback()
                    return Response({"error": "Associated travel record not found for this reservation."}, status=404)

                if travel_info.get("amount") is None:
                    conn.rollback()
                    return Response({"error": "Cannot approve cancellation: Payment record for this reservation is missing."}, status=409)

                travel_id = travel_info['travel_id']
                departure_time, amount_paid = travel_info["departure_time"], travel_info["amount"]
                remaining_time = departure_time - datetime.now()

                if remaining_time <= timedelta(hours=1): penalty_percent = 90
                elif remaining_time <= timedelta(hours=3): penalty_percent = 50
                else: penalty_percent = 10
                
                penalty_amount = round(float(amount_paid) * penalty_percent / 100)
                refund_amount = float(amount_paid) - penalty_amount

                cursor.execute("UPDATE User SET wallet = wallet + %s WHERE user_id = %s", (refund_amount, user_id))
                cursor.execute("UPDATE Payment SET payment_status = 'refunded' WHERE reservation_id = %s", (reservation_id,))
                cursor.execute("UPDATE Reservation SET status = 'canceled' WHERE reservation_id = %s", (reservation_id,))
                cursor.execute("UPDATE Travel SET remaining_capacity = remaining_capacity + 1 WHERE travel_id = %s", (travel_id,))
                next_status = 'canceled'
                
                email_info = {
                    "to_email": travel_info["email"],
                    "subject": "Cancellation Request Approved",
                    "title": "Cancellation Approved",
                    "message": f"Your request to cancel reservation #{reservation_id} has been approved. An amount of ${refund_amount:,.2f} has been refunded to your wallet.",
                    "details": {
                        "Trip": f"{travel_info['departure_city']} to {travel_info['destination_city']}",
                        "Original Amount": f"${float(amount_paid):,.2f}",
                        "Penalty": f"${penalty_amount:,.2f}",
                        "Refunded Amount": f"${refund_amount:,.2f}"
                    }
                }
                
            # ACTION: Reject a user's cancellation request
            elif action == "reject_cancellation":
                if current_status != 'cancellation_pending':
                    conn.rollback()
                    return Response({"error": "This reservation is not pending cancellation."}, status=400)
                
                cursor.execute("UPDATE Reservation SET status = 'paid' WHERE reservation_id = %s", (reservation_id,))
                next_status = 'paid'

                query = """
                    SELECT u.email, dep_city.city_name AS departure_city, dest_city.city_name AS destination_city
                    FROM Reservation r
                    JOIN User u ON r.user_id = u.user_id
                    JOIN Ticket t ON r.ticket_id = t.ticket_id
                    JOIN Travel tr ON t.travel_id = tr.travel_id
                    LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                    LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                    LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                    LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                    WHERE r.reservation_id = %s
                """
                cursor.execute(query, (reservation_id,))
                user_info_for_email = cursor.fetchone()

                email_info = {
                    "to_email": user_info_for_email["email"],
                    "subject": "Cancellation Request Rejected",
                    "title": "Cancellation Rejected",
                    "message": f"Your request to cancel reservation #{reservation_id} has been rejected. Your booking remains active.",
                    "details": {
                        "Trip": f"{user_info_for_email['departure_city']} to {user_info_for_email['destination_city']}"
                    }
                }

            else:
                conn.rollback()
                return Response({"error": "Invalid action specified for this endpoint."}, status=400)
            
            if current_status != next_status:
                cursor.execute("INSERT INTO ReservationChange (reservation_id, support_id, prev_status, next_status) VALUES (%s, %s, %s, %s)", (reservation_id, admin_user_id, current_status, next_status))

            conn.commit()
            
            # Send email after successful commit
            if email_info:
                try:
                    send_notification_email(**email_info)
                except Exception as e:
                    # Log the email error but don't fail the whole request
                    print(f"Failed to send notification email for reservation {reservation_id}: {e}")
            
            return Response({"message": f"Action '{action}' performed successfully."})

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            print(e)
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            print(e)
            if conn: conn.rollback()
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()