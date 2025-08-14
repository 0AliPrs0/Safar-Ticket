import smtplib
from email.mime.text import MIMEText
from django.conf import settings
import smtplib
from email.mime.text import MIMEText
from django.conf import settings
from datetime import timedelta 


def send_otp_email(to_email, otp):
    subject = "Your SafarTicket Verification Code"
    frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000')
    verification_link = f"{frontend_url}/verify-otp?otp={otp}&email={to_email}"

    body = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #333; padding: 20px; background-color: #F8F9FA;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; padding: 40px; background-color: #FFFFFF;">
          <h1 style="color: #0D47A1; font-size: 28px;">SafarTicket Verification</h1>
          <p style="font-size: 18px;">Thank you for registering! Please verify your email address.</p>
          
          <p style="margin-top: 30px; margin-bottom: 20px;">
            <a href="{verification_link}" target="_blank" style="text-decoration: none; background-color: #FFA726; color: white; padding: 15px 25px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Verify by Clicking Here
            </a>
          </p>
          
          <p style="font-size: 16px; color: #555;">Or, use the code below:</p>

          <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #0D47A1; background-color: #f0f5ff; padding: 20px; border-radius: 8px;">{otp}</p>
          
          <p style="font-size: 14px; color: #777;">This code will expire in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #aaa;">If you did not request this, please ignore this email.</p>
        </div>
      </body>
    </html>
    """

    msg = MIMEText(body, 'html')
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_HOST_USER
    msg['To'] = to_email

    try:
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_payment_reminder_email(to_email, expiration_time, reservation_details):
    subject = "Payment Reminder for Your SafarTicket Reservation"
    frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000')

    payment_link = f"{frontend_url}/payment/{reservation_details.get('reservation_id')}"
    
    user_local_expiration_time = expiration_time + timedelta(hours=3, minutes=30)
    formatted_expiration_time = user_local_expiration_time.strftime('%H:%M on %Y-%m-%d')

    body = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #333; padding: 20px; background-color: #F8F9FA;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; padding: 40px; background-color: #FFFFFF;">
          <h1 style="color: #0D47A1; font-size: 28px;">Complete Your Payment</h1>
          <p style="font-size: 18px; line-height: 1.6;">Your reservation is waiting! Please complete the payment to confirm your trip.</p>
          
          <div style="text-align: left; margin: 30px 0; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fdfdfd;">
            <p style="margin: 5px 0; font-size: 16px;"><strong>Reservation ID:</strong> {reservation_details.get('reservation_id')}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Trip:</strong> {reservation_details.get('departure_city')} to {reservation_details.get('destination_city')}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Departure:</strong> {reservation_details.get('departure_time')}</p>
          </div>

          <p style="font-size: 16px; color: #D32F2F;">Your reservation will expire at <strong style="font-weight: bold;">{formatted_expiration_time}</strong>.</p>

          <p style="margin-top: 30px; margin-bottom: 20px;">
            <a href="{payment_link}" target="_blank" style="text-decoration: none; background-color: #FFA726; color: white; padding: 15px 25px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Pay Now
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #aaa;">Thank you for choosing SafarTicket!</p>
        </div>
      </body>
    </html>
    """

    msg = MIMEText(body, 'html')
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_HOST_USER
    msg['To'] = to_email

    try:
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_password_reset_email(email, token, is_admin=False):
    reset_path = "admin/reset-password" if is_admin else "reset-password"
    reset_link = f"http://localhost:3000/{reset_path}/{token}"
    subject = "Reset Your SafarTicket Password"

    body = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #333; padding: 20px; background-color: #F8F9FA;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; padding: 40px; background-color: #FFFFFF;">
          <h1 style="color: #0D47A1; font-size: 28px;">Password Reset Request</h1>
          <p style="font-size: 18px;">You requested to reset your password. Click the button below to set a new one.</p>
          
          <p style="margin-top: 30px; margin-bottom: 20px;">
            <a href="{reset_link}" target="_blank" style="text-decoration: none; background-color: #FFA726; color: white; padding: 15px 25px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Reset Your Password
            </a>
          </p>
          
          <p style="font-size: 14px; color: #777;">This link will expire in 15 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #aaa;">If you did not request this, please ignore this email.</p>
        </div>
      </body>
    </html>
    """

    msg = MIMEText(body, 'html')
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_HOST_USER
    msg['To'] = to_email

    try:
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")