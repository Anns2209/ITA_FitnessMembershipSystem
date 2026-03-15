from fastapi import FastAPI
from app.routes import router
from app.database import engine, Base

Base.metadata.create_all(bind=engine)



app = FastAPI(title="Member Management Service")

app.include_router(router)

import logging

logging.basicConfig(level=logging.INFO)

logging.info("Member service started")

