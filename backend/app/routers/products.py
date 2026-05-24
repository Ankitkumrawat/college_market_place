from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user
from app.utils.cloudinary import upload_image

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    title: str = Form(...),
    price: float = Form(...),
    original_price: Optional[float] = Form(None),
    condition: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Post a new product in the marketplace. Requires login."""
    image_final_url = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500"
    
    if image:
        try:
            image_final_url = upload_image(image.file)
        except Exception as e:
            print(f"Unexpected image upload exception: {str(e)}. Using fallback/provided image.")
            if image_url:
                image_final_url = image_url
    elif image_url:
        image_final_url = image_url

    parsed_tags = ["CollegeItem"]
    if tags:
        try:
            parsed_tags = json.loads(tags)
        except Exception:
            parsed_tags = [t.strip() for t in tags.split(",") if t.strip()]

    db_product = models.Product(
        title=title,
        price=price,
        original_price=original_price,
        condition=condition,
        category=category,
        image_url=image_final_url,
        description=description or "No detailed description provided.",
        tags=parsed_tags,
        seller_id=current_user.id,
        status="active",
        is_sold=False
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

@router.post("/{product_id}/buy", response_model=schemas.ConversationResponse)
def express_interest_or_buy(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Register buying interest (order) and start a private conversation with the seller."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    if product.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot buy your own product.")
        
    # Check if conversation already exists
    conv = db.query(models.Conversation).filter(
        models.Conversation.buyer_id == current_user.id,
        models.Conversation.seller_id == product.seller_id,
        models.Conversation.product_id == product_id
    ).first()
    
    if not conv:
        conv = models.Conversation(
            buyer_id=current_user.id,
            seller_id=product.seller_id,
            product_id=product_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        
    # Create or update Order (interest record)
    order = db.query(models.Order).filter(
        models.Order.buyer_id == current_user.id,
        models.Order.product_id == product_id
    ).first()
    
    if not order:
        order = models.Order(
            buyer_id=current_user.id,
            product_id=product_id,
            status="pending"
        )
        db.add(order)
        db.commit()
        
    return conv

@router.put("/{product_id}/sold", response_model=schemas.ProductResponse)
def mark_product_as_sold(
    product_id: int,
    buyer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mark a product as sold and update the interest record status to completed."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can mark this product as sold.")
        
    product.status = "sold"
    product.is_sold = True
    
    # Mark associated order as completed
    if buyer_id:
        order = db.query(models.Order).filter(
            models.Order.buyer_id == buyer_id,
            models.Order.product_id == product_id
        ).first()
        if order:
            order.status = "completed"
    else:
        # Mark all pending orders for this product as completed
        orders = db.query(models.Order).filter(
            models.Order.product_id == product_id,
            models.Order.status == "pending"
        ).all()
        for order in orders:
            order.status = "completed"
            
    db.commit()
    db.refresh(product)
    return product
