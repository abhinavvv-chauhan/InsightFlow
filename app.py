import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
from streamlit_float import float_init

# Configure page
st.set_page_config(
    page_title="InsightFlow Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

float_init()


# Custom CSS for premium look
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    /* Dark sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
        border-right: 1px solid rgba(99,102,241,0.3);
    }
    
    [data-testid="stSidebar"] * {
        color: #e2e8f0 !important;
    }
    
    /* Main background */
    .main .block-container {
        background: #0f0f1a;
        padding: 2rem;
    }
    
    /* KPI metric cards */
    .kpi-card {
        background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%);
        border: 1px solid rgba(99,102,241,0.3);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        margin: 0.5rem 0;
        backdrop-filter: blur(10px);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99,102,241,0.3);
    }
    
    .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        color: #a78bfa;
        margin: 0;
    }
    
    .kpi-label {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 0.3rem;
    }
    
    .kpi-delta {
        font-size: 0.85rem;
        margin-top: 0.4rem;
    }
    
    /* Section headers */
    .section-header {
        font-size: 1.3rem;
        font-weight: 600;
        color: #e2e8f0;
        border-left: 4px solid #6366f1;
        padding-left: 0.75rem;
        margin: 1.5rem 0 1rem 0;
    }
    
    /* Alert strip */
    .alert-warning {
        background: linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.05) 100%);
        border: 1px solid rgba(251,191,36,0.4);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #fbbf24;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }
    
    .alert-success {
        background: linear-gradient(90deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.05) 100%);
        border: 1px solid rgba(52,211,153,0.4);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #34d399;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }
    
    /* Recommendation panel */
    .recommendation-panel {
        background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%);
        border: 1px solid rgba(16,185,129,0.3);
        border-radius: 12px;
        padding: 1.25rem;
        margin-top: 1.5rem;
    }
    
    /* Hide streamlit default elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Stagger animation for cards */
    [data-testid="metric-container"] {
        background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08));
        border: 1px solid rgba(99,102,241,0.25);
        border-radius: 12px;
        padding: 1rem;
    }
    
    /* Navigation logo area */
    .nav-logo {
        font-size: 1.6rem;
        font-weight: 700;
        background: linear-gradient(90deg, #6366f1, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        padding: 0.5rem 0 1.5rem 0;
        text-align: center;
    }
    
    h1, h2, h3 {
        color: #e2e8f0 !important;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar Navigation
with st.sidebar:
    st.markdown('<div class="nav-logo">📊 InsightFlow</div>', unsafe_allow_html=True)
    st.markdown("### Navigation")
    
    page = st.radio(
        label="",
        options=["🏠 Executive", "🔻 Funnel", "👥 Customer", "📦 Product"],
        label_visibility="collapsed"
    )

    st.markdown("---")
    st.markdown("### Platform Status")
    st.success("✅ Warehouse Connected")
    st.info("📈 25,140 events loaded")
    st.markdown("---")
    st.caption("InsightFlow v1.0.0 — Neon PostgreSQL")

# Global Floating Copilot Widget
# We render this BEFORE the long page content so Streamlit doesn't lazy-load it, ensuring it's always in the DOM for CSS to float it.
from dashboard.components.copilot_widget import render_copilot_widget
render_copilot_widget(context=page.replace("🏠 ", "").replace("🔻 ", "").replace("👥 ", "").replace("📦 ", ""))

# Route to pages
if page == "🏠 Executive":
    from dashboard.pages import executive
    executive.render()
elif page == "🔻 Funnel":
    from dashboard.pages import funnel
    funnel.render()
elif page == "👥 Customer":
    from dashboard.pages import customer
    customer.render()
elif page == "📦 Product":
    from dashboard.pages import product
    product.render()
