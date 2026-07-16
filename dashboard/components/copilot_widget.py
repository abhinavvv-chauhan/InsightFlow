import streamlit as st
import pandas as pd
from analytics.copilot import ask_copilot

def render_copilot_widget(context=""):
    """
    Renders the AI Copilot chat interface as a floating widget in the bottom right using streamlit-float.
    """
    state_key = f"messages_{context}"
    toggle_key = f"chat_open_{context}"
    
    if state_key not in st.session_state:
        st.session_state[state_key] = []
        st.session_state[state_key].append({"role": "assistant", "content": f"Hi! I'm your InsightFlow AI assistant. Ask me questions about your {context} data!"})
    if toggle_key not in st.session_state:
        st.session_state[toggle_key] = False

    # 1. Render the floating chat window (if open)
    if st.session_state[toggle_key]:
        chat_box = st.container()
        with chat_box:
            st.markdown(f"**🤖 AI Copilot ({context.title()})**")
            
            # Chat history container
            hist_container = st.container(height=350)
            with hist_container:
                for message in st.session_state[state_key]:
                    with st.chat_message(message["role"]):
                        st.markdown(message["content"])
                        if "sql" in message:
                            with st.expander("View generated SQL"):
                                st.code(message["sql"], language="sql")
                        if "data" in message and isinstance(message["data"], list) and len(message["data"]) > 0:
                            with st.expander("View raw data"):
                                st.dataframe(pd.DataFrame(message["data"]))
            
            # Chat input form
            with st.form(key=f"form_{context}", clear_on_submit=True):
                user_input = st.text_input("Ask a question...", label_visibility="collapsed", placeholder="Type your question here...")
                submit = st.form_submit_button("Send", use_container_width=True)
                
            if submit and user_input:
                st.session_state[state_key].append({"role": "user", "content": user_input})
                with st.spinner("Analyzing data..."):
                    response = ask_copilot(user_input)
                if response.get("error"):
                    st.session_state[state_key].append({"role": "assistant", "content": f"**Error:** {response['error']}"})
                else:
                    st.session_state[state_key].append({
                        "role": "assistant", 
                        "content": response["finding"],
                        "sql": response["sql"],
                        "data": response["data"]
                    })
                st.rerun()
                
        # Float the chat window above the button
        chat_box.float("position: fixed !important; bottom: 80px !important; right: 20px !important; width: 400px !important; background-color: #1e1e2d; border: 1px solid #333; border-radius: 12px; padding: 15px; z-index: 999999 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8);")

    # 2. Render the floating toggle button
    btn_container = st.container()
    with btn_container:
        btn_label = "❌ Close" if st.session_state[toggle_key] else "💬 Ask AI"
        if st.button(btn_label, key=f"toggle_{context}"):
            st.session_state[toggle_key] = not st.session_state[toggle_key]
            st.rerun()
            
    # Float the button in the very bottom right corner
    btn_container.float("position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 1000000 !important; width: auto !important;")
