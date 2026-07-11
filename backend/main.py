from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from contextlib import asynccontextmanager
from db.database import connect_to_mongo, close_mongo_connection
from api import auth, expenses, income, budget, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="ExpenseAI API", lifespan=lifespan)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(income.router, prefix="/api/income", tags=["Income"])
app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Insights"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ExpenseAI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
