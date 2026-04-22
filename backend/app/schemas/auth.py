from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    model_config = {"from_attributes": True}
