from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Moderation & Administration"])

def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Dependency to check if the current user is an administrator."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to perform this action."
        )
    return current_user

@router.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_current_admin)
):
    """Admin forcefully deletes a product listing."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product listing not found."
        )
    db.delete(product)
    db.commit()
    return {"success": True, "detail": f"Product '{product.title}' has been deleted."}

@router.delete("/posts/{post_id}", status_code=status.HTTP_200_OK)
def delete_post(
    post_id: str, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_current_admin)
):
    """Admin forcefully deletes a community discussion post."""
    # Since posts are stored locally in the frontend, this functions as an audit route.
    # We return success immediately so the frontend can delete it from state.
    return {"success": True, "detail": f"Post '{post_id}' deleted from community."}

@router.put("/users/{user_id}/ban", status_code=status.HTTP_200_OK)
def ban_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_current_admin)
):
    """Admin suspends a user's account and terminates all their active product listings."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )
    
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot ban another administrator."
        )
        
    user.is_banned = True
    
    # Forcefully delete all active products belonging to the banned user
    user_products = db.query(models.Product).filter(models.Product.seller_id == user_id).all()
    for prod in user_products:
        db.delete(prod)
        
    db.commit()
    return {"success": True, "detail": f"Student user '{user.name}' has been banned and their listings removed."}
