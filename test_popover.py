import streamlit as st

with st.popover("Chat"):
    st.write("Hello")
    if prompt := st.chat_input("Say something"):
        st.write(f"You said {prompt}")
