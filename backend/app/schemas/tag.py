from pydantic import BaseModel
from datetime import datetime


class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime
    article_count: int = 0

    class Config:
        from_attributes = True
