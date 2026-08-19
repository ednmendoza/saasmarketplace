from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import uuid
import json
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage

from seed_data import SEED_APPS

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class AppModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = ""
    name: str
    tagline: str = ""
    category: str
    logo_url: str = ""
    website: str = ""
    description: str = ""
    rating: float = 0.0
    reviews_count: int = 0
    installs: str = ""
    pricing: str = "Freemium"
    status: str = "Available"
    verified: bool = False
    tags: List[str] = []
    features: List[str] = []
    compliance: List[str] = []
    vendor: str = ""
    annual_cost: float = 0.0
    security_approved: bool = False
    approved_by: str = ""
    managed_by: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AppInput(BaseModel):
    name: str
    tagline: str = ""
    category: str
    logo_url: str = ""
    website: str = ""
    description: str = ""
    rating: float = 0.0
    reviews_count: int = 0
    installs: str = ""
    pricing: str = "Freemium"
    status: str = "Available"
    verified: bool = False
    tags: List[str] = []
    features: List[str] = []
    compliance: List[str] = []
    vendor: str = ""
    annual_cost: float = 0.0
    security_approved: bool = False
    approved_by: str = ""
    managed_by: str = ""


class AIAutofillInput(BaseModel):
    query: str


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(data: LoginInput):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    return {
        "token": token,
        "user": {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


# ---------------------------------------------------------------------------
# App catalog routes
# ---------------------------------------------------------------------------
@api_router.get("/apps", response_model=List[AppModel])
async def list_apps(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "All":
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    docs = await db.apps.find(query, {"_id": 0}).to_list(1000)
    return docs


@api_router.get("/apps/stats")
async def app_stats():
    docs = await db.apps.find({}, {"_id": 0}).to_list(1000)
    total = len(docs)
    categories = sorted({d["category"] for d in docs})
    integrated = len([d for d in docs if d.get("status") == "Integrated"])
    avg_rating = round(sum(d.get("rating", 0) for d in docs) / total, 2) if total else 0
    return {
        "total_apps": total,
        "categories_count": len(categories),
        "categories": categories,
        "active_integrations": integrated,
        "avg_rating": avg_rating,
    }


@api_router.get("/apps/{app_id}", response_model=AppModel)
async def get_app(app_id: str):
    doc = await db.apps.find_one({"id": app_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="App not found")
    return doc


@api_router.post("/apps", response_model=AppModel)
async def create_app(data: AppInput, user: dict = Depends(get_current_user)):
    app_obj = AppModel(**data.model_dump())
    if not app_obj.slug:
        app_obj.slug = app_obj.name.lower().replace(" ", "-")
    await db.apps.insert_one(app_obj.model_dump())
    return app_obj


@api_router.put("/apps/{app_id}", response_model=AppModel)
async def update_app(app_id: str, data: AppInput, user: dict = Depends(get_current_user)):
    existing = await db.apps.find_one({"id": app_id})
    if not existing:
        raise HTTPException(status_code=404, detail="App not found")
    update = data.model_dump()
    await db.apps.update_one({"id": app_id}, {"$set": update})
    doc = await db.apps.find_one({"id": app_id}, {"_id": 0})
    return doc


@api_router.delete("/apps/{app_id}")
async def delete_app(app_id: str, user: dict = Depends(get_current_user)):
    res = await db.apps.delete_one({"id": app_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# AI Auto-fill
# ---------------------------------------------------------------------------
@api_router.post("/apps/ai-autofill")
async def ai_autofill(data: AIAutofillInput, user: dict = Depends(get_current_user)):
    system_message = (
        "You are a SaaS product catalog expert. Given an application name or website URL, "
        "you return accurate structured metadata about the software product. "
        "Respond ONLY with a valid JSON object, no markdown fences, no commentary."
    )
    prompt = f"""Generate marketplace catalog metadata for this software application: "{data.query}".

Return a JSON object with EXACTLY these keys:
{{
  "name": "official product name",
  "tagline": "short catchy tagline (max 8 words)",
  "category": "one of: DevOps, Analytics, Productivity, Security, Design, Communication, CRM & Sales, AI Tools, Finance",
  "website": "official https url",
  "logo_url": "https://logo.clearbit.com/DOMAIN (use the product's real domain)",
  "description": "2-3 sentence professional description",
  "pricing": "one of: Free, Freemium, Paid, Enterprise",
  "status": "Available",
  "tags": ["4 short capability tags"],
  "features": ["5 concise key feature bullet points"],
  "compliance": ["relevant standards like SOC 2, GDPR, ISO 27001, HIPAA, PCI DSS"],
  "vendor": "the company that owns/provides the software, e.g. Salesforce, Inc.",
  "annual_cost": 24000,
  "managed_by": "a reasonable internal owning team, e.g. IT Operations",
  "rating": 4.5,
  "reviews_count": 1000,
  "installs": "e.g. 1M+"
}}

annual_cost is an approximate typical enterprise annual price in USD (use 0 for usage-based pricing). Be factually accurate. If you don't recognize the product, make reasonable professional estimates."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"autofill-{uuid.uuid4()}",
            system_message=system_message,
        ).with_model("anthropic", "claude-sonnet-4-6")
        response = await chat.send_message(UserMessage(text=prompt))
        text = response.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        result = json.loads(text)
        return result
    except Exception as e:
        logger.error(f"AI autofill failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI auto-fill failed: {str(e)}")


# ---------------------------------------------------------------------------
# Startup seeding
# ---------------------------------------------------------------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@marketplace.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


async def seed_apps():
    count = await db.apps.count_documents({})
    if count == 0:
        for app_data in SEED_APPS:
            obj = AppModel(**app_data)
            await db.apps.insert_one(obj.model_dump())
        logger.info(f"Seeded {len(SEED_APPS)} apps")


async def migrate_governance():
    """Backfill vendor / cost / approval / owner fields on existing apps."""
    gov_keys = ["vendor", "annual_cost", "security_approved", "approved_by", "managed_by"]
    for app_data in SEED_APPS:
        update = {k: app_data.get(k) for k in gov_keys if k in app_data}
        if update:
            await db.apps.update_one({"slug": app_data["slug"]}, {"$set": update})
    await db.apps.update_many(
        {"vendor": {"$exists": False}},
        {"$set": {"vendor": "", "annual_cost": 0.0, "security_approved": False, "approved_by": "", "managed_by": ""}},
    )


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_apps()
    await migrate_governance()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
