from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import os
import MySQLdb
import uuid

class UploadProfileImageAPIView(APIView):
    def post(self, request):
        user_info = getattr(request, 'user_info', None)
        if not user_info:
            return Response({"error": "Authentication credentials were not provided."}, status=401)

        user_id = user_info.get('user_id')
        if 'profile_image' not in request.FILES:
            return Response({'error': 'No profile image provided.'}, status=400)

        image_file = request.FILES['profile_image']
        
        # ایجاد یک نام فایل یکتا برای جلوگیری از تداخل
        ext = image_file.name.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        
        # تعریف مسیر برای ذخیره عکس‌ها
        # مطمئن شوید که پوشه 'media/profile_pics' وجود دارد
        media_path = os.path.join(settings.MEDIA_ROOT, 'profile_pics')
        os.makedirs(media_path, exist_ok=True)
        
        file_path = os.path.join(media_path, filename)

        # ذخیره فایل روی سرور
        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
        
        # ساخت URL قابل دسترس برای فرانت‌اند
        image_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, 'profile_pics', filename))

        conn = None
        cursor = None
        try:
            conn = MySQLdb.connect(host="db", user="root", password="Aliprs2005", database="safarticket", port=3306)
            cursor = conn.cursor()
            
            # آپدیت کردن URL عکس در دیتابیس
            cursor.execute("UPDATE User SET profile_image_url = %s WHERE user_id = %s", (image_url, user_id))
            conn.commit()

            return Response({'profile_image_url': image_url})

        except MySQLdb.Error as e:
            return Response({"error": f"Database error: {str(e)}"}, status=500)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
