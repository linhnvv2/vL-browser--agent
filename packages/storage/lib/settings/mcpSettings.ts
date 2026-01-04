import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export interface MCPServerConfig {
    id: string;
    name: string;
    enabled: boolean;
    type: 'stdio' | 'sse';
    // For SSE
    url?: string;
    // For Stdio
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    timeout?: number;
}

export interface MCPSettings {
    servers: MCPServerConfig[];
}

export type MCPSettingsStorage = BaseStorage<MCPSettings> & {
    getServers: () => Promise<MCPServerConfig[]>;
    addServer: (server: Omit<MCPServerConfig, 'id'>) => Promise<void>;
    updateServer: (id: string, server: Partial<MCPServerConfig>) => Promise<void>;
    removeServer: (id: string) => Promise<void>;
    toggleServer: (id: string) => Promise<void>;
    importServers: (mcpServers: Record<string, any>) => Promise<void>;
};

const DEFAULT_MCP_SETTINGS: MCPSettings = {
    servers: [],
};

const storage = createStorage<MCPSettings>('mcp-settings', DEFAULT_MCP_SETTINGS, {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
});

export const mcpSettingsStore: MCPSettingsStorage = {
    ...storage,
    async getServers() {
        const settings = await storage.get();
        return settings?.servers || [];
    },
    async addServer(server) {
        const id = Date.now().toString();
        await storage.set(current => ({
            ...current,
            servers: [...(current?.servers || []), { ...server, id }],
        }));
    },
    async updateServer(id, updatedServer) {
        await storage.set(current => ({
            ...current,
            servers: (current?.servers || []).map(s => (s.id === id ? { ...s, ...updatedServer } : s)),
        }));
    },
    async removeServer(id) {
        await storage.set(current => ({
            ...current,
            servers: (current?.servers || []).filter(s => s.id !== id),
        }));
    },
    async toggleServer(id) {
        await storage.set(current => ({
            ...current,
            servers: (current?.servers || []).map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
        }));
    },
    async importServers(mcpServers) {
        const newServers: MCPServerConfig[] = Object.entries(mcpServers).map(([name, config], index) => {
            const id = `imported-${Date.now()}-${index}`;
            const type = config.url ? 'sse' : 'stdio';
            return {
                id,
                name,
                enabled: true,
                type,
                ...config,
            };
        });

        await storage.set(current => ({
            ...current,
            servers: [...(current?.servers || []), ...newServers],
        }));
    },
};
