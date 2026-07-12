from groq import Groq
from core.config import settings
import json
import base64

# Configure Groq client
client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"  # Fast, free, highly capable

async def extract_receipt_data(image_bytes: bytes, mime_type: str) -> dict:
    """
    Calls Groq vision to extract receipt details.
    Uses llama-4-scout which supports vision (image input).
    """
    prompt = """Extract the following details from this receipt image:
    - amount: total amount as a float
    - merchant: name of the store/merchant
    - date: date of transaction in YYYY-MM-DD
    - category: guess a short category string from [food, transport, shopping, housing, utilities, medical, entertainment, salary, default]
    
    Return ONLY valid JSON in this exact format, nothing else:
    {"amount": 12.50, "merchant": "Store Name", "date": "2024-01-01", "category": "food"}"""
    
    try:
        # Encode image to base64 for the API
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",  # Groq vision model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300,
        )
        
        text = response.choices[0].message.content.strip()
        
        # Strip markdown JSON block if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Groq OCR Error: {e}")
        return None

async def extract_text_data(text_content: str) -> dict:
    """
    Calls Groq to extract receipt/transaction details from SMS or raw text.
    """
    prompt = f"""Extract the following details from this transaction message or text:
    - amount: total amount as a float (ignore currency symbols)
    - merchant: name of the store, person, or merchant
    - date: date of transaction in YYYY-MM-DD (guess today's date if not present)
    - category: guess a short category string from [food, transport, shopping, housing, utilities, medical, entertainment, salary, default]
    
    Text: "{text_content}"
    
    Return ONLY valid JSON in this exact format, nothing else:
    {{"amount": 12.50, "merchant": "Store Name", "date": "2024-01-01", "category": "food"}}"""
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300,
        )
        
        text = response.choices[0].message.content.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Groq Text Extraction Error: {e}")
        return None


async def get_financial_advice(query: str, user_data_context: str) -> str:
    """
    Calls Groq to act as a financial advisor based on user's query and their data context.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert financial advisor AI inside the 'ExpenseAI' app. "
                "You help users understand their spending habits and give practical money tips. "
                "Be friendly, concise, and specific. Respond in under 4 sentences. "
                f"Here is the user's financial context: {user_data_context}"
            )
        },
        {
            "role": "user",
            "content": query
        }
    ]
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat Error: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment!"

async def get_daily_insight(user_data_context: str) -> str:
    """
    Generates a single, punchy 1-sentence insight for the user's dashboard based on recent spending.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI financial coach inside a finance app. "
                "Write EXACTLY ONE short, encouraging or insightful sentence about the user's spending. "
                "Examples: 'You've spent 40% more on food this week, try cooking at home!' or "
                "'Great job keeping your transport costs low this month.' or "
                "'No recent expenses yet — time to start tracking!' "
                "Do NOT include pleasantries or any extra text, just the single insight sentence."
            )
        },
        {
            "role": "user",
            "content": f"Here is my recent spending context:\n{user_data_context}"
        }
    ]
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=100,
            temperature=0.8,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Insight Error: {e}")
        return "Track more expenses to get personalized AI insights."
