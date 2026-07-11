from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class BudgetBase(BaseModel):
    category_id: str
    amount: float
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetInDB(BudgetBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class BudgetResponse(BudgetBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
