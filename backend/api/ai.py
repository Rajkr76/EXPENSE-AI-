from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from db.database import get_db
from models.user import UserResponse
from api.auth import get_current_user
from services.ai_service import get_financial_advice, extract_receipt_data, get_daily_insight, extract_text_data

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    reply: str
    
class InsightResponse(BaseModel):
    insight: str

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    # Fetch recent expenses to give AI context
    cursor = db["expenses"].find({"user_id": current_user.id}).sort("date", -1).limit(10)
    expenses = []
    async for exp in cursor:
        expenses.append(f"{exp['date']}: {exp['merchant']} - ₹{exp['amount']} ({exp['category_id']})")
        
    context = "\n".join(expenses) if expenses else "No recent expenses."
    
    reply = await get_financial_advice(request.query, context)
    return ChatResponse(reply=reply)

@router.get("/insight", response_model=InsightResponse)
async def get_insight(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    cursor = db["expenses"].find({"user_id": current_user.id}).sort("date", -1).limit(15)
    expenses = []
    async for exp in cursor:
        expenses.append(f"{exp['date']}: {exp['merchant']} - ₹{exp['amount']} ({exp['category_id']})")
        
    context = "\n".join(expenses) if expenses else "No expenses recorded yet."
    
    insight = await get_daily_insight(context)
    return InsightResponse(insight=insight)

@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        image_bytes = await file.read()
        mime_type = file.content_type
        
        result = await extract_receipt_data(image_bytes, mime_type)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to parse receipt")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TextScanRequest(BaseModel):
    text: str

@router.post("/scan-text")
async def scan_text(
    request: TextScanRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        result = await extract_text_data(request.text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to parse text")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
