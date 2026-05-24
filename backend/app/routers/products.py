from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Post a new product in the marketplace. Requires login."""
    db_product = models.Product(
        title=product_in.title,
        price=product_in.price,
        original_price=product_in.original_price,
        condition=product_in.condition,
        category=product_in.category,
        image_url=product_in.image_url,
        description=product_in.description,
        tags=product_in.tags or ["CollegeItem"],
        seller_id=current_user.id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve products matching filters (search text, category, price, condition)."""
    query = db.query(models.Product)
    
    if q:
        query = query.filter(
            (models.Product.title.ilike(f"%{q}%")) | 
            (models.Product.description.ilike(f"%{q}%"))
        )
    if category and category != "All":
        query = query.filter(models.Product.category.ilike(category))
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if condition and condition != "All":
        query = query.filter(models.Product.condition.ilike(condition))
        
    return query.order_by(models.Product.created_at.desc()).all()

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Fetch details of a single product by its ID."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product
