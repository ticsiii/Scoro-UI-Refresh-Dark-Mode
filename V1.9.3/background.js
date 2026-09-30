/**
 * Scoro UI Refresh — Background Service Worker
 *
 * Runs as a Manifest V3 service worker (see manifest.json "background").
 * Its only job is to proxy fetch requests from content.js so that Dark Reader
 * can load external CSS files without hitting CORS restrictions.
 *
 * Message protocol:
 *   content.js → background.js:  { type: 'FETCH_URL', url: <string> }
 *   background.js → content.js:  { success: true, data: <string> }
 *
 * On fetch failure, returns an empty string (success: true, data: '') to
 * prevent Dark Reader from falling back to unsafe methods.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_URL') {
        fetch(request.url)
            .then(response => response.text())
            .then(text => sendResponse({ success: true, data: text }))
            .catch(error => {
                console.warn('Fetch failed for:', request.url, error);
                // Return empty string to prevent Dark Reader from failing/trying unsafe fallbacks
                sendResponse({ success: true, data: '' });
            });
        return true; // Keep channel open for async response
    }
});
