import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')
    
    # Check for Vercel Postgres or Neon database URL
    database_url = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')
    
    if database_url:
        # Fix for SQLAlchemy 1.4+ which requires 'postgresql://' instead of 'postgres://'
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Fallback to local SQLite or ephemeral /tmp in Vercel
        base_dir = os.path.abspath(os.path.dirname(__file__))
        db_path = os.path.join(base_dir, 'database', 'seclabs.db')
        
        # If running in Vercel environment without a DB (fallback mode), use /tmp
        if os.environ.get('VERCEL_ENV'):
            db_path = '/tmp/seclabs.db'
            
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
