from fastapi import APIRouter, Depends, HTTPException, status, Body
import random
import string
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from db.database import get_db
from core.email import send_email
from models.user import UserCreate, UserResponse, UserInDB, Token
from core.security import get_password_hash, verify_password, create_access_token
from pydantic import BaseModel

class VerifyEmailRequest(BaseModel):
    email: str
    code: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    from core.security import settings
    from jose import JWTError, jwt
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    user["_id"] = str(user["_id"])
    return UserResponse(**user)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    user.email = user.email.strip().lower()
    # Check if user exists
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create user
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    # Generate 6-digit verification code
    verification_code = ''.join(random.choices(string.digits, k=6))
    user_dict["verification_code"] = verification_code
    
    # Try to send verification email
    email_sent = send_email(
        to_email=user.email,
        subject="ExpenseAI Verification Code",
        body=f"Welcome to ExpenseAI!\n\nYour verification code is: {verification_code}\n\nPlease enter this code in the app to verify your account."
    )
    
    # If email was sent successfully, require verification
    # If email failed (e.g., SMTP blocked on Render free tier), auto-verify the user
    if email_sent:
        user_dict["is_verified"] = False
        print(f"Verification email sent to {user.email}. User must verify.")
    else:
        user_dict["is_verified"] = True
        print(f"SMTP unavailable. Auto-verified user {user.email}.")

    result = await db["users"].insert_one(user_dict)
    
    # Return user
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    return UserResponse(**created_user)

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_db)):
    email = form_data.username.strip().lower()
    user = await db["users"].find_one({"email": email})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.post("/verify-email")
async def verify_email(
    req: VerifyEmailRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    email = req.email.strip().lower()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.get("is_verified"):
        return {"message": "Email already verified"}
        
    if user.get("verification_code") != req.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True, "verification_code": None}}
    )
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(
    req: ForgotPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    email = req.email.strip().lower()
    user = await db["users"].find_one({"email": email})
    if not user:
        # Don't reveal user existence, just return success
        return {"message": "If this email is registered, a reset code was sent."}
        
    reset_code = ''.join(random.choices(string.digits, k=6))
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_code": reset_code}}
    )
    
    # Send email (falls back to terminal print if no SMTP setup)
    email_sent = send_email(
        to_email=email,
        subject="ExpenseAI Password Reset",
        body=f"You requested a password reset for ExpenseAI.\n\nYour reset code is: {reset_code}\n\nIf you did not request this, please ignore this email."
    )
    
    if not email_sent:
        # If email failed, return the code in the response (for development/testing)
        return {"message": "If this email is registered, a reset code was sent.", "debug_code": reset_code}
    
    return {"message": "If this email is registered, a reset code was sent."}

@router.post("/reset-password")
async def reset_password(
    req: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    email = req.email.strip().lower()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.get("reset_code") or user.get("reset_code") != req.code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
        
    hashed_password = get_password_hash(req.new_password)
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": hashed_password, "reset_code": None}}
    )
    
    return {"message": "Password reset successfully"}
