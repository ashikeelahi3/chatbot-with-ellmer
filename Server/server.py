from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from typing import TypedDict, List, Union, Annotated, Sequence

from dotenv import load_dotenv
from langchain_core.messages import (
    HumanMessage, AIMessage, BaseMessage, ToolMessage, SystemMessage
)
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

load_dotenv()

app = Flask(__name__)
CORS(app)

# ✅ Define LangGraph-compatible state
class ToolAgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

# ✅ Define your tools
@tool
def add(a: int, b: int):
    """Add two integers"""
    result = a + b
    print(f"[🔧 TOOL] add({a}, {b}) = {result}")
    return result

@tool
def subtract(a: int, b: int):
    """Subtract two integers"""
    result = a - b
    print(f"[🔧 TOOL] subtract({a}, {b}) = {result}")
    return result

@tool
def multiply(a: int, b: int):
    """Multiply two integers"""
    result = a * b
    print(f"[🔧 TOOL] multiply({a}, {b}) = {result}")
    return result

@tool
def divide(a: int, b: int):
    """Divide two integers"""
    if b == 0:
        raise ValueError("Division by zero is not allowed.")
    result = a / b
    print(f"[🔧 TOOL] divide({a}, {b}) = {result}")
    return result

# ✅ Register tools
tools = [add, subtract, multiply, divide]

# ✅ LLM with tool binding
tool_model = ChatOpenAI(model="gpt-4o-mini").bind_tools(tools)

# ✅ Node: Model thinking step
def model_call(state: ToolAgentState) -> ToolAgentState:
    system_prompt = SystemMessage(content="""
        You are a helpful AI assistant. 
        You must use the provided tools to answer math-related questions.
        Do not answer directly. Always call the relevant tool for:
        - addition, subtraction, multiplication, or division.
        Do not do the calculation yourself.
        """)
    print(f"\n[🧠 LLM] Thinking with user input: {state['messages'][-1].content}")
    response = tool_model.invoke([system_prompt] + list(state["messages"]))
    
    # Log tool call info
    tool_calls = getattr(response, "tool_calls", None)
    if tool_calls:
        print(f"[⚙️  LLM] Tool call(s) requested: {tool_calls}")
    else:
        print("[⚠️  LLM] No tool call detected")
    
    return {"messages": [response]}

# ✅ Conditional routing
def should_continue(state: ToolAgentState):
    messages = state["messages"]
    last = messages[-1]
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "continue"
    return "end"

# ✅ Build ReAct graph
tool_graph = StateGraph(ToolAgentState)
tool_graph.add_node("agent", model_call)
tool_graph.add_node("tools", ToolNode(tools=tools))

tool_graph.set_entry_point("agent")
tool_graph.add_conditional_edges("agent", should_continue, {
    "continue": "tools",
    "end": END
})
tool_graph.add_edge("tools", "agent")

tool_agent = tool_graph.compile()

# ✅ API endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])

    lc_messages = []
    for m in messages:
        role = m.get('role')
        content = m.get('content')
        if role == 'user':
            lc_messages.append(HumanMessage(content=content))
        elif role == 'assistant':
            lc_messages.append(AIMessage(content=content))
        elif role == 'system':
            lc_messages.append(SystemMessage(content=content))
        elif role == 'tool':
            lc_messages.append(ToolMessage(content=content, tool_call_id="tool-1"))

    try:
        result_state = tool_agent.invoke({"messages": lc_messages})

        bot_reply = ""
        for msg in reversed(result_state["messages"]):
            if isinstance(msg, AIMessage):
                bot_reply = msg.content
                break

        print(f"[🤖 AI Reply] {bot_reply}")

    except Exception as e:
        bot_reply = f"[OpenAI Error] {str(e)}"
        print(f"[❌ ERROR] {str(e)}")

    now = datetime.datetime.now()
    return jsonify({
        'reply': bot_reply,
        'time': now.strftime('%H:%M'),
        'date': now.strftime('%Y-%m-%d')
    })

if __name__ == '__main__':
    print("[🚀 Server Running] Listening at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
