from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List
from datetime import datetime

from db.database import get_db
from models.income import IncomeCreate, IncomeResponse
from models.user import UserResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=IncomeResponse)
async def create_income(
    income: IncomeCreate, 
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    income_dict = income.model_dump()
    income_dict["user_id"] = current_user.id
    
    result = await db["incomes"].insert_one(income_dict)
    
    created_income = await db["incomes"].find_one({"_id": result.inserted_id})
    created_income["_id"] = str(created_income["_id"])
    return IncomeResponse(**created_income)

@router.get("/", response_model=List[IncomeResponse])
async def get_incomes(
    skip: int = 0, 
    limit: int = 100, 
    month: int = None,
    year: int = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    query = {"user_id": current_user.id}
    
    if month and year:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
            
        query["date"] = {"$gte": start_date, "$lt": end_date}
        
    cursor = db["incomes"].find(query).skip(skip).limit(limit).sort("date", -1)
    incomes = []
    async for inc in cursor:
        inc["_id"] = str(inc["_id"])
        incomes.append(IncomeResponse(**inc))
        
    return incomes

@router.delete("/all", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_incomes(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    await db["incomes"].delete_many({"user_id": current_user.id})
    return None

@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(income_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    result = await db["incomes"].delete_one({"_id": obj_id, "user_id": current_user.id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income not found or not authorized to delete")
        
    return None
