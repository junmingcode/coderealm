from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import SiteConfig
from app.dependencies import get_current_admin

router = APIRouter()


class SiteConfigUpdate(BaseModel):
    value: str


@router.get("/{key}")
def get_site_config(key: str, db: Session = Depends(get_db)):
    config = db.query(SiteConfig).filter(SiteConfig.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    return {"key": config.key, "value": config.value}


@router.put("/{key}")
def update_site_config(
    key: str,
    data: SiteConfigUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    config = db.query(SiteConfig).filter(SiteConfig.key == key).first()
    if config:
        config.value = data.value
    else:
        config = SiteConfig(key=key, value=data.value)
        db.add(config)
    db.commit()
    db.refresh(config)
    return {"key": config.key, "value": config.value}


@router.get("")
def list_site_configs(db: Session = Depends(get_db)):
    configs = db.query(SiteConfig).all()
    return {c.key: c.value for c in configs}
