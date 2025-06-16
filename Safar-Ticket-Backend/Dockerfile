FROM python:3.11-slim

# نصب وابستگی‌های سیستمی مورد نیاز برای MySQL Client و سایر پکیج‌های پایتون
RUN apt-get update && apt-get install -y \
    libmariadb-dev \
    libmariadb-dev-compat \
    libssl-dev \
    gcc \
    cron \
    pkg-config \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code

COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /code/

EXPOSE 8000

CMD ["sh", "-c", "cd SafarTicket/ && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
