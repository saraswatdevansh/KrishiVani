import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    has_completed_profile = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    village_or_city = Column(String, nullable=False, default="")
    district = Column(String, nullable=False, default="")
    state = Column(String, nullable=False, default="Punjab")
    latitude = Column(Float, nullable=False, default=30.9010)
    longitude = Column(Float, nullable=False, default=75.8573)
    farm_size = Column(Float, nullable=False, default=2.5)
    farm_size_unit = Column(String, default="Acres")
    preferred_language = Column(String, default="en")
    
    # Soil parameters
    nitrogen = Column(Float, nullable=False, default=90.0)
    phosphorus = Column(Float, nullable=False, default=45.0)
    potassium = Column(Float, nullable=False, default=45.0)
    ph = Column(Float, nullable=False, default=6.5)
    rainfall = Column(Float, nullable=False, default=150.0)
    
    selected_crop = Column(String, nullable=True, default="rice")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")
