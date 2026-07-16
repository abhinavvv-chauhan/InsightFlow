import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from analytics.engine import engine

PLOTLY_LAYOUT = dict(
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
    font=dict(color='#94a3b8', family='Inter'),
    xaxis=dict(gridcolor='rgba(99,102,241,0.1)', linecolor='rgba(99,102,241,0.2)'),
    yaxis=dict(gridcolor='rgba(99,102,241,0.1)', linecolor='rgba(99,102,241,0.2)'),
    margin=dict(l=20, r=20, t=30, b=20),
)

def render():
    st.markdown("# 🏠 Executive Dashboard")
    st.markdown("*Your business, at a glance.*")
    
    # --- Fetch data ---
    kpis = engine.get_executive_kpis()
    trend_df = engine.get_revenue_trend()

    # --- KPI Cards Row ---
    st.markdown('<div class="section-header">Key Performance Indicators</div>', unsafe_allow_html=True)
    
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        revenue = float(kpis.get('revenue', 0))
        st.metric("💰 Revenue (Latest Day)", f"₹{revenue:,.0f}")
    with col2:
        orders = kpis.get('orders', 0)
        st.metric("🛒 Orders", orders)
    with col3:
        dau = kpis.get('dau', 0)
        st.metric("👤 DAU", f"{dau:,}")
    with col4:
        conv = float(kpis.get('conversion_pct', 0))
        st.metric("📈 Conversion Rate", f"{conv:.2f}%", delta="threshold: 8%" if conv < 8 else None)
    with col5:
        aov = float(kpis.get('aov', 0))
        st.metric("💳 Avg. Order Value", f"₹{aov:,.0f}")

    # --- Alerts ---
    if not trend_df.empty:
        st.markdown('<div class="section-header">🚨 Alerts & Anomalies</div>', unsafe_allow_html=True)
        conv_val = float(kpis.get('conversion_pct', 0))
        if conv_val < 8:
            st.markdown(f'<div class="alert-warning">⚠️ Conversion rate ({conv_val}%) is below the 8% threshold. Check the Funnel page for drop-off details.</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="alert-success">✅ Conversion rate ({conv_val}%) is above threshold.</div>', unsafe_allow_html=True)
            
    # --- Revenue Trend Chart ---
    st.markdown('<div class="section-header">Revenue Trend with 7-Day Moving Average</div>', unsafe_allow_html=True)

    if not trend_df.empty:
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=trend_df['full_date'],
            y=trend_df['revenue'].astype(float),
            name='Daily Revenue',
            marker_color='rgba(99,102,241,0.5)',
            marker_line_color='rgba(99,102,241,0.8)',
            marker_line_width=1
        ))
        
        fig.add_trace(go.Scatter(
            x=trend_df['full_date'],
            y=trend_df['revenue_7d_moving_avg'].astype(float),
            name='7-Day Moving Avg',
            line=dict(color='#a78bfa', width=2.5),
            mode='lines'
        ))
        
        fig.update_layout(**PLOTLY_LAYOUT, height=360, legend=dict(
            orientation='h', y=1.1, x=0, bgcolor='rgba(0,0,0,0)'
        ))
        st.plotly_chart(fig, use_container_width=True)

    # --- Day-over-Day Growth ---
    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="section-header">Day-over-Day Growth %</div>', unsafe_allow_html=True)
        if not trend_df.empty:
            dod_df = trend_df.dropna(subset=['dod_growth_pct'])
            colors = ['#34d399' if v >= 0 else '#f87171' for v in dod_df['dod_growth_pct'].astype(float)]
            fig2 = go.Figure(go.Bar(
                x=dod_df['full_date'],
                y=dod_df['dod_growth_pct'].astype(float),
                marker_color=colors,
                name='DoD Growth'
            ))
            fig2.update_layout(**PLOTLY_LAYOUT, height=280)
            st.plotly_chart(fig2, use_container_width=True)

    with c2:
        st.markdown('<div class="section-header">30-Day Rolling Revenue</div>', unsafe_allow_html=True)
        if not trend_df.empty:
            roll_df = trend_df.dropna(subset=['revenue_30d_rolling'])
            fig3 = go.Figure(go.Scatter(
                x=roll_df['full_date'],
                y=roll_df['revenue_30d_rolling'].astype(float),
                fill='tozeroy',
                fillcolor='rgba(99,102,241,0.1)',
                line=dict(color='#6366f1', width=2),
                name='30-Day Rolling Rev'
            ))
            fig3.update_layout(**PLOTLY_LAYOUT, height=280)
            st.plotly_chart(fig3, use_container_width=True)

    # --- Business Recommendation Panel ---
    rca_result = engine.run_root_cause_analysis()
    st.markdown('<div class="section-header">🤖 Auto-Generated Insight</div>', unsafe_allow_html=True)
    st.markdown(f"""
    <div class="recommendation-panel">
        <strong>📌 RCA Finding</strong><br/>
        {rca_result.get('insight', 'No anomalies detected.')}
        <br/><br/>
        <strong>💡 Recommendation:</strong> Investigate the underperforming segment and consider running targeted campaigns or infrastructure reviews.
    </div>
    """, unsafe_allow_html=True)
