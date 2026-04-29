from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from PIL import Image
import io

from app.database import get_db
from app.config import get_settings
from app.dependencies import get_current_admin

router = APIRouter()
settings = get_settings()

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}


def get_upload_dir():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base_dir, settings.upload_dir)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_path = os.path.join(get_upload_dir(), filename)

    content = await file.read()
    if len(content) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="File too large")

    # Compress image if it's not SVG
    if ext != "svg":
        try:
            img = Image.open(io.BytesIO(content))
            img = img.convert("RGB") if img.mode in ("RGBA", "P") else img
            max_size = (1920, 1080)
            img.thumbnail(max_size, Image.LANCZOS)
            output = io.BytesIO()
            img.save(output, format="JPEG", quality=85, optimize=True)
            content = output.getvalue()
            filename = f"{uuid.uuid4().hex}.jpg"
            upload_path = os.path.join(get_upload_dir(), filename)
        except Exception:
            pass

    with open(upload_path, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}"}
