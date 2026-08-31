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
    registered_crops = relationship("RegisteredCrop", back_populates="user", cascade="all, delete-orphan")

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

class RegisteredCrop(Base):
    __tablename__ = "registered_crops"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String, nullable=False)  # e.g. "rice", "maize"
    season = Column(String, nullable=False)  # "kharif", "rabi", "zaid"
    sowing_date = Column(String, nullable=False)  # ISO date string "2026-07-15"
    expected_harvest_date = Column(String, nullable=True)  # Auto-computed
    current_stage = Column(String, default="germination")
    stage_start_date = Column(String, nullable=True)
    next_stage = Column(String, nullable=True)
    next_stage_date = Column(String, nullable=True)
    status = Column(String, default="active")  # active, harvested, failed
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="registered_crops")
