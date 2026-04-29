from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.category import CategoryResponse
from app.schemas.tag import TagResponse


class ArticleBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    status: str = "draft"
    category_id: Optional[int] = None
    tag_ids: List[int] = []


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(ArticleBase):
    title: Optional[str] = None
    content: Optional[str] = None


class ArticleResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    summary: Optional[str]
    cover_image: Optional[str]
    status: str
    view_count: int
    like_count: int
    comment_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    category: Optional[CategoryResponse]
    tags: List[TagResponse]

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str]
    cover_image: Optional[str]
    status: str
    view_count: int
    like_count: int
    comment_count: int
    created_at: datetime
    published_at: Optional[datetime]
    category: Optional[CategoryResponse]
    tags: List[TagResponse]

    class Config:
        from_attributes = True
