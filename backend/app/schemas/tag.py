from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None


class TagResponse(TagBase):
    id: int
    created_at: datetime
    article_count: int = 0

    class Config:
        from_attributes = True
