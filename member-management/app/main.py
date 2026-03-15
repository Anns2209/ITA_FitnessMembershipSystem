from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="Member Management Service")

app.include_router(router)

import logging

logging.basicConfig(level=logging.INFO)

logging.info("Member service started")