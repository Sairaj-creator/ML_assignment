from pydantic import BaseModel, EmailStr, Field

class UserInfo(BaseModel):
    id: int
    email: str
    full_name: str = Field(validation_alias="full_name", serialization_alias="fullName")
    role: str

    model_config = {"from_attributes": True, "populate_by_name": True}

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
    user: UserInfo
    access_token: str
    token_type: str = "bearer"
