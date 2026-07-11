from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class IncomeBase(BaseModel):
    title: str
    amount: float
    source: str
    date: datetime
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeInDB(IncomeBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class IncomeResponse(IncomeBase):
    id: str = Field(alias="_id")
    user_id: str

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
