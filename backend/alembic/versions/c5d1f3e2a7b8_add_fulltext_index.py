"""add fulltext index for article search

Revision ID: c5d1f3e2a7b8
Revises: b3c9e2a1d4f5
Create Date: 2026-05-08 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5d1f3e2a7b8'
down_revision: Union[str, None] = 'b3c9e2a1d4f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'mysql':
        op.execute("ALTER TABLE articles ADD FULLTEXT INDEX ft_articles_search (title, content, summary)")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'mysql':
        op.execute("ALTER TABLE articles DROP INDEX ft_articles_search")
