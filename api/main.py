import os
import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add root directory to path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.copilot import ask_copilot
from analytics.funnel import get_funnel
from utils.db import async_execute_query

app = FastAPI(title="InsightFlow API")

# Setup CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CopilotRequest(BaseModel):
    question: str


@app.get("/api/kpi")
async def get_kpis():
    """
    Returns revenue KPIs. Uses async_execute_query so the event loop
    is never blocked while waiting on PostgreSQL I/O.
    """
    revenue = await async_execute_query(
        "SELECT full_date as day, revenue FROM revenue_trend ORDER BY full_date DESC LIMIT 7"
    )
    # Reverse so chronological order
    revenue = list(reversed(revenue))

    total_rev_row = await async_execute_query("SELECT SUM(revenue) as t FROM revenue_trend")
    total_rev = total_rev_row[0]['t'] if total_rev_row and total_rev_row[0]['t'] else 0

    # Convert dates to strings for JSON serialisation
    for r in revenue:
        if r['day']:     r['day']     = str(r['day'])
        if r['revenue']: r['revenue'] = float(r['revenue'])

    return {
        "status": "success",
        "total_revenue": float(total_rev),
        "trend": revenue
    }


@app.get("/api/funnel")
async def get_funnel_data(device: str = "All", city: str = "All"):
    """
    Returns funnel data with optional device/city filters.
    The pandas funnel helper runs in a thread pool via asyncio.to_thread
    so it does not block the event loop.
    """
    filters = {}
    if device != "All": filters['device'] = device
    if city   != "All": filters['city']   = city

    # get_funnel uses psycopg2 + pandas — run in thread pool to stay non-blocking
    df = await asyncio.to_thread(get_funnel, filters if filters else None)

    return {
        "status": "success",
        "data": df.to_dict(orient="records") if not df.empty else []
    }


@app.get("/api/customer")
async def get_customer_data():
    """Returns customer growth and city performance metrics."""
    growth, city_perf = await asyncio.gather(
        async_execute_query("SELECT * FROM customer_growth"),
        async_execute_query("SELECT * FROM city_performance"),
    )
    return {
        "status": "success",
        "growth": growth,
        "city_performance": city_perf
    }


@app.get("/api/product")
async def get_product_data():
    """Returns product performance and top category data."""
    perf, cat = await asyncio.gather(
        async_execute_query("SELECT * FROM product_performance LIMIT 10"),
        async_execute_query("SELECT * FROM top_categories"),
    )

    # Convert Decimals for JSON serialisation
    for r in cat:
        r['total_revenue'] = float(r['revenue']) if r.get('revenue') else 0

    return {
        "status": "success",
        "performance": perf,
        "categories": cat
    }


@app.post("/api/copilot")
async def query_copilot(req: CopilotRequest):
    """
    AI Copilot endpoint. Fully async — both LLM calls (SQL generation +
    summarisation) and the DB execution are awaited, so the server can
    serve other dashboard requests while this route is waiting on I/O.
    """
    response = await ask_copilot(req.question)
    return response


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
