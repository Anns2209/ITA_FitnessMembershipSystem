from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI(title="Mobile BFF")

MEMBER_SERVICE_URL = "http://member-service:8000"
PAYMENT_SERVICE_URL = "http://payment-service:8080"

@app.get("/mobile/member/{member_id}/payments-status")
async def get_member_payment_status(member_id: int):
    try:
        async with httpx.AsyncClient() as client:
            payments_response = await client.get(f"{PAYMENT_SERVICE_URL}/payments/{member_id}")
            payments_response.raise_for_status()
            payments = payments_response.json()

        unpaid_exists = any(payment["status"] == "UNPAID" for payment in payments)

        return {
            "memberId": member_id,
            "hasUnpaidPayments": unpaid_exists,
            "paymentsCount": len(payments)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/mobile/member/{member_id}/summary")
async def get_member_summary(member_id: int):
    try:
        async with httpx.AsyncClient() as client:
            payments_response = await client.get(f"{PAYMENT_SERVICE_URL}/payments/{member_id}")
            payments_response.raise_for_status()
            payments = payments_response.json()

        total_paid = sum(float(payment["amount"]) for payment in payments if payment["status"] == "PAID")

        return {
            "memberId": member_id,
            "totalPaid": total_paid,
            "payments": payments
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))