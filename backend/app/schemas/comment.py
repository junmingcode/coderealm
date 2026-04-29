from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class CommentBase(BaseModel):
    author_name: str
    author_email: str
    content: str
    parent_id: Optional[int] = None


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    article_id: int
    status: str
    created_at: datetime
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


CommentResponse.model_rebuild()
