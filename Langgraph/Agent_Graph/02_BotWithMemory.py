##########################################################
###################### Objectives ########################
##########################################################
# 1. Use different message types - `HumanMessage` and `AIMessage`
# 2. Maintain a full conversation history using both message types
# 3. Use GPT-4o model using `LangChain's ChatOpenAI` But I have only GPT-4o-mini
# 4. Create a sophisticated conversation loop

## Main Goal: Create a form of memory for our Agent

from typing import TypedDict, List, Union
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END

from dotenv import load_dotenv

load_dotenv()

class AgentState(TypedDict):
  messages: List[Union[HumanMessage, AIMessage]]


llm = ChatOpenAI(model = "gpt-4o-mini")

def process(state: AgentState) -> AgentState:
  """This node will solve the request you input"""
  response = llm.invoke(state["messages"])
  state["messages"].append(AIMessage(content=response.content))

  print(f"\nAI: {response.content}")
  return state


graph = StateGraph(AgentState)
graph.add_node("process", process)
graph.add_edge(START, "process")
graph.add_edge("process", END)

agent = graph.compile()

conversation_history = []

while True:
  user_input = input("Enter: ")
  if user_input == "exit": break

  conversation_history.append(HumanMessage(content=user_input))
  result = agent.invoke({"messages": conversation_history})

  conversation_history = result["messages"]


with open("logging.txt", "w") as file:
  file.write("Your conversation Log:\n")
  for message in conversation_history:
    if isinstance(message, HumanMessage):
      file.write(f"You: {message.content} \n")
    elif isinstance(message, AIMessage):
      file.write(f"AI: {message.content}\n\n")

  file.write("End of conversation")

print("Conversation saved to logging.text")        