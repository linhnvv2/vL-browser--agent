import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { mcpSettingsStore, type MCPServerConfig } from '@extension/storage';
import { createLogger } from '../log';
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

const logger = createLogger('MCPService');

export interface MCPTool {
    serverName: string;
    name: string;
    description?: string;
    inputSchema: any;
}

export class MCPService {
    private static instance: MCPService;
    private clients: Map<string, Client> = new Map();
    private tools: MCPTool[] = [];
    private initialized = false;

    private constructor() { }

    public static getInstance(): MCPService {
        if (!MCPService.instance) {
            MCPService.instance = new MCPService();
        }
        return MCPService.instance;
    }

    public async initialize() {
        if (this.initialized) return;

        await this.reloadServers();

        // Subscribe to settings changes
        mcpSettingsStore.subscribe(() => {
            this.reloadServers().catch(err => logger.error('Failed to reload MCP servers', err));
        });

        this.initialized = true;
        logger.info('MCPService initialized');
    }

    public async reloadServers() {
        const servers = await mcpSettingsStore.getServers();
        const enabledServers = servers.filter(s => s.enabled && s.type === 'sse');

        // Disconnect removed or disabled servers
        for (const [serverId, client] of this.clients.entries()) {
            if (!enabledServers.find(s => s.id === serverId)) {
                try {
                    await client.close();
                } catch (e) {
                    logger.error(`Failed to close MCP client ${serverId}`, e);
                }
                this.clients.delete(serverId);
                logger.info(`Disconnected MCP server: ${serverId}`);
            }
        }

        // Connect to new or updated servers
        for (const server of enabledServers) {
            if (!this.clients.has(server.id)) {
                await this.connectServer(server);
            }
        }

        await this.refreshTools();
    }

    private async connectServer(server: MCPServerConfig) {
        if (!server.url) return;

        try {
            logger.info(`Connecting to MCP server: ${server.name} at ${server.url}`);
            const transport = new SSEClientTransport(new URL(server.url));
            const client = new Client(
                { name: "vL-Agent", version: "1.0.0" },
                { capabilities: {} }
            );

            await client.connect(transport);
            this.clients.set(server.id, client);
            logger.info(`Connected to MCP server: ${server.name}`);
        } catch (error) {
            logger.error(`Failed to connect to MCP server ${server.name}`, error);
        }
    }

    public async refreshTools() {
        const allTools: MCPTool[] = [];

        for (const [serverId, client] of this.clients.entries()) {
            try {
                const servers = await mcpSettingsStore.getServers();
                const server = servers.find(s => s.id === serverId);
                const serverName = server?.name || 'Unknown';

                const response = await client.listTools();
                const tools = response.tools.map((tool: any) => ({
                    serverName,
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }));

                allTools.push(...tools);
            } catch (error) {
                logger.error(`Failed to list tools for server ${serverId}`, error);
            }
        }

        this.tools = allTools;
        logger.info(`Refreshed MCP tools: ${this.tools.length} tools found`);
    }

    public getTools(): MCPTool[] {
        return this.tools;
    }

    public async callTool(serverName: string, toolName: string, args: any) {
        const serverEntry = Array.from(this.clients.entries()).find(async ([id, _]) => {
            const servers = await mcpSettingsStore.getServers();
            return servers.find(s => s.id === id)?.name === serverName;
        });

        // Optimization: we already have tools list, maybe find client by tool name if unique
        // For now, search by serverName
        const servers = await mcpSettingsStore.getServers();
        const server = servers.find(s => s.name === serverName);
        if (!server) throw new Error(`MCP Server ${serverName} not found`);

        const client = this.clients.get(server.id);
        if (!client) throw new Error(`MCP Client for ${serverName} not connected`);

        return await client.callTool({
            name: toolName,
            arguments: args
        }, CallToolResultSchema);
    }
}
