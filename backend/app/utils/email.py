import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    """
    Sends a 6-digit verification code to the student's email using smtplib.
    """
    # Verify SMTP credentials are set
    if not settings.SMTP_SERVER or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP credentials are not fully configured in environment variables.")
        return False

    subject = "Verify your Student Marketplace Account"
    
    # Beautiful HTML email template
    html_content = f"""
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; margin: 0;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Student Thrift Exchange</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email Verification</p>
          </div>
          <div style="padding: 40px 30px; color: #334155;">
            <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hi {name},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">Welcome to the campus peer-to-peer marketplace! To complete your registration and activate your student seller status, please use the 6-digit verification code below:</p>
            
            <div style="margin: 35px 0; text-align: center;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4f46e5; background-color: #eef2ff; border: 2px dashed #c7d2fe; padding: 15px 30px; border-radius: 16px; display: inline-block; font-family: monospace;">
                {otp}
              </div>
            </div>
            
            <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              This verification code was generated for your student registration. If you did not sign up for an account, please disregard this email.
            </p>
          </div>
          <div style="background-color: #f8fafc; text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
            &copy; 2026 Student Thrift Exchange. Connecting students on campus.
          </div>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Student Marketplace <{settings.SMTP_USERNAME}>"
    msg["To"] = to_email
    
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Establish SMTP connection with TLS
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, to_email, msg.as_string())
        server.close()
        return True
    except Exception as e:
        print(f"SMTP execution failure sending to {to_email}: {str(e)}")
        raise e
