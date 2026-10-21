// Runs in the MAIN world — has access to the real window.fetch.
// Cannot use chrome.runtime here, so posts data via window.postMessage
// for the ISOLATED world bridge to pick up and forward.
// Keep Account parsing in the bridge: Chrome can skip a shared script path
// registered in both MAIN and ISOLATED worlds.

(function () {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const response = await originalFetch(...args);

        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? args[0]?.href;
        if (typeof url !== 'string' || !/\/completion(?:[?#]|$)/.test(url)) return response;

        const clone = response.clone();

        (async () => {
            try {
                const reader = clone.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
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

                            if (percent === null) continue;

                            // Post to the ISOLATED world bridge
                            window.postMessage({
                                source: 'claude-peak-extension',
                                type: 'USAGE_UPDATE',
                                completionUrl: url,
                                percent,
                                resetsAt
                            }, '*');

                        } catch (_) { }
                    }
                }
            } catch (_) { }
        })();

        return response;
    };
})();
