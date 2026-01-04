import { useState, useEffect, useCallback } from 'react';
import { mcpSettingsStore, type MCPServerConfig } from '@extension/storage';
import { Button } from '@extension/ui';
import { t } from '@extension/i18n';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiUpload } from 'react-icons/fi';

interface MCPSettingsProps {
    isDarkMode: boolean;
}

export const MCPSettings = ({ isDarkMode }: MCPSettingsProps) => {
    const [servers, setServers] = useState<MCPServerConfig[]>([]);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [importJson, setImportJson] = useState('');
    const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});

    const loadServers = useCallback(async () => {
        const data = await mcpSettingsStore.getServers();
        setServers(data || []);
    }, []);

    useEffect(() => {
        loadServers();
    }, [loadServers]);

    const handleAddServer = async () => {
        if (!newName.trim() || !newUrl.trim()) return;
        await mcpSettingsStore.addServer({
            name: newName.trim(),
            url: newUrl.trim(),
            type: 'sse',
            enabled: true,
        });
        setNewName('');
        setNewUrl('');
        await loadServers();
    };

    const handleRemoveServer = async (id: string) => {
        await mcpSettingsStore.removeServer(id);
        await loadServers();
    };

    const handleToggleServer = async (id: string) => {
        await mcpSettingsStore.toggleServer(id);
        await loadServers();
    };

    const handleBulkImport = async () => {
        try {
            const data = JSON.parse(importJson);
            const mcpServers = data.mcpServers || data;
            await mcpSettingsStore.importServers(mcpServers);
            setImportJson('');
            setShowImport(false);
            await loadServers();
            alert(t('options_mcp_importSuccess').replace('$COUNT$', Object.keys(mcpServers).length.toString()));
        } catch (e) {
            alert(t('options_mcp_importError'));
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedServers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className="space-y-6">
            <div
                className={`rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-blue-100 bg-white'} p-6 text-left shadow-sm`}>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {t('options_mcp_header')}
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('options_mcp_description')}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowImport(!showImport)}
                        variant="secondary"
                        theme={isDarkMode ? 'dark' : 'light'}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm">
                        <FiUpload className="h-4 w-4" />
                        <span>{t('options_mcp_import')}</span>
                    </Button>
                </div>

                {showImport && (
                    <div className={`mb-6 rounded-lg border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                        <h3 className={`mb-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('options_mcp_import')}
                        </h3>
                        <textarea
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                            placeholder={t('options_mcp_importPlaceholder')}
                            className={`mb-3 h-48 w-full rounded-md border p-3 text-xs font-mono ${isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-700'
                                }`}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                onClick={() => setShowImport(false)}
                                variant="secondary"
                                theme={isDarkMode ? 'dark' : 'light'}
                                className="px-4 py-2 text-sm">
                                {t('options_models_providers_btnCancel')}
                            </Button>
                            <Button
                                onClick={handleBulkImport}
                                theme={isDarkMode ? 'dark' : 'light'}
                                className="px-4 py-2 text-sm">
                                {t('options_mcp_importBtn')}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className={`rounded-lg border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                        <h3 className={`mb-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('options_mcp_addServer')}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={`mb-1 block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('options_mcp_serverName')}
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder={t('options_mcp_placeholder_name')}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ${isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-700'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className={`mb-1 block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('options_mcp_serverUrl')}
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        placeholder={t('options_mcp_placeholder_url')}
                                        className={`flex-1 rounded-md border px-3 py-2 text-sm ${isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                    />
                                    <Button
                                        onClick={handleAddServer}
                                        theme={isDarkMode ? 'dark' : 'light'}
                                        className="whitespace-nowrap px-4 py-2 text-sm">
                                        {t('options_firewall_btnAdd')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {servers.length > 0 ? (
                            servers.map(server => (
                                <div
                                    key={server.id}
                                    className={`flex flex-col rounded-md border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'
                                        }`}>
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleToggleServer(server.id)}
                                                className={`text-2xl ${server.enabled ? 'text-blue-500' : 'text-gray-400'}`}>
                                                {server.enabled ? <FiToggleRight /> : <FiToggleLeft />}
                                            </button>
                                            <div onClick={() => toggleExpand(server.id)} className="cursor-pointer">
                                                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {server.name}
                                                    <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase ${server.type === 'sse'
                                                            ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                                                            : (isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700')
                                                        }`}>
                                                        {server.type}
                                                    </span>
                                                </div>
                                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {server.type === 'sse' ? server.url : `${server.command} ${server.args?.join(' ') || ''}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleExpand(server.id)}
                                                className={`p-1.5 hover:rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                                                {expandedServers[server.id] ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveServer(server.id)}
                                                className={`p-1.5 text-red-500 hover:rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedServers[server.id] && (
                                        <div className={`border-t p-4 text-xs ${isDarkMode ? 'border-slate-700 bg-slate-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
                                            {server.type === 'stdio' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="mb-1 font-semibold text-gray-500 uppercase">Command</div>
                                                        <code className={`block rounded p-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                                                            {server.command} {server.args?.map(a => `"${a}"`).join(' ')}
                                                        </code>
                                                    </div>
                                                    {server.env && Object.keys(server.env).length > 0 && (
                                                        <div>
                                                            <div className="mb-1 font-semibold text-gray-500 uppercase">Environment Variables</div>
                                                            <div className={`rounded p-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                                                                {Object.entries(server.env).map(([key, value]) => (
                                                                    <div key={key} className="font-mono">
                                                                        <span className="text-blue-400">{key}</span>: <span className="text-orange-400">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {server.timeout && (
                                                        <div>
                                                            <span className="font-semibold text-gray-500 uppercase">Timeout:</span> {server.timeout}s
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {server.type === 'sse' && (
                                                <div>
                                                    <div className="mb-1 font-semibold text-gray-500 uppercase">SSE URL</div>
                                                    <code className={`block rounded p-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                                                        {server.url}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className={`py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('options_mcp_noServers')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
