import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add root directory to path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.engine import ProductAnalyticsEngine
from analytics.copilot import ask_copilot

from utils.db import execute_query

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
def get_kpis():
    revenue = execute_query("SELECT full_date as day, revenue FROM revenue_trend ORDER BY full_date DESC LIMIT 7")
    # Reverse so chronological order
    revenue.reverse()
    
    # Calculate simple totals
    total_rev_row = execute_query("SELECT SUM(revenue) as t FROM revenue_trend")
    total_rev = total_rev_row[0]['t'] if total_rev_row and total_rev_row[0]['t'] else 0
    
    # Convert dates to strings
    for r in revenue:
        if r['day']: r['day'] = str(r['day'])
        if r['revenue']: r['revenue'] = float(r['revenue'])
        
    return {
        "status": "success",
        "total_revenue": float(total_rev),
        "trend": revenue
    }

@app.get("/api/funnel")
def get_funnel_data(device: str = "All", city: str = "All"):
    # Since analytics.funnel.get_funnel handles this, we can still use it, just pass the dict correctly
    filters = {}
    if device != "All": filters['device'] = device
    if city != "All": filters['city'] = city
    
    from analytics.funnel import get_funnel
    df = get_funnel(filters=filters if filters else None)
    
    return {
        "status": "success",
        "data": df.to_dict(orient="records") if not df.empty else []
    }

@app.get("/api/customer")
def get_customer_data():
    growth = execute_query("SELECT * FROM customer_growth")
    city_perf = execute_query("SELECT * FROM city_performance")
    
    return {
        "status": "success",
        "growth": growth,
        "city_performance": city_perf
    }

@app.get("/api/product")
def get_product_data():
    perf = execute_query("SELECT * FROM product_performance LIMIT 10")
    cat = execute_query("SELECT * FROM top_categories")
    
    # Convert Decimals
    for r in cat:
        r['total_revenue'] = float(r['revenue']) if r.get('revenue') else 0
        
    return {
        "status": "success",
        "performance": perf,
        "categories": cat
    }

@app.post("/api/copilot")
def query_copilot(req: CopilotRequest):
    response = ask_copilot(req.question)
    return response

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
