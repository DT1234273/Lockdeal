from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_add_product_id_to_ratings'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add product_id column to ratings table
    op.add_column('ratings', sa.Column('product_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_ratings_product_id_products',
        'ratings', 'products',
        ['product_id'], ['id']
    )


def downgrade() -> None:
    # Remove product_id column from ratings table
    op.drop_constraint('fk_ratings_product_id_products', 'ratings', type_='foreignkey')
    op.drop_column('ratings', 'product_id')