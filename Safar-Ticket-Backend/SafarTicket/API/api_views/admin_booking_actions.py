import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
import datetime
from ..utils.email_utils import send_notification_email

class AdminBookingActionsAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Permission denied."}, status=403)

        admin_user_id = user_info.get('user_id')
        reservation_id = request.data.get("reservation_id")
        action = request.data.get("action")

        if not all([reservation_id, action]):
            return Response({"error": "reservation_id and action are required"}, status=400)

        conn = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306,
                charset='utf8mb4',
                cursorclass=MySQLdb.cursors.DictCursor,
                use_unicode=True
            )
            cursor = conn.cursor()
            conn.begin()

            cursor.execute("SELECT status, ticket_id, user_id FROM Reservation WHERE reservation_id = %s FOR UPDATE", (reservation_id,))
            reservation = cursor.fetchone()
            if not reservation:
                conn.rollback()
                return Response({"error": "Reservation not found"}, status=404)

            current_status = reservation['status']
            ticket_id = reservation['ticket_id']
            user_id = reservation['user_id']
            next_status = None
            email_info = {}

            if (action == "mark_as_paid" and current_status == 'canceled') or \
               (action == "approve_reserved" and current_status == 'reserved'):
                
                next_status = 'paid'
                
                # Check for an existing payment record, regardless of its status
                cursor.execute("SELECT payment_id FROM Payment WHERE reservation_id = %s", (reservation_id,))
                existing_payment = cursor.fetchone()
                
                info_query = """
                    SELECT tr.price, u.email, dep_city.city_name AS departure_city, dest_city.city_name AS destination_city
                    FROM Ticket t
                    JOIN Travel tr ON t.travel_id = tr.travel_id
                    JOIN Reservation r ON t.ticket_id = r.ticket_id
                    JOIN User u ON r.user_id = u.user_id
                    LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                    LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                    LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                    LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                    WHERE t.ticket_id = %s
                """
                cursor.execute(info_query, (ticket_id,))
                info = cursor.fetchone()
                if not info:
                    conn.rollback()
                    return Response({"error": "Associated travel/user information not found."}, status=404)

                if existing_payment:
                    # If a payment record exists, UPDATE it
                    cursor.execute("""
                        UPDATE Payment SET payment_status = 'completed', payment_date = %s
                        WHERE payment_id = %s
                    """, (datetime.datetime.now(), existing_payment['payment_id']))
                else:
                    # If no payment record exists, INSERT a new one
                    cursor.execute("""
                        INSERT INTO Payment (user_id, reservation_id, amount, payment_method, payment_status, payment_date)
                        VALUES (%s, %s, %s, 'credit_card', 'completed', %s)
                    """, (user_id, reservation_id, info['price'], datetime.datetime.now()))

                email_info = {
                    "to_email": info["email"],
                    "subject": "Your Reservation is Confirmed",
                    "title": "Booking Confirmed",
                    "message": f"Your reservation #{reservation_id} has been confirmed by our team. Your trip is now booked.",
                    "details": {"Trip": f"{info['departure_city']} to {info['destination_city']}"}
                }

            elif action == "cancel_paid" and current_status == 'paid':
                next_status = 'canceled'
                
                query = """
                    SELECT tr.departure_time, p.amount, t.travel_id, u.email,
                           dep_city.city_name AS departure_city, dest_city.city_name AS destination_city
                    FROM Reservation r
                    JOIN Ticket t ON r.ticket_id = t.ticket_id
                    JOIN Travel tr ON t.travel_id = tr.travel_id
                    JOIN User u ON r.user_id = u.user_id
                    LEFT JOIN Payment p ON r.reservation_id = p.reservation_id
                    LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                    LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id
                    LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                    LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id
                    WHERE r.reservation_id = %s
                """
                cursor.execute(query, (reservation_id,))
                travel_info = cursor.fetchone()

                if not travel_info or travel_info.get("amount") is None:
                    conn.rollback()
                    return Response({"error": "Cannot cancel: Associated payment record not found."}, status=409)

                # Full refund for admin cancellation
                refund_amount = float(travel_info["amount"])
                cursor.execute("UPDATE User SET wallet = wallet + %s WHERE user_id = %s", (refund_amount, user_id))
                cursor.execute("UPDATE Payment SET payment_status = 'refunded' WHERE reservation_id = %s", (reservation_id,))
                cursor.execute("UPDATE Travel SET remaining_capacity = remaining_capacity + 1 WHERE travel_id = %s", (travel_info['travel_id'],))
                
                email_info = {
                    "to_email": travel_info["email"],
                    "subject": "Your Reservation has been Canceled",
                    "title": "Booking Canceled by Admin",
                    "message": f"Your reservation #{reservation_id} has been canceled by our support team. A full refund of ${refund_amount:,.2f} has been processed to your wallet.",
                    "details": {"Trip": f"{travel_info['departure_city']} to {travel_info['destination_city']}"}
                }

            elif action == "cancel_reserved" and current_status == 'reserved':
                next_status = 'canceled'
                cursor.execute("SELECT travel_id FROM Ticket WHERE ticket_id = %s", (ticket_id,))
                travel_id = cursor.fetchone()['travel_id']
                cursor.execute("UPDATE Travel SET remaining_capacity = remaining_capacity + 1 WHERE travel_id = %s", (travel_id,))

                cursor.execute("""
                    SELECT u.email, dep_city.city_name AS departure_city, dest_city.city_name AS destination_city
                    FROM Reservation r JOIN User u ON r.user_id = u.user_id JOIN Ticket t ON r.ticket_id = t.ticket_id
                    JOIN Travel tr ON t.travel_id = tr.travel_id LEFT JOIN Terminal dep_term ON tr.departure_terminal_id = dep_term.terminal_id
                    LEFT JOIN City dep_city ON dep_term.city_id = dep_city.city_id LEFT JOIN Terminal dest_term ON tr.destination_terminal_id = dest_term.terminal_id
                    LEFT JOIN City dest_city ON dest_term.city_id = dest_city.city_id WHERE r.reservation_id = %s
                """, (reservation_id,))
                info = cursor.fetchone()
                
                email_info = {
                    "to_email": info["email"], "subject": "Your Reservation has been Canceled",
                    "title": "Reservation Canceled", "message": f"Your unpaid reservation #{reservation_id} has been canceled.",
                    "details": {"Trip": f"{info['departure_city']} to {info['destination_city']}"}
                }

            else:
                conn.rollback()
                return Response({"error": f"Action '{action}' is not valid for the current status '{current_status}'."}, status=400)

            cursor.execute("UPDATE Reservation SET status = %s WHERE reservation_id = %s", (next_status, reservation_id))
            cursor.execute("INSERT INTO ReservationChange (reservation_id, support_id, prev_status, next_status) VALUES (%s, %s, %s, %s)", 
                           (reservation_id, admin_user_id, current_status, next_status))

            conn.commit()
            
            if email_info:
                try: send_notification_email(**email_info)
                except Exception as e: print(f"Failed to send notification email for reservation {reservation_id}: {e}")

            return Response({"message": f"Reservation status successfully changed to '{next_status}'."})

        except Exception as e:
            if conn: conn.rollback()
            return Response({"error": f"An unexpected error occurred: {e}"}, status=500)
        finally:
            if conn:
                conn.close()