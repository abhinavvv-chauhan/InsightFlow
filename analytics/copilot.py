import os
import re
import json
import asyncio
import glob
from utils.db import async_execute_query
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

# Initialize async Groq client
api_key = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY")
if api_key:
    client = AsyncGroq(api_key=api_key)
else:
    client = None


def _get_schema_context():
    """Reads view definitions to construct a schema context for the LLM."""
    views_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sql', 'views')
    sql_files = glob.glob(os.path.join(views_dir, '*.sql'))

    schema_parts = []
    view_names = []

    for fpath in sql_files:
        filename = os.path.basename(fpath)
        view_name = re.sub(r'^\d+_', '', filename).replace('.sql', '')
        view_names.append(view_name)

        with open(fpath, 'r') as f:
            content = f.read()
            schema_parts.append(f"--- View: {view_name} ---\n{content}\n")

    return ", ".join(view_names), "\n".join(schema_parts)


def validate_sql(sql: str, view_catalog: list) -> bool:
    """Ensures SQL is a SELECT and doesn't write/modify."""
    sql = sql.strip().upper()
    if not sql.startswith("SELECT"):
        return False

    # Block destructive keywords
    blocked = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE"]
    for word in blocked:
        if re.search(rf'\b{word}\b', sql):
            return False

    return True


def clean_sql(sql_text: str) -> str:
    """Removes markdown code blocks if the LLM wrapped the SQL in them."""
    sql = sql_text.strip()
    if sql.startswith("```"):
        sql = sql.split("\n", 1)[-1]
    if sql.endswith("```"):
        sql = sql.rsplit("\n", 1)[0]
    # Sometimes LLM outputs "sql" as the first word inside the markdown block
    if sql.lower().startswith("sql\n"):
        sql = sql[4:].strip()
    return sql.strip()


async def ask_copilot(question: str):
    """
    Async two-prompt text-to-SQL-to-insight pipeline.

    Both LLM calls (SQL generation + summarization) and the DB query are
    fully non-blocking — the FastAPI event loop is free to handle other
    requests while this coroutine awaits I/O.

    Returns dict with {sql, data, finding, error}.
    """
    if not client:
        return {"error": "GROQ_API_KEY or LLM_API_KEY is missing. Please configure it in .env."}

    # File I/O is fast; run synchronously (no network, no DB)
    view_list, schema_context = _get_schema_context()

    if not view_list:
        view_list = "daily_kpis, product_performance, retention_metrics, conversion_metrics, customer_growth, city_performance, top_categories"

    generation_prompt = f"""You are a SQL generator for the InsightFlow PostgreSQL warehouse.
Rules:
1. Output ONE valid PostgreSQL SELECT statement only.
2. ONLY use these views. Do not query base tables directly.
3. NEVER write DDL/DML.
4. ALWAYS add LIMIT 100.
5. Do NOT wrap the output in markdown ```sql ... ``` blocks, output ONLY the raw SQL string.

Available Views and Schemas:
{schema_context}

Question: {question}
SQL:
"""

    try:
        # Step 1: Generate SQL — async, non-blocking LLM call
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": generation_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0
        )
        raw_sql = response.choices[0].message.content
        sql = clean_sql(raw_sql)

        # Step 2: Validate SQL (pure Python, no I/O)
        if not validate_sql(sql, view_list):
            return {"error": "Generated SQL was invalid or unsafe.", "sql": sql}

        # Step 3: Execute SQL — async, non-blocking DB call via asyncio.to_thread
        rows = await async_execute_query(sql)

        if not rows:
            return {
                "sql": sql,
                "data": [],
                "finding": "No data found for this query.",
                "recommendation": "Try broadening the date range or removing filters."
            }

        # Step 4: Summarize — async, non-blocking LLM call
        result_str = json.dumps([dict(r) for r in rows[:20]], default=str)

        summarization_prompt = f"""Given the question "{question}" and these query results:
{result_str}

Write exactly three sentences:
1. One-sentence finding with the key number.
2. The top 1-2 contributors (if applicable, else skip).
3. Exactly one actionable business recommendation.
"""

        summary_response = await client.chat.completions.create(
            messages=[{"role": "user", "content": summarization_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3
        )
        narrative = summary_response.choices[0].message.content.strip()

        return {
            "sql": sql,
            "data": rows[:100],
            "finding": narrative,
            "error": None
        }

    except Exception as e:
        return {"error": f"Copilot execution failed: {str(e)}"}
