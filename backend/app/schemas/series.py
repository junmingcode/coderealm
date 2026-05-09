from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class SeriesBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    cover_image: Optional[str] = None


class SeriesCreate(SeriesBase):
    pass


class SeriesUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None


class SeriesArticleItem(BaseModel):
    id: int
    title: str
    slug: str
    series_order: Optional[int] = None
    published_at: Optional[datetime] = None
    reading_time: int = 1

    class Config:
        from_attributes = True


class SeriesResponse(SeriesBase):
    id: int
    created_at: datetime
    article_count: int = 0
    articles: List[SeriesArticleItem] = []

    class Config:
        from_attributes = True


class SeriesListResponse(SeriesBase):
    id: int
    created_at: datetime
    article_count: int = 0

    class Config:
        from_attributes = True
