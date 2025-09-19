from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models.models import Rating, User, Seller, GroupMember, Group
from ..schemas.product import RatingCreate, RatingResponse
from ..utils.auth import get_current_user

router = APIRouter(tags=["Ratings"])

@router.get("/seller/{seller_id}", response_model=List[RatingResponse])
async def get_seller_ratings(seller_id: int, db: Session = Depends(get_db)):
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Get ratings for seller
    ratings = db.query(Rating).filter(Rating.seller_id == seller_id).all()
    return ratings

@router.post("/", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
async def create_rating(rating_data: RatingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create ratings"
        )
    
    # Check if seller exists
    seller = db.query(Seller).filter(Seller.user_id == rating_data.seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Check if user has picked up an order from this seller
    # Get groups by seller
    seller_groups = db.query(Group).filter(Group.seller_id == rating_data.seller_id).all()
    seller_group_ids = [group.id for group in seller_groups]
    
    # Check if user is a member of any of these groups and has picked up
    has_picked_up = db.query(GroupMember).filter(
        GroupMember.group_id.in_(seller_group_ids),
        GroupMember.user_id == current_user.id,
        GroupMember.is_picked_up == True
    ).first()
    
    if not has_picked_up:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only rate sellers after picking up an order"
        )
    
    # Check if user has already rated this seller for this product
    existing_rating = None
    if rating_data.product_id:
        existing_rating = db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.seller_id == rating_data.seller_id,
            Rating.product_id == rating_data.product_id
        ).first()
    
    if existing_rating:
        # Update existing rating
        existing_rating.score = rating_data.score
        existing_rating.feedback = rating_data.feedback
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    
    # Create new rating
    new_rating = Rating(
        user_id=current_user.id,
        seller_id=rating_data.seller_id,
        score=rating_data.score,
        feedback=rating_data.feedback,
        product_id=rating_data.product_id if rating_data.product_id else None
    )
    
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    
    # Update the seller's Trust Score in real-time
    from ..ml.trust_score_model import get_trust_score_model
    trust_score_model = get_trust_score_model(db)
    
    # Recalculate the Trust Score after the new rating
    trust_score = trust_score_model.calculate_trust_score(rating_data.seller_id)
    
    # Log the updated Trust Score
    print(f"Updated Trust Score for seller {rating_data.seller_id}: {trust_score}")
    
    return new_rating

@router.get("/my-ratings", response_model=List[RatingResponse])
async def get_my_ratings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get ratings created by user
    if current_user.role == "customer":
        ratings = db.query(Rating).filter(Rating.user_id == current_user.id).all()
    else:  # seller
        ratings = db.query(Rating).filter(Rating.seller_id == current_user.id).all()
    
    return ratings