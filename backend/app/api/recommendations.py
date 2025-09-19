from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models.models import Product
from ..schemas.product import ProductResponse
from ..utils.auth import get_current_user
from ..ml.recommendation import get_product_recommendations

router = APIRouter(tags=["Recommendations"])

@router.get("/products/recommended", response_model=List[ProductResponse])
async def get_recommended_products(limit: int = 5, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get product recommendations for the current user based on their ratings.
    """
    # Get recommended product IDs
    recommended_product_ids = get_product_recommendations(current_user.id, db, limit)
    
    # Get product details
    recommended_products = db.query(Product).filter(Product.id.in_(recommended_product_ids)).all()
    
    return recommended_products