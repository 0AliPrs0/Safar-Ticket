import MySQLdb
import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
import re

class ChangePasswordAPIView(APIView):
    def _is_password_strong(self, password):
        if len(password) < 8: return False
        if not re.search(r"[a-z]", password): return False
        if not re.search(r"[A-Z]", password): return False
        if not re.search(r"[0-9]", password): return False
        if not re.search(r"[!@#$%^&*(),.?:{}|<>]", password): return False
        return True

    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not all([old_password, new_password]):
            return Response({"error": "Old and new passwords are required."}, status=400)

        if not self._is_password_strong(new_password):
            return Response({'error': 'New password is not strong enough.'}, status=400)

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306, cursorclass=MySQLdb.cursors.DictCursor)
            cursor = conn.cursor()

            cursor.execute("SELECT password_hash FROM User WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                return Response({"error": "User not found."}, status=404)

            old_password_hash = hashlib.sha256(old_password.encode()).hexdigest()
            if user['password_hash'] != old_password_hash:
                return Response({"error": "Incorrect old password."}, status=400)

            new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            cursor.execute("UPDATE User SET password_hash = %s WHERE user_id = %s", (new_password_hash, user_id))
            conn.commit()

            return Response({"message": "Password changed successfully."})

        except MySQLdb.Error as e:
            if conn: conn.rollback()
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
