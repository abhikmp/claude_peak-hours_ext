// Runs in the MAIN world — has access to the real window.fetch.
// Cannot use chrome.runtime here, so posts data via window.postMessage
// for the ISOLATED world bridge to pick up and forward.
// Keep Account parsing in the bridge: Chrome can skip a shared script path
// registered in both MAIN and ISOLATED worlds.

(function () {
    // Updates leave the old MAIN world alive. Retire its interceptor before
    // installing another, including any old stream reads still in progress.
    window.__claudePeakCaptureCleanup?.();
    let active = true;
    const originalFetch = window.fetch;
    const readers = new Set();
    const RPC_PATH = '/claudeai-rpc/anthropic.bard.api.v1alpha.ConversationService/StreamTimeline';

    const captureFetch = async function (...args) {
        // Snapshot identity before fetch yields: callers can reuse and mutate headers.
        let url;
        let rpc = false;
        let organizationId;
        try {
            url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? args[0]?.href;
            const endpoint = new URL(url, 'https://claude.ai');
            rpc = endpoint.origin === 'https://claude.ai' && endpoint.pathname === RPC_PATH;
            if (rpc) organizationId = new Headers(args[1]?.headers ?? args[0]?.headers).get('x-organization-uuid');
        } catch (_) { url = undefined; }
        const response = await originalFetch(...args);
        if (!active || typeof url !== 'string') return response;
        if (!rpc && !/\/completion(?:[?#]|$)/.test(url)) return response;
        if (rpc && (!response.ok || !organizationId ||
            response.headers.get('content-type')?.split(';')[0].trim() !== 'application/connect+proto')) return response;

        function publish({ percent, resetsAt }) {
            if (!active) return;
            window.postMessage({
                source: 'claude-peak-extension-v2', type: 'USAGE_UPDATE',
                completionUrl: url, organizationId, percent, resetsAt
            }, '*');
        }

        (async () => {
            let reader;
            try {
                reader = response.clone().body.getReader();
                readers.add(reader);
                if (rpc) {
                    await globalThis.ConnectUsage.read(reader,
                        response.headers.get('connect-content-encoding') ?? 'identity', publish);
                    return;
                }
                const decoder = new TextDecoder();
                let buffer = '';

                while (active) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data:')) continue;
                        try {
                            const json = JSON.parse(line.slice(5).trim());
                            if (json.type !== 'message_limit') continue;

                            const percent = json.message_limit?.resolved?.limit?.percent ?? null;
                            const resetsAt = json.message_limit?.windows?.['5h']?.resets_at ?? null;

                            if (!active || percent === null) continue;

                            publish({ percent, resetsAt });

                        } catch (_) { }
                    }
                }
            } catch (_) { }
            finally {
                if (reader) {
                    readers.delete(reader);
                    reader.cancel?.().catch(() => {});
                }
            }
        })();

        return response;
    };
    window.fetch = captureFetch;
    window.__claudePeakCaptureCleanup = () => {
        active = false;
        for (const reader of readers) reader.cancel?.().catch(() => {});
        if (window.fetch === captureFetch) window.fetch = originalFetch;
    };
})();
