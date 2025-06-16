# مرحله اول: ساخت اپلیکیشن React با Vite
# از یک ایمیج Node.js برای نصب وابستگی‌ها و بیلد کردن پروژه استفاده می‌کنیم.
FROM node:18-alpine as build

# تنظیم دایرکتوری کاری در داخل کانتینر
WORKDIR /app

# کپی کردن package.json و package-lock.json برای نصب وابستگی‌ها
# این کار کمک می‌کند تا کش لایه‌های داکر به خوبی کار کند.
COPY package*.json ./

# نصب وابستگی‌های پروژه
RUN npm install

# کپی کردن تمام فایل‌های پروژه به دایرکتوری کاری
COPY . .

# بیلد کردن پروژه React برای محیط production با Vite
# Vite فایل‌های خروجی را به طور پیش‌فرض در پوشه 'dist' قرار می‌دهد.
RUN npm run build

# مرحله دوم: سرویس‌دهی فایل‌های بیلد شده با Nginx
# از یک ایمیج Nginx سبک برای سرویس‌دهی فایل‌های استاتیک استفاده می‌کنیم.
FROM nginx:alpine

# حذف فایل‌های پیکربندی پیش‌فرض Nginx
RUN rm /etc/nginx/conf.d/default.conf

# کپی کردن فایل‌های بیلد شده از مرحله 'build' به دایرکتوری پیش‌فرض Nginx
# پوشه 'dist' همان خروجی دستور 'npm run build' (یا 'vite build') است.
COPY --from=build /app/dist /usr/share/nginx/html

# کپی کردن یک فایل پیکربندی Nginx سفارشی
COPY nginx.conf /etc/nginx/conf.d/default.conf

# اکسپوز کردن پورت 80 که Nginx روی آن سرویس می‌دهد
EXPOSE 80

# دستور شروع Nginx در حالت غیر daemon
CMD ["nginx", "-g", "daemon off;"]

