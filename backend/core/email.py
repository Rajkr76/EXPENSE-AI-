import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings

def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Sends an email using SMTP if credentials are provided in the .env file.
    Returns True if email was sent successfully, False otherwise.
    Falls back to printing the email to the console if SMTP is not configured or fails.
    """
    
    # If no SMTP credentials are set, simulate sending by printing to console
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n=========================================")
        print(f"EMAIL SIMULATOR: Send to {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"=========================================\n")
        return False

    # Use SMTP settings from env, fallback to Gmail defaults
    smtp_server = getattr(settings, 'SMTP_SERVER', None) or "smtp.gmail.com"
    smtp_port = getattr(settings, 'SMTP_PORT', None) or 587
    
    # Set up the email message
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to the server with a timeout
        server = smtplib.SMTP(smtp_server, int(smtp_port), timeout=10)
        server.starttls() # Secure the connection
        
        # Login
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        print(f"Email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        print(f"SMTP may be blocked on this host (e.g., Render free tier).")
        print(f"Falling back to console output:")
        print(f"  Subject: {subject}")
        print(f"  Body: {body}")
        return False
