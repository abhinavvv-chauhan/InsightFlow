import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.engine import engine

def test_funnel():
    print("\n--- Testing Funnel ---")
    df = engine.get_funnel()
    print(df)
    
def test_cohort():
    print("\n--- Testing Cohort Heatmap ---")
    df = engine.get_retention_heatmap()
    print(df)
    
def test_kpi():
    print("\n--- Testing Executive KPIs ---")
    kpis = engine.get_executive_kpis()
    print(kpis)
    
    print("\n--- Testing Revenue Trend ---")
    df = engine.get_revenue_trend()
    print(df.head())
    
def test_rca():
    print("\n--- Testing Root Cause Analysis ---")
    insight = engine.run_root_cause_analysis()
    print(insight)

if __name__ == "__main__":
    test_funnel()
    test_cohort()
    test_kpi()
    test_rca()
