from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel
from ..db.database import get_db
from ..models.models import Group, GroupMember, Product, User, Seller
from ..schemas.product import GroupCreate, GroupResponse, GroupDetailResponse, GroupMemberCreate
from ..utils.auth import get_current_user, generate_pickup_otp, send_otp

router = APIRouter(tags=["Groups"])

@router.get("/", response_model=List[GroupResponse])
async def get_all_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    return groups


@router.get("/available", response_model=List[GroupResponse])
async def get_available_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a seller
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can view available groups"
        )
    
    # Get groups that meet criteria (10+ members OR ₹1000+ total price)
    # and are locked, not accepted, not picked up
    # Include groups created by website developers (email ending with @example.com) and groups that don't belong to the current seller
    
    # First, get all groups that have been accepted by any seller
    accepted_group_ids = db.query(Group.id).filter(Group.is_accepted == True).all()
    accepted_group_ids = [g[0] for g in accepted_group_ids]
    
    groups = db.query(Group).join(Product).join(User, User.id == Group.seller_id).filter(
        or_(
            and_(
                Group.seller_id != current_user.id,  # Not the current seller's groups
                Group.locked_at != None,  # Locked
                Group.is_accepted == False,  # Not accepted
                ~Group.id.in_(accepted_group_ids) if accepted_group_ids else True,  # Not accepted by any seller
                or_(
                    Group.members >= 10,  # 10+ members
                    Group.total_price >= 1000  # ₹1000+ total price
                )
            ),
            User.email.like("%@example.com")  # Groups created by website developers
        )
    ).all()
    
    # Filter out groups where any member has picked up
    filtered_groups = []
    for group in groups:
        # Check if any member has picked up
        any_pickup = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.is_picked_up == True
        ).first()
        
        if not any_pickup:
            filtered_groups.append(group)
    
    return filtered_groups

@router.get("/my-groups", response_model=List[GroupResponse])
async def get_my_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        # Get groups where user is a member
        group_ids = db.query(GroupMember.group_id).filter(GroupMember.user_id == current_user.id).all()
        group_ids = [g[0] for g in group_ids]
        groups = db.query(Group).filter(Group.id.in_(group_ids)).all()
        
        # Attach user-specific data to each group
        for group in groups:
            # Get the user's group member record to get quantity and total_price
            member = db.query(GroupMember).filter(
                GroupMember.group_id == group.id,
                GroupMember.user_id == current_user.id
            ).first()
            
            if member:
                group.quantity = member.quantity
                # Store user's total price in a separate field to avoid overriding group's total price
                group.user_total_price = member.total_price
                # Always set the is_picked_up flag from the group member to ensure it's correctly reflected
                # This is critical for ensuring orders appear in the correct section on the frontend
                group.is_picked_up = member.is_picked_up
                # If member is picked up, ensure picked_up_at is set
                if member.is_picked_up and member.picked_up_at:
                    group.picked_up_at = member.picked_up_at
                
            # Ensure seller information is loaded
            if group.seller_id:
                seller = db.query(Seller).filter(Seller.user_id == group.seller_id).first()
                if seller:
                    group.seller = seller
    else:  # seller
        # For sellers, show two types of groups:
        # 1. ALL groups where the product belongs to the seller (regardless of criteria)
        # 2. Other sellers' groups that meet criteria (members >= 10 OR total_price >= 1000)
        #    BUT only on Saturdays or in the special Available Groups section
        import datetime
        
        # Get all groups where the product belongs to the seller
        seller_product_ids = db.query(Product.id).filter(Product.seller_id == current_user.id).all()
        seller_product_ids = [p[0] for p in seller_product_ids]
        
        # Get seller's own groups (all of them)
        own_groups = db.query(Group).filter(Group.product_id.in_(seller_product_ids)).all()
        
        # Check if today is Saturday (weekday 5)
        is_saturday = datetime.datetime.now().weekday() == 5
        
        # Get other sellers' groups that meet criteria, but only if it's Saturday
        other_groups = []
        if is_saturday:
            other_groups = db.query(Group).filter(
                ~Group.product_id.in_(seller_product_ids),  # Not seller's own products
                or_(
                    Group.members >= 10,
                    Group.total_price >= 1000
                )
            ).all()
        
        # Combine both sets of groups
        groups = own_groups + other_groups
    
    return groups

@router.get("/accepted", response_model=List[GroupResponse])
async def get_accepted_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a seller
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can view accepted groups"
        )
    
    # Get all groups that have been accepted but don't belong to the current seller
    accepted_groups = db.query(Group).join(Product).filter(
        Group.seller_id != current_user.id,  # Not the current seller's groups
        Group.is_accepted == True,  # Accepted groups
        Group.locked_at != None,  # Locked groups
        Group.is_completed == False  # Not completed groups
    ).all()
    
    return accepted_groups

@router.get("/completed", response_model=List[GroupResponse])
async def get_completed_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a seller
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can view completed groups"
        )
    
    # Get all groups that have been completed and don't belong to the current seller
    completed_groups = db.query(Group).join(Product).filter(
        Group.seller_id != current_user.id,  # Not the current seller's groups
        Group.is_accepted == True,  # Accepted groups
        Group.is_completed == True  # Completed groups
    ).all()
    
    return completed_groups

@router.get("/{group_id}", response_model=GroupDetailResponse)
async def get_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return group

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(group_data: GroupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if product exists
    product = db.query(Product).filter(Product.id == group_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Create group
    new_group = Group(
        product_id=group_data.product_id,
        seller_id=product.seller_id,
        total_price=0,
        members=0
    )
    
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    return new_group

@router.post("/join", status_code=status.HTTP_201_CREATED)
async def join_group(group_member_data: GroupMemberCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can join groups"
        )
    
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_member_data.group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if group is already locked
    if group.locked_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is already locked and cannot be joined"
        )
    
    # Check if user is already a member of this group
    existing_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_member_data.group_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    # Get product information first
    product = db.query(Product).filter(Product.id == group.product_id).first()
    
    if existing_member:
        # Update quantity if already a member
        existing_member.quantity = group_member_data.quantity
        existing_member.total_price = group_member_data.quantity * product.price  # Update total_price
        db.commit()
        db.refresh(existing_member)
    else:
        # Add user to group
        new_member = GroupMember(
            group_id=group_member_data.group_id,
            user_id=current_user.id,
            seller_id=group.seller_id,  # Set seller_id from the group
            quantity=group_member_data.quantity,
            total_price=group_member_data.quantity * product.price  # Calculate total_price
        )
        
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
    
    # Update group total price and member count
    
    # Calculate total price and members
    total_quantity = db.query(func.sum(GroupMember.quantity)).filter(GroupMember.group_id == group.id).scalar() or 0
    total_members = db.query(func.count(GroupMember.id)).filter(GroupMember.group_id == group.id).scalar() or 0
    
    group.total_price = total_quantity * product.price
    group.members = total_members
    
    db.commit()
    
    return {"message": "Successfully joined group"}

@router.post("/lock/{group_id}", status_code=status.HTTP_200_OK)
async def lock_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"DEBUG: lock_group called for group_id={group_id}, user={current_user.email}, role={current_user.role}")
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if group is already locked
    print(f"DEBUG: Group {group_id} locked_at status: {group.locked_at}")
    if group.locked_at:
        print(f"DEBUG: Group {group_id} is already locked at {group.locked_at}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is already locked"
        )
    

    
    # Lock group without criteria check
    group.locked_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Group locked successfully"}

@router.post("/lock-and-accept/{group_id}", status_code=status.HTTP_200_OK)
async def lock_and_accept_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"DEBUG: lock_and_accept_group called for group_id={group_id}, user={current_user.email}, role={current_user.role}")
    # Check if user is a seller
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can accept groups"
        )
    
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if group is already accepted
    print(f"DEBUG: Group {group_id} is_accepted status: {group.is_accepted}, locked_at: {group.locked_at}")
    if group.is_accepted:
        print(f"DEBUG: Group {group_id} is already accepted")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is already accepted by a seller"
        )
    
    # Store initial locked status to determine if criteria check is needed
    was_locked_initially = group.locked_at is not None
    
    # Lock the group if it's not already locked
    if not group.locked_at:
        group.locked_at = datetime.utcnow()
        db.commit()

    # Criteria check removed - allow accepting any group regardless of size or value
    # Groups can now be accepted even if they have fewer than 10 members or total price less than ₹1000
    
    # Accept group
    group.is_accepted = True
    db.commit()
    db.refresh(group)
    
    # Create a Deal record for this group if it doesn't exist
    from ..models.models import Deal
    existing_deal = db.query(Deal).filter(Deal.group_id == group.id).first()
    if not existing_deal:
        new_deal = Deal(
            group_id=group.id,
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(new_deal)
        db.commit()
        db.refresh(new_deal)
    
    # Generate pickup OTPs for all group members
    group_members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    for member in group_members:
        otp = generate_pickup_otp(member.id, db)
        print(f"Generated pickup OTP: {otp} for group member ID: {member.id} during group acceptance")
    
    return {"message": "Group locked and accepted successfully"}

@router.post("/accept/{group_id}", status_code=status.HTTP_200_OK)
@router.post("/group/accept/{group_id}", status_code=status.HTTP_200_OK)
async def accept_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Redirect to lock_and_accept_group function
    return await lock_and_accept_group(group_id, current_user, db)
    
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if group is already accepted
    if group.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is already accepted by a seller"
        )
    
    # Check if group belongs to seller or is created by a website developer
    # Get the seller who created the group
    group_seller = db.query(User).filter(User.id == group.seller_id).first()
    is_developer_group = group_seller and group_seller.email.endswith('@example.com')
    
    if group.seller_id != current_user.id and not is_developer_group:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only accept your own groups or groups created by website developers"
        )
    
    # Check if group is locked
    if not group.locked_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group must be locked before it can be accepted"
        )
    
    # Criteria check removed - allow accepting any group regardless of size or value
    # Groups can now be accepted even if they have fewer than 10 members or total price less than ₹1000
    
    # Accept group
    group.is_accepted = True
    db.commit()
    
    # Generate pickup OTPs for all group members
    group_members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    for member in group_members:
        member.pickup_otp = generate_pickup_otp(member.id, db)
    
    db.commit()
    
    return {"message": "Group accepted successfully"}

class VerifyPickupRequest(BaseModel):
    group_id: int
    otp: str
    user_id: int = None

@router.post("/generate-pickup-otp/{group_id}", status_code=status.HTTP_200_OK)
async def generate_pickup_otp_endpoint(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can generate pickup OTPs"
        )
    
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if group is accepted
    if not group.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group must be accepted before generating pickup OTP"
        )
    
    # Check if user is a member of the group
    group_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    # Generate OTP for this member
    otp = generate_pickup_otp(group_member.id, db)
    
    # Log the generated OTP for debugging
    print(f"Generated pickup OTP: {otp} for group member ID: {group_member.id}")
    
    return {"otp": otp}

@router.post("/verify-pickup", status_code=status.HTTP_200_OK)
async def verify_pickup(request: VerifyPickupRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is a seller
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can verify pickups"
        )
    
    # Check if group exists and belongs to seller
    group = db.query(Group).filter(Group.id == request.group_id, Group.seller_id == current_user.id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or does not belong to you"
        )
    
    # Check if group is accepted
    if not group.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group must be accepted before pickup"
        )
    
    # Check if today is Saturday or Sunday for pickup
    today = datetime.datetime.now().weekday()
    if today not in [5, 6]:  # 5 is Saturday, 6 is Sunday
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pickup is only allowed on Saturday or Sunday"
        )
    
    # Find group member by OTP if user_id is not provided
    if request.user_id is None:
        # Find any group member with this OTP
        group_member = db.query(GroupMember).filter(
            GroupMember.group_id == request.group_id,
            GroupMember.pickup_otp == request.otp
        ).first()
        
        if not group_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
            
        # Get all group members for this user to mark all products as picked up
        user_id = group_member.user_id
        all_group_members = db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.is_picked_up == False
        ).all()
        
        # Ensure all_group_members is not empty
        if not all_group_members:
            all_group_members = [group_member]
    else:
        group_member = db.query(GroupMember).filter(
            GroupMember.group_id == request.group_id,
            GroupMember.user_id == request.user_id
        ).first()
        
        # Verify OTP if user_id was provided
        if group_member and group_member.pickup_otp != request.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
            
        # Get all group members for this user to mark all products as picked up
        all_group_members = db.query(GroupMember).filter(
            GroupMember.user_id == request.user_id,
            GroupMember.is_picked_up == False
        ).all()
        
        # Ensure all_group_members is not empty
        if not all_group_members:
            all_group_members = [group_member] if group_member else []
    
    if not group_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No group member found with the provided information"
        )
    
    # Mark all products as picked up for this user
    for member in all_group_members:
        member.is_picked_up = True
    
    db.commit()
    
    # Get customer name
    customer_id = group_member.user_id
    customer = db.query(User).filter(User.id == customer_id).first()
    
    # Get all groups for this customer that were marked as picked up
    picked_up_groups = []
    for member in all_group_members:
        group_details = db.query(Group).filter(Group.id == member.group_id).first()
        product = db.query(Product).filter(Product.id == group_details.product_id).first()
        
        picked_up_groups.append({
            "id": group_details.id,
            "total_quantity": member.quantity,
            "total_price": member.quantity * product.price,
            "product": {
                "id": product.id,
                "name": product.name,
                "unit": product.unit,
                "price": product.price
            }
        })
    
    # Get seller address and contact from the group member's seller
    # This ensures we get the actual seller associated with this group member
    group_member_seller_id = group_member.seller_id
    seller = db.query(Seller).filter(Seller.user_id == group_member_seller_id).first()
    
    # If seller not found or has default placeholder values, try to get from product's seller
    if not seller or seller.address == "Seller address will be available soon" or seller.contact == "Seller contact will be available soon":
        # Get the product from the group
        group_details = db.query(Group).filter(Group.id == group_member.group_id).first()
        product = db.query(Product).filter(Product.id == group_details.product_id).first()
        product_seller_id = product.seller_id
        product_seller = db.query(Seller).filter(Seller.user_id == product_seller_id).first()
        
        if product_seller and product_seller.address != "Seller address will be available soon" and product_seller.contact != "Seller contact will be available soon":
            seller = product_seller
    
    return {
        "message": "Pickup verified successfully",
        "customer_name": customer.name,
        "customer_id": customer_id,
        "seller_address": seller.address,
        "seller_contact": seller.contact,
        "groups": picked_up_groups,
        "total_items": len(picked_up_groups)
    }

# Scheduled task to lock groups every Saturday
# This would typically be implemented with a background task scheduler like Celery
# For simplicity, we'll create an endpoint that can be called manually or by a cron job
@router.post("/schedule/lock-saturday-groups", status_code=status.HTTP_200_OK)
async def lock_saturday_groups(db: Session = Depends(get_db)):
    # Check if today is Saturday
    today = datetime.datetime.now().weekday()
    if today != 5:  # 5 is Saturday
        return {"message": "This operation is only allowed on Saturday"}
    
    # Get all unlocked groups that meet requirements (either total price >= 1000 OR members >= 10)
    from sqlalchemy import or_
    eligible_groups = db.query(Group).filter(
        Group.locked_at == None,
        or_(
            Group.total_price >= 1000,
            Group.members >= 10
        )
    ).all()
    
    locked_count = 0
    for group in eligible_groups:
        group.locked_at = datetime.utcnow()
        locked_count += 1
    
    db.commit()
    
    return {"message": f"Locked {locked_count} eligible groups"}