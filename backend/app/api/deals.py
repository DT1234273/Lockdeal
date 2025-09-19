from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..db.database import get_db
from ..models.models import Deal, Group, Seller, GroupMember, Product, User
from ..schemas.deal import Deal as DealSchema, DealCreate, DealUpdate
from ..schemas.product import ProductResponse
from ..utils.auth import get_current_user

router = APIRouter(tags=["Deals"])

@router.get("/", response_model=List[DealSchema])
async def get_all_deals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all deals (admin only)"""
    # Only admin can see all deals (future feature)
    deals = db.query(Deal).all()
    return deals

@router.get("/customer-products/{customer_id}", response_model=List[ProductResponse])
async def get_customer_products(customer_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all products purchased by a customer from locked groups"""
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access customer products"
        )
    
    # Weekend restriction is removed to allow sellers to search for customer products anytime
    # This allows sellers to find products in the locked section on the customer side
    
    # Check if customer exists
    customer = db.query(User).filter(User.id == customer_id, User.role == "customer").first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Get all group members where the customer is a member and the seller is the current user
    # This directly fetches the quantity and total_price from the group_members table
    group_members = db.query(GroupMember).filter(
        GroupMember.user_id == customer_id,
        GroupMember.seller_id == current_user.id,
        GroupMember.is_picked_up == False  # Only show products that haven't been picked up
    ).all()
    
    group_ids = [member.group_id for member in group_members]
    
    # Get all groups that are locked and accepted
    groups = db.query(Group).filter(
        Group.id.in_(group_ids),
        Group.locked_at != None,  # Groups that are locked (have a locked_at timestamp)
        Group.is_accepted == True  # Only show products from accepted groups
    ).all()
    
    # Create a mapping of group_id to group for easier lookup
    group_map = {group.id: group for group in groups}
    
    # Create a mapping of group_member by group_id for easier lookup
    group_member_map = {member.group_id: member for member in group_members}
    
    # Get products from these groups
    products = []
    for group_member in group_members:
        # Only process if the group is locked
        if group_member.group_id in group_map:
            group = group_map[group_member.group_id]
            product = db.query(Product).filter(Product.id == group.product_id).first()
            if product:
                # Add group_id, quantity and total_price to product for reference
                # Make sure to use the quantity and total_price from group_members table
                member = group_member_map[group.id]
                setattr(product, "group_id", group.id)
                setattr(product, "quantity", member.quantity)
                # Ensure total_price is set correctly
                if member.total_price is not None:
                    setattr(product, "total_price", member.total_price)
                else:
                    # Calculate total_price if not set
                    calculated_total = product.price * member.quantity
                    setattr(product, "total_price", calculated_total)
                setattr(product, "group_member_id", member.id)
                # Print debug information
                print(f"Debug - Product: {product.name}, Quantity: {product.quantity}, Total Price: {product.total_price}, Group Member ID: {product.group_member_id}")
                products.append(product)
    
    return products

@router.post("/confirm-order/{group_member_id}")
async def confirm_order(group_member_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Confirm order pickup for a customer"""
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can confirm orders"
        )
    
    # Check if group member exists
    group_member = db.query(GroupMember).filter(GroupMember.id == group_member_id).first()
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group member not found"
        )
    
    # Check if the group is accepted
    group = db.query(Group).filter(Group.id == group_member.group_id).first()
    if not group or not group.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is not accepted"
        )
    
    # Check if the deal exists and is pending
    deal = db.query(Deal).filter(Deal.group_id == group.id, Deal.status == "pending").first()
    if not deal:
        # Create a new deal if one doesn't exist
        deal = Deal(
            group_id=group.id,
            seller_id=current_user.id,
            total_amount=group.total_price,
            total_members=group.members,
            status="pending"
        )
        db.add(deal)
        db.commit()
        db.refresh(deal)
    
    # Mark the group member as picked up
    group_member.is_picked_up = True
    
    # Update the group's total price and members count
    # Calculate the member's contribution to the total price
    product = db.query(Product).filter(Product.id == group.product_id).first()
    member_total_price = group_member.quantity * product.price if product else 0
    
    # Subtract the member's price from the group's total price
    group.total_price = group.total_price - member_total_price
    
    # Decrement the members count
    group.members = group.members - 1
    
    # Always mark the group as picked up for this member when order is confirmed
    # This ensures it shows in the completed section for the customer
    group.is_picked_up = True
    group.picked_up_at = datetime.now()
    
    # Also mark the group member as picked up
    group_member.is_picked_up = True
    group_member.picked_up_at = datetime.now()
    
    # If total price becomes 0.0 or all members have picked up, mark the group as completed and picked up
    if group.total_price <= 0 or group.members <= 0:
        group.is_completed = True
        group.is_picked_up = True
        if not group.picked_up_at:
            group.picked_up_at = datetime.now()
    
    # Check if all members have picked up their products
    all_picked_up = db.query(GroupMember).filter(
        GroupMember.group_id == group.id,
        GroupMember.is_picked_up == False
    ).first() is None
    
    # If all members have picked up, mark the deal as completed
    if all_picked_up:
        deal.status = "completed"
        deal.completed_at = datetime.now()
    
    # Commit all changes at once
    db.commit()
    db.refresh(group_member)
    db.refresh(group)
    db.refresh(deal)
    
    return {"message": "Order confirmed successfully"}

@router.get("/seller", response_model=List[DealSchema])
async def get_seller_deals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get all deals for a seller"""
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access their deals"
        )
    
    # Check if user is a seller
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )
    
    deals = db.query(Deal).filter(Deal.seller_id == seller.user_id).all()
    return deals

@router.get("/{deal_id}", response_model=DealSchema)
async def get_deal(deal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific deal"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Check if user is the seller or a member of the group
    if current_user.role == "seller" and deal.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own deals"
        )
    
    # For customers, check if they are part of the group
    if current_user.role == "customer":
        group = db.query(Group).filter(Group.id == deal.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        
        # Check if user is a member of the group
        is_member = False
        for member in group.group_members:
            if member.user_id == current_user.id:
                is_member = True
                break
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view deals for groups you are a member of"
            )
    
    return deal

@router.post("/", response_model=DealSchema)
async def create_deal(deal_data: DealCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new deal (automatically created when a group is locked and accepted)"""
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create deals"
        )
    
    # Check if the group exists
    group = db.query(Group).filter(Group.id == deal_data.group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if the seller is the owner of the group
    if group.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create deals for your own groups"
        )
    
    # Check if the group is locked
    if not group.locked_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group must be locked before creating a deal"
        )
    
    # Check if a deal already exists for this group
    existing_deal = db.query(Deal).filter(Deal.group_id == group.id).first()
    if existing_deal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A deal already exists for this group"
        )
    
    # Create the deal
    new_deal = Deal(
        group_id=group.id,
        seller_id=current_user.id,
        total_amount=group.total_price,
        total_members=group.members,
        status="pending"
    )
    
    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)
    
    return new_deal

@router.put("/{deal_id}", response_model=DealSchema)
async def update_deal(deal_id: int, deal_data: DealUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Update a deal's status"""
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can update deals"
        )
    
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    
    # Check if the seller is the owner of the deal
    if deal.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own deals"
        )
    
    # Update the deal
    if deal_data.status:
        deal.status = deal_data.status
    
    if deal_data.status == "completed" and not deal.completed_at:
        deal.completed_at = datetime.now()
    
    db.commit()
    db.refresh(deal)
    
    return deal