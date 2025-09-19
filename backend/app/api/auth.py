from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas.user import SellerCreate, SellerUpdate, SellerResponse
import logging

from ..db.database import get_db
from ..models.models import User, Seller, OTPLog
from ..schemas.user import UserCreate, UserLogin, OTPVerify, UserResponse, UserWithSellerResponse, EmailSchema
from ..utils.auth import get_password_hash, send_otp, verify_otp, verify_password, create_access_token, get_current_user
from datetime import timedelta

# Set up logging
logger = logging.getLogger(__name__)

# ✅ Do NOT add "/auth" prefix here — it's already in main.py
router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registering new user with email: {user_data.email}, role: {user_data.role}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email {user_data.email} already registered")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create new user
        logger.info("Creating new user record")
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        
        # First add and commit the user
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"User created successfully with ID: {new_user.id}")
        
        # Send OTP for verification in a separate transaction
        try:
            logger.info(f"Sending OTP to user: {new_user.email}")
            # Create a new session for OTP to avoid transaction issues
            from ..db.database import SessionLocal
            otp_db = SessionLocal()
            try:
                otp = send_otp(new_user.email, otp_db)
                logger.info(f"Generated OTP: {otp} for user: {new_user.email}")
                otp_db.commit()
                logger.info("OTP saved successfully in database")
            except Exception as otp_error:
                logger.error(f"Error in OTP transaction: {str(otp_error)}")
                otp_db.rollback()
                raise
            finally:
                otp_db.close()
        except Exception as e:
            logger.error(f"Error sending OTP: {str(e)}")
            # Don't raise exception, just log it
        
        return new_user
    except Exception as e:
        logger.error(f"Error during user registration: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        logger.warning(f"Login failed: Email {user_data.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user.password_hash):
        logger.warning(f"Login failed: Incorrect password for {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    logger.info(f"User {user_data.email} authenticated successfully, sending OTP")
    
    # Send OTP for verification in a separate transaction
    try:
        # Create a new session for OTP to avoid transaction issues
        from ..db.database import SessionLocal
        otp_db = SessionLocal()
        try:
            otp = send_otp(user.email, otp_db)
            logger.info(f"Generated OTP: {otp} for user: {user.email}")
            otp_db.commit()
            logger.info("OTP saved successfully in database")
        except Exception as otp_error:
            logger.error(f"Error in OTP transaction: {str(otp_error)}")
            otp_db.rollback()
            raise
        finally:
            otp_db.close()
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)}")
        # Don't raise exception, just log it
    
    return {"message": "OTP sent to your email", "email": user.email}

@router.post("/resend-otp")
async def resend_otp(email_data: EmailSchema, db: Session = Depends(get_db)):
    logger.info(f"Resending OTP for email: {email_data.email}")
    
    # Check if user exists
    user = db.query(User).filter(User.email == email_data.email).first()
    if not user:
        logger.warning(f"Resend OTP failed: User with email {email_data.email} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Send new OTP
    try:
        # Create a new session for OTP to avoid transaction issues
        from ..db.database import SessionLocal
        otp_db = SessionLocal()
        try:
            otp = send_otp(user.email, otp_db)
            logger.info(f"Resent OTP: {otp} for user: {user.email}")
            otp_db.commit()
            logger.info("Resent OTP saved successfully in database")
        except Exception as otp_error:
            logger.error(f"Error in OTP resend transaction: {str(otp_error)}")
            otp_db.rollback()
            raise
        finally:
            otp_db.close()
    except Exception as e:
        logger.error(f"Error resending OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend OTP: {str(e)}"
        )
    
    return {"message": "OTP resent to your email", "email": user.email}

@router.post("/verify-otp")
async def verify_user_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    logger.info(f"Verifying OTP for email: {otp_data.email}")
    
    # Check if user exists first
    user = db.query(User).filter(User.email == otp_data.email).first()
    if not user:
        logger.warning(f"OTP verification failed: User with email {otp_data.email} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify OTP
    try:
        # Log OTP verification attempt
        logger.info(f"Attempting to verify OTP: {otp_data.otp_code} for user: {otp_data.email}")
        
        # Check for existing OTP records
        otp_records = db.query(OTPLog).filter(OTPLog.email == otp_data.email).all()
        if not otp_records:
            logger.warning(f"No OTP records found for email: {otp_data.email}")
        else:
            logger.info(f"Found {len(otp_records)} OTP records for email: {otp_data.email}")
            for record in otp_records:
                logger.info(f"OTP record: code={record.otp_code}, created={record.created_at}, expires={record.expires_at}, used={record.is_used}")
        
        is_valid = verify_otp(otp_data.email, otp_data.otp_code, db)
        if not is_valid:
            logger.warning(f"OTP verification failed for user: {otp_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP or OTP expired"
            )
        
        logger.info(f"OTP verified successfully for user: {otp_data.email}")
    except Exception as e:
        logger.error(f"Error during OTP verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification failed: {str(e)}"
        )
    
    # Create access token
    try:
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        logger.info(f"Access token created for user: {user.id}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": user.role
        }
    except Exception as e:
        logger.error(f"Error creating access token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/register-seller", status_code=status.HTTP_201_CREATED)
async def register_seller(seller_data: SellerCreate, user_id: int, db: Session = Depends(get_db)):
    # Check if user exists and is a seller
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a seller"
        )
    
    # Check if seller profile already exists
    existing_seller = db.query(Seller).filter(Seller.user_id == user_id).first()
    if existing_seller:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller profile already exists"
        )
    
    # Create seller profile
    new_seller = Seller(
        user_id=user_id,
        shop_name=seller_data.shop_name,
        address=seller_data.address,
        contact=seller_data.contact,
        paid_99=False  # Default to not paid
    )
    
    db.add(new_seller)
    db.commit()
    db.refresh(new_seller)
    
    return {"message": "Seller profile created successfully"}

@router.post("/pay-seller-fee/{user_id}")
async def pay_seller_fee(user_id: int, db: Session = Depends(get_db)):
    logger.info(f"Processing seller fee payment for user ID: {user_id}")
    try:
        # Check if user exists and is a seller
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        if user.role != "seller":
            logger.warning(f"User ID {user_id} is not a seller")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a seller"
            )
            
        # Check if seller exists
        seller = db.query(Seller).filter(Seller.user_id == user_id).first()
        
        # If seller profile doesn't exist, create one with default values
        if not seller:
            logger.info(f"Creating seller profile for user ID: {user_id}")
            seller = Seller(
                user_id=user_id,
                shop_name=f"{user.name}'s Shop",
                address="",
                contact="",
                paid_99=False
            )
            db.add(seller)
            db.flush()
        
        # Update paid status
        logger.info(f"Updating paid status for seller ID: {user_id}")
        seller.paid_99 = True
        db.commit()
        db.refresh(seller)
        logger.info(f"Payment successful for seller ID: {user_id}")
        
        return {"message": "Seller fee paid successfully", "seller": {"user_id": seller.user_id, "paid_99": seller.paid_99}}
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Roll back transaction on error
        db.rollback()
        logger.error(f"Error processing seller payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing failed: {str(e)}"
        )

@router.put("/update-seller-profile", response_model=SellerResponse)
async def update_seller_profile(seller_update: SellerUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Updating seller profile for user ID: {current_user.id}")
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can update their profile"
        )

    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )

    if seller_update.address is not None:
        seller.address = seller_update.address
    if seller_update.contact is not None:
        seller.contact = seller_update.contact

    try:
        db.commit()
        db.refresh(seller)
        logger.info(f"Seller profile updated successfully for user ID: {current_user.id}")
        return seller
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating seller profile for user ID {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update seller profile: {str(e)}"
        )

@router.get("/profile", response_model=UserWithSellerResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)): 
    logger.info(f"Fetching profile for user ID: {current_user.id}")
    return current_user
