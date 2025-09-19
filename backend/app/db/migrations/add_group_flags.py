from sqlalchemy import Column, Boolean, DateTime
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


def upgrade():
    # Add is_picked_up, picked_up_at, and is_completed columns to groups table
    op.add_column('groups', Column('is_picked_up', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('groups', Column('picked_up_at', sa.DateTime(), nullable=True))
    op.add_column('groups', Column('is_completed', sa.Boolean(), nullable=True, server_default='false'))


def downgrade():
    # Remove the columns
    op.drop_column('groups', 'is_picked_up')
    op.drop_column('groups', 'picked_up_at')
    op.drop_column('groups', 'is_completed')