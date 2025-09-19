import csv
import os
from sqlalchemy.orm import Session
from ..models.models import Product, Seller
from typing import List, Dict, Any

def import_products_from_csv(db: Session, csv_path: str = "market.csv") -> List[Dict[str, Any]]:
    """
    Import products from a CSV file and return them as a list of dictionaries.
    If the seller exists, associate the products with the seller.
    """
    if not os.path.exists(csv_path):
        return []
    
    products_data = []
    
    with open(csv_path, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            # Check if seller exists
            seller = None
            if 'seller_id' in row and row['seller_id']:
                seller = db.query(Seller).filter(Seller.user_id == int(row['seller_id'])).first()
            
            # If seller doesn't exist, skip this product
            if not seller:
                continue
            
            # Create product dictionary
            product_data = {
                "name": row.get("name", ""),
                "price": float(row.get("price", 0)),
                "unit": row.get("unit", "piece"),
                "image_url": row.get("image_url", ""),
                "seller_id": seller.user_id
            }
            
            products_data.append(product_data)
    
    return products_data

def create_sample_csv(csv_path: str = "market.csv") -> None:
    """
    Create a sample CSV file with product data if it doesn't exist.
    This is useful for development and testing.
    """
    if os.path.exists(csv_path):
        return
    
    sample_data = [
        {"name": "Fresh Apples", "price": "120", "unit": "kg", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Organic Tomatoes", "price": "80", "unit": "kg", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Basmati Rice", "price": "150", "unit": "kg", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Whole Wheat Flour", "price": "45", "unit": "kg", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Organic Milk", "price": "60", "unit": "liter", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Fresh Paneer", "price": "300", "unit": "kg", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Mixed Vegetables Pack", "price": "100", "unit": "pack", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Assorted Fruits Basket", "price": "250", "unit": "basket", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Organic Honey", "price": "220", "unit": "500g", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""},
        {"name": "Cold Pressed Oil", "price": "180", "unit": "liter", "image_url": "/uploads/products/sample-product.svg", "seller_id": ""}
    ]
    
    with open(csv_path, mode='w', encoding='utf-8', newline='') as file:
        fieldnames = ["name", "price", "unit", "image_url", "seller_id"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        writer.writeheader()
        for data in sample_data:
            writer.writerow(data)