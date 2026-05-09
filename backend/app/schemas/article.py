from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Literal, Optional
from app.schemas.category import CategoryResponse
from app.schemas.tag import TagResponse


class SeriesInfo(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class ArticleBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    summary: Optional[str] = Field(None, max_length=500)
    cover_image: Optional[str] = Field(None, max_length=255)
    status: Literal["draft", "published"] = "draft"
    category_id: Optional[int] = None
    tag_ids: List[int] = []
    series_id: Optional[int] = None
    series_order: Optional[int] = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(ArticleBase):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)


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
    reading_time: int
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    category: Optional[CategoryResponse]
    tags: List[TagResponse]
    series: Optional[SeriesInfo] = None
    series_order: Optional[int] = None

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
    reading_time: int
    created_at: datetime
    published_at: Optional[datetime]
    category: Optional[CategoryResponse]
    tags: List[TagResponse]
    series: Optional[SeriesInfo] = None
    series_order: Optional[int] = None

    class Config:
        from_attributes = True
