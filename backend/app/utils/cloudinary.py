import cloudinary
import cloudinary.uploader
from app.config import settings

# Configure Cloudinary with loaded settings
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file_object) -> str:
    """
    Uploads a file-like object directly to Cloudinary and returns the secure URL.
    Falls back to a high-quality placeholder image if Cloudinary keys are placeholder defaults.
    """
    is_configured = (
        settings.CLOUDINARY_CLOUD_NAME and 
        "your_cloudinary" not in settings.CLOUDINARY_CLOUD_NAME and
        settings.CLOUDINARY_API_KEY and 
        "your_cloudinary" not in settings.CLOUDINARY_API_KEY and
        settings.CLOUDINARY_API_SECRET and 
        "your_cloudinary" not in settings.CLOUDINARY_API_SECRET
    )

    if not is_configured:
        print("Cloudinary is not configured or uses default placeholders. Using fallback image.")
        return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500"

    try:
        response = cloudinary.uploader.upload(file_object)
        return response.get("secure_url") or "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500"
    except Exception as e:
        print(f"Cloudinary upload failed: {str(e)}. Using fallback image.")
        return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500"

