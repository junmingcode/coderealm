from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
import bleach
from PIL import Image
import io

from app.database import get_db
from app.config import get_settings
from app.dependencies import get_current_admin
from app.limiter import limiter

router = APIRouter()
settings = get_settings()

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}


def get_upload_dir():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, settings.upload_dir)


def sanitize_svg(content: str) -> str:
    allowed_tags = {
        "svg", "g", "path", "rect", "circle", "line", "polyline", "polygon",
        "text", "tspan", "defs", "use", "symbol", "linearGradient",
        "radialGradient", "stop", "clipPath", "mask", "pattern", "image",
        "filter", "feGaussianBlur", "title", "desc"
    }
    allowed_attrs = {
        "*": ["class", "id", "fill", "stroke", "stroke-width"],
        "svg": ["xmlns", "viewBox", "width", "height", "version", "preserveAspectRatio"],
        "path": ["d", "fill-rule", "clip-rule"],
        "rect": ["x", "y", "width", "height", "rx", "ry"],
        "circle": ["cx", "cy", "r"],
        "line": ["x1", "y1", "x2", "y2"],
        "polyline": ["points"],
        "polygon": ["points"],
        "text": ["x", "y", "font-size", "font-family", "text-anchor"],
        "image": ["href", "x", "y", "width", "height"],
        "use": ["href", "x", "y", "width", "height"],
    }
    return bleach.clean(content, tags=allowed_tags, attributes=allowed_attrs, strip=True)


@router.post("/image")
@limiter.limit("10/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
):
    ext = os.path.splitext(file.filename)[1].lstrip(".").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content = await file.read()
    if len(content) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="File too large")

    if ext == "svg":
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Invalid SVG encoding")
        if "<svg" not in text:
            raise HTTPException(status_code=400, detail="Invalid SVG content")
        text = sanitize_svg(text)
        content = text.encode("utf-8")
        filename = f"{uuid.uuid4().hex}.svg"
    else:
        try:
            img = Image.open(io.BytesIO(content))
            fmt = img.format.lower() if img.format else ""
            if fmt not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"Image format mismatch: {fmt}")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file")

        try:
            max_size = (1920, 1080)
            img.thumbnail(max_size, Image.LANCZOS)
            output = io.BytesIO()
            if fmt == "png":
                if img.mode in ("RGBA", "P"):
                    img.save(output, format="PNG", optimize=True)
                else:
                    img.save(output, format="PNG", optimize=True)
                out_ext = "png"
            elif fmt == "gif":
                img.save(output, format="GIF")
                out_ext = "gif"
            elif fmt == "webp":
                img.save(output, format="WEBP", quality=85, method=6)
                out_ext = "webp"
            else:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(output, format="JPEG", quality=85, optimize=True)
                out_ext = "jpg"
            content = output.getvalue()
            filename = f"{uuid.uuid4().hex}.{out_ext}"
        except Exception:
            raise HTTPException(status_code=400, detail="Image processing failed")

    upload_path = os.path.join(get_upload_dir(), filename)
    with open(upload_path, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}"}
