from pydantic import BaseModel
from typing import List, TypeVar, Generic


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 10


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
