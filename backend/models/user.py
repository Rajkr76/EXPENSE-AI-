from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from bson import ObjectId

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    is_verified: bool = False
    verification_code: Optional[str] = None
    reset_code: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_verified: bool = False

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class Token(BaseModel):
    access_token: str
    token_type: str
