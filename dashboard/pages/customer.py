import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from analytics.engine import engine
from utils.db import execute_query

PLOTLY_LAYOUT = dict(
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
    font=dict(color='#94a3b8', family='Inter'),
    xaxis=dict(gridcolor='rgba(99,102,241,0.1)', linecolor='rgba(99,102,241,0.2)'),
    yaxis=dict(gridcolor='rgba(99,102,241,0.1)', linecolor='rgba(99,102,241,0.2)'),
    margin=dict(l=20, r=20, t=30, b=20),
)

def render():
    st.markdown("# 👥 Customer Analysis")
    st.markdown("*Retention, cohorts, and growth trends.*")

    # --- KPIs Row ---
    rows = execute_query("SELECT * FROM customer_growth ORDER BY activity_month")
    growth_df = pd.DataFrame(rows)

    rows2 = execute_query("""
        SELECT payment_status, COUNT(*) AS cnt FROM fact_orders GROUP BY payment_status
    """)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        total_users = execute_query("SELECT COUNT(*) AS cnt FROM dim_user")
        st.metric("👤 Total Users", f"{total_users[0]['cnt']:,}")
    with col2:
        new_users = execute_query("SELECT COUNT(*) AS cnt FROM dim_user WHERE user_type = 'new'")
        st.metric("🆕 New Users", f"{new_users[0]['cnt']:,}")
    with col3:
        ret_users = execute_query("SELECT COUNT(*) AS cnt FROM dim_user WHERE user_type = 'returning'")
        st.metric("🔁 Returning Users", f"{ret_users[0]['cnt']:,}")
    with col4:
        repeat_rate = execute_query("""
            SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE order_cnt >= 2) / NULLIF(COUNT(*), 0), 1) AS rate
            FROM (SELECT user_key, COUNT(*) AS order_cnt FROM fact_orders WHERE payment_status='success' GROUP BY user_key) x
        """)
        rr = repeat_rate[0]['rate'] or 0
        st.metric("🏆 Repeat Purchase Rate", f"{rr}%")

    # --- New vs Returning Chart ---
    st.markdown('<div class="section-header">New vs Returning Users Over Time</div>', unsafe_allow_html=True)
    if not growth_df.empty:
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=growth_df['activity_month'], y=growth_df['new_users'],
            name='New Users', marker_color='#6366f1'
        ))
        fig.add_trace(go.Bar(
            x=growth_df['activity_month'], y=growth_df['returning_users'],
            name='Returning Users', marker_color='#a78bfa'
        ))
        fig.update_layout(**PLOTLY_LAYOUT, barmode='group', height=320)
        st.plotly_chart(fig, use_container_width=True)

    # --- Retention Heatmap ---
    st.markdown('<div class="section-header">Cohort Retention Heatmap</div>', unsafe_allow_html=True)
    heatmap = engine.get_retention_heatmap()
    
    if not heatmap.empty:
        fig2 = px.imshow(
            heatmap,
            color_continuous_scale=[
                [0.0, 'rgba(99,102,241,0.05)'],
                [0.5, 'rgba(139,92,246,0.5)'],
                [1.0, 'rgba(99,102,241,0.95)']
            ],
            aspect='auto',
            text_auto=True,
            labels=dict(x='Month Offset', y='Cohort Month', color='Retention %')
        )
        fig2.update_layout(**PLOTLY_LAYOUT, height=350)
        st.plotly_chart(fig2, use_container_width=True)
    else:
        st.info("📊 Retention heatmap requires data spanning multiple months. Data is currently limited to July 2026 — this will populate as you add more months of data to the warehouse.")

    # --- Top Cities ---
    st.markdown('<div class="section-header">Revenue & Conversion by City</div>', unsafe_allow_html=True)
    city_rows = execute_query("SELECT * FROM city_performance ORDER BY total_revenue DESC LIMIT 15")
    city_df = pd.DataFrame(city_rows)
    
    if not city_df.empty:
        c1, c2 = st.columns(2)
        with c1:
            fig3 = go.Figure(go.Bar(
                x=city_df['total_revenue'].astype(float),
                y=city_df['city'],
                orientation='h',
                marker_color='rgba(99,102,241,0.7)',
                marker_line_color='#6366f1',
                marker_line_width=1
            ))
            fig3.update_layout(**PLOTLY_LAYOUT, height=400, title_text='Revenue by City', xaxis_title='Revenue (₹)')
            st.plotly_chart(fig3, use_container_width=True)
        
        with c2:
            fig4 = go.Figure(go.Bar(
                x=city_df['conversion_rate_pct'].astype(float),
                y=city_df['city'],
                orientation='h',
                marker_color='rgba(167,139,250,0.7)',
                marker_line_color='#a78bfa',
                marker_line_width=1
            ))
            fig4.update_layout(**PLOTLY_LAYOUT, height=400, title_text='Conversion Rate by City', xaxis_title='Conversion Rate (%)')
            st.plotly_chart(fig4, use_container_width=True)

    # --- Recommendation ---
    st.markdown('<div class="section-header">💡 Customer Insights</div>', unsafe_allow_html=True)
    if not city_df.empty:
        top_city = city_df.iloc[0]
        st.markdown(f"""
        <div class="recommendation-panel">
            <strong>📌 Key Finding</strong><br/>
            <strong style="color:#a78bfa">{top_city['city']}</strong> is the highest revenue-generating city with ₹{float(top_city['total_revenue']):,.0f} in successful orders 
            and a <strong style="color:#34d399">{float(top_city['conversion_rate_pct']):.1f}%</strong> conversion rate.
            <br/><br/>
            <strong>💡 Recommendation:</strong> Double down on acquisition campaigns in top-converting cities and investigate what's making them convert higher to replicate in lower-performing cities.
        </div>
        """, unsafe_allow_html=True)
