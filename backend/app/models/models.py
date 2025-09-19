from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime, Text, func
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base  # Using the Base from database.py

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'customer' or 'seller'
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    seller = relationship("Seller", back_populates="user", uselist=False)
    group_memberships = relationship("GroupMember", back_populates="user")
    ratings_given = relationship("Rating", back_populates="user")

class OTPLog(Base):
    __tablename__ = "otp_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.user_id"), nullable=False)
    name = Column(String(200), nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    image_url = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    seller = relationship("Seller", back_populates="products")
    groups = relationship("Group", back_populates="product")

class Group(Base):
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.user_id"), nullable=False)
    total_price = Column(Float, default=0.0)
    members = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    locked_at = Column(DateTime, nullable=True)
    is_accepted = Column(Boolean, default=False)
    is_picked_up = Column(Boolean, default=False)
    picked_up_at = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    product = relationship("Product", back_populates="groups")
    seller = relationship("Seller", back_populates="groups")
    group_members = relationship("GroupMember", back_populates="group")
    deal = relationship("Deal", back_populates="group", uselist=False)

class GroupMember(Base):
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.user_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False, default=0.0)
    joined_at = Column(DateTime, default=func.now())
    is_picked_up = Column(Boolean, default=False)
    pickup_otp = Column(String(6), nullable=True)
    picked_up_at = Column(DateTime, nullable=True)
    
    # Relationships
    group = relationship("Group", back_populates="group_members")
    user = relationship("User", back_populates="group_memberships")
    seller = relationship("Seller", back_populates="group_members")

class Seller(Base):
    __tablename__ = "sellers"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    shop_name = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)
    contact = Column(String(20), nullable=False)
    paid_99 = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="seller")
    products = relationship("Product", back_populates="seller")
    groups = relationship("Group", back_populates="seller")
    ratings_received = relationship("Rating", back_populates="seller")
    deals = relationship("Deal", back_populates="seller")
    group_members = relationship("GroupMember", back_populates="seller")

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    score = Column(Integer, nullable=False)  # 1-5 rating
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="ratings_given")
    seller = relationship("Seller", back_populates="ratings_received")
    product = relationship("Product", backref="ratings")


class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False, unique=True)
    seller_id = Column(Integer, ForeignKey("sellers.user_id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    total_members = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    status = Column(String(20), default="pending")  # pending, completed, cancelled
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    group = relationship("Group", back_populates="deal")
    seller = relationship("Seller", back_populates="deals")