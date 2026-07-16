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

FUNNEL_STEPS = ['Landing', 'Search', 'Product View', 'Add To Cart', 'Checkout', 'Payment', 'Purchase']
INDIGO = 'rgba(99,102,241,'

def render():
    st.markdown("# 🔻 Funnel Analysis")
    st.markdown("*Where are users dropping off? Use filters to drill down.*")
    
    # --- Filters ---
    with st.expander("🔍 Filter Options", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            device_rows = execute_query("SELECT DISTINCT device FROM dim_device ORDER BY device")
            devices = ['All'] + [r['device'] for r in device_rows]
            selected_device = st.selectbox("Filter by Device", devices)
        with col2:
            city_rows = execute_query("SELECT DISTINCT city FROM dim_location ORDER BY city LIMIT 20")
            cities = ['All'] + [r['city'] for r in city_rows]
            selected_city = st.selectbox("Filter by City", cities)

    filters = {}
    if selected_device != 'All':
        filters['device'] = selected_device
    if selected_city != 'All':
        filters['city'] = selected_city

    # --- Main Funnel ---
    funnel_df = engine.get_funnel(filters)
    
    c1, c2 = st.columns([3, 2])
    
    with c1:
        st.markdown('<div class="section-header">Purchase Funnel</div>', unsafe_allow_html=True)
        if not funnel_df.empty:
            fig = go.Figure(go.Funnel(
                y=funnel_df['Step'].tolist(),
                x=funnel_df['Sessions'].tolist(),
                textinfo="value+percent initial",
                textfont=dict(color='#e2e8f0'),
                marker=dict(
                    color=[
                        '#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'
                    ],
                    line=dict(width=1, color='rgba(0,0,0,0.2)')
                ),
                connector=dict(line=dict(color='rgba(99,102,241,0.3)', width=1))
            ))
            fig.update_layout(**PLOTLY_LAYOUT, height=440)
            st.plotly_chart(fig, use_container_width=True)

    with c2:
        st.markdown('<div class="section-header">Step-by-Step Metrics</div>', unsafe_allow_html=True)
        if not funnel_df.empty:
            for _, row in funnel_df.iterrows():
                drop_color = '#f87171' if row['Drop-off (%)'] > 40 else '#fbbf24' if row['Drop-off (%)'] > 20 else '#34d399'
                st.markdown(f"""
                <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;padding:0.6rem 0.9rem;margin-bottom:0.5rem;">
                    <strong style="color:#a78bfa">{row['Step']}</strong><br/>
                    <span style="color:#94a3b8;font-size:0.8rem;">{row['Sessions']:,} sessions · </span>
                    <span style="color:#e2e8f0;font-size:0.8rem;">Conv: {row['Conversion (%)']:.1f}%</span>
                    {f'<span style="color:{drop_color};font-size:0.75rem;"> · ↓ {row["Drop-off (%)"]:.1f}% drop</span>' if row['Drop-off (%)'] > 0 else ''}
                </div>
                """, unsafe_allow_html=True)

    # --- Device Comparison ---
    st.markdown('<div class="section-header">Funnel by Device</div>', unsafe_allow_html=True)
    device_data = []
    for dv in ['Android', 'iOS', 'Desktop']:
        df = engine.get_funnel(filters={'device': dv})
        if not df.empty:
            purchase_row = df[df['Step'] == 'Purchase']
            if not purchase_row.empty:
                device_data.append({'device': dv, 'conversion': float(purchase_row['Conversion (%)'].iloc[0])})

    if device_data:
        dev_df = pd.DataFrame(device_data)
        fig2 = go.Figure(go.Bar(
            x=dev_df['device'],
            y=dev_df['conversion'],
            marker_color=['#6366f1', '#a78bfa', '#34d399'],
            text=dev_df['conversion'].map(lambda x: f"{x:.2f}%"),
            textposition='outside',
            textfont=dict(color='#e2e8f0')
        ))
        fig2.update_layout(**PLOTLY_LAYOUT, height=280, yaxis_title='Overall Conversion (%)')
        st.plotly_chart(fig2, use_container_width=True)

    # --- Recommendation Panel ---
    st.markdown('<div class="section-header">💡 Funnel Insights</div>', unsafe_allow_html=True)
    if not funnel_df.empty:
        worst_step = funnel_df[funnel_df['Drop-off (%)'] > 0].sort_values('Drop-off (%)', ascending=False).iloc[0]
        st.markdown(f"""
        <div class="recommendation-panel">
            <strong>📌 Key Finding</strong><br/>
            The biggest funnel leak is at <strong style="color:#a78bfa">{worst_step['Step']}</strong> with a <strong style="color:#f87171">{worst_step['Drop-off (%)']:.1f}%</strong> drop-off.
            Only <strong style="color:#a78bfa">{funnel_df.iloc[-1]['Conversion (%)']:.2f}%</strong> of landing sessions result in a purchase.
            <br/><br/>
            <strong>💡 Recommendation:</strong> Focus engineering and UX resources on the <strong>{worst_step['Step']}</strong> experience to recover these sessions.
        </div>
        """, unsafe_allow_html=True)
