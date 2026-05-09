"""add site_configs table

Revision ID: b3c9e2a1d4f5
Revises: a418b601b0c5
Create Date: 2026-05-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c9e2a1d4f5'
down_revision: Union[str, None] = 'a418b601b0c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('site_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_site_configs_id', 'site_configs', ['id'])
    op.create_index('ix_site_configs_key', 'site_configs', ['key'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_site_configs_key', table_name='site_configs')
    op.drop_index('ix_site_configs_id', table_name='site_configs')
    op.drop_table('site_configs')
