from typing import TypedDict, List
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END

from dotenv import load_dotenv

load_dotenv()


class AgentState(TypedDict):
  messages: List[HumanMessage]
  
llm = ChatOpenAI(model="gpt-4o-mini")


def process(state: AgentState) -> AgentState:
  response = llm.invoke(state["messages"])
  print(f"\nAI: {response.content}")
  return state

graph = StateGraph(AgentState)
graph.add_node("process", process)
graph.add_edge(START, "process")
graph.add_edge("process", END)
agent = graph.compile()

# from IPython.display import Image, display
# display(Image(agent.get_graph().draw_mermaid_png()))

while True:
  user_message = input("User: ")
  if user_message == "break" : break
  agent.invoke({"messages": [HumanMessage(content=user_message)]})

