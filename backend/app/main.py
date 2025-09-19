from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import os
import logging
import time

# Set up logging with more detailed format but reduce verbosity
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Reduce SQLAlchemy and other verbose loggers
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
logging.getLogger('uvicorn').setLevel(logging.WARNING)
logging.getLogger('uvicorn.access').setLevel(logging.WARNING)

# Suppress pydantic warnings
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

from app.db.database import engine, get_db, Base, SessionLocal
from app.models.models import User, OTPLog, Product, Group, GroupMember, Seller, Rating, Deal

from app.api import auth, products, groups, ratings, deals, sellers, recommendations
from app.utils.csv_handler import create_sample_csv, import_products_from_csv

# Create database tables with retry logic
logger.info("Initializing database...")
max_retries = 5
retry_delay = 2

for attempt in range(max_retries):
    try:
        logger.info(f"Creating database tables (attempt {attempt+1}/{max_retries})")
        Base.metadata.create_all(bind=engine)
        
        # Test database connection by creating a session
        test_db = SessionLocal()
        from sqlalchemy import text
        test_db.execute(text("SELECT 1"))
        test_db.close()
        
        logger.info("Database tables created successfully and connection verified")
        break
    except SQLAlchemyError as e:
        logger.error(f"Database initialization error (attempt {attempt+1}/{max_retries}): {e}")
        if attempt < max_retries - 1:
            logger.info(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff
        else:
            logger.critical("All database initialization attempts failed")
            raise

app = FastAPI(title="LockDeal API", description="API for LockDeal")

# Add request/response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(time.time())
    logger.info(f"[{request_id}] Request: {request.method} {request.url.path}")
    
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"[{request_id}] Response: {response.status_code} (took {process_time:.4f}s)")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"[{request_id}] Error: {str(e)} (took {process_time:.4f}s)")
        raise

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve product images
os.makedirs(os.path.join("uploads", "products"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers with correct prefixes
app.include_router(auth.router, prefix="/api/auth")
app.include_router(products.router, prefix="/api/product")
app.include_router(groups.router, prefix="/api/group")
# Add additional route for groups with plural form to handle frontend requests
app.include_router(groups.router, prefix="/api/groups")
app.include_router(ratings.router, prefix="/api/ratings")
app.include_router(deals.router, prefix="/api/deals")
app.include_router(sellers.router, prefix="/api/sellers")
# Add additional route for sellers with singular form to handle frontend requests
app.include_router(sellers.router, prefix="/api/seller")
app.include_router(recommendations.router, prefix="/api/recommendations")

@app.get("/")
async def root():
    return {"message": "Welcome to LockDeal API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
