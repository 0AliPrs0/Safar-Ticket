import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import redis

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
                host="db",
                user="root",
                password="Aliprs2005",
                database="safarticket",
                port=3306,
                use_unicode=True
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

            # ACTION: Approve a 'reserved' ticket
            if action == "approve":
                if current_status != 'reserved':
                    conn.rollback()
                    return Response({"error": "Only reserved reservations can be approved"}, status=400)
                
                cursor.execute("UPDATE Reservation SET status = 'paid' WHERE reservation_id = %s", (reservation_id,))
                next_status = 'paid'

            # ACTION: Admin directly cancels a reservation (paid or reserved)
            elif action == "cancel":
                if current_status == 'canceled':
                    conn.rollback()
                    return Response({"error": "Reservation is already canceled"}, status=400)

                cursor.execute("SELECT travel_id FROM Ticket WHERE ticket_id = %s", (ticket_id,))
                travel_id = cursor.fetchone()['travel_id']

                if current_status == 'paid':
                    # Full refund logic as before
                    cursor.execute("SELECT tr.departure_time, p.amount FROM Travel tr LEFT JOIN Payment p ON p.reservation_id = %s WHERE tr.travel_id = %s", (reservation_id, travel_id))
                    travel_info = cursor.fetchone()
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

            # ACTION: Approve a user's cancellation request
            elif action == "approve_cancellation":
                if current_status != 'cancellation_pending':
                    conn.rollback()
                    return Response({"error": "This reservation is not pending cancellation."}, status=400)
                
                # The logic is identical to a direct admin cancellation of a 'paid' ticket
                cursor.execute("SELECT travel_id FROM Ticket WHERE ticket_id = %s", (ticket_id,))
                travel_id = cursor.fetchone()['travel_id']

                cursor.execute("SELECT tr.departure_time, p.amount FROM Travel tr JOIN Payment p ON p.reservation_id = %s WHERE tr.travel_id = %s", (reservation_id, travel_id))
                travel_info = cursor.fetchone()
                
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
                
            # ACTION: Reject a user's cancellation request
            elif action == "reject_cancellation":
                if current_status != 'cancellation_pending':
                    conn.rollback()
                    return Response({"error": "This reservation is not pending cancellation."}, status=400)
                cursor.execute("UPDATE Reservation SET status = 'paid' WHERE reservation_id = %s", (reservation_id,))
                next_status = 'paid'

            # ACTION: Modify expiration time (from your original code)
            elif action == "modify":
                if "expiration_time" not in new_data:
                    conn.rollback()
                    return Response({"error": "Only 'expiration_time' can be modified"}, status=400)
                try:
                    expiration_time = datetime.fromisoformat(new_data["expiration_time"])
                except ValueError:
                    conn.rollback()
                    return Response({"error": "Invalid expiration_time format."}, status=400)
                
                cursor.execute("UPDATE Reservation SET expiration_time = %s WHERE reservation_id = %s", (expiration_time, reservation_id))
                next_status = current_status

            else:
                conn.rollback()
                return Response({"error": "Invalid action specified."}, status=400)
            
            if current_status != next_status:
                cursor.execute("INSERT INTO ReservationChange (reservation_id, support_id, prev_status, next_status) VALUES (%s, %s, %s, %s)", (reservation_id, admin_user_id, current_status, next_status))

            conn.commit()
            return Response({"message": f"Action '{action}' performed successfully."})

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            print(e)
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        except Exception as e:
            if conn: conn.rollback()
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()