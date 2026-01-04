# Model Context Protocol (MCP) Integration

This document explains how to add and use MCP servers with vL Browser Agent.

## What is MCP?
The Model Context Protocol (MCP) allows your AI agents to connect to external tools and data sources (like Google Search, GitHub, or local scripts) using a standardized interface.

## How to Add MCP Servers

Currently, MCP integration is a manual process that involves the following steps:

### 1. Choose or Create an MCP Server
You can find many pre-built MCP servers in the [MCP community](https://github.com/modelcontextprotocol/servers).
Alternatively, you can run one using Docker. See the `docker-compose.yml` file for an example.

### 2. Register MCP Tools in the Agent
To allow the **Navigator** agent to use MCP tools:
1.  **Install the SDK**: `pnpm add @modelcontextprotocol/sdk` in the `chrome-extension` package.
2.  **Initialize Client**: In `chrome-extension/src/background/index.ts`, create an MCP client connection.
3.  **Fetch Tools**: Call `client.listTools()` to get available tools.
4.  **Register Actions**: Add these tools to the `NavigatorActionRegistry` in `chrome-extension/src/background/agent/agents/navigator.ts`.

### 3. Example Connection Code (SSE)
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const client = new Client({ name: "vL-Agent", version: "1.0.0" });
await client.connect(new SSEClientTransport(new URL("http://localhost:8080/sse")));

// After connection, tools can be registered in the registry
const tools = await client.listTools();
```

## Resources
- [Official MCP Documentation](https://modelcontextprotocol.io/)
- [MCP GitHub Organization](https://github.com/modelcontextprotocol)
