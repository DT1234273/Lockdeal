from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging
import time
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Reduce SQLAlchemy logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

# Load environment variables
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"Using database URL: {DATABASE_URL}")

# Configure connection pool and retry settings for PostgreSQL
engine_args = {
    "echo": False,  # Disable SQL query logging
    "pool_pre_ping": True,  # Check connection before using from pool
    "pool_recycle": 3600,  # Recycle connections after 1 hour
    "pool_size": 10,  # Maximum number of connections in pool
    "max_overflow": 20,  # Maximum number of connections that can be created beyond pool_size
    "connect_args": {}
}

# Add specific connect_args for PostgreSQL
if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
    engine_args["connect_args"] = {
        "connect_timeout": 10,  # Connection timeout in seconds
        "application_name": "lockdeal_app"  # Identify app in PostgreSQL logs
    }

# Create SQLAlchemy engine with retry logic
max_retries = 5
retry_delay = 2

for attempt in range(max_retries):
    try:
        logger.info(f"Attempting to connect to database (attempt {attempt+1}/{max_retries})")
        engine = create_engine(DATABASE_URL, **engine_args)
        # Test connection
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        break
    except OperationalError as e:
        logger.error(f"Database connection failed (attempt {attempt+1}/{max_retries}): {e}")
        if attempt < max_retries - 1:
            logger.info(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff
        else:
            logger.critical("All database connection attempts failed")
            raise

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()