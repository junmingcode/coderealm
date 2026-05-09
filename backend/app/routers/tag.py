from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from slugify import slugify

from app.database import get_db
from app.models import Tag, Article, article_tags
from app.schemas import TagCreate, TagUpdate, TagResponse
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    if tags:
        tag_ids = [t.id for t in tags]
        counts = dict(
            db.query(article_tags.c.tag_id, func.count(Article.id))
            .join(Article, Article.id == article_tags.c.article_id)
            .filter(Article.status == "published", article_tags.c.tag_id.in_(tag_ids))
            .group_by(article_tags.c.tag_id)
            .all()
        )
        for tag in tags:
            tag.article_count = counts.get(tag.id, 0)
    return tags


@router.get("/{slug}", response_model=TagResponse)
def get_tag(slug: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.article_count = db.query(func.count(Article.id)).join(article_tags).filter(
        article_tags.c.tag_id == tag.id, Article.status == "published"
    ).scalar()
    return tag


@router.post("", response_model=TagResponse)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    slug = tag.slug or slugify(tag.name)
    existing = db.query(Tag).filter((Tag.name == tag.name) | (Tag.slug == slug)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag name or slug already exists")
    db_tag = Tag(name=tag.name, slug=slug)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    db_tag.article_count = 0
    return db_tag


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    data: TagUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if data.name is not None:
        tag.name = data.name
    if data.slug is not None:
        tag.slug = data.slug
    elif data.name is not None:
        tag.slug = slugify(data.name)
    db.commit()
    db.refresh(tag)
    tag.article_count = db.query(func.count(Article.id)).join(article_tags).filter(
        article_tags.c.tag_id == tag.id, Article.status == "published"
    ).scalar()
    return tag


@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    usage_count = db.query(func.count(article_tags.c.article_id)).filter(article_tags.c.tag_id == tag_id).scalar()
    if usage_count > 0:
        raise HTTPException(status_code=409, detail="该标签已被文章使用，无法删除")
    db.delete(tag)
    db.commit()
    return {"message": "删除成功"}
