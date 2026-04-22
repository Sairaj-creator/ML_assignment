from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./app.db"

    # Security — C4 FIX: No default value. App crashes at startup if JWT_SECRET is
    # not set in env, preventing silent use of a known-plaintext secret.
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ML Config
    MAX_PIXELS: int = 8_000_000
    RATE_LIMIT_PER_MINUTE: int = 60
    MODEL_VARIANT_DEFAULT: str = "int8_static_640"
    MOCK_INFERENCE: bool = True

    # App
    DEBUG: bool = True
    APP_NAME: str = "PrivacyMaskAPI"
    VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
