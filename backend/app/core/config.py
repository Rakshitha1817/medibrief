from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediBrief"
    VERSION: str = "1.0.0"
    
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    GROQ_API_KEY: str
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
