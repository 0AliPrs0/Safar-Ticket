import MySQLdb
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ChargeWalletAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response(
                {"error": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user_id = user_info.get('user_id')
        data = request.data
        amount = data.get('amount')

        if amount is None:
            return Response(
                {"error": "Amount is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = int(amount)
            if amount <= 0:
                raise ValueError("Amount must be a positive integer.")
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount. Please provide a positive integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(
                host="db", user="root", password="Aliprs2005",
                database="safarticket", port=3306
            )
            cursor = conn.cursor(MySQLdb.cursors.DictCursor)
            
            conn.begin()
            
            update_query = "UPDATE User SET wallet = wallet + %s WHERE user_id = %s"
            cursor.execute(update_query, (amount, user_id))
            
            if cursor.rowcount == 0:
                conn.rollback()
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            select_query = "SELECT wallet FROM User WHERE user_id = %s"
            cursor.execute(select_query, (user_id,))
            result = cursor.fetchone()
            new_balance = result['wallet']

            conn.commit()

            return Response({
                "message": "Wallet charged successfully.",
                "new_balance": new_balance
            }, status=status.HTTP_200_OK)

        except MySQLdb.Error as e:
            if conn:
                conn.rollback()
            return Response(
                {"error": f"Database error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            if conn:
                conn.rollback()
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
