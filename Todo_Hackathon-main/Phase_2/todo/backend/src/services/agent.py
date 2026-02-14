"""
Groq Agent for Todo task operations.
Connects to Groq API and executes MCP tools via function calling.
"""

from typing import List, Dict, Any, Optional
from groq import Groq
import json
from src.config import settings
from src.services import mcp_server


class TodoAgent:
    """Agent that uses Groq LLM to understand natural language and execute task operations."""

    def __init__(self):
        """Initialize Groq client and load MCP tools."""
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"
        self.tools = self._load_tools()
        self.max_retries = 3

    def _load_tools(self) -> List[Dict[str, Any]]:
        """
        Load MCP tools and convert to OpenAI function format.

        Returns:
            List of tool definitions in OpenAI format
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task for the user. Use this when the user wants to add, create, or remember something to do.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "The title or name of the task"
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional detailed description of the task"
                            }
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Retrieve all tasks for the user. Use this when the user wants to see, view, list, or check their tasks.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "completed": {
                                "type": "boolean",
                                "description": "Filter by completion status. True for completed tasks, False for pending tasks, omit for all tasks"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed. Use this when the user wants to complete, finish, or mark a task as done.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The ID of the task to complete"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task permanently. Use this when the user wants to delete, remove, or get rid of a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The ID of the task to delete"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update a task's title or description. Use this when the user wants to change, modify, or edit a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The ID of the task to update"
                            },
                            "title": {
                                "type": "string",
                                "description": "New title for the task"
                            },
                            "description": {
                                "type": "string",
                                "description": "New description for the task"
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

    def _execute_tool(self, tool_name: str, tool_args: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Execute an MCP tool with the given arguments.

        Args:
            tool_name: Name of the tool to execute
            tool_args: Arguments for the tool
            user_id: UUID of the user

        Returns:
            Tool execution result
        """
        # Add user_id to all tool calls
        tool_args["user_id"] = user_id

        # Map tool names to MCP functions
        tool_map = {
            "add_task": mcp_server.add_task,
            "list_tasks": mcp_server.list_tasks,
            "complete_task": mcp_server.complete_task,
            "delete_task": mcp_server.delete_task,
            "update_task": mcp_server.update_task,
        }

        if tool_name not in tool_map:
            return {
                "status": "error",
                "data": None,
                "message": f"Unknown tool: {tool_name}"
            }

        try:
            # Execute the tool
            result = tool_map[tool_name](**tool_args)
            return result
        except Exception as e:
            return {
                "status": "error",
                "data": None,
                "message": f"Tool execution failed: {str(e)}"
            }

    def chat(self, messages: List[Dict[str, str]], user_id: str) -> Dict[str, Any]:
        """
        Process a chat conversation with tool execution.

        Args:
            messages: List of message dicts with 'role' and 'content'
            user_id: UUID of the user

        Returns:
            Dict with 'content' (response text) and 'tool_calls' (list of executed tools)
        """
        # Add system prompt
        system_prompt = {
            "role": "system",
            "content": (
                "You are a helpful task management assistant. You help users manage their todo tasks "
                "through natural language. You can add, list, complete, update, and delete tasks. "
                "Always be concise and friendly. When a user asks to do something with their tasks, "
                "use the appropriate tool. After executing a tool, provide a natural language summary "
                "of what was done. If a task ID is needed but not provided, ask the user for it or "
                "suggest they list their tasks first."
            )
        }

        # Prepare messages with system prompt
        full_messages = [system_prompt] + messages

        # Track tool calls for response
        executed_tools = []

        # Retry loop for API calls
        for attempt in range(self.max_retries):
            try:
                # Call Groq API with tools
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=full_messages,
                    tools=self.tools,
                    tool_choice="auto",
                    temperature=0.7,
                    max_tokens=1024
                )

                message = response.choices[0].message

                # Check if tool calls are needed
                if message.tool_calls:
                    # Execute each tool call
                    for tool_call in message.tool_calls:
                        tool_name = tool_call.function.name
                        tool_args = json.loads(tool_call.function.arguments)

                        # Execute the tool
                        tool_result = self._execute_tool(tool_name, tool_args, user_id)
                        executed_tools.append({
                            "name": tool_name,
                            "arguments": tool_args,
                            "result": tool_result
                        })

                        # Add tool call and result to messages for next API call
                        # Convert tool_call to dict format for Groq SDK 1.0.0
                        tool_call_dict = {
                            "id": tool_call.id,
                            "type": "function",
                            "function": {
                                "name": tool_name,
                                "arguments": tool_call.function.arguments
                            }
                        }

                        full_messages.append({
                            "role": "assistant",
                            "content": "",
                            "tool_calls": [tool_call_dict]
                        })
                        full_messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(tool_result)
                        })

                    # Call API again to get natural language response
                    final_response = self.client.chat.completions.create(
                        model=self.model,
                        messages=full_messages,
                        temperature=0.7,
                        max_tokens=1024
                    )

                    return {
                        "content": final_response.choices[0].message.content,
                        "tool_calls": executed_tools
                    }
                else:
                    # No tool calls, return direct response
                    return {
                        "content": message.content,
                        "tool_calls": executed_tools
                    }

            except Exception as e:
                if attempt < self.max_retries - 1:
                    # Retry on failure
                    continue
                else:
                    # Final attempt failed
                    return {
                        "content": f"I'm sorry, I encountered an error: {str(e)}. Please try again.",
                        "tool_calls": executed_tools
                    }

        # Should not reach here, but just in case
        return {
            "content": "I'm sorry, I couldn't process your request. Please try again.",
            "tool_calls": executed_tools
        }
