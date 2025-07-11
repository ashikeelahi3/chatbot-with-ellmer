from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from typing import TypedDict, List, Union
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

class AgentState(TypedDict):
  messages: List[Union[HumanMessage, AIMessage]]


llm = ChatOpenAI(model = "gpt-4o-mini")

def process(state: AgentState) -> AgentState:
  """This node will solve the request you input"""
  response = llm.invoke(state["messages"])
  state["messages"].append(AIMessage(content=response.content))

  print(f"\nAI: {response.content}")
  return state

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    # Convert OpenAI-style dicts to LangChain message objects
    lc_messages = []
    for m in messages:
        if m['role'] == 'user':
            lc_messages.append(HumanMessage(content=m['content']))
        else:
            lc_messages.append(AIMessage(content=m['content']))
    try:
        graph = StateGraph(AgentState)
        graph.add_node("process", process)
        graph.add_edge(START, "process")
        graph.add_edge("process", END)

        agent = graph.compile()

        result_state = agent.invoke({"messages": lc_messages})
        # Get the last AI message as the reply
        bot_reply = ""
        for msg in reversed(result_state["messages"]):
            if isinstance(msg, AIMessage):
                bot_reply = msg.content
                break
    except Exception as e:
        bot_reply = f"[OpenAI Error] {str(e)}"
    now = datetime.datetime.now()
    return jsonify({
        'reply': bot_reply,
        'time': now.strftime('%H:%M'),
        'date': now.strftime('%Y-%m-%d')
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
