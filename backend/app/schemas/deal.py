from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DealBase(BaseModel):
    group_id: int
    seller_id: int
    total_amount: float
    total_members: int
    status: str = "pending"

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    status: Optional[str] = None
    completed_at: Optional[datetime] = None

class DealInDB(DealBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Deal(DealInDB):
    pass