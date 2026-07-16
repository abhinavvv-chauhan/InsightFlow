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
    st.markdown("# 📦 Product Analysis")
    st.markdown("*Product performance, category trends, and conversion rates.*")
    
    # --- KPI Row ---
    product_rows = execute_query("SELECT COUNT(*) AS cnt FROM dim_product")
    top_prod = execute_query("SELECT product_name, revenue FROM product_performance ORDER BY revenue DESC LIMIT 1")
    payment_rows = execute_query("SELECT * FROM payment_success")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("📦 Total Products", f"{product_rows[0]['cnt']:,}")
    with col2:
        if top_prod:
            st.metric("🏆 Top Product", top_prod[0]['product_name'][:18]+'...' if len(top_prod[0]['product_name']) > 18 else top_prod[0]['product_name'])
    with col3:
        cart_rows = execute_query("SELECT abandonment_rate_pct FROM cart_abandonment")
        cart_rate = float(cart_rows[0]['abandonment_rate_pct'] or 0)
        st.metric("🛒 Cart Abandonment", f"{cart_rate:.1f}%", delta="above 65% threshold" if cart_rate > 65 else None, delta_color="inverse")
    with col4:
        success_rows = execute_query("SELECT AVG(success_rate_pct) AS avg_rate FROM payment_success")
        avg_success = float(success_rows[0]['avg_rate'] or 0)
        st.metric("💳 Avg. Payment Success", f"{avg_success:.1f}%")

    # --- Product Leaderboard ---
    st.markdown('<div class="section-header">Product Performance Leaderboard</div>', unsafe_allow_html=True)
    products_df = engine.get_product_leaderboard(15)
    
    if not products_df.empty:
        products_df['revenue'] = products_df['revenue'].astype(float)
        products_df['view_to_buy_pct'] = products_df['view_to_buy_pct'].astype(float)

        c1, c2 = st.columns([3, 2])
        with c1:
            fig1 = go.Figure()
            fig1.add_trace(go.Bar(
                y=products_df['product_name'].head(10),
                x=products_df['revenue'].head(10),
                orientation='h',
                name='Revenue',
                marker_color='rgba(99,102,241,0.75)',
                marker_line_color='#6366f1', marker_line_width=1
            ))
            fig1.update_layout(**PLOTLY_LAYOUT, height=380, title_text='Top 10 Products by Revenue', xaxis_title='Revenue (₹)')
            st.plotly_chart(fig1, use_container_width=True)

        with c2:
            fig2 = go.Figure()
            fig2.add_trace(go.Scatter(
                x=products_df['view_to_buy_pct'],
                y=products_df['revenue'],
                mode='markers+text',
                text=products_df['product_name'],
                textfont=dict(size=8, color='#94a3b8'),
                textposition='top center',
                marker=dict(
                    size=products_df['orders'] * 2,
                    color=products_df['revenue'],
                    colorscale=[[0,'rgba(99,102,241,0.3)'], [1,'rgba(167,139,250,0.9)']],
                    showscale=False,
                    line=dict(width=1, color='rgba(99,102,241,0.5)')
                )
            ))
            fig2.update_layout(
                **PLOTLY_LAYOUT, height=380,
                title_text='View→Buy Rate vs Revenue',
                xaxis_title='View-to-Buy %',
                yaxis_title='Revenue (₹)'
            )
            st.plotly_chart(fig2, use_container_width=True)

    # --- Category Breakdown ---
    st.markdown('<div class="section-header">Revenue by Category</div>', unsafe_allow_html=True)
    cat_rows = execute_query("SELECT * FROM top_categories")
    cat_df = pd.DataFrame(cat_rows)
    
    if not cat_df.empty:
        cat_df['revenue'] = cat_df['revenue'].astype(float)
        c1, c2 = st.columns([2, 3])
        
        with c1:
            fig3 = px.pie(
                cat_df, values='revenue', names='category',
                hole=0.5,
                color_discrete_sequence=['#6366f1', '#a78bfa', '#34d399', '#f59e0b', '#f87171', '#06b6d4']
            )
            fig3.update_layout(**PLOTLY_LAYOUT, height=320, showlegend=True, legend=dict(bgcolor='rgba(0,0,0,0)'))
            st.plotly_chart(fig3, use_container_width=True)

        with c2:
            fig4 = go.Figure(go.Bar(
                x=cat_df['category'],
                y=cat_df['revenue'],
                marker_color='rgba(99,102,241,0.7)',
                text=cat_df['revenue'].map(lambda x: f"₹{x/1000:.0f}K"),
                textposition='outside',
                textfont=dict(color='#e2e8f0')
            ))
            fig4.update_layout(**PLOTLY_LAYOUT, height=320, yaxis_title='Revenue (₹)')
            st.plotly_chart(fig4, use_container_width=True)

    # --- Payment Success by Method ---
    st.markdown('<div class="section-header">Payment Success Rate by Method</div>', unsafe_allow_html=True)
    pay_df = pd.DataFrame(payment_rows)
    
    if not pay_df.empty:
        pay_df['success_rate_pct'] = pay_df['success_rate_pct'].astype(float)
        colors = ['#f87171' if r < 70 else '#fbbf24' if r < 85 else '#34d399' for r in pay_df['success_rate_pct']]
        
        fig5 = go.Figure(go.Bar(
            x=pay_df['payment_method'],
            y=pay_df['success_rate_pct'],
            marker_color=colors,
            text=pay_df['success_rate_pct'].map(lambda x: f"{x:.1f}%"),
            textposition='outside',
            textfont=dict(color='#e2e8f0')
        ))
        # 90% threshold line
        fig5.add_hline(y=90, line_dash='dash', line_color='rgba(251,191,36,0.5)', 
                       annotation_text='90% target', annotation_font_color='#fbbf24')
        fig5.update_layout(**PLOTLY_LAYOUT, height=280, yaxis_title='Success Rate (%)', yaxis_range=[0, 115])
        st.plotly_chart(fig5, use_container_width=True)

    # --- Recommendation ---
    st.markdown('<div class="section-header">💡 Product Insights</div>', unsafe_allow_html=True)
    if not products_df.empty:
        top_prod_row = products_df.iloc[0]
        low_conv = products_df.sort_values('view_to_buy_pct').iloc[0]
        st.markdown(f"""
        <div class="recommendation-panel">
            <strong>📌 Key Finding</strong><br/>
            <strong style="color:#a78bfa">{top_prod_row['product_name']}</strong> leads in revenue with ₹{top_prod_row['revenue']:,.0f}.
            However, <strong style="color:#f87171">{low_conv['product_name']}</strong> has a low view-to-buy rate of {float(low_conv['view_to_buy_pct']):.1f}% despite {low_conv['product_views']} views.
            <br/><br/>
            <strong>💡 Recommendation:</strong> Audit the product page for <strong>{low_conv['product_name']}</strong> — improve photos, description, and pricing to convert the existing interest into purchases.
        </div>
        """, unsafe_allow_html=True)
