from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from ..db.database import get_db
from ..models.models import Seller, User, Group, Rating
from ..schemas.user import SellerResponse
from ..utils.auth import get_current_user
from ..ml.trust_score_model import get_trust_score_model

router = APIRouter(prefix="/sellers", tags=["sellers"])


@router.get("/{seller_id}", response_model=SellerResponse)
async def get_seller_by_id(
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    return seller


@router.get("/{seller_id}/trust-score")
async def get_seller_trust_score(
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the Trust Score for a seller based on their customer ratings.
    
    The Trust Score determines the seller's access level to groups and price limits:
    - If Trust Score ≥ 3.5 → Unlimited Groups and Unlimited Price Access
    - If 2.5 ≤ Trust Score < 3.5 → Max 50 Groups and ₹20,000 Price Limit
    - If Trust Score < 2.5 → Max 20 Groups and ₹7,000 Price Limit
    """
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get the Trust Score model
    trust_score_model = get_trust_score_model(db)
    
    # Calculate the Trust Score
    trust_score = trust_score_model.calculate_trust_score(seller_id)
    
    return {"trust_score": trust_score}


@router.get("/{seller_id}/permissions")
async def get_seller_permissions(
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the seller's permissions based on their Trust Score.
    
    Returns the Trust Score, maximum number of groups allowed, and price limit.
    """
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get the Trust Score model
    trust_score_model = get_trust_score_model(db)
    
    # Get the seller's permissions
    _, permissions = trust_score_model.check_seller_limits(seller_id)
    
    return permissions


@router.get("/{seller_id}/can-create-group")
async def can_seller_create_group(
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a seller can create a new group based on their Trust Score limits.
    """
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get the Trust Score model
    trust_score_model = get_trust_score_model(db)
    
    # Check if the seller has reached their limits
    has_reached_limit, permissions = trust_score_model.check_seller_limits(seller_id)
    
    return {
        "can_create_group": not has_reached_limit,
        "permissions": permissions
    }


@router.get("/{seller_id}/can-set-price/{price}")
async def can_seller_set_price(
    seller_id: int,
    price: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a seller can set a specific price based on their Trust Score limits.
    """
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get the Trust Score model
    trust_score_model = get_trust_score_model(db)
    
    # Get the seller's permissions
    _, permissions = trust_score_model.check_seller_limits(seller_id)
    
    # Check if the price is within the seller's limit
    can_set_price = price <= permissions["price_limit"]
    
    return {
        "can_set_price": can_set_price,
        "permissions": permissions
    }
