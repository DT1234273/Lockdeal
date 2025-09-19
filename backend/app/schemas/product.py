from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    price: float = Field(..., gt=0)
    unit: str
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    created_at: datetime
    quantity: Optional[int] = None
    total_price: Optional[float] = None
    group_id: Optional[int] = None
    group_member_id: Optional[int] = None
    
    class Config:
        orm_mode = True

class GroupBase(BaseModel):
    product_id: int

class GroupCreate(GroupBase):
    pass

class GroupMemberBase(BaseModel):
    group_id: int
    quantity: int = Field(..., gt=0)

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMemberResponse(GroupMemberBase):
    id: int
    user_id: int
    joined_at: datetime
    is_picked_up: bool
    
    class Config:
        orm_mode = True

class GroupResponse(GroupBase):
    id: int
    seller_id: int
    total_price: float
    members: int
    created_at: datetime
    locked_at: Optional[datetime] = None
    is_accepted: bool
    is_picked_up: bool = False
    picked_up_at: Optional[datetime] = None
    is_completed: bool = False
    product: ProductResponse
    quantity: Optional[int] = None  # User's quantity in the group
    user_total_price: Optional[float] = None  # User's total price in the group
    
    class Config:
        orm_mode = True

class GroupDetailResponse(GroupResponse):
    group_members: List[GroupMemberResponse]
    
    class Config:
        orm_mode = True

class RatingBase(BaseModel):
    seller_id: int
    score: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
    product_id: Optional[int] = None

class RatingCreate(RatingBase):
    pass

class RatingResponse(RatingBase):
    id: int
    user_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None
    
    class Config:
        orm_mode = True