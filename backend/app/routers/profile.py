from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, FarmerProfile
from ..schemas import FarmerProfileCreate, FarmerProfileResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Farmer Profile"])

@router.get("", response_model=FarmerProfileResponse)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not registered yet.")
    return profile

@router.post("", response_model=FarmerProfileResponse)
def save_profile(payload: FarmerProfileCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if profile:
        profile.full_name = payload.full_name
        profile.phone = payload.phone
        profile.village_or_city = payload.village_or_city
        profile.district = payload.district or ""
        profile.state = payload.state
        profile.latitude = payload.latitude
        profile.longitude = payload.longitude
        profile.farm_size = payload.farm_size
        profile.farm_size_unit = payload.farm_size_unit
        profile.preferred_language = payload.preferred_language
        profile.nitrogen = payload.nitrogen
        profile.phosphorus = payload.phosphorus
        profile.potassium = payload.potassium
        profile.ph = payload.ph
        profile.rainfall = payload.rainfall
        if payload.selected_crop:
            profile.selected_crop = payload.selected_crop
    else:
        profile = FarmerProfile(
            user_id=user.id,
            full_name=payload.full_name,
            phone=payload.phone,
            village_or_city=payload.village_or_city,
            district=payload.district or "",
            state=payload.state,
            latitude=payload.latitude,
            longitude=payload.longitude,
            farm_size=payload.farm_size,
            farm_size_unit=payload.farm_size_unit,
            preferred_language=payload.preferred_language,
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            ph=payload.ph,
            rainfall=payload.rainfall,
            selected_crop=payload.selected_crop or "rice"
        )
        db.add(profile)
        
    user.has_completed_profile = True
    db.commit()
    db.refresh(profile)
    return profile

@router.patch("/select-crop")
def select_crop(crop_name: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not registered")
    profile.selected_crop = crop_name.lower()
    db.commit()
    return {"status": "success", "selected_crop": profile.selected_crop}
