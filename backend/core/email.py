import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings

def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email using SMTP if credentials are provided in the .env file.
    Otherwise, falls back to printing the email to the console.
    """
    
    # If no SMTP credentials are set, simulate sending by printing to console
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n=========================================\n")
        print(f"EMAIL SIMULATOR: Send to {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"\n=========================================\n")
        return

    # Use Gmail's SMTP server by default
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    
    # Set up the email message
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to the server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls() # Secure the connection
        
        # Login
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        print(f"Real Email successfully sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
