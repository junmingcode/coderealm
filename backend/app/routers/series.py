from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from slugify import slugify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Series, Article
from app.schemas.series import SeriesCreate, SeriesUpdate, SeriesResponse, SeriesListResponse
from app.dependencies import get_current_admin
from app.utils.reading import calculate_reading_time

router = APIRouter()


@router.get("", response_model=list[SeriesListResponse])
def list_series(db: Session = Depends(get_db)):
    article_count_sub = (
        db.query(Article.series_id, func.count(Article.id).label("cnt"))
        .filter(Article.status == "published")
        .group_by(Article.series_id)
        .subquery()
    )
    rows = (
        db.query(Series, func.coalesce(article_count_sub.c.cnt, 0).label("article_count"))
        .outerjoin(article_count_sub, Series.id == article_count_sub.c.series_id)
        .all()
    )
    result = []
    for series, count in rows:
        series.article_count = count
        result.append(series)
    return result


@router.get("/{slug}", response_model=SeriesResponse)
def get_series(slug: str, db: Session = Depends(get_db)):
    series = db.query(Series).filter(Series.slug == slug).first()
    if not series:
        raise HTTPException(status_code=404, detail="系列不存在")
    series.article_count = db.query(func.count(Article.id)).filter(
        Article.series_id == series.id, Article.status == "published"
    ).scalar()
    articles = (
        db.query(Article)
        .filter(Article.series_id == series.id, Article.status == "published")
        .order_by(Article.series_order.asc(), Article.published_at.asc())
        .all()
    )
    series.articles = [{"id": a.id, "title": a.title, "slug": a.slug, "series_order": a.series_order, "published_at": a.published_at, "reading_time": calculate_reading_time(a.content)} for a in articles]
    return series


@router.post("", response_model=SeriesResponse)
def create_series(data: SeriesCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    s = Series(name=data.name, slug=slugify(data.slug) if data.slug else slugify(data.name), description=data.description, cover_image=data.cover_image)
    db.add(s)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        import uuid
        s.slug = f"{s.slug}-{uuid.uuid4().hex[:8]}"
        db.add(s)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            s.slug = f"{s.slug}-{uuid.uuid4().hex[:8]}"
            db.add(s)
            db.commit()
    db.refresh(s)
    s.article_count = 0
    s.articles = []
    return s


@router.put("/{series_id}", response_model=SeriesResponse)
def update_series(series_id: int, data: SeriesUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="系列不存在")
    if data.name is not None:
        series.name = data.name
    if data.slug is not None:
        series.slug = data.slug
    if data.description is not None:
        series.description = data.description
    if data.cover_image is not None:
        series.cover_image = data.cover_image
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Slug 已存在")
    db.refresh(series)
    series.article_count = db.query(func.count(Article.id)).filter(
        Article.series_id == series.id, Article.status == "published"
    ).scalar()
    series.articles = []
    return series


@router.delete("/{series_id}")
def delete_series(series_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="系列不存在")
    db.query(Article).filter(Article.series_id == series_id).update({"series_id": None, "series_order": None})
    db.delete(series)
    db.commit()
    return {"message": "删除成功"}
