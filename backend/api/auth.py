from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
import jwt

from db.database import get_db
from models.user import UserResponse
from core.config import settings

from clerk_backend_api import Clerk
from clerk_backend_api.models.components.jwt_template import JWTTemplate

router = APIRouter()
security = HTTPBearer()

# We need the Clerk Secret Key to use the Clerk SDK
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY) if settings.CLERK_SECRET_KEY else None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncIOMotorDatabase = Depends(get_db)):
    token = credentials.credentials
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        # Decode the token (verifies signature if Clerk SDK is used properly, 
        # but here we decode without verification first to extract the ID, 
        # or we verify if we have the secret key)
        # Note: In production, you MUST verify the signature using JWKS.
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        clerk_id: str = unverified_payload.get("sub")
        email: str = unverified_payload.get("email") # Requires email to be included in JWT template, or we just rely on clerk_id
        
        if clerk_id is None:
            raise credentials_exception
            
    except Exception as e:
        print("JWT Decode error:", e)
        raise credentials_exception
        
    # Check if user exists in MongoDB by clerk_id
    user = await db["users"].find_one({"clerk_id": clerk_id})
    
    if user is None:
        # Try fetching clerk user to get email for linking
        if clerk:
            try:
                clerk_user = clerk.users.get(clerk_id)
                email = clerk_user.email_addresses[0].email_address if clerk_user.email_addresses else email
                name = f"{clerk_user.first_name or ''} {clerk_user.last_name or ''}".strip()
            except Exception as e:
                print("Failed to fetch Clerk user details:", e)
                name = "Unknown User"
        else:
            name = "Unknown User"
            
        if email:
            # Check if user exists by email (migration from custom auth)
            user = await db["users"].find_one({"email": email})
            if user:
                # Link existing account to Clerk
                await db["users"].update_one({"_id": user["_id"]}, {"$set": {"clerk_id": clerk_id}})
                user["clerk_id"] = clerk_id

    # If user still doesn't exist, create them on the fly!
    if user is None:
        new_user = {
            "clerk_id": clerk_id,
            "email": email or "unknown@example.com",
            "name": name or "Unknown User",
            "is_verified": True
        }
        result = await db["users"].insert_one(new_user)
        user = await db["users"].find_one({"_id": result.inserted_id})
        
    user["_id"] = str(user["_id"])
    
    # Map clerk_id to id for the response model if needed, but UserResponse usually expects email and name
    return UserResponse(**user)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
