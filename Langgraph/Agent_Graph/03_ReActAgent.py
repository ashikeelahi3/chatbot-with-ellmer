##########################################################
##############         ReAct Agent        ################
############## Reasoning and Acting Agent ################
##########################################################
#### Objectives
# 1. Learn how to create `Tools` in LangGraph
# 2. How to create a `ReAct Graph`
# 3. Work with different types of `Messages` such as `ToolMessages`
# 4. Test out robustness of our graph

## Main Goal: Create a robust ReAct Agent!

from typing import Annotated, Sequence, TypedDict
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, ToolMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

# BaseMessage   -> The fundamental class for all message types in LngGraph
# ToolMessage   -> Passes data back to LLM after it calls a tool such as the content and the tool_call_id
# SystemMessage -> Message for providing instructions to the LLM 

load_dotenv()

class AgentState(TypedDict):
  messages: Annotated[Sequence[BaseMessage], add_messages]
  

@tool
def add(a: int, b:int):
  """This is an addition function that adds 2 numbers together"""
  return a + b

tools = [add]

model = ChatOpenAI(model="gpt-4o-mini").bind_tools(tools)

def model_call(state:AgentState) -> AgentState:
    system_prompt = SystemMessage(content=
        "You are my AI assistant, please answer my query to the best of your ability."
    )
    response = model.invoke([system_prompt] + list(state["messages"]))
    return {"messages": [response]}

from langchain_core.messages import AIMessage

def should_continue(state: AgentState):
  messages = state["messages"]
  last_message = messages[-1]
  if isinstance(last_message, AIMessage) and getattr(last_message, "tool_calls", None):
    return "continue"
  else:
    return "end"

graph = StateGraph(AgentState)
graph.add_node("our_agent", model_call)

tool_node = ToolNode(tools=tools)
graph.add_node("tools", tool_node)

graph.set_entry_point("our_agent")

graph.add_conditional_edges(
  "our_agent",
  should_continue,
  {
    "continue": "tools",
    "end": END
  }
)

graph.add_edge("tools", "our_agent")

app = graph.compile()

def print_stream(stream):
  for s in stream:
    message = s["messages"][-1]
    if isinstance(message, tuple):
      print(message)
    else:
      message.pretty_print()

from langchain_core.messages import HumanMessage

inputs: AgentState = {"messages": [HumanMessage(content="Add 40 + 12")]}
print_stream(app.stream(inputs, stream_mode="values"))