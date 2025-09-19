import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random
import requests
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from ..db.database import get_db
from ..models.models import User, OTPLog

# Load environment variables
load_dotenv()

# Constants
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "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")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "lockdeal.noreply@gmail.com")

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Password hashing and verification
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT token creation and verification
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Eagerly load the seller relationship to avoid "Seller not found" errors
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.seller)).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not verified"
        )
    return user

# OTP generation and sending
def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_otp(email: str, db: Session) -> str:
    # Generate OTP
    otp = generate_otp()
    print(f"Generated OTP: {otp} for email: {email}")
    
    # Set expiry time (10 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    try:
        # Store OTP in database
        otp_log = OTPLog(
            email=email,
            otp_code=otp,
            expires_at=expires_at,
            is_used=False
        )
        
        # Check if the OTP was actually created
        print(f"Creating OTP log with email={email}, otp={otp}, expires_at={expires_at}")
        
        # Add to database
        db.add(otp_log)
        db.flush()  # Flush to get the ID without committing
        
        # Verify the OTP was added correctly
        print(f"OTP log created with ID: {otp_log.id}")
        
        # Note: We don't commit here, the calling function will handle the commit
        # This prevents issues with nested transactions
    except Exception as e:
        print(f"Error storing OTP in database: {str(e)}")
        raise
    
    # Send OTP via Brevo API
    url = "https://api.brevo.com/v3/smtp/email"
    
    # Enhanced email template with better formatting
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
            <h2 style="color: #4a6ee0;">LockDeal Authentication</h2>
            <p>Your One-Time Password (OTP) for LockDeal is:</p>
            <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                <strong>{otp}</strong>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong> only.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
            <p style="font-size: 12px; color: #777; margin-top: 30px;">This is an automated message, please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """
    
    payload = {
        "sender": {"name": "LockDeal", "email": BREVO_SENDER_EMAIL},
        "to": [{"email": email}],
        "subject": "Your OTP for LockDeal Login",
        "htmlContent": html_content
    }
    
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    print(f"Sending OTP to {email} using Brevo API")
    print(f"Sender email: {BREVO_SENDER_EMAIL}")
    print(f"API Key: {BREVO_API_KEY[:5]}...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Brevo API response status: {response.status_code}")
        print(f"Brevo API response: {response.text}")
        
        if response.status_code != 201:
            error_detail = f"Failed to send OTP via email. Status code: {response.status_code}"
            try:
                error_json = response.json()
                if 'message' in error_json:
                    error_detail += f". Error: {error_json['message']}"
            except:
                error_detail += f". Response: {response.text}"
                
            print(f"ERROR: {error_detail}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_detail
            )
        return otp
    except requests.RequestException as e:
        error_message = f"Network error while sending OTP: {str(e)}"
        print(f"ERROR: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        )
    except Exception as e:
        error_message = f"Unexpected error while sending OTP: {str(e)}"
        print(f"ERROR: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        )

def verify_otp(email: str, otp_code: str, db: Session) -> bool:
    print(f"Verifying OTP: {otp_code} for email: {email}")
    
    # First check if there are any OTP records for this email
    all_otps = db.query(OTPLog).filter(OTPLog.email == email).all()
    if not all_otps:
        print(f"No OTP records found for email: {email}")
        return False
    else:
        print(f"Found {len(all_otps)} OTP records for email: {email}")
        for otp in all_otps:
            print(f"OTP record: id={otp.id}, code={otp.otp_code}, created={otp.created_at}, expires={otp.expires_at}, used={otp.is_used}")
    
    # Get the latest OTP for the email that hasn't expired and hasn't been used
    try:
        otp_log = db.query(OTPLog).filter(
            OTPLog.email == email,
            OTPLog.otp_code == otp_code,
            OTPLog.expires_at > datetime.utcnow(),
            OTPLog.is_used == False
        ).order_by(OTPLog.created_at.desc()).first()
        
        if not otp_log:
            print(f"No valid OTP found for email: {email} with code: {otp_code}")
            return False
        
        print(f"Valid OTP found: id={otp_log.id}, code={otp_log.otp_code}")
        
        # Mark OTP as used
        otp_log.is_used = True
        db.flush()
        print(f"OTP marked as used: id={otp_log.id}")
        
        # Update user verification status
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.is_verified = True
            db.flush()
            print(f"User marked as verified: id={user.id}, email={user.email}")
        
        # Commit all changes
        db.commit()
        print("All changes committed successfully")
        
        return True
    except Exception as e:
        print(f"Error during OTP verification: {str(e)}")
        db.rollback()
        return False

# Generate pickup OTP for group members
def generate_pickup_otp(group_member_id: int, db: Session) -> str:
    from ..models.models import GroupMember
    
    otp = generate_otp()
    group_member = db.query(GroupMember).filter(GroupMember.id == group_member_id).first()
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group member not found"
        )
    
    group_member.pickup_otp = otp
    db.commit()
    
    return otp