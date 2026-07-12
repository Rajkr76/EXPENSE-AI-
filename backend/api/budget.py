from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List

from db.database import get_db
from models.budget import BudgetCreate, BudgetResponse
from models.user import UserResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=BudgetResponse)
async def create_or_update_budget(
    budget: BudgetCreate, 
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    # Upsert logic: ADD the amount if exists, else insert
    update_data = {
        "$inc": {"amount": budget.amount},
        "$setOnInsert": {
            "user_id": current_user.id,
            "category_id": budget.category_id,
            "month": budget.month,
            "year": budget.year
        }
    }
    
    result = await db["budgets"].update_one(
        {
            "user_id": current_user.id,
            "category_id": budget.category_id,
            "month": budget.month,
            "year": budget.year
        },
        update_data,
        upsert=True
    )
    
    query = {
        "user_id": current_user.id,
        "category_id": budget.category_id,
        "month": budget.month,
        "year": budget.year
    }
    saved_budget = await db["budgets"].find_one(query)
    saved_budget["_id"] = str(saved_budget["_id"])
    
    return BudgetResponse(**saved_budget)

@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
    month: int,
    year: int,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    query = {
        "user_id": current_user.id,
        "month": month,
        "year": year
    }
    
    cursor = db["budgets"].find(query)
    budgets = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        budgets.append(BudgetResponse(**b))
        
    return budgets
