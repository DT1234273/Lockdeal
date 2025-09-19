from sqlalchemy.orm import Session
from ..models.models import Rating, Product, User
import numpy as np
from collections import defaultdict

# Simple recommendation system based on collaborative filtering
def get_product_recommendations(user_id: int, db: Session, limit: int = 5):
    """
    Get product recommendations for a user based on collaborative filtering.
    
    Args:
        user_id: The ID of the user to get recommendations for
        db: Database session
        limit: Maximum number of recommendations to return
        
    Returns:
        List of recommended product IDs
    """
    # Get all ratings
    ratings = db.query(Rating).all()
    
    # Create user-product rating matrix
    user_ratings = defaultdict(dict)
    for rating in ratings:
        if rating.product_id:  # Only consider ratings with product_id
            user_ratings[rating.user_id][rating.product_id] = rating.score
    
    # If user has no ratings, return popular products
    if user_id not in user_ratings or not user_ratings[user_id]:
        return get_popular_products(db, limit)
    
    # Calculate similarity between users
    similarity = {}
    for other_user_id in user_ratings:
        if other_user_id != user_id:
            sim = calculate_similarity(user_ratings[user_id], user_ratings[other_user_id])
            if sim > 0:  # Only consider positive similarity
                similarity[other_user_id] = sim
    
    # Get recommendations
    recommendations = defaultdict(float)
    for other_user_id, sim in similarity.items():
        for product_id, rating in user_ratings[other_user_id].items():
            if product_id not in user_ratings[user_id]:  # Only recommend products user hasn't rated
                recommendations[product_id] += sim * rating
    
    # Sort recommendations by score
    sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    
    # Return top N product IDs
    return [product_id for product_id, _ in sorted_recommendations[:limit]]

def calculate_similarity(user1_ratings, user2_ratings):
    """
    Calculate cosine similarity between two users based on their ratings.
    
    Args:
        user1_ratings: Dictionary of product_id -> rating for user 1
        user2_ratings: Dictionary of product_id -> rating for user 2
        
    Returns:
        Similarity score between 0 and 1
    """
    # Find common products
    common_products = set(user1_ratings.keys()) & set(user2_ratings.keys())
    
    if not common_products:
        return 0
    
    # Calculate cosine similarity
    vector1 = np.array([user1_ratings[product_id] for product_id in common_products])
    vector2 = np.array([user2_ratings[product_id] for product_id in common_products])
    
    dot_product = np.dot(vector1, vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    
    if norm1 == 0 or norm2 == 0:
        return 0
    
    return dot_product / (norm1 * norm2)

def get_popular_products(db: Session, limit: int = 5):
    """
    Get popular products based on average rating.
    
    Args:
        db: Database session
        limit: Maximum number of products to return
        
    Returns:
        List of popular product IDs
    """
    # Get products with ratings
    products_with_ratings = db.query(Product).filter(
        Product.id.in_(db.query(Rating.product_id).filter(Rating.product_id.isnot(None)))
    ).all()
    
    # Calculate average rating for each product
    product_ratings = {}
    for product in products_with_ratings:
        ratings = db.query(Rating).filter(Rating.product_id == product.id).all()
        if ratings:
            avg_rating = sum(r.score for r in ratings) / len(ratings)
            product_ratings[product.id] = avg_rating
    
    # Sort by average rating
    sorted_products = sorted(product_ratings.items(), key=lambda x: x[1], reverse=True)
    
    # Return top N product IDs
    return [product_id for product_id, _ in sorted_products[:limit]]