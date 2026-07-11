from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ExpenseBase(BaseModel):
    title: str
    amount: float
    category_id: str
    date: datetime
    merchant: Optional[str] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseInDB(ExpenseBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class ExpenseResponse(ExpenseBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
