from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List
from datetime import datetime

from db.database import get_db
from models.expense import ExpenseCreate, ExpenseResponse
from models.user import UserResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense: ExpenseCreate, 
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    expense_dict = expense.model_dump()
    expense_dict["user_id"] = current_user.id
    
    result = await db["expenses"].insert_one(expense_dict)
    
    created_expense = await db["expenses"].find_one({"_id": result.inserted_id})
    created_expense["_id"] = str(created_expense["_id"])
    return ExpenseResponse(**created_expense)

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    skip: int = 0, 
    limit: int = 100, 
    month: int = None,
    year: int = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    query = {"user_id": current_user.id}
    
    if month and year:
        # Simple date filtering based on month/year
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
            
        query["date"] = {"$gte": start_date, "$lt": end_date}
        
    cursor = db["expenses"].find(query).skip(skip).limit(limit).sort("date", -1)
    expenses = []
    async for exp in cursor:
        exp["_id"] = str(exp["_id"])
        expenses.append(ExpenseResponse(**exp))
        
    return expenses

@router.delete("/all", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_expenses(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    await db["expenses"].delete_many({"user_id": current_user.id})
    return None

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(expense_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    result = await db["expenses"].delete_one({"_id": obj_id, "user_id": current_user.id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found or not authorized to delete")
        
    return None
