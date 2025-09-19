from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['customer', 'seller']:
            raise ValueError('Role must be either customer or seller')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailSchema(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class UserResponse(UserBase):
    id: int
    is_verified: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class SellerCreate(BaseModel):
    shop_name: str
    address: str
    contact: str

class SellerUpdate(BaseModel):
    address: Optional[str] = None
    contact: Optional[str] = None

class SellerResponse(SellerCreate):
    user_id: int
    paid_99: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserWithSellerResponse(UserResponse):
    seller: Optional[SellerResponse] = None
    
    class Config:
        orm_mode = True