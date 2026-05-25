from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["AI Advisor & Chatbot"])

class ChatPrompt(BaseModel):
    prompt: str

@router.post("/chatbot")
def chatbot_reply(payload: ChatPrompt):
    query = payload.prompt.lower()
    
    # Rule-based matching
    if "laptop" in query or "list" in query:
        reply = (
            "### How to list an item for sale: 📦\n\n"
            "1. Click on the **'Sell Item'** button at the top right of the page.\n"
            "2. Fill in all the parameters such as **Title**, **Price**, **Condition**, **Category**, and **Description**.\n"
            "3. Upload a clear photo of the product.\n"
            "4. Hit submit to make it live for other students on campus!"
        )
    elif "textbook" in query or "notes" in query:
        reply = (
            "### Need study materials? 📚\n\n"
            "Head over to our **AI Smart Match** dashboard tab. You can find "
            "branch-wise engineering textbooks and lecture notes compiled dynamically by the system."
        )
    elif "safety" in query or "rules" in query:
        reply = (
            "### Campus Handover Safety Guidelines 🛡️\n\n"
            "- Always meet the other student in a **public campus location** (e.g., library, hostel main gate, cafeteria).\n"
            "- Verify the item's condition in person **before** transferring any payment.\n"
            "- **Avoid advance online scams**. Never pay in advance before seeing the product."
        )
    else:
        reply = (
            f"Thanks for asking! I'm indexing information about *\"{payload.prompt}\"*. "
            "Currently, I am in student sandbox mode, but you can search for listings "
            "or check our Community forum for active student posts related to this query."
        )
        
    return {"reply": reply}
