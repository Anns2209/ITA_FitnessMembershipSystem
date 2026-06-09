from contextlib import asynccontextmanager

from fastapi import FastAPI
from app.routes import router
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Member Management Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

logging.basicConfig(level=logging.INFO)
logging.info("Member service started")

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "member-management"
    }
