import json
import os
from datetime import datetime, date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/api/farm",
    tags=["Farm"],
)

LIFECYCLE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "crop_lifecycle.json")
_lifecycle_data = None

def get_lifecycle_data():
    global _lifecycle_data
    if _lifecycle_data is None:
        try:
            with open(LIFECYCLE_PATH, "r") as f:
                _lifecycle_data = json.load(f)
        except Exception:
            _lifecycle_data = {}
    return _lifecycle_data

def compute_crop_stage(crop_name: str, sowing_date_str: str):
    """Compute current growth stage based on sowing date and crop lifecycle data."""
    lifecycle = get_lifecycle_data()
    crop_data = lifecycle.get(crop_name.lower())
    if not crop_data:
        return {"current_stage": "unknown", "stage_progress_pct": 0}
    
    sowing = date.fromisoformat(sowing_date_str)
    today = date.today()
    days_elapsed = (today - sowing).days
    
    if days_elapsed < 0:
        return {
            "current_stage": "not_started",
            "stage_progress_pct": 0,
            "next_stage": crop_data["stages"][0]["name"],
            "next_stage_date": sowing_date_str,
            "days_remaining": crop_data["total_duration_days"],
            "expected_harvest_date": (sowing + timedelta(days=crop_data["total_duration_days"])).isoformat(),
            "stage_advisory": ["Crop not yet sown. Prepare soil and inputs."]
        }
    
    cumulative = 0
    for i, stage in enumerate(crop_data["stages"]):
        stage_end = cumulative + stage["duration_days"]
        if days_elapsed < stage_end:
            days_in_stage = days_elapsed - cumulative
            progress = (days_in_stage / stage["duration_days"]) * 100
            next_stage = crop_data["stages"][i + 1]["name"] if i + 1 < len(crop_data["stages"]) else "Harvest Complete"
            next_stage_date = (sowing + timedelta(days=stage_end)).isoformat()
            harvest_date = (sowing + timedelta(days=crop_data["total_duration_days"])).isoformat()
            days_remaining = crop_data["total_duration_days"] - days_elapsed
            
            return {
                "current_stage": stage["name"],
                "stage_start_date": (sowing + timedelta(days=cumulative)).isoformat(),
                "stage_progress_pct": round(min(progress, 100), 1),
                "days_in_stage": days_in_stage,
                "next_stage": next_stage,
                "next_stage_date": next_stage_date,
                "expected_harvest_date": harvest_date,
                "days_remaining": max(days_remaining, 0),
                "stage_advisory": stage.get("care_tips", []),
                "irrigation": stage.get("irrigation", ""),
                "fertilizer": stage.get("fertilizer", "")
            }
        cumulative = stage_end
    
    # Past all stages = harvest time
    harvest_date = (sowing + timedelta(days=crop_data["total_duration_days"])).isoformat()
    return {
        "current_stage": "Harvest / Post-Harvest",
        "stage_progress_pct": 100,
        "days_in_stage": days_elapsed - cumulative,
        "next_stage": None,
        "next_stage_date": None,
        "expected_harvest_date": harvest_date,
        "days_remaining": 0,
        "stage_advisory": ["Crop is ready for harvest or has been harvested.", "Plan post-harvest storage and marketing.", "Consider selling at nearby mandi for best prices."]
    }

@router.post("/register-crop", response_model=schemas.RegisteredCropResponse)
def register_crop(
    req: schemas.RegisterCropRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate crop_name
    lifecycle = get_lifecycle_data()
    crop_name_lower = req.crop_name.lower()
    if lifecycle and crop_name_lower not in lifecycle:
        raise HTTPException(status_code=400, detail="Invalid crop name")

    stage_info = compute_crop_stage(crop_name_lower, req.sowing_date)
    
    new_crop = models.RegisteredCrop(
        user_id=current_user.id,
        crop_name=req.crop_name,
        season=req.season,
        sowing_date=req.sowing_date,
        notes=req.notes,
        expected_harvest_date=stage_info.get("expected_harvest_date"),
        current_stage=stage_info.get("current_stage"),
        stage_start_date=stage_info.get("stage_start_date"),
        next_stage=stage_info.get("next_stage"),
        next_stage_date=stage_info.get("next_stage_date"),
    )
    
    db.add(new_crop)
    
    # Auto-sync farmer's active/primary crop to this newly registered crop
    profile = db.query(models.FarmerProfile).filter(models.FarmerProfile.user_id == current_user.id).first()
    if profile:
        profile.selected_crop = crop_name_lower
        
    db.commit()
    db.refresh(new_crop)
    
    resp_dict = {
        "id": new_crop.id,
        "user_id": new_crop.user_id,
        "crop_name": new_crop.crop_name,
        "season": new_crop.season,
        "sowing_date": new_crop.sowing_date,
        "expected_harvest_date": new_crop.expected_harvest_date,
        "current_stage": new_crop.current_stage,
        "stage_start_date": new_crop.stage_start_date,
        "next_stage": new_crop.next_stage,
        "next_stage_date": new_crop.next_stage_date,
        "status": new_crop.status,
        "notes": new_crop.notes,
        "stage_progress_pct": stage_info.get("stage_progress_pct"),
        "days_in_stage": stage_info.get("days_in_stage"),
        "days_remaining": stage_info.get("days_remaining"),
        "stage_advisory": stage_info.get("stage_advisory"),
    }
    return resp_dict

@router.get("/my-crops", response_model=List[schemas.RegisteredCropResponse])
def my_crops(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crops = db.query(models.RegisteredCrop).filter(models.RegisteredCrop.user_id == current_user.id).all()
    results = []
    for crop in crops:
        stage_info = compute_crop_stage(crop.crop_name, crop.sowing_date)
        resp_dict = {
            "id": crop.id,
            "user_id": crop.user_id,
            "crop_name": crop.crop_name,
            "season": crop.season,
            "sowing_date": crop.sowing_date,
            "expected_harvest_date": stage_info.get("expected_harvest_date", crop.expected_harvest_date),
            "current_stage": stage_info.get("current_stage", crop.current_stage),
            "stage_start_date": stage_info.get("stage_start_date", crop.stage_start_date),
            "next_stage": stage_info.get("next_stage", crop.next_stage),
            "next_stage_date": stage_info.get("next_stage_date", crop.next_stage_date),
            "status": crop.status,
            "notes": crop.notes,
            "stage_progress_pct": stage_info.get("stage_progress_pct"),
            "days_in_stage": stage_info.get("days_in_stage"),
            "days_remaining": stage_info.get("days_remaining"),
            "stage_advisory": stage_info.get("stage_advisory"),
        }
        results.append(resp_dict)
    return results

@router.get("/crop/{crop_id}/advisory")
def get_crop_advisory(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crop = db.query(models.RegisteredCrop).filter(models.RegisteredCrop.id == crop_id, models.RegisteredCrop.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    stage_info = compute_crop_stage(crop.crop_name, crop.sowing_date)
    return {
        "crop_name": crop.crop_name,
        "current_stage": stage_info.get("current_stage"),
        "stage_progress_pct": stage_info.get("stage_progress_pct"),
        "advisory": stage_info.get("stage_advisory"),
        "irrigation": stage_info.get("irrigation"),
        "fertilizer": stage_info.get("fertilizer")
    }

@router.patch("/crop/{crop_id}/status", response_model=schemas.RegisteredCropResponse)
def update_crop_status(
    crop_id: int,
    status_update: schemas.CropStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crop = db.query(models.RegisteredCrop).filter(models.RegisteredCrop.id == crop_id, models.RegisteredCrop.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    crop.status = status_update.status
    db.commit()
    db.refresh(crop)
    
    stage_info = compute_crop_stage(crop.crop_name, crop.sowing_date)
    resp_dict = {
        "id": crop.id,
        "user_id": crop.user_id,
        "crop_name": crop.crop_name,
        "season": crop.season,
        "sowing_date": crop.sowing_date,
        "expected_harvest_date": stage_info.get("expected_harvest_date", crop.expected_harvest_date),
        "current_stage": stage_info.get("current_stage", crop.current_stage),
        "stage_start_date": stage_info.get("stage_start_date", crop.stage_start_date),
        "next_stage": stage_info.get("next_stage", crop.next_stage),
        "next_stage_date": stage_info.get("next_stage_date", crop.next_stage_date),
        "status": crop.status,
        "notes": crop.notes,
        "stage_progress_pct": stage_info.get("stage_progress_pct"),
        "days_in_stage": stage_info.get("days_in_stage"),
        "days_remaining": stage_info.get("days_remaining"),
        "stage_advisory": stage_info.get("stage_advisory"),
    }
    return resp_dict

@router.patch("/crop/{crop_id}/set-primary")
def set_primary_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crop = db.query(models.RegisteredCrop).filter(
        models.RegisteredCrop.id == crop_id,
        models.RegisteredCrop.user_id == current_user.id
    ).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    profile = db.query(models.FarmerProfile).filter(models.FarmerProfile.user_id == current_user.id).first()
    if profile:
        profile.selected_crop = crop.crop_name.lower()
        db.commit()
    
    return {"status": "success", "selected_crop": crop.crop_name.lower()}

@router.delete("/crop/{crop_id}")
def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crop = db.query(models.RegisteredCrop).filter(models.RegisteredCrop.id == crop_id, models.RegisteredCrop.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    deleted_crop_name = crop.crop_name.lower()
    db.delete(crop)
    
    # If the deleted crop was the primary crop, reassign to another active crop if available
    profile = db.query(models.FarmerProfile).filter(models.FarmerProfile.user_id == current_user.id).first()
    if profile and profile.selected_crop == deleted_crop_name:
        remaining = db.query(models.RegisteredCrop).filter(
            models.RegisteredCrop.user_id == current_user.id,
            models.RegisteredCrop.status == "active"
        ).first()
        profile.selected_crop = remaining.crop_name.lower() if remaining else "rice"
        
    db.commit()
    return {"detail": "Crop deleted successfully"}

