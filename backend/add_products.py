import os
import sys
import shutil
import csv
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Product, Base, Seller
from app.db.database import get_db, engine

# Create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Create uploads directory if it doesn't exist
upload_dir = os.path.join("uploads", "products")
os.makedirs(upload_dir, exist_ok=True)
print(f"Using upload directory: {os.path.abspath(upload_dir)}")

# Create frontend public uploads directory if it doesn't exist
frontend_upload_dir = "E:\\market_sell\\frontend\\public\\uploads\\products"
os.makedirs(frontend_upload_dir, exist_ok=True)
print(f"Using frontend upload directory: {frontend_upload_dir}")

# Function to copy image from frontend to backend uploads
def copy_image_to_uploads(source_image_path):
    # Generate unique filename
    file_extension = os.path.splitext(source_image_path)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    dest_path = os.path.join(upload_dir, unique_filename)
    
    try:
        # Copy file
        shutil.copy(source_image_path, dest_path)
        print(f"Copied image from {source_image_path} to {dest_path}")
    except Exception as e:
        print(f"Error copying image: {e}")
        # If copy fails, use sample product image
        sample_path = "E:\\market_sell\\frontend\\public\\images\\sample-product.svg"
        if os.path.exists(sample_path):
            shutil.copy(sample_path, dest_path)
            print(f"Used sample product image instead")
        else:
            raise Exception(f"Failed to copy image and sample image not found")
    
    # Return relative path for database storage
    return f"/uploads/products/{unique_filename}"

# Read product data from monthly_products.csv
products_data = []
csv_path = os.path.join(os.path.dirname(__file__), 'monthly_products.csv')

# Get all sellers from the database
sellers = db.query(Seller).all()
if not sellers:
    print("No sellers found in the database. Please create at least one seller first.")
    sys.exit(1)

# Use the first seller if seller_id is not specified in CSV
default_seller = sellers[0]
print(f"Using default seller: {default_seller.shop_name} (ID: {default_seller.user_id})")

with open(csv_path, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Skip empty rows
        if not row['name']:
            continue
            
        # Get image path from frontend public directory
        image_path = f"E:\\market_sell\\frontend\\public{row['image_url']}"
        
        # Check if image exists, if not use sample product image
        if not os.path.exists(image_path):
            print(f"Warning: Image not found at {image_path}")
            image_path = "E:\\market_sell\\frontend\\public\\images\\sample-product.svg"
        
        # Use specified seller_id or default to the first seller
        seller_id = int(row['seller_id']) if row['seller_id'] and row['seller_id'].strip() else default_seller.user_id
        
        products_data.append({
            "name": row['name'],
            "price": float(row['price']),
            "unit": row['unit'],
            "image_path": image_path,
            "seller_id": seller_id
        })
        
    print(f"Found {len(products_data)} products in CSV file.")



try:
    # Check if products already exist
    existing_products = db.query(Product).all()
    existing_names = [p.name for p in existing_products]
    
    # Add products to database
    added_count = 0
    for product_data in products_data:
        # Skip if product with same name already exists
        if product_data["name"] in existing_names:
            print(f"Skipping existing product: {product_data['name']}")
            continue
            
        try:
            # Copy image and get path
            image_db_path = copy_image_to_uploads(product_data["image_path"])
            
            # Create product
            new_product = Product(
                name=product_data["name"],
                price=product_data["price"],
                unit=product_data["unit"],
                image_url=image_db_path,
                seller_id=product_data["seller_id"]  # Use seller_id from CSV data
            )
            
            db.add(new_product)
            added_count += 1
            print(f"Added product: {product_data['name']}")
        except Exception as product_error:
            print(f"Error adding product {product_data['name']}: {product_error}")
    
    # Commit changes
    db.commit()
    print(f"Successfully added {added_count} new products to the database.")

except Exception as e:
    db.rollback()
    print(f"Error adding products: {e}")

finally:
    db.close()