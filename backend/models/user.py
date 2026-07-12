from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from bson import ObjectId

class UserBase(BaseModel):
    clerk_id: str
    name: Optional[str] = "Unknown User"
    email: Optional[str] = "unknown@example.com"

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    is_verified: bool = True

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_verified: bool = False

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class Token(BaseModel):
    access_token: str
    token_type: str
