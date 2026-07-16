from analytics import funnel, cohort, kpi, rca

class ProductAnalyticsEngine:
    """
    Facade class that provides a unified interface for the product analytics capabilities.
    """
    
    def get_funnel(self, filters=None):
        """Returns the purchase funnel as a pandas DataFrame."""
        return funnel.get_funnel(filters)
        
    def get_retention_heatmap(self):
        """Returns the cohort retention heatmap as a pandas DataFrame."""
        return cohort.get_retention_heatmap()
        
    def get_executive_kpis(self):
        """Returns a dictionary of the top-level KPIs."""
        return kpi.get_executive_kpis()
        
    def get_revenue_trend(self):
        """Returns the revenue trend with moving averages."""
        return kpi.get_revenue_trend()
        
    def get_product_leaderboard(self, limit=10):
        """Returns the top performing products."""
        return kpi.get_product_leaderboard(limit)
        
    def run_root_cause_analysis(self, metric="revenue", dimension="device"):
        """Executes the RCA drill-down algorithm and returns an insight dictionary."""
        return rca.perform_rca(metric, dimension)

# Singleton instance for easy import
engine = ProductAnalyticsEngine()
