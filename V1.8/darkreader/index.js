(function () {
    'use strict';

    const isNavigatorDefined = typeof navigator !== 'undefined';
    const userAgent = isNavigatorDefined ? (navigator.userAgentData && Array.isArray(navigator.userAgentData.brands)) ?
        navigator.userAgentData.brands.map((brand) => `${brand.brand.toLowerCase()} ${brand.version}`).join(' ') : navigator.userAgent.toLowerCase()
        : 'some useragent';
    const platform = isNavigatorDefined ? (navigator.userAgentData && typeof navigator.userAgentData.platform === 'string') ?
        navigator.userAgentData.platform.toLowerCase() : navigator.platform.toLowerCase()
        : 'some platform';
    const isFirefox = (((false)));
    (userAgent.includes('vivaldi'));
    (userAgent.includes('yabrowser'));
    const isOpera = ((userAgent.includes('opr') || userAgent.includes('opera')));
    const isEdge = (userAgent.includes('edg'));
    const isWindows = platform.startsWith('win');
    const isMacOS = platform.startsWith('mac');
    const isMobile = (isNavigatorDefined && navigator.userAgentData) ? navigator.userAgentData.mobile : (userAgent.includes('mobile') || (false));
    // Return true if browser is known to have a bug with Media Queries, specifically Chromium on Linux and Kiwi on Android
    // We assume that if we are on Android, then we are running in Kiwi since it is the only mobile browser we can install Dark Reader in
    (((isNavigatorDefined && navigator.userAgentData) && ['Linux', 'Android'].includes(navigator.userAgentData.platform))
        || platform.startsWith('linux'));
    (() => {
        const m = userAgent.match(/chrom(?:e|ium)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return '';
    })();
    (() => {
        const m = userAgent.match(/(?:firefox|librewolf)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return '';
    })();
    (() => {
        try {
            document.querySelector(':defined');
            return true;
        }
        catch (err) {
            return false;
        }
    })();
    const isXMLHttpRequestSupported = typeof XMLHttpRequest === 'function';
    const isFetchSupported = typeof fetch === 'function';

    function parse24HTime(time) {
        return time.split(':').map((x) => parseInt(x));
    }
    function compareTime(time1, time2) {
        if (time1[0] === time2[0] && time1[1] === time2[1]) {
            return 0;
        }
        if (time1[0] < time2[0] || (time1[0] === time2[0] && time1[1] < time2[1])) {
            return -1;
        }
        return 1;
    }
    function nextTimeInterval(time0, time1, date = new Date()) {
        const a = parse24HTime(time0);
        const b = parse24HTime(time1);
        const t = [date.getHours(), date.getMinutes()];
        // Ensure a <= b
        if (compareTime(a, b) > 0) {
            return nextTimeInterval(time1, time0, date);
        }
        if (compareTime(a, b) === 0) {
            return null;
        }
        if (compareTime(t, a) < 0) {
            // t < a <= b
            // Schedule for todate at time a
            date.setHours(a[0]);
            date.setMinutes(a[1]);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
        }
        if (compareTime(t, b) < 0) {
            // a <= t < b
            // Schedule for today at time b
            date.setHours(b[0]);
            date.setMinutes(b[1]);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
        }
        // a <= b <= t
        // Schedule for tomorrow at time a
        return (new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, a[0], a[1])).getTime();
    }
    function isInTimeIntervalLocal(time0, time1, date = new Date()) {
        const a = parse24HTime(time0);
        const b = parse24HTime(time1);
        const t = [date.getHours(), date.getMinutes()];
        if (compareTime(a, b) > 0) {
            return compareTime(a, t) <= 0 || compareTime(t, b) < 0;
        }
        return compareTime(a, t) <= 0 && compareTime(t, b) < 0;
    }
    function isInTimeIntervalUTC(time0, time1, timestamp) {
        if (time1 < time0) {
            return timestamp <= time1 || time0 <= timestamp;
        }
        return time0 < timestamp && timestamp < time1;
    }
    function getDuration(time) {
        let duration = 0;
        if (time.seconds) {
            duration += time.seconds * 1000;
        }
        if (time.minutes) {
            duration += time.minutes * 60 * 1000;
        }
        if (time.hours) {
            duration += time.hours * 60 * 60 * 1000;
        }
        if (time.days) {
            duration += time.days * 24 * 60 * 60 * 1000;
        }
        return duration;
    }
    function getDurationInMinutes(time) {
        return getDuration(time) / 1000 / 60;
    }
    function getSunsetSunriseUTCTime(latitude, longitude, date) {
        const dec31 = Date.UTC(date.getUTCFullYear(), 0, 0, 0, 0, 0, 0);
        const oneDay = getDuration({ days: 1 });
        const dayOfYear = Math.floor((date.getTime() - dec31) / oneDay);
        const zenith = 90.83333333333333;
        const D2R = Math.PI / 180;
        const R2D = 180 / Math.PI;
        // convert the longitude to hour value and calculate an approximate time
        const lnHour = longitude / 15;
        function getTime(isSunrise) {
            const t = dayOfYear + (((isSunrise ? 6 : 18) - lnHour) / 24);
            // calculate the Sun's mean anomaly
            const M = (0.9856 * t) - 3.289;
            // calculate the Sun's true longitude
            let L = M + (1.916 * Math.sin(M * D2R)) + (0.020 * Math.sin(2 * M * D2R)) + 282.634;
            if (L > 360) {
                L -= 360;
            }
            else if (L < 0) {
                L += 360;
            }
            // calculate the Sun's right ascension
            let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
            if (RA > 360) {
                RA -= 360;
            }
            else if (RA < 0) {
                RA += 360;
            }
            // right ascension value needs to be in the same qua
            const Lquadrant = (Math.floor(L / (90))) * 90;
            const RAquadrant = (Math.floor(RA / 90)) * 90;
            RA += (Lquadrant - RAquadrant);
            // right ascension value needs to be converted into hours
            RA /= 15;
            // calculate the Sun's declination
            const sinDec = 0.39782 * Math.sin(L * D2R);
            const cosDec = Math.cos(Math.asin(sinDec));
            // calculate the Sun's local hour angle
            const cosH = (Math.cos(zenith * D2R) - (sinDec * Math.sin(latitude * D2R))) / (cosDec * Math.cos(latitude * D2R));
            if (cosH > 1) {
                // always night
                return {
                    alwaysDay: false,
                    alwaysNight: true,
                    time: 0,
                };
            }
            else if (cosH < -1) {
                // always day
                return {
                    alwaysDay: true,
                    alwaysNight: false,
                    time: 0,
                };
            }
            const H = (isSunrise ? (360 - R2D * Math.acos(cosH)) : (R2D * Math.acos(cosH))) / 15;
            // calculate local mean time of rising/setting
            const T = H + RA - (0.06571 * t) - 6.622;
            // adjust back to UTC
            let UT = T - lnHour;
            if (UT > 24) {
                UT -= 24;
            }
            else if (UT < 0) {
                UT += 24;
            }
            // convert to milliseconds
            return {
                alwaysDay: false,
                alwaysNight: false,
                time: Math.round(UT * getDuration({ hours: 1 })),
            };
        }
        const sunriseTime = getTime(true);
        const sunsetTime = getTime(false);
        if (sunriseTime.alwaysDay || sunsetTime.alwaysDay) {
            return {
                alwaysDay: true,
                alwaysNight: false,
                sunriseTime: 0,
                sunsetTime: 0,
            };
        }
        else if (sunriseTime.alwaysNight || sunsetTime.alwaysNight) {
            return {
                alwaysDay: false,
                alwaysNight: true,
                sunriseTime: 0,
                sunsetTime: 0,
            };
        }
        return {
            alwaysDay: false,
            alwaysNight: false,
            sunriseTime: sunriseTime.time,
            sunsetTime: sunsetTime.time,
        };
    }
    function isNightAtLocation(latitude, longitude, date = new Date()) {
        const time = getSunsetSunriseUTCTime(latitude, longitude, date);
        if (time.alwaysDay) {
            return false;
        }
        else if (time.alwaysNight) {
            return true;
        }
        const sunriseTime = time.sunriseTime;
        const sunsetTime = time.sunsetTime;
        const currentTime = (date.getUTCHours() * getDuration({ hours: 1 }) +
            date.getUTCMinutes() * getDuration({ minutes: 1 }) +
            date.getUTCSeconds() * getDuration({ seconds: 1 }) +
            date.getUTCMilliseconds());
        return isInTimeIntervalUTC(sunsetTime, sunriseTime, currentTime);
    }
    function nextTimeChangeAtLocation(latitude, longitude, date = new Date()) {
        const time = getSunsetSunriseUTCTime(latitude, longitude, date);
        if (time.alwaysDay) {
            return date.getTime() + getDuration({ days: 1 });
        }
        else if (time.alwaysNight) {
            return date.getTime() + getDuration({ days: 1 });
        }
        const [firstTimeOnDay, lastTimeOnDay] = time.sunriseTime < time.sunsetTime ? [time.sunriseTime, time.sunsetTime] : [time.sunsetTime, time.sunriseTime];
        const currentTime = (date.getUTCHours() * getDuration({ hours: 1 }) +
            date.getUTCMinutes() * getDuration({ minutes: 1 }) +
            date.getUTCSeconds() * getDuration({ seconds: 1 }) +
            date.getUTCMilliseconds());
        if (currentTime <= firstTimeOnDay) {
            // Timeline:
            // --- firstTimeOnDay <---> lastTimeOnDay ---
            //  ^
            // Current time
            return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, firstTimeOnDay);
        }
        if (currentTime <= lastTimeOnDay) {
            // Timeline:
            // --- firstTimeOnDay <---> lastTimeOnDay ---
            //                      ^
            //                 Current time
            return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, lastTimeOnDay);
        }
        // Timeline:
        // --- firstTimeOnDay <---> lastTimeOnDay ---
        //                                         ^
        //                                    Current time
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, firstTimeOnDay);
    }

    function cachedFactory(factory, size) {
        const cache = new Map();
        return (key) => {
            if (cache.has(key)) {
                return cache.get(key);
            }
            const value = factory(key);
            cache.set(key, value);
            if (cache.size > size) {
                const first = cache.keys().next().value;
                cache.delete(first);
            }
            return value;
        };
    }

    function getURLHostOrProtocol($url) {
        const url = new URL($url);
        if (url.host) {
            return url.host;
        }
        else if (url.protocol === 'file:') {
            return url.pathname;
        }
        return url.protocol;
    }
    function compareURLPatterns(a, b) {
        return a.localeCompare(b);
    }
    /**
     * Determines whether URL has a match in URL template list.
     * @param url Site URL.
     * @paramlist List to search into.
     */
    function isURLInList(url, list) {
        for (let i = 0; i < list.length; i++) {
            if (isURLMatched(url, list[i])) {
                return true;
            }
        }
        return false;
    }
    /**
     * Determines whether URL matches the template.
     * @param url URL.
     * @param urlTemplate URL template ("google.*", "youtube.com" etc).
     */
    function isURLMatched(url, urlTemplate) {
        if (isRegExp(urlTemplate)) {
            const regexp = createRegExp(urlTemplate);
            return regexp ? regexp.test(url) : false;
        }
        return matchURLPattern(url, urlTemplate);
    }
    const URL_CACHE_SIZE = 32;
    const prepareURL = cachedFactory((url) => {
        let parsed;
        try {
            parsed = new URL(url);
        }
        catch (err) {
            return null;
        }
        const { hostname, pathname, protocol, port } = parsed;
        const hostParts = hostname.split('.').reverse();
        const pathParts = pathname.split('/').slice(1);
        if (!pathParts[pathParts.length - 1]) {
            pathParts.splice(pathParts.length - 1, 1);
        }
        return {
            hostParts,
            pathParts,
            port,
            protocol,
        };
    }, URL_CACHE_SIZE);
    const URL_MATCH_CACHE_SIZE = 32 * 1024;
    const preparePattern = cachedFactory((pattern) => {
        if (!pattern) {
            return null;
        }
        const exactStart = pattern.startsWith('^');
        const exactEnd = pattern.endsWith('$');
        if (exactStart) {
            pattern = pattern.substring(1);
        }
        if (exactEnd) {
            pattern = pattern.substring(0, pattern.length - 1);
        }
        let protocol = '';
        const protocolIndex = pattern.indexOf('://');
        if (protocolIndex > 0) {
            protocol = pattern.substring(0, protocolIndex + 1);
            pattern = pattern.substring(protocolIndex + 3);
        }
        const slashIndex = pattern.indexOf('/');
        const host = slashIndex < 0 ? pattern : pattern.substring(0, slashIndex);
        let hostName = host;
        let isIPv6 = false;
        let ipV6End = -1;
        if (host.startsWith('[')) {
            ipV6End = host.indexOf(']');
            if (ipV6End > 0) {
                isIPv6 = true;
            }
        }
        let port = '*';
        const portIndex = host.lastIndexOf(':');
        if (portIndex >= 0 && (!isIPv6 || ipV6End < portIndex)) {
            hostName = host.substring(0, portIndex);
            port = host.substring(portIndex + 1);
        }
        if (isIPv6) {
            try {
                const ipV6URL = new URL(`http://${hostName}`);
                hostName = ipV6URL.hostname;
            }
            catch (err) {
            }
        }
        const hostParts = hostName.split('.').reverse();
        const path = slashIndex < 0 ? '' : pattern.substring(slashIndex + 1);
        const pathParts = path.split('/');
        if (!pathParts[pathParts.length - 1]) {
            pathParts.splice(pathParts.length - 1, 1);
        }
        return {
            hostParts,
            pathParts,
            port,
            exactStart,
            exactEnd,
            protocol,
        };
    }, URL_MATCH_CACHE_SIZE);
    function matchURLPattern(url, pattern) {
        const u = prepareURL(url);
        const p = preparePattern(pattern);
        if (!(u && p)
            || (p.hostParts.length > u.hostParts.length)
            || (p.exactStart && p.hostParts.length !== u.hostParts.length)
            || (p.exactEnd && p.pathParts.length !== u.pathParts.length)
            || (p.port !== '*' && p.port !== u.port)
            || (p.protocol && p.protocol !== u.protocol)) {
            return false;
        }
        for (let i = 0; i < p.hostParts.length; i++) {
            const pHostPart = p.hostParts[i];
            const uHostPart = u.hostParts[i];
            if (pHostPart !== '*' && pHostPart !== uHostPart) {
                return false;
            }
        }
        if (p.hostParts.length >= 2
            && p.hostParts.at(-1) !== '*'
            && (p.hostParts.length < u.hostParts.length - 1
                || (p.hostParts.length === u.hostParts.length - 1
                    && u.hostParts.at(-1) !== 'www'))) {
            return false;
        }
        if (p.pathParts.length === 0) {
            return true;
        }
        if (p.pathParts.length > u.pathParts.length) {
            return false;
        }
        for (let i = 0; i < p.pathParts.length; i++) {
            const pPathPart = p.pathParts[i];
            const uPathPart = u.pathParts[i];
            if (pPathPart !== '*' && pPathPart !== uPathPart) {
                return false;
            }
        }
        return true;
    }
    function isRegExp(pattern) {
        return pattern.startsWith('/') && pattern.endsWith('/') && pattern.length > 2;
    }
    const REGEXP_CACHE_SIZE = 1024;
    const createRegExp = cachedFactory((pattern) => {
        if (pattern.startsWith('/')) {
            pattern = pattern.substring(1);
        }
        if (pattern.endsWith('/')) {
            pattern = pattern.substring(0, pattern.length - 1);
        }
        try {
            return new RegExp(pattern);
        }
        catch (err) {
            return null;
        }
    }, REGEXP_CACHE_SIZE);
    function isPDF(url) {
        try {
            const { hostname, pathname } = new URL(url);
            if (pathname.includes('.pdf')) {
                if ((hostname.match(/(wikipedia|wikimedia)\.org$/i) && pathname.match(/^\/.*\/[a-z]+\:[^\:\/]+\.pdf/i)) ||
                    (hostname.match(/timetravel\.mementoweb\.org$/i) && pathname.match(/^\/reconstruct/i) && pathname.match(/\.pdf$/i)) ||
                    (hostname.match(/dropbox\.com$/i) && pathname.match(/^\/s\//i) && pathname.match(/\.pdf$/i))) {
                    return false;
                }
                if (pathname.endsWith('.pdf')) {
                    for (let i = pathname.length; i >= 0; i--) {
                        if (pathname[i] === '=') {
                            return false;
                        }
                        else if (pathname[i] === '/') {
                            return true;
                        }
                    }
                }
                else {
                    return false;
                }
            }
        }
        catch (e) {
            // Do nothing
        }
        return false;
    }
    function isURLEnabled(url, userSettings, { isProtected, isInDarkList, isDarkThemeDetected }, isAllowedFileSchemeAccess = true) {
        if (isLocalFile(url) && !isAllowedFileSchemeAccess) {
            return false;
        }
        if (isProtected && !userSettings.enableForProtectedPages) {
            return false;
        }
        if (isPDF(url)) {
            return userSettings.enableForPDF;
        }
        const isURLInDisabledList = isURLInList(url, userSettings.disabledFor);
        const isURLInEnabledList = isURLInList(url, userSettings.enabledFor);
        if (!userSettings.enabledByDefault) {
            return isURLInEnabledList;
        }
        if (isURLInEnabledList) {
            return true;
        }
        if (isInDarkList || (userSettings.detectDarkTheme && isDarkThemeDetected)) {
            return false;
        }
        return !isURLInDisabledList;
    }
    function isFullyQualifiedDomain(candidate) {
        return /^[a-z0-9\.\-]+$/i.test(candidate) && candidate.indexOf('..') === -1;
    }
    function isFullyQualifiedDomainWildcard(candidate) {
        if (!candidate.includes('*') || !/^[a-z0-9\.\-\*]+$/i.test(candidate)) {
            return false;
        }
        const labels = candidate.split('.');
        for (const label of labels) {
            if (label !== '*' && !/^[a-z0-9\-]+$/i.test(label)) {
                return false;
            }
        }
        return true;
    }
    function fullyQualifiedDomainMatchesWildcard(wildcard, candidate) {
        const wildcardLabels = wildcard.toLowerCase().split('.');
        const candidateLabels = candidate.toLowerCase().split('.');
        if (candidateLabels.length < wildcardLabels.length) {
            return false;
        }
        while (wildcardLabels.length) {
            const wildcardLabel = wildcardLabels.pop();
            const candidateLabel = candidateLabels.pop();
            if (wildcardLabel !== '*' && wildcardLabel !== candidateLabel) {
                return false;
            }
        }
        return true;
    }
    function isLocalFile(url) {
        return Boolean(url) && url.startsWith('file:///');
    }

    function canInjectScript(url) {
        if (url === 'about:blank') {
            return false;
        }
        if (isEdge) {
            return Boolean(url
                && !url.startsWith('chrome')
                && !url.startsWith('data')
                && !url.startsWith('devtools')
                && !url.startsWith('edge')
                && !url.startsWith('https://chrome.google.com/webstore')
                && !url.startsWith('https://chromewebstore.google.com/')
                && !url.startsWith('https://microsoftedge.microsoft.com/addons')
                && !url.startsWith('view-source'));
        }
        return Boolean(url
            && !url.startsWith('chrome')
            && !url.startsWith('https://chrome.google.com/webstore')
            && !url.startsWith('https://chromewebstore.google.com/')
            && !url.startsWith('data')
            && !url.startsWith('devtools')
            && !url.startsWith('view-source'));
    }
    async function readSyncStorage(defaults) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (sync) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    resolve(null);
                    return;
                }
                for (const key in sync) {
                    // Just to be sure: https://github.com/darkreader/darkreader/issues/7270
                    // The value of sync[key] shouldn't be null.
                    if (!sync[key]) {
                        continue;
                    }
                    const metaKeysCount = sync[key].__meta_split_count;
                    if (!metaKeysCount) {
                        continue;
                    }
                    let string = '';
                    for (let i = 0; i < metaKeysCount; i++) {
                        string += sync[`${key}_${i.toString(36)}`];
                        delete sync[`${key}_${i.toString(36)}`];
                    }
                    try {
                        sync[key] = JSON.parse(string);
                    }
                    catch (error) {
                        console.error(`sync[${key}]: Could not parse record from sync storage: ${string}`);
                        resolve(null);
                        return;
                    }
                }
                sync = {
                    ...defaults,
                    ...sync,
                };
                resolve(sync);
            });
        });
    }
    async function readLocalStorage(defaults) {
        return new Promise((resolve) => {
            chrome.storage.local.get(defaults, (local) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    resolve(defaults);
                    return;
                }
                resolve(local);
            });
        });
    }
    function prepareSyncStorage(values) {
        for (const key in values) {
            const value = values[key];
            const string = JSON.stringify(value);
            // The maximum size of any one item that each extension is allowed to store in the sync storage area,
            // as measured by the JSON stringification of the item's value plus the length of its key.
            // Source: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync
            const totalLength = string.length + key.length;
            if (totalLength > chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
                // This length limit permits us to store up to 1000 = (parseInt('rr', 36) + 1) records.
                const maxLength = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - key.length - 1 - 2;
                const minimalKeysNeeded = Math.ceil(string.length / maxLength);
                for (let i = 0; i < minimalKeysNeeded; i++) {
                    values[`${key}_${i.toString(36)}`] = string.substring(i * maxLength, (i + 1) * maxLength);
                }
                values[key] = {
                    __meta_split_count: minimalKeysNeeded,
                };
            }
        }
        return values;
    }
    async function writeSyncStorage(values) {
        return new Promise((resolve, reject) => {
            const packaged = prepareSyncStorage(values);
            chrome.storage.sync.set(packaged, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve();
            });
        });
    }
    async function writeLocalStorage(values) {
        return new Promise((resolve) => {
            chrome.storage.local.set(values, () => {
                resolve();
            });
        });
    }
    async function removeSyncStorage(keys) {
        return new Promise((resolve) => {
            chrome.storage.sync.remove(keys, () => {
                resolve();
            });
        });
    }
    async function removeLocalStorage(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            });
        });
    }
    async function getCommands() {
        return new Promise((resolve) => {
            if (!chrome.commands) {
                resolve([]);
                return;
            }
            chrome.commands.getAll((commands) => {
                if (commands) {
                    resolve(commands);
                }
                else {
                    resolve([]);
                }
            });
        });
    }
    function keepListeningToEvents() {
        let intervalId = 0;
        const keepHopeAlive = () => {
            intervalId = setInterval(chrome.runtime.getPlatformInfo, getDuration({ seconds: 10 }));
        };
        chrome.runtime.onStartup.addListener(keepHopeAlive);
        keepHopeAlive();
        const stopListening = () => {
            clearInterval(intervalId);
            chrome.runtime.onStartup.removeListener(keepHopeAlive);
        };
        return stopListening;
    }

    const BLOG_URL = 'https://darkreader.org/blog/';
    const NEWS_URL = 'https://darkreader.org/blog/posts.json';
    const CONFIG_URL_BASE = 'https://raw.githubusercontent.com/darkreader/darkreader/main/src/config';
    function getBlogPostURL(postId) {
        return `${BLOG_URL}${postId}/`;
    }

    const isSystemDarkModeEnabled = () => (matchMedia('(prefers-color-scheme: dark)')).matches;

    var MessageTypeUItoBG;
    (function (MessageTypeUItoBG) {
        MessageTypeUItoBG["GET_DATA"] = "ui-bg-get-data";
        MessageTypeUItoBG["GET_DEVTOOLS_DATA"] = "ui-bg-get-devtools-data";
        MessageTypeUItoBG["SUBSCRIBE_TO_CHANGES"] = "ui-bg-subscribe-to-changes";
        MessageTypeUItoBG["UNSUBSCRIBE_FROM_CHANGES"] = "ui-bg-unsubscribe-from-changes";
        MessageTypeUItoBG["CHANGE_SETTINGS"] = "ui-bg-change-settings";
        MessageTypeUItoBG["SET_THEME"] = "ui-bg-set-theme";
        MessageTypeUItoBG["TOGGLE_ACTIVE_TAB"] = "ui-bg-toggle-active-tab";
        MessageTypeUItoBG["MARK_NEWS_AS_READ"] = "ui-bg-mark-news-as-read";
        MessageTypeUItoBG["MARK_NEWS_AS_DISPLAYED"] = "ui-bg-mark-news-as-displayed";
        MessageTypeUItoBG["LOAD_CONFIG"] = "ui-bg-load-config";
        MessageTypeUItoBG["APPLY_DEV_DYNAMIC_THEME_FIXES"] = "ui-bg-apply-dev-dynamic-theme-fixes";
        MessageTypeUItoBG["RESET_DEV_DYNAMIC_THEME_FIXES"] = "ui-bg-reset-dev-dynamic-theme-fixes";
        MessageTypeUItoBG["APPLY_DEV_INVERSION_FIXES"] = "ui-bg-apply-dev-inversion-fixes";
        MessageTypeUItoBG["RESET_DEV_INVERSION_FIXES"] = "ui-bg-reset-dev-inversion-fixes";
        MessageTypeUItoBG["APPLY_DEV_STATIC_THEMES"] = "ui-bg-apply-dev-static-themes";
        MessageTypeUItoBG["RESET_DEV_STATIC_THEMES"] = "ui-bg-reset-dev-static-themes";
        MessageTypeUItoBG["START_ACTIVATION"] = "ui-bg-start-activation";
        MessageTypeUItoBG["RESET_ACTIVATION"] = "ui-bg-reset-activation";
        MessageTypeUItoBG["COLOR_SCHEME_CHANGE"] = "ui-bg-color-scheme-change";
        MessageTypeUItoBG["HIDE_HIGHLIGHTS"] = "ui-bg-hide-highlights";
    })(MessageTypeUItoBG || (MessageTypeUItoBG = {}));
    var MessageTypeBGtoUI;
    (function (MessageTypeBGtoUI) {
        MessageTypeBGtoUI["CHANGES"] = "bg-ui-changes";
    })(MessageTypeBGtoUI || (MessageTypeBGtoUI = {}));
    var DebugMessageTypeBGtoUI;
    (function (DebugMessageTypeBGtoUI) {
        DebugMessageTypeBGtoUI["CSS_UPDATE"] = "debug-bg-ui-css-update";
        DebugMessageTypeBGtoUI["UPDATE"] = "debug-bg-ui-update";
    })(DebugMessageTypeBGtoUI || (DebugMessageTypeBGtoUI = {}));
    var MessageTypeBGtoCS;
    (function (MessageTypeBGtoCS) {
        MessageTypeBGtoCS["ADD_CSS_FILTER"] = "bg-cs-add-css-filter";
        MessageTypeBGtoCS["ADD_DYNAMIC_THEME"] = "bg-cs-add-dynamic-theme";
        MessageTypeBGtoCS["ADD_STATIC_THEME"] = "bg-cs-add-static-theme";
        MessageTypeBGtoCS["ADD_SVG_FILTER"] = "bg-cs-add-svg-filter";
        MessageTypeBGtoCS["CLEAN_UP"] = "bg-cs-clean-up";
        MessageTypeBGtoCS["FETCH_RESPONSE"] = "bg-cs-fetch-response";
        MessageTypeBGtoCS["UNSUPPORTED_SENDER"] = "bg-cs-unsupported-sender";
    })(MessageTypeBGtoCS || (MessageTypeBGtoCS = {}));
    var DebugMessageTypeBGtoCS;
    (function (DebugMessageTypeBGtoCS) {
        DebugMessageTypeBGtoCS["RELOAD"] = "debug-bg-cs-reload";
    })(DebugMessageTypeBGtoCS || (DebugMessageTypeBGtoCS = {}));
    var MessageTypeCStoBG;
    (function (MessageTypeCStoBG) {
        MessageTypeCStoBG["COLOR_SCHEME_CHANGE"] = "cs-bg-color-scheme-change";
        MessageTypeCStoBG["DARK_THEME_DETECTED"] = "cs-bg-dark-theme-detected";
        MessageTypeCStoBG["DARK_THEME_NOT_DETECTED"] = "cs-bg-dark-theme-not-detected";
        MessageTypeCStoBG["FETCH"] = "cs-bg-fetch";
        MessageTypeCStoBG["DOCUMENT_CONNECT"] = "cs-bg-document-connect";
        MessageTypeCStoBG["DOCUMENT_FORGET"] = "cs-bg-document-forget";
        MessageTypeCStoBG["DOCUMENT_FREEZE"] = "cs-bg-document-freeze";
        MessageTypeCStoBG["DOCUMENT_RESUME"] = "cs-bg-document-resume";
    })(MessageTypeCStoBG || (MessageTypeCStoBG = {}));
    var DebugMessageTypeCStoBG;
    (function (DebugMessageTypeCStoBG) {
        DebugMessageTypeCStoBG["LOG"] = "debug-cs-bg-log";
    })(DebugMessageTypeCStoBG || (DebugMessageTypeCStoBG = {}));
    var MessageTypeCStoUI;
    (function (MessageTypeCStoUI) {
        MessageTypeCStoUI["EXPORT_CSS_RESPONSE"] = "cs-ui-export-css-response";
    })(MessageTypeCStoUI || (MessageTypeCStoUI = {}));
    var MessageTypeUItoCS;
    (function (MessageTypeUItoCS) {
        MessageTypeUItoCS["EXPORT_CSS"] = "ui-cs-export-css";
    })(MessageTypeUItoCS || (MessageTypeUItoCS = {}));

    function parseArray(text) {
        return text.replace(/\r/g, '')
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s);
    }
    function formatArray(arr) {
        return arr.concat('').join('\n');
    }
    function getStringSize(value) {
        return value.length * 2;
    }
    function getParenthesesRange(input, searchStartIndex = 0) {
        return getOpenCloseRange(input, searchStartIndex, '(', ')', []);
    }
    function getOpenCloseRange(input, searchStartIndex, openToken, closeToken, excludeRanges) {
        let indexOf;
        if (excludeRanges.length === 0) {
            indexOf = (token, pos) => input.indexOf(token, pos);
        }
        else {
            indexOf = (token, pos) => indexOfExcluding(input, token, pos, excludeRanges);
        }
        const { length } = input;
        let depth = 0;
        let firstOpenIndex = -1;
        for (let i = searchStartIndex; i < length; i++) {
            if (depth === 0) {
                const openIndex = indexOf(openToken, i);
                if (openIndex < 0) {
                    break;
                }
                firstOpenIndex = openIndex;
                depth++;
                i = openIndex;
            }
            else {
                const closeIndex = indexOf(closeToken, i);
                if (closeIndex < 0) {
                    break;
                }
                const openIndex = indexOf(openToken, i);
                if (openIndex < 0 || closeIndex <= openIndex) {
                    depth--;
                    if (depth === 0) {
                        return { start: firstOpenIndex, end: closeIndex + 1 };
                    }
                    i = closeIndex;
                }
                else {
                    depth++;
                    i = openIndex;
                }
            }
        }
        return null;
    }
    function indexOfExcluding(input, search, position, excludeRanges) {
        const i = input.indexOf(search, position);
        const exclusion = excludeRanges.find((r) => i >= r.start && i < r.end);
        if (exclusion) {
            return indexOfExcluding(input, search, exclusion.end, excludeRanges);
        }
        return i;
    }
    function splitExcluding(input, separator, excludeRanges) {
        const parts = [];
        let commaIndex = -1;
        let currIndex = 0;
        while ((commaIndex = indexOfExcluding(input, separator, currIndex, excludeRanges)) >= 0) {
            parts.push(input.substring(currIndex, commaIndex).trim());
            currIndex = commaIndex + 1;
        }
        parts.push(input.substring(currIndex).trim());
        return parts;
    }

    // Exclude font libraries to preserve icons
    const excludedSelectors = [
        'pre', 'pre *', 'code',
        '[aria-hidden="true"]',
        // Font Awesome
        '[class*="fa-"]',
        '.fa', '.fab', '.fad', '.fal', '.far', '.fas', '.fass', '.fasr', '.fat',
        // Generic matches for icon/symbol fonts
        '.icofont', '[style*="font-"]',
        '[class*="icon"]', '[class*="Icon"]',
        '[class*="symbol"]', '[class*="Symbol"]',
        // Glyph Icons
        '.glyphicon',
        // Material Design
        '[class*="material-symbol"]', '[class*="material-icon"]',
        // MUI
        'mu', '[class*="mu-"]',
        // Typicons
        '.typcn',
        // Videojs font
        '[class*="vjs-"]',
    ];
    function createTextStyle(config) {
        const lines = [];
        lines.push(`*:not(${excludedSelectors.join(', ')}) {`);
        if (config.useFont && config.fontFamily) {
            lines.push(`  font-family: ${config.fontFamily} !important;`);
        }
        if (config.textStroke > 0) {
            lines.push(`  -webkit-text-stroke: ${config.textStroke}px !important;`);
            lines.push(`  text-stroke: ${config.textStroke}px !important;`);
        }
        lines.push('}');
        return lines.join('\n');
    }

    function isArrayLike(items) {
        return items.length != null;
    }
    // NOTE: Iterating Array-like items using `for .. of` is 3x slower in Firefox
    // https://jsben.ch/kidOp
    function forEach(items, iterator) {
        if (isArrayLike(items)) {
            for (let i = 0, len = items.length; i < len; i++) {
                iterator(items[i]);
            }
        }
        else {
            for (const item of items) {
                iterator(item);
            }
        }
    }
    // NOTE: Pushing items like `arr.push(...items)` is 3x slower in Firefox
    // https://jsben.ch/nr9OF
    function push(array, addition) {
        forEach(addition, (a) => array.push(a));
    }

    function formatSitesFixesConfig(fixes, options) {
        const lines = [];
        fixes.forEach((fix, i) => {
            push(lines, fix.url);
            options.props.forEach((prop) => {
                const command = options.getPropCommandName(prop);
                const value = fix[prop];
                if (options.shouldIgnoreProp(prop, value)) {
                    return;
                }
                lines.push('');
                lines.push(command);
                const formattedValue = options.formatPropValue(prop, value);
                if (formattedValue) {
                    lines.push(formattedValue);
                }
            });
            if (i < fixes.length - 1) {
                lines.push('');
                lines.push('='.repeat(32));
                lines.push('');
            }
        });
        lines.push('');
        return lines.join('\n');
    }

    function scale(x, inLow, inHigh, outLow, outHigh) {
        return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
    }
    function clamp(x, min, max) {
        return Math.min(max, Math.max(min, x));
    }
    // Note: the caller is responsible for ensuring that matrix dimensions make sense
    function multiplyMatrices(m1, m2) {
        const result = [];
        for (let i = 0, len = m1.length; i < len; i++) {
            result[i] = [];
            for (let j = 0, len2 = m2[0].length; j < len2; j++) {
                let sum = 0;
                for (let k = 0, len3 = m1[0].length; k < len3; k++) {
                    sum += m1[i][k] * m2[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    function createFilterMatrix(config) {
        let m = Matrix.identity();
        if (config.sepia !== 0) {
            m = multiplyMatrices(m, Matrix.sepia(config.sepia / 100));
        }
        if (config.grayscale !== 0) {
            m = multiplyMatrices(m, Matrix.grayscale(config.grayscale / 100));
        }
        if (config.contrast !== 100) {
            m = multiplyMatrices(m, Matrix.contrast(config.contrast / 100));
        }
        if (config.brightness !== 100) {
            m = multiplyMatrices(m, Matrix.brightness(config.brightness / 100));
        }
        if (config.mode === 1) {
            m = multiplyMatrices(m, Matrix.invertNHue());
        }
        return m;
    }
    function applyColorMatrix([r, g, b], matrix) {
        const rgb = [[r / 255], [g / 255], [b / 255], [1], [1]];
        const result = multiplyMatrices(matrix, rgb);
        return [0, 1, 2].map((i) => clamp(Math.round(result[i][0] * 255), 0, 255));
    }
    const Matrix = {
        identity() {
            return [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
        invertNHue() {
            return [
                [0.333, -0.667, -0.667, 0, 1],
                [-0.667, 0.333, -0.667, 0, 1],
                [-0.667, -0.667, 0.333, 0, 1],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
        brightness(v) {
            return [
                [v, 0, 0, 0, 0],
                [0, v, 0, 0, 0],
                [0, 0, v, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
        contrast(v) {
            const t = (1 - v) / 2;
            return [
                [v, 0, 0, 0, t],
                [0, v, 0, 0, t],
                [0, 0, v, 0, t],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
        sepia(v) {
            return [
                [(0.393 + 0.607 * (1 - v)), (0.769 - 0.769 * (1 - v)), (0.189 - 0.189 * (1 - v)), 0, 0],
                [(0.349 - 0.349 * (1 - v)), (0.686 + 0.314 * (1 - v)), (0.168 - 0.168 * (1 - v)), 0, 0],
                [(0.272 - 0.272 * (1 - v)), (0.534 - 0.534 * (1 - v)), (0.131 + 0.869 * (1 - v)), 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
        grayscale(v) {
            return [
                [(0.2126 + 0.7874 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
                [(0.2126 - 0.2126 * (1 - v)), (0.7152 + 0.2848 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
                [(0.2126 - 0.2126 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 + 0.9278 * (1 - v)), 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
            ];
        },
    };

    const INDEX_CACHE_CLEANUP_INTERVAL_IN_MS = 60000;
    function parseSitesFixesConfig(text, options) {
        const sites = [];
        const blocks = text.replace(/\r/g, '').split(/^\s*={2,}\s*$/gm);
        blocks.forEach((block) => {
            const lines = block.split('\n');
            const commandIndices = [];
            lines.forEach((ln, i) => {
                if (ln.match(/^[A-Z]+(\s[A-Z]+){0,2}$/)) {
                    commandIndices.push(i);
                }
            });
            if (commandIndices.length === 0) {
                return;
            }
            const siteFix = {
                url: parseArray(lines.slice(0, commandIndices[0]).join('\n')),
            };
            commandIndices.forEach((commandIndex, i) => {
                const command = lines[commandIndex].trim();
                const valueText = lines.slice(commandIndex + 1, i === commandIndices.length - 1 ? lines.length : commandIndices[i + 1]).join('\n');
                const prop = options.getCommandPropName(command);
                if (!prop) {
                    return;
                }
                const value = options.parseCommandValue(command, valueText);
                siteFix[prop] = value;
            });
            sites.push(siteFix);
        });
        return sites;
    }
    // URL patterns are guaranteed to not have protocol and leading '/'
    function getDomain(url) {
        try {
            return (new URL(url)).hostname.toLowerCase();
        }
        catch (error) {
            return url.split('/')[0].toLowerCase();
        }
    }
    /*
     * Encode all offsets into a string, where each record is 7 bytes long:
     *  - 4 bytes for start offset
     *  - 3 bytes for record length (end offset - start offset)
     * Both values are stored in base 36 (radix 36) notation.
     * Maximum supported numbers:
     *  - start offset must be no more than parseInt('zzzz', 36) = 1679615
     *  - length must be no more than parseInt('zzz', 36) = 46655
     *
     * We have to encode offsets into a string to be able to save them in
     * chrome.storage.local for use in non-persistent background contexts.
     */
    function encodeOffsets(offsets) {
        return offsets.map(([offset, length]) => {
            const stringOffset = offset.toString(36);
            const stringLength = length.toString(36);
            return '0'.repeat(4 - stringOffset.length) + stringOffset + '0'.repeat(3 - stringLength.length) + stringLength;
        }).join('');
    }
    function decodeOffset(offsets, index) {
        const base = (4 + 3) * index;
        const offset = parseInt(offsets.substring(base + 0, base + 4), 36);
        const length = parseInt(offsets.substring(base + 4, base + 4 + 3), 36);
        return [
            offset,
            offset + length,
        ];
    }
    function addLabel(set, label, index) {
        if (!set[label]) {
            set[label] = [index];
        }
        else if (!(set[label].includes(index))) {
            set[label].push(index);
        }
    }
    function extractDomainLabelsFromFullyQualifiedDomainWildcard(fullyQualifiedDomainWildcard) {
        const postfixStart = fullyQualifiedDomainWildcard.lastIndexOf('*');
        const postfix = fullyQualifiedDomainWildcard.substring(postfixStart + 2);
        if (postfixStart < 0 || postfix.length === 0) {
            return fullyQualifiedDomainWildcard.split('.');
        }
        const labels = [postfix];
        const prefix = fullyQualifiedDomainWildcard.substring(0, postfixStart);
        prefix.split('.').filter(Boolean).forEach((l) => labels.concat(l));
        return labels;
    }
    function indexConfigURLs(urls) {
        const domains = {};
        const domainLabels = {};
        const nonstandard = [];
        const domainLabelFrequencies = {};
        const domainLabelMembers = [];
        for (let index = 0; index < urls.length; index++) {
            const block = urls[index];
            const blockDomainLabels = new Set();
            for (const url of block) {
                const domain = getDomain(url);
                if (isFullyQualifiedDomain(domain)) {
                    addLabel(domains, domain, index);
                }
                else if (isFullyQualifiedDomainWildcard(domain)) {
                    const labels = extractDomainLabelsFromFullyQualifiedDomainWildcard(domain);
                    domainLabelMembers.push({ labels, index });
                    labels.forEach((l) => blockDomainLabels.add(l));
                }
                else {
                    // Sitefix parser encountered non-standard URL
                    nonstandard.push(index);
                    break;
                }
            }
            // Compute domain label frequencies, counting each label within each fix only once
            for (const label of blockDomainLabels) {
                if (domainLabelFrequencies[label]) {
                    domainLabelFrequencies[label]++;
                }
                else {
                    domainLabelFrequencies[label] = 1;
                }
            }
        }
        // For each domain name, find the most specific label
        for (const { labels, index } of domainLabelMembers) {
            let label = labels[0];
            for (const currLabel of labels) {
                if (domainLabelFrequencies[currLabel] < domainLabelFrequencies[label]) {
                    label = currLabel;
                }
            }
            addLabel(domainLabels, label, index);
        }
        return { domains, domainLabels, nonstandard };
    }
    function processSiteFixesConfigBlock(text, offsets, recordStart, recordEnd, urls) {
        // TODO: more formal definition of URLs and delimiters
        const block = text.substring(recordStart, recordEnd);
        const lines = block.split('\n');
        const commandIndices = [];
        lines.forEach((ln, i) => {
            if (ln.match(/^[A-Z]+(\s[A-Z]+){0,2}$/)) {
                commandIndices.push(i);
            }
        });
        if (commandIndices.length === 0) {
            return;
        }
        offsets.push([recordStart, recordEnd - recordStart]);
        const urls_ = parseArray(lines.slice(0, commandIndices[0]).join('\n'));
        urls.push(urls_);
    }
    function extractURLsFromSiteFixesConfig(text) {
        const urls = [];
        // Array of tuples, where first number is an offset of record start and second number is record length.
        const offsets = [];
        let recordStart = 0;
        // Delimiter between two blocks
        const delimiterRegex = /^\s*={2,}\s*$/gm;
        let delimiter;
        while ((delimiter = delimiterRegex.exec(text))) {
            const nextDelimiterStart = delimiter.index;
            const nextDelimiterEnd = delimiter.index + delimiter[0].length;
            processSiteFixesConfigBlock(text, offsets, recordStart, nextDelimiterStart, urls);
            recordStart = nextDelimiterEnd;
        }
        processSiteFixesConfigBlock(text, offsets, recordStart, text.length, urls);
        return { urls, offsets };
    }
    function indexSitesFixesConfig(text) {
        const { urls, offsets } = extractURLsFromSiteFixesConfig(text);
        const { domains, domainLabels, nonstandard } = indexConfigURLs(urls);
        return { offsets: encodeOffsets(offsets), domains, domainLabels, nonstandard, cacheDomainIndex: {}, cacheSiteFix: {}, cacheCleanupTimer: null };
    }
    function lookupConfigURLsInDomainLabels(domain, recordIds, currRecordIds, getAllRecordURLs) {
        for (const recordId of currRecordIds) {
            const recordURLs = getAllRecordURLs(recordId);
            for (const ruleUrl of recordURLs) {
                const wildcard = getDomain(ruleUrl);
                if (isFullyQualifiedDomainWildcard(wildcard) && fullyQualifiedDomainMatchesWildcard(wildcard, domain)) {
                    recordIds.push(recordId);
                }
            }
        }
    }
    function lookupConfigURLs(domain, index, getAllRecordURLs) {
        const labels = domain.split('.');
        let recordIds = [];
        // Common fix
        if (index.domainLabels.hasOwnProperty('*')) {
            recordIds = recordIds.concat(index.domainLabels['*']);
        }
        // Wildcard fixes
        for (const label of labels) {
            // We need to use in operator because ids are 0-based and 0 is falsy
            if (index.domainLabels.hasOwnProperty(label)) {
                const currRecordIds = index.domainLabels[label];
                lookupConfigURLsInDomainLabels(domain, recordIds, currRecordIds, getAllRecordURLs);
            }
        }
        for (let i = 0; i < labels.length; i++) {
            const substring = labels.slice(i).join('.');
            if (index.domains.hasOwnProperty(substring)) {
                recordIds = recordIds.concat(index.domains[substring]);
            }
            if (index.domainLabels.hasOwnProperty(substring)) {
                const currRecordIds = index.domainLabels[substring];
                lookupConfigURLsInDomainLabels(domain, recordIds, currRecordIds, getAllRecordURLs);
            }
        }
        // Backwards compatibility: check for nonssend over nonstandard patterns, which will be filtered out
        // via regex in content script
        if (index.nonstandard) {
            for (const currRecordId of index.nonstandard) {
                const urls = getAllRecordURLs(currRecordId);
                if (urls.some((url) => isURLMatched(domain, getDomain(url)))) {
                    recordIds.push(currRecordId);
                    continue;
                }
            }
        }
        // Deduplicate array elements
        recordIds = Array.from(new Set(recordIds));
        return recordIds;
    }
    /**
     * Extracts a single site fix and parses it (cached)
     * @param text the fix file
     * @param index site fix index
     * @param options fix parsing options
     * @param id numeric index of the fix
     * @returns a single fix
     */
    function getSiteFix(text, index, options, id) {
        if (index.cacheSiteFix.hasOwnProperty(id)) {
            return index.cacheSiteFix[id];
        }
        const [blockStart, blockEnd] = decodeOffset(index.offsets, id);
        const block = text.substring(blockStart, blockEnd);
        const fix = parseSitesFixesConfig(block, options)[0];
        index.cacheSiteFix[id] = fix;
        return fix;
    }
    /**
     * This function uses setTimeout instead of Alarms API so that background context can
     * go incative (resulting in cleanup of all context variables) and then not be awoken
     * by the alarm.
     * @param index
     */
    function scheduleCacheCleanup(index) {
        clearTimeout(index.cacheCleanupTimer);
        index.cacheCleanupTimer = setTimeout(() => {
            index.cacheCleanupTimer = null;
            index.cacheDomainIndex = {};
            index.cacheSiteFix = {};
        }, INDEX_CACHE_CLEANUP_INTERVAL_IN_MS);
    }
    /**
     * Given a URL, raw fixes, and an index, finds the applicable fixes.
     * Note that dependents assume that the first returned fix is a generic fix (has URL pattern '*').
     *
     * This method uses two levels of caching:
     *  - caching the site fixes keyed by a numeric id (to avoid re-parsing the site fixes)
     *  - caching the numeric ids keyed by domain (to avoid re-computing lists of site fixes for the same site,
     *    which is useful if user has multiple tabs of the same site and toggles Dark Reader on)
     */
    function getSitesFixesFor(url, text, index, options) {
        const records = [];
        const domain = getDomain(url);
        if (!index.cacheDomainIndex[domain]) {
            index.cacheDomainIndex[domain] = lookupConfigURLs(domain, index, (recordId) => getSiteFix(text, index, options, recordId).url);
        }
        const recordIds = index.cacheDomainIndex[domain];
        for (const recordId of recordIds) {
            const fix = getSiteFix(text, index, options, recordId);
            records.push(fix);
        }
        scheduleCacheCleanup(index);
        return records;
    }
    function indexSiteListConfig(text) {
        const urls = parseArray(text);
        const urls2D = urls.map((u) => [u]);
        const { domains, domainLabels, nonstandard } = indexConfigURLs(urls2D);
        return { domains, domainLabels, nonstandard, urls };
    }
    function getSiteListFor(url, index) {
        const domain = getDomain(url);
        const recordIds = lookupConfigURLs(domain, index, (recordId) => [index.urls[recordId]]);
        const result = [];
        for (const recordId of recordIds) {
            result.push(index.urls[recordId]);
        }
        return result;
    }
    function isURLInSiteList(url, index) {
        if (index === null) {
            return false;
        }
        const urls = getSiteListFor(url, index);
        return isURLInList(url, urls);
    }

    var FilterMode;
    (function (FilterMode) {
        FilterMode[FilterMode["light"] = 0] = "light";
        FilterMode[FilterMode["dark"] = 1] = "dark";
    })(FilterMode || (FilterMode = {}));
    function createCSSFilterStyleSheet(config, url, isTopFrame, fixes, index) {
        const filterValue = getCSSFilterValue(config);
        const reverseFilterValue = 'invert(100%) hue-rotate(180deg)';
        return cssFilterStyleSheetTemplate('html', filterValue, reverseFilterValue, config, url, isTopFrame, fixes, index);
    }
    function cssFilterStyleSheetTemplate(filterRoot, filterValue, reverseFilterValue, config, url, isTopFrame, fixes, index) {
        const fix = getInversionFixesFor(url, fixes, index);
        const lines = [];
        lines.push('@media screen {');
        // Add leading rule
        if (filterValue && isTopFrame) {
            lines.push('');
            lines.push('/* Leading rule */');
            lines.push(createLeadingRule(filterRoot, filterValue));
        }
        if (config.mode === FilterMode.dark) {
            // Add reverse rule
            lines.push('');
            lines.push('/* Reverse rule */');
            lines.push(createReverseRule(reverseFilterValue, fix));
        }
        if (config.useFont || config.textStroke > 0) {
            // Add text rule
            lines.push('');
            lines.push('/* Font */');
            lines.push(createTextStyle(config));
        }
        // Fix bad font hinting after inversion
        lines.push('');
        lines.push('/* Text contrast */');
        lines.push('html {');
        lines.push('  text-shadow: 0 0 0 !important;');
        lines.push('}');
        // Full screen fix
        lines.push('');
        lines.push('/* Full screen */');
        [':-webkit-full-screen', ':-moz-full-screen', ':fullscreen'].forEach((fullScreen) => {
            lines.push(`${fullScreen}, ${fullScreen} * {`);
            lines.push('  -webkit-filter: none !important;');
            lines.push('  filter: none !important;');
            lines.push('}');
        });
        if (isTopFrame) {
            const light = [255, 255, 255];
            // If browser affected by Chromium Issue 501582, set dark background on html
            // Or if browser is Firefox v102+
            const bgColor = light;
            lines.push('');
            lines.push('/* Page background */');
            lines.push('html {');
            lines.push(`  background: rgb(${bgColor.join(',')}) !important;`);
            lines.push('}');
        }
        if (fix.css && fix.css.length > 0 && config.mode === FilterMode.dark) {
            lines.push('');
            lines.push('/* Custom rules */');
            lines.push(fix.css);
        }
        lines.push('');
        lines.push('}');
        return lines.join('\n');
    }
    function getCSSFilterValue(config) {
        const filters = [];
        if (config.mode === FilterMode.dark) {
            filters.push('invert(100%) hue-rotate(180deg)');
        }
        if (config.brightness !== 100) {
            filters.push(`brightness(${config.brightness}%)`);
        }
        if (config.contrast !== 100) {
            filters.push(`contrast(${config.contrast}%)`);
        }
        if (config.grayscale !== 0) {
            filters.push(`grayscale(${config.grayscale}%)`);
        }
        if (config.sepia !== 0) {
            filters.push(`sepia(${config.sepia}%)`);
        }
        if (filters.length === 0) {
            return null;
        }
        return filters.join(' ');
    }
    function createLeadingRule(filterRoot, filterValue) {
        return [
            `${filterRoot} {`,
            `  -webkit-filter: ${filterValue} !important;`,
            `  filter: ${filterValue} !important;`,
            '}',
        ].join('\n');
    }
    function joinSelectors(selectors) {
        return selectors.map((s) => s.replace(/\,$/, '')).join(',\n');
    }
    function createReverseRule(reverseFilterValue, fix) {
        const lines = [];
        if (fix.invert.length > 0) {
            lines.push(`${joinSelectors(fix.invert)} {`);
            lines.push(`  -webkit-filter: ${reverseFilterValue} !important;`);
            lines.push(`  filter: ${reverseFilterValue} !important;`);
            lines.push('}');
        }
        if (fix.noinvert.length > 0) {
            lines.push(`${joinSelectors(fix.noinvert)} {`);
            lines.push('  -webkit-filter: none !important;');
            lines.push('  filter: none !important;');
            lines.push('}');
        }
        if (fix.removebg.length > 0) {
            lines.push(`${joinSelectors(fix.removebg)} {`);
            lines.push('  background: white !important;');
            lines.push('}');
        }
        return lines.join('\n');
    }
    /**
    * Returns fixes for a given URL.
    * If no matches found, common fixes will be returned.
    * @param url Site URL.
    * @param inversionFixes List of inversion fixes.
    */
    function getInversionFixesFor(url, fixes, index) {
        const inversionFixes = getSitesFixesFor(url, fixes, index, {
            commands: Object.keys(inversionFixesCommands),
            getCommandPropName: (command) => inversionFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'CSS') {
                    return value.trim();
                }
                return parseArray(value);
            },
        });
        const common = {
            url: inversionFixes[0].url,
            invert: inversionFixes[0].invert || [],
            noinvert: inversionFixes[0].noinvert || [],
            removebg: inversionFixes[0].removebg || [],
            css: inversionFixes[0].css || '',
        };
        if (url) {
            // Search for match with given URL
            const matches = inversionFixes
                .slice(1)
                .filter((s) => isURLInList(url, s.url))
                .sort((a, b) => b.url[0].length - a.url[0].length);
            if (matches.length > 0) {
                const found = matches[0];
                return {
                    url: found.url,
                    invert: common.invert.concat(found.invert || []),
                    noinvert: common.noinvert.concat(found.noinvert || []),
                    removebg: common.removebg.concat(found.removebg || []),
                    css: [common.css, found.css].filter((s) => s).join('\n'),
                };
            }
        }
        return common;
    }
    const inversionFixesCommands = {
        'INVERT': 'invert',
        'NO INVERT': 'noinvert',
        'REMOVE BG': 'removebg',
        'CSS': 'css',
    };
    function parseInversionFixes(text) {
        return parseSitesFixesConfig(text, {
            commands: Object.keys(inversionFixesCommands),
            getCommandPropName: (command) => inversionFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'CSS') {
                    return value.trim();
                }
                return parseArray(value);
            },
        });
    }
    function formatInversionFixes(inversionFixes) {
        const fixes = inversionFixes.slice().sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(fixes, {
            props: Object.values(inversionFixesCommands),
            getPropCommandName: (prop) => Object.entries(inversionFixesCommands).find(([, p]) => p === prop)[0],
            formatPropValue: (prop, value) => {
                if (prop === 'css') {
                    return value.trim().replace(/\n+/g, '\n');
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === 'css') {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            },
        });
    }

    const detectorHintsCommands = {
        'TARGET': 'target',
        'MATCH': 'match',
        'NO DARK THEME': 'noDarkTheme',
        'SYSTEM THEME': 'systemTheme',
        'IFRAME': 'iframe',
    };
    const detectorParserOptions = {
        commands: Object.keys(detectorHintsCommands),
        getCommandPropName: (command) => detectorHintsCommands[command],
        parseCommandValue: (command, value) => {
            if (command === 'TARGET') {
                return value.trim();
            }
            if (command === 'NO DARK THEME' || command === 'SYSTEM THEME') {
                return true;
            }
            return parseArray(value);
        },
    };
    function getDetectorHintsFor(url, text, index) {
        const fixes = getSitesFixesFor(url, text, index, detectorParserOptions);
        if (fixes.length === 0) {
            return null;
        }
        return fixes;
    }

    const cssCommentsRegex = /\/\*[\s\S]*?\*\//g;
    function removeCSSComments(cssText) {
        return cssText.replace(cssCommentsRegex, '');
    }

    function parseCSS(cssText) {
        cssText = removeCSSComments(cssText);
        cssText = cssText.trim();
        if (!cssText) {
            return [];
        }
        const rules = [];
        // Find {...} ranges excluding inside of "...", [...] etc.
        const excludeRanges = getTokenExclusionRanges(cssText);
        const bracketRanges = getAllOpenCloseRanges(cssText, '{', '}', excludeRanges);
        let ruleStart = 0;
        bracketRanges.forEach((brackets) => {
            const key = cssText.substring(ruleStart, brackets.start).trim();
            const content = cssText.substring(brackets.start + 1, brackets.end - 1);
            if (key.startsWith('@')) {
                const typeEndIndex = key.search(/[\s\(]/);
                const rule = {
                    type: typeEndIndex < 0 ? key : key.substring(0, typeEndIndex),
                    query: typeEndIndex < 0 ? '' : key.substring(typeEndIndex).trim(),
                    rules: parseCSS(content),
                };
                rules.push(rule);
            }
            else {
                const rule = {
                    selectors: parseSelectors(key),
                    declarations: parseDeclarations(content),
                };
                rules.push(rule);
            }
            ruleStart = brackets.end;
        });
        return rules;
    }
    function getAllOpenCloseRanges(input, openToken, closeToken, excludeRanges = []) {
        const ranges = [];
        let i = 0;
        let range;
        while ((range = getOpenCloseRange(input, i, openToken, closeToken, excludeRanges))) {
            ranges.push(range);
            i = range.end;
        }
        return ranges;
    }
    function getTokenExclusionRanges(cssText) {
        const singleQuoteGoesFirst = cssText.indexOf("'") < cssText.indexOf('"');
        const firstQuote = singleQuoteGoesFirst ? "'" : '"';
        const secondQuote = singleQuoteGoesFirst ? '"' : "'";
        const excludeRanges = getAllOpenCloseRanges(cssText, firstQuote, firstQuote);
        excludeRanges.push(...getAllOpenCloseRanges(cssText, secondQuote, secondQuote, excludeRanges));
        excludeRanges.push(...getAllOpenCloseRanges(cssText, '[', ']', excludeRanges));
        excludeRanges.push(...getAllOpenCloseRanges(cssText, '(', ')', excludeRanges));
        return excludeRanges;
    }
    function parseSelectors(selectorText) {
        const excludeRanges = getTokenExclusionRanges(selectorText);
        return splitExcluding(selectorText, ',', excludeRanges);
    }
    function parseDeclarations(cssDeclarationsText) {
        const declarations = [];
        const excludeRanges = getTokenExclusionRanges(cssDeclarationsText);
        splitExcluding(cssDeclarationsText, ';', excludeRanges).forEach((part) => {
            const colonIndex = part.indexOf(':');
            if (colonIndex > 0) {
                const importantIndex = part.indexOf('!important');
                declarations.push({
                    property: part.substring(0, colonIndex).trim(),
                    value: part.substring(colonIndex + 1, importantIndex > 0 ? importantIndex : part.length).trim(),
                    important: importantIndex > 0,
                });
            }
        });
        return declarations;
    }
    function isParsedStyleRule(rule) {
        return 'selectors' in rule;
    }

    function formatCSS(cssText) {
        const parsed = parseCSS(cssText);
        return formatParsedCSS(parsed);
    }
    function formatParsedCSS(parsed) {
        const lines = [];
        const tab = '    ';
        function formatRule(rule, indent) {
            if (isParsedStyleRule(rule)) {
                formatStyleRule(rule, indent);
            }
            else {
                formatAtRule(rule, indent);
            }
        }
        function formatAtRule({ type, query, rules }, indent) {
            lines.push(`${indent}${type} ${query} {`);
            rules.forEach((child) => formatRule(child, `${indent}${tab}`));
            lines.push(`${indent}}`);
        }
        function formatStyleRule({ selectors, declarations }, indent) {
            const lastSelectorIndex = selectors.length - 1;
            selectors.forEach((selector, i) => {
                lines.push(`${indent}${selector}${i < lastSelectorIndex ? ',' : ' {'}`);
            });
            const sorted = sortDeclarations(declarations);
            sorted.forEach(({ property, value, important }) => {
                lines.push(`${indent}${tab}${property}: ${value}${important ? ' !important' : ''};`);
            });
            lines.push(`${indent}}`);
        }
        clearEmptyRules(parsed);
        parsed.forEach((rule) => formatRule(rule, ''));
        return lines.join('\n');
    }
    function sortDeclarations(declarations) {
        const prefixRegex = /^-[a-z]-/;
        return [...declarations].sort((a, b) => {
            const aProp = a.property;
            const bProp = b.property;
            const aPrefix = aProp.match(prefixRegex)?.[0] ?? '';
            const bPrefix = bProp.match(prefixRegex)?.[0] ?? '';
            const aNorm = aPrefix ? aProp.replace(prefixRegex, '') : aProp;
            const bNorm = bPrefix ? bProp.replace(prefixRegex, '') : bProp;
            if (aNorm === bNorm) {
                return aPrefix.localeCompare(bPrefix);
            }
            return aNorm.localeCompare(bNorm);
        });
    }
    function clearEmptyRules(rules) {
        for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (isParsedStyleRule(rule)) {
                if (rule.declarations.length === 0) {
                    rules.splice(i, 1);
                }
            }
            else {
                clearEmptyRules(rule.rules);
                if (rule.rules.length === 0) {
                    rules.splice(i, 1);
                }
            }
        }
    }

    const dynamicThemeFixesCommands = {
        'INVERT': 'invert',
        'CSS': 'css',
        'IGNORE INLINE STYLE': 'ignoreInlineStyle',
        'IGNORE IMAGE ANALYSIS': 'ignoreImageAnalysis',
    };
    function parseDynamicThemeFixes(text) {
        return parseSitesFixesConfig(text, {
            commands: Object.keys(dynamicThemeFixesCommands),
            getCommandPropName: (command) => dynamicThemeFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'CSS') {
                    return value.trim();
                }
                return parseArray(value);
            },
        });
    }
    function formatDynamicThemeFixes(dynamicThemeFixes) {
        const fixes = dynamicThemeFixes.slice().sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(fixes, {
            props: Object.values(dynamicThemeFixesCommands),
            getPropCommandName: (prop) => Object.entries(dynamicThemeFixesCommands).find(([, p]) => p === prop)[0],
            formatPropValue: (prop, value) => {
                if (prop === 'css') {
                    return formatCSS(value);
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === 'css') {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            },
        });
    }
    function getDynamicThemeFixesFor(url, isTopFrame, text, index, enabledForPDF) {
        const fixes = getSitesFixesFor(url, text, index, {
            commands: Object.keys(dynamicThemeFixesCommands),
            getCommandPropName: (command) => dynamicThemeFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'CSS') {
                    return value.trim();
                }
                return parseArray(value);
            },
        });
        if (fixes.length === 0 || fixes[0].url[0] !== '*') {
            return null;
        }
        if (enabledForPDF) {
            // Copy part of fixes which will be mutated
            const commonFix = { ...fixes[0] };
            const pdfFixes = [
                commonFix,
                ...fixes.slice(1),
            ];
            const inversionFix = '\nembed[type="application/pdf"][src="about:blank"] { filter: invert(100%) contrast(90%); }' ;
            if (!commonFix.css.endsWith(inversionFix)) {
                commonFix.css += inversionFix;
            }
            if (['drive.google.com', 'mail.google.com'].includes(getDomain(url))) {
                const nestedInversionFix = 'div[role="dialog"] div[role="document"]';
                if (commonFix.invert.at(-1) !== nestedInversionFix) {
                    commonFix.invert.push(nestedInversionFix);
                }
            }
            return pdfFixes;
        }
        return fixes;
    }

    const darkTheme = {
        neutralBg: [16, 20, 23],
        neutralText: [167, 158, 139],
        redBg: [64, 12, 32],
        redText: [247, 142, 102],
        greenBg: [32, 64, 48],
        greenText: [128, 204, 148],
        blueBg: [32, 48, 64],
        blueText: [128, 182, 204],
        fadeBg: [16, 20, 23, 0.5],
        fadeText: [167, 158, 139, 0.5],
    };
    const lightTheme = {
        neutralBg: [255, 242, 228],
        neutralText: [0, 0, 0],
        redBg: [255, 85, 170],
        redText: [140, 14, 48],
        greenBg: [192, 255, 170],
        greenText: [0, 128, 0],
        blueBg: [173, 215, 229],
        blueText: [28, 16, 171],
        fadeBg: [0, 0, 0, 0.5],
        fadeText: [0, 0, 0, 0.5],
    };
    function rgb([r, g, b, a]) {
        if (typeof a === 'number') {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
    }
    function mix(color1, color2, t) {
        return color1.map((c, i) => Math.round(c * (1 - t) + color2[i] * t));
    }
    function createStaticStylesheet(config, url, isTopFrame, staticThemes, staticThemesIndex) {
        const srcTheme = config.mode === 1 ? darkTheme : lightTheme;
        const theme = Object.entries(srcTheme).reduce((t, [prop, color]) => {
            const [r, g, b, a] = color;
            t[prop] = applyColorMatrix([r, g, b], createFilterMatrix({ ...config, mode: 0 }));
            if (a !== undefined) {
                t[prop].push(a);
            }
            return t;
        }, {});
        const commonTheme = getCommonTheme(staticThemes, staticThemesIndex);
        const siteTheme = getThemeFor(url, staticThemes, staticThemesIndex);
        const lines = [];
        if (!siteTheme || !siteTheme.noCommon) {
            lines.push('/* Common theme */');
            lines.push(...ruleGenerators.map((gen) => gen(commonTheme, theme)));
        }
        if (siteTheme) {
            lines.push(`/* Theme for ${siteTheme.url.join(' ')} */`);
            lines.push(...ruleGenerators.map((gen) => gen(siteTheme, theme)));
        }
        if (config.useFont || config.textStroke > 0) {
            lines.push('/* Font */');
            lines.push(createTextStyle(config));
        }
        return lines
            .filter((ln) => ln)
            .join('\n');
    }
    function createRuleGen(getSelectors, generateDeclarations, modifySelector = (s) => s) {
        return (siteTheme, themeColors) => {
            const selectors = getSelectors(siteTheme);
            if (selectors == null || selectors.length === 0) {
                return null;
            }
            const lines = [];
            selectors.forEach((s, i) => {
                let ln = modifySelector(s);
                if (i < selectors.length - 1) {
                    ln += ',';
                }
                else {
                    ln += ' {';
                }
                lines.push(ln);
            });
            const declarations = generateDeclarations(themeColors);
            declarations.forEach((d) => lines.push(`    ${d} !important;`));
            lines.push('}');
            return lines.join('\n');
        };
    }
    const mx = {
        bg: {
            hover: 0.075,
            active: 0.1,
        },
        fg: {
            hover: 0.25,
            active: 0.5,
        },
        border: 0.5,
    };
    const ruleGenerators = [
        createRuleGen((t) => t.neutralBg, (t) => [`background-color: ${rgb(t.neutralBg)}`]),
        createRuleGen((t) => t.neutralBgActive, (t) => [`background-color: ${rgb(t.neutralBg)}`]),
        createRuleGen((t) => t.neutralBgActive, (t) => [`background-color: ${rgb(mix(t.neutralBg, [255, 255, 255], mx.bg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.neutralBgActive, (t) => [`background-color: ${rgb(mix(t.neutralBg, [255, 255, 255], mx.bg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.neutralText, (t) => [`color: ${rgb(t.neutralText)}`]),
        createRuleGen((t) => t.neutralTextActive, (t) => [`color: ${rgb(t.neutralText)}`]),
        createRuleGen((t) => t.neutralTextActive, (t) => [`color: ${rgb(mix(t.neutralText, [255, 255, 255], mx.fg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.neutralTextActive, (t) => [`color: ${rgb(mix(t.neutralText, [255, 255, 255], mx.fg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.neutralBorder, (t) => [`border-color: ${rgb(mix(t.neutralBg, t.neutralText, mx.border))}`]),
        createRuleGen((t) => t.redBg, (t) => [`background-color: ${rgb(t.redBg)}`]),
        createRuleGen((t) => t.redBgActive, (t) => [`background-color: ${rgb(t.redBg)}`]),
        createRuleGen((t) => t.redBgActive, (t) => [`background-color: ${rgb(mix(t.redBg, [255, 0, 64], mx.bg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.redBgActive, (t) => [`background-color: ${rgb(mix(t.redBg, [255, 0, 64], mx.bg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.redText, (t) => [`color: ${rgb(t.redText)}`]),
        createRuleGen((t) => t.redTextActive, (t) => [`color: ${rgb(t.redText)}`]),
        createRuleGen((t) => t.redTextActive, (t) => [`color: ${rgb(mix(t.redText, [255, 255, 0], mx.fg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.redTextActive, (t) => [`color: ${rgb(mix(t.redText, [255, 255, 0], mx.fg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.redBorder, (t) => [`border-color: ${rgb(mix(t.redBg, t.redText, mx.border))}`]),
        createRuleGen((t) => t.greenBg, (t) => [`background-color: ${rgb(t.greenBg)}`]),
        createRuleGen((t) => t.greenBgActive, (t) => [`background-color: ${rgb(t.greenBg)}`]),
        createRuleGen((t) => t.greenBgActive, (t) => [`background-color: ${rgb(mix(t.greenBg, [128, 255, 182], mx.bg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.greenBgActive, (t) => [`background-color: ${rgb(mix(t.greenBg, [128, 255, 182], mx.bg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.greenText, (t) => [`color: ${rgb(t.greenText)}`]),
        createRuleGen((t) => t.greenTextActive, (t) => [`color: ${rgb(t.greenText)}`]),
        createRuleGen((t) => t.greenTextActive, (t) => [`color: ${rgb(mix(t.greenText, [182, 255, 224], mx.fg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.greenTextActive, (t) => [`color: ${rgb(mix(t.greenText, [182, 255, 224], mx.fg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.greenBorder, (t) => [`border-color: ${rgb(mix(t.greenBg, t.greenText, mx.border))}`]),
        createRuleGen((t) => t.blueBg, (t) => [`background-color: ${rgb(t.blueBg)}`]),
        createRuleGen((t) => t.blueBgActive, (t) => [`background-color: ${rgb(t.blueBg)}`]),
        createRuleGen((t) => t.blueBgActive, (t) => [`background-color: ${rgb(mix(t.blueBg, [0, 128, 255], mx.bg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.blueBgActive, (t) => [`background-color: ${rgb(mix(t.blueBg, [0, 128, 255], mx.bg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.blueText, (t) => [`color: ${rgb(t.blueText)}`]),
        createRuleGen((t) => t.blueTextActive, (t) => [`color: ${rgb(t.blueText)}`]),
        createRuleGen((t) => t.blueTextActive, (t) => [`color: ${rgb(mix(t.blueText, [182, 224, 255], mx.fg.hover))}`], (s) => `${s}:hover`),
        createRuleGen((t) => t.blueTextActive, (t) => [`color: ${rgb(mix(t.blueText, [182, 224, 255], mx.fg.active))}`], (s) => `${s}:active, ${s}:focus`),
        createRuleGen((t) => t.blueBorder, (t) => [`border-color: ${rgb(mix(t.blueBg, t.blueText, mx.border))}`]),
        createRuleGen((t) => t.fadeBg, (t) => [`background-color: ${rgb(t.fadeBg)}`]),
        createRuleGen((t) => t.fadeText, (t) => [`color: ${rgb(t.fadeText)}`]),
        createRuleGen((t) => t.transparentBg, () => ['background-color: transparent']),
        createRuleGen((t) => t.noImage, () => ['background-image: none']),
        createRuleGen((t) => t.invert, () => ['filter: invert(100%) hue-rotate(180deg)']),
    ];
    const staticThemeCommands = {
        'NO COMMON': 'noCommon',
        'NEUTRAL BG': 'neutralBg',
        'NEUTRAL BG ACTIVE': 'neutralBgActive',
        'NEUTRAL TEXT': 'neutralText',
        'NEUTRAL TEXT ACTIVE': 'neutralTextActive',
        'NEUTRAL BORDER': 'neutralBorder',
        'RED BG': 'redBg',
        'RED BG ACTIVE': 'redBgActive',
        'RED TEXT': 'redText',
        'RED TEXT ACTIVE': 'redTextActive',
        'RED BORDER': 'redBorder',
        'GREEN BG': 'greenBg',
        'GREEN BG ACTIVE': 'greenBgActive',
        'GREEN TEXT': 'greenText',
        'GREEN TEXT ACTIVE': 'greenTextActive',
        'GREEN BORDER': 'greenBorder',
        'BLUE BG': 'blueBg',
        'BLUE BG ACTIVE': 'blueBgActive',
        'BLUE TEXT': 'blueText',
        'BLUE TEXT ACTIVE': 'blueTextActive',
        'BLUE BORDER': 'blueBorder',
        'FADE BG': 'fadeBg',
        'FADE TEXT': 'fadeText',
        'TRANSPARENT BG': 'transparentBg',
        'NO IMAGE': 'noImage',
        'INVERT': 'invert',
    };
    function parseStaticThemes($themes) {
        return parseSitesFixesConfig($themes, {
            commands: Object.keys(staticThemeCommands),
            getCommandPropName: (command) => staticThemeCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'NO COMMON') {
                    return true;
                }
                return parseArray(value);
            },
        });
    }
    function camelCaseToUpperCase(text) {
        return text.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
    }
    function formatStaticThemes(staticThemes) {
        const themes = staticThemes.slice().sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(themes, {
            props: Object.values(staticThemeCommands),
            getPropCommandName: camelCaseToUpperCase,
            formatPropValue: (prop, value) => {
                if (prop === 'noCommon') {
                    return '';
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === 'noCommon') {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            },
        });
    }
    function getCommonTheme(staticThemes, staticThemesIndex) {
        const length = parseInt(staticThemesIndex.offsets.substring(4, 4 + 3), 36);
        const staticThemeText = staticThemes.substring(0, length);
        return parseStaticThemes(staticThemeText)[0];
    }
    function getThemeFor(url, staticThemes, staticThemesIndex) {
        const themes = getSitesFixesFor(url, staticThemes, staticThemesIndex, {
            commands: Object.keys(staticThemeCommands),
            getCommandPropName: (command) => staticThemeCommands[command],
            parseCommandValue: (command, value) => {
                if (command === 'NO COMMON') {
                    return true;
                }
                return parseArray(value);
            },
        });
        const sortedBySpecificity = themes
            .slice(1)
            .map((theme) => {
            return {
                specificity: isURLInList(url, theme.url) ? theme.url[0].length : 0,
                theme,
            };
        })
            .filter(({ specificity }) => specificity > 0)
            .sort((a, b) => b.specificity - a.specificity);
        if (sortedBySpecificity.length === 0) {
            return null;
        }
        return sortedBySpecificity[0].theme;
    }

    function createSVGFilterStylesheet(config, url, isTopFrame, fixes, index) {
        let filterValue;
        let reverseFilterValue;
        {
            // Chrome fails with "Unsafe attempt to load URL ... Domains, protocols and ports must match.
            filterValue = 'url(#dark-reader-filter)';
            reverseFilterValue = 'url(#dark-reader-reverse-filter)';
        }
        const filterRoot = 'html';
        return cssFilterStyleSheetTemplate(filterRoot, filterValue, reverseFilterValue, config, url, isTopFrame, fixes, index);
    }
    function toSVGMatrix(matrix) {
        return matrix.slice(0, 4).map((m) => m.map((m) => m.toFixed(3)).join(' ')).join(' ');
    }
    function getSVGFilterMatrixValue(config) {
        return toSVGMatrix(createFilterMatrix(config));
    }
    function getSVGReverseFilterMatrixValue() {
        return toSVGMatrix(Matrix.invertNHue());
    }

    var ThemeEngine;
    (function (ThemeEngine) {
        ThemeEngine["cssFilter"] = "cssFilter";
        ThemeEngine["svgFilter"] = "svgFilter";
        ThemeEngine["staticTheme"] = "staticTheme";
        ThemeEngine["dynamicTheme"] = "dynamicTheme";
    })(ThemeEngine || (ThemeEngine = {}));

    var AutomationMode;
    (function (AutomationMode) {
        AutomationMode["NONE"] = "";
        AutomationMode["TIME"] = "time";
        AutomationMode["SYSTEM"] = "system";
        AutomationMode["LOCATION"] = "location";
    })(AutomationMode || (AutomationMode = {}));

    function debounce(delay, fn) {
        let timeoutId = null;
        return ((...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                timeoutId = null;
                fn(...args);
            }, delay);
        });
    }

    class PromiseBarrier {
        resolves = [];
        rejects = [];
        wasResolved = false;
        wasRejected = false;
        resolution;
        reason;
        async entry() {
            if (this.wasResolved) {
                return Promise.resolve(this.resolution);
            }
            if (this.wasRejected) {
                return Promise.reject(this.reason);
            }
            return new Promise((resolve, reject) => {
                this.resolves.push(resolve);
                this.rejects.push(reject);
            });
        }
        async resolve(value) {
            if (this.wasRejected || this.wasResolved) {
                return;
            }
            this.wasResolved = true;
            this.resolution = value;
            this.resolves.forEach((resolve) => resolve(value));
            this.resolves = [];
            this.rejects = [];
            return new Promise((resolve) => setTimeout(() => resolve()));
        }
        async reject(reason) {
            if (this.wasRejected || this.wasResolved) {
                return;
            }
            this.wasRejected = true;
            this.reason = reason;
            this.rejects.forEach((reject) => reject(reason));
            this.resolves = [];
            this.rejects = [];
            return new Promise((resolve) => setTimeout(() => resolve()));
        }
        isPending() {
            return !this.wasResolved && !this.wasRejected;
        }
        isFulfilled() {
            return this.wasResolved;
        }
        isRejected() {
            return this.wasRejected;
        }
    }

    var StateManagerImplState;
    (function (StateManagerImplState) {
        StateManagerImplState[StateManagerImplState["INITIAL"] = 0] = "INITIAL";
        StateManagerImplState[StateManagerImplState["LOADING"] = 1] = "LOADING";
        StateManagerImplState[StateManagerImplState["READY"] = 2] = "READY";
        StateManagerImplState[StateManagerImplState["SAVING"] = 3] = "SAVING";
        StateManagerImplState[StateManagerImplState["SAVING_OVERRIDE"] = 4] = "SAVING_OVERRIDE";
        StateManagerImplState[StateManagerImplState["ONCHANGE_RACE"] = 5] = "ONCHANGE_RACE";
        StateManagerImplState[StateManagerImplState["RECOVERY"] = 6] = "RECOVERY";
    })(StateManagerImplState || (StateManagerImplState = {}));
    class StateManagerImpl {
        localStorageKey;
        parent;
        defaults;
        logWarn;
        meta;
        barrier = null;
        storage;
        listeners;
        constructor(localStorageKey, parent, defaults, storage, addListener, logWarn) {
            this.localStorageKey = localStorageKey;
            this.parent = parent;
            this.defaults = defaults;
            this.storage = storage;
            addListener((change) => this.onChange(change));
            this.logWarn = logWarn;
            this.meta = StateManagerImplState.INITIAL;
            this.barrier = new PromiseBarrier();
            this.listeners = new Set();
            // TODO(Anton): consider calling this.loadState() to preload data,
            // and remove StateManagerImplState.INITIAL.
        }
        collectState() {
            const state = {};
            for (const key of Object.keys(this.defaults)) {
                state[key] = this.parent[key] || this.defaults[key];
            }
            return state;
        }
        applyState(storage) {
            Object.assign(this.parent, this.defaults, storage);
        }
        releaseBarrier() {
            const barrier = this.barrier;
            this.barrier = new PromiseBarrier();
            barrier.resolve();
        }
        notifyListeners() {
            this.listeners.forEach((listener) => listener());
        }
        onChange(state) {
            switch (this.meta) {
                case StateManagerImplState.INITIAL:
                    this.meta = StateManagerImplState.READY;
                // fallthrough
                case StateManagerImplState.READY:
                    this.applyState(state);
                    this.notifyListeners();
                    return;
                case StateManagerImplState.LOADING:
                    this.meta = StateManagerImplState.ONCHANGE_RACE;
                    return;
                case StateManagerImplState.SAVING:
                    this.meta = StateManagerImplState.ONCHANGE_RACE;
                    return;
                case StateManagerImplState.SAVING_OVERRIDE:
                    this.meta = StateManagerImplState.ONCHANGE_RACE;
                    break;
                case StateManagerImplState.ONCHANGE_RACE:
                    // We are already waiting for an active read/write operation to end
                    break;
                case StateManagerImplState.RECOVERY:
                    this.meta = StateManagerImplState.ONCHANGE_RACE;
                    break;
            }
        }
        saveStateInternal() {
            this.storage.set({ [this.localStorageKey]: this.collectState() }, () => {
                switch (this.meta) {
                    case StateManagerImplState.INITIAL:
                    // fallthrough
                    case StateManagerImplState.LOADING:
                    // fallthrough
                    case StateManagerImplState.READY:
                    // fallthrough
                    case StateManagerImplState.RECOVERY:
                        this.logWarn('Unexpected state. Possible data race!');
                        this.meta = StateManagerImplState.ONCHANGE_RACE;
                        this.loadStateInternal();
                        return;
                    case StateManagerImplState.SAVING:
                        this.meta = StateManagerImplState.READY;
                        this.releaseBarrier();
                        return;
                    case StateManagerImplState.SAVING_OVERRIDE:
                        this.meta = StateManagerImplState.SAVING;
                        this.saveStateInternal();
                        return;
                    case StateManagerImplState.ONCHANGE_RACE:
                        this.meta = StateManagerImplState.RECOVERY;
                        this.loadStateInternal();
                }
            });
        }
        // This function is not guaranteed to save state before returning
        async saveState() {
            switch (this.meta) {
                case StateManagerImplState.INITIAL:
                    // Make sure not to overwrite data before it is loaded
                    this.logWarn('StateManager.saveState was called before StateManager.loadState(). Possible data race! Loading data instead.');
                    return this.loadState();
                case StateManagerImplState.LOADING:
                    // Need to wait for active read operation to end
                    this.logWarn('StateManager.saveState was called before StateManager.loadState() resolved. Possible data race! Loading data instead.');
                    return this.barrier.entry();
                case StateManagerImplState.READY: {
                    this.meta = StateManagerImplState.SAVING;
                    const entry = this.barrier.entry();
                    this.saveStateInternal();
                    return entry;
                }
                case StateManagerImplState.SAVING:
                    // Another save is in progress
                    this.meta = StateManagerImplState.SAVING_OVERRIDE;
                    return this.barrier.entry();
                case StateManagerImplState.SAVING_OVERRIDE:
                    return this.barrier.entry();
                case StateManagerImplState.ONCHANGE_RACE:
                    this.logWarn('StateManager.saveState was called during active read/write operation. Possible data race! Loading data instead.');
                    return this.barrier.entry();
                case StateManagerImplState.RECOVERY:
                    this.logWarn('StateManager.saveState was called during active read operation. Possible data race! Waiting for data load instead.');
                    return this.barrier.entry();
            }
        }
        loadStateInternal() {
            this.storage.get(this.localStorageKey, (data) => {
                switch (this.meta) {
                    case StateManagerImplState.INITIAL:
                    case StateManagerImplState.READY:
                    case StateManagerImplState.SAVING:
                    case StateManagerImplState.SAVING_OVERRIDE:
                        this.logWarn('Unexpected state. Possible data race!');
                        return;
                    case StateManagerImplState.LOADING:
                        this.meta = StateManagerImplState.READY;
                        this.applyState(data[this.localStorageKey]);
                        this.releaseBarrier();
                        return;
                    case StateManagerImplState.ONCHANGE_RACE:
                        this.meta = StateManagerImplState.RECOVERY;
                        this.loadStateInternal();
                    // eslint-disable-next-line no-fallthrough
                    case StateManagerImplState.RECOVERY:
                        this.meta = StateManagerImplState.READY;
                        this.applyState(data[this.localStorageKey]);
                        this.releaseBarrier();
                        this.notifyListeners();
                }
            });
        }
        async loadState() {
            switch (this.meta) {
                case StateManagerImplState.INITIAL: {
                    this.meta = StateManagerImplState.LOADING;
                    const entry = this.barrier.entry();
                    this.loadStateInternal();
                    return entry;
                }
                case StateManagerImplState.READY:
                    return;
                case StateManagerImplState.SAVING:
                    return this.barrier.entry();
                case StateManagerImplState.SAVING_OVERRIDE:
                    return this.barrier.entry();
                case StateManagerImplState.LOADING:
                    return this.barrier.entry();
                case StateManagerImplState.ONCHANGE_RACE:
                    return this.barrier.entry();
                case StateManagerImplState.RECOVERY:
                    return this.barrier.entry();
            }
        }
        addChangeListener(callback) {
            this.listeners.add(callback);
        }
        getStateForTesting() {
            {
                return '';
            }
        }
    }

    /**
     * This class exists only to simplify Jest testing of the real implementation
     * which is in StateManagerImpl class.
     */
    class StateManager {
        stateManager;
        constructor(localStorageKey, parent, defaults, logWarn) {
            {
                function addListener(listener) {
                    chrome.storage.local.onChanged.addListener((changes) => {
                        if (localStorageKey in changes) {
                            listener(changes[localStorageKey].newValue);
                        }
                    });
                }
                this.stateManager = new StateManagerImpl(localStorageKey, parent, defaults, chrome.storage.local, addListener, logWarn);
            }
        }
        async saveState() {
            if (this.stateManager) {
                return this.stateManager.saveState();
            }
        }
        async loadState() {
            if (this.stateManager) {
                return this.stateManager.loadState();
            }
        }
    }

    // Promissified version of chrome.tabs.query
    async function queryTabs(query = {}) {
        return new Promise((resolve) => chrome.tabs.query(query, resolve));
    }
    /**
     * Attempts to find the current active tab
     * Despite all efforts, sometimes active tab may not be determined so we explicitly return nullable value,
     * and handle this case in callers explicitly
     */
    async function getActiveTab() {
        let log = null;
        let tab = (await queryTabs({
            active: true,
            lastFocusedWindow: true,
            // Explicitly exclude Dark Reader's Dev Tools and other special windows from the query
            windowType: 'normal',
        }))[0];
        if (!tab) {
            tab = (await queryTabs({
                active: true,
                lastFocusedWindow: true,
                windowType: 'app',
            }))[0];
        }
        if (!tab) {
            {
                log = 'method 1';
            }
            // When Dark Reader's DevTools are open, last focused window might be the DevTools window
            // so we lift this restriction and try again (with the best guess)
            tab = (await queryTabs({
                active: true,
                windowType: 'normal',
            }))[0];
        }
        if (!tab) {
            {
                log = 'method 2';
            }
            tab = (await queryTabs({
                active: true,
                windowType: 'app',
            }))[0];
        }
        if (log) {
            console.warn(`TabManager.getActiveTab() could not reliably find the active tab, picking the best guess ${log}`, tab);
        }
        // In rare cases tab can be null, despite what TypeScript says
        return tab || null;
    }

    const DEFAULT_COLORS = {
        darkScheme: {
            background: '#181a1b',
            text: '#e8e6e3',
        },
        lightScheme: {
            background: '#dcdad7',
            text: '#181a1b',
        },
    };
    const DEFAULT_THEME = {
        mode: 1,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
        useFont: false,
        fontFamily: isMacOS ? 'Helvetica Neue' : isWindows ? 'Segoe UI' : 'Open Sans',
        textStroke: 0,
        engine: ThemeEngine.dynamicTheme,
        stylesheet: '',
        darkSchemeBackgroundColor: DEFAULT_COLORS.darkScheme.background,
        darkSchemeTextColor: DEFAULT_COLORS.darkScheme.text,
        lightSchemeBackgroundColor: DEFAULT_COLORS.lightScheme.background,
        lightSchemeTextColor: DEFAULT_COLORS.lightScheme.text,
        scrollbarColor: '',
        selectionColor: 'auto',
        styleSystemControls: false ,
        lightColorScheme: 'Default',
        darkColorScheme: 'Default',
        immediateModify: false,
    };
    const DEFAULT_COLORSCHEME = {
        light: {
            Default: {
                backgroundColor: DEFAULT_COLORS.lightScheme.background,
                textColor: DEFAULT_COLORS.lightScheme.text,
            },
        },
        dark: {
            Default: {
                backgroundColor: DEFAULT_COLORS.darkScheme.background,
                textColor: DEFAULT_COLORS.darkScheme.text,
            },
        },
    };
    const filterModeSites = [
        '*.officeapps.live.com',
        '*.sharepoint.com',
        'docs.google.com',
        'onedrive.live.com',
    ];
    const DEFAULT_SETTINGS = {
        schemeVersion: 0,
        enabled: true,
        fetchNews: true,
        theme: DEFAULT_THEME,
        presets: [],
        customThemes: filterModeSites.map((url) => {
            const engine = ThemeEngine.cssFilter;
            return {
                url: [url],
                theme: { ...DEFAULT_THEME, engine },
                builtIn: true,
            };
        }),
        enabledByDefault: true,
        enabledFor: [],
        disabledFor: [],
        changeBrowserTheme: false,
        syncSettings: true,
        syncSitesFixes: false,
        automation: {
            enabled: isEdge && isMobile ? true : false,
            mode: isEdge && isMobile ? AutomationMode.SYSTEM : AutomationMode.NONE,
            behavior: 'OnOff',
        },
        time: {
            activation: '18:00',
            deactivation: '9:00',
        },
        location: {
            latitude: null,
            longitude: null,
        },
        previewNewDesign: false,
        previewNewestDesign: false,
        enableForPDF: true,
        enableForProtectedPages: false,
        enableContextMenus: false,
        detectDarkTheme: true,
    };

    // Seperator is to indicate that the it should start with a new defined colorscheme.
    const SEPERATOR = '='.repeat(32);
    // Just a few constants to make the code more readable.
    const backgroundPropertyLength = 'background: '.length;
    const textPropertyLength = 'text: '.length;
    // Should return a humanized version of the given number.
    // For example:
    // humanizeNumber(0) => '0'
    // humanizeNumber(1) => '1st'
    // humanizeNumber(2) => '2nd'
    // humanizeNumber(3) => '3rd'
    // humanizeNumber(4) => '4th'
    // TODO(Anton): rewrite me with case-default
    // eslint-disable-next-line
    // @ts-ignore
    const humanizeNumber = (number) => {
        if (number > 3) {
            return `${number}th`;
        }
        switch (number) {
            case 0:
                return '0';
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
        }
    };
    // Should return if the given string is a valid 3 or 6 digit hex color.
    const isValidHexColor = (color) => {
        return /^#([0-9a-fA-F]{3}){1,2}$/.test(color);
    };
    function parseColorSchemeConfig(config) {
        // Let's first get all "possible" sections of the text.
        // We're adding `\n` so the sections "first" word is the
        // name of the color scheme. We could remove this and
        // skip this in the process of parsing, but because
        // the first entry will not have this first '\n' it will
        // be more complicated to otherwise just add this '\n' here.
        const sections = config.split(`${SEPERATOR}\n\n`);
        const definedColorSchemeNames = new Set();
        let lastDefinedColorSchemeName = '';
        const definedColorSchemes = {
            light: {},
            dark: {},
        };
        // Define the interrupt and error variables.
        // Interrupt is to indicate that the parsing should stop.
        // But because we cannot break out of a forEach loop,
        // we need to use an interrupt variable.
        // The error is to indicate that there was an error.
        // And also the reason why the parsing failed.
        // It will be the first error that is found.
        let interrupt = false;
        let error = null;
        const throwError = (message) => {
            if (!interrupt) {
                interrupt = true;
                error = message;
            }
        };
        // Now we will iterate troughout each section.
        // We will always assume bad-faith and make sure to have
        // guards in place. As this could also be bad code.
        // We shouldn't rely on that the input is correct.
        sections.forEach((section) => {
            // Check if the interrupt variable is set.
            // If it is, we should stop parsing.
            if (interrupt) {
                return;
            }
            // First we split the section into lines.
            const lines = section.split('\n');
            // We have to make sure that the first line is a valid color scheme name.
            // We will also make sure that the name is not already defined.
            const name = lines[0];
            if (!name) {
                throwError('No color scheme name was found.');
                return;
            }
            if (definedColorSchemeNames.has(name)) {
                throwError(`The color scheme name "${name}" is already defined.`);
                return;
            }
            // Check if the name is on alphabetical order.
            if (lastDefinedColorSchemeName && lastDefinedColorSchemeName !== 'Default' && name.localeCompare(lastDefinedColorSchemeName) < 0) {
                throwError(`The color scheme name "${name}" is not in alphabetical order.`);
                return;
            }
            lastDefinedColorSchemeName = name;
            // Add the name to the set of defined color scheme names.
            definedColorSchemeNames.add(name);
            // Check if line[1] is empty, which is must be.
            if (lines[1]) {
                throwError(`The second line of the color scheme "${name}" is not empty.`);
                return;
            }
            const checkVariant = (lineIndex, isSecondVariant) => {
                // Get the possible variant name.
                const variant = lines[lineIndex];
                if (!variant) {
                    throwError(`The third line of the color scheme "${name}" is not defined.`);
                    return;
                }
                // Check if the variant is valid.
                // if isSecondVariant is true, then we will check if the variant is 'Light', 'Dark' is not considered valid.
                if (variant !== 'LIGHT' && variant !== 'DARK' && (isSecondVariant && variant === 'Light')) {
                    throwError(`The ${humanizeNumber(lineIndex)} line of the color scheme "${name}" is not a valid variant.`);
                    return;
                }
                // Get the possible background color.
                const firstProperty = lines[lineIndex + 1];
                if (!firstProperty) {
                    throwError(`The ${humanizeNumber(lineIndex + 1)} line of the color scheme "${name}" is not defined.`);
                    return;
                }
                // Check if the property is background color.
                if (!firstProperty.startsWith('background: ')) {
                    throwError(`The ${humanizeNumber(lineIndex + 1)} line of the color scheme "${name}" is not background-color property.`);
                    return;
                }
                // Get the background color and check if it is a valid hex color.
                const backgroundColor = firstProperty.slice(backgroundPropertyLength);
                if (!isValidHexColor(backgroundColor)) {
                    throwError(`The ${humanizeNumber(lineIndex + 1)} line of the color scheme "${name}" is not a valid hex color.`);
                    return;
                }
                // Get the possible text color.
                const secondProperty = lines[lineIndex + 2];
                if (!secondProperty) {
                    throwError(`The ${humanizeNumber(lineIndex + 2)} line of the color scheme "${name}" is not defined.`);
                    return;
                }
                // Check if the property is text color.
                if (!secondProperty.startsWith('text: ')) {
                    throwError(`The ${humanizeNumber(lineIndex + 2)} line of the color scheme "${name}" is not text-color property.`);
                    return;
                }
                // Get the text color and check if it is a valid hex color.
                const textColor = secondProperty.slice(textPropertyLength);
                if (!isValidHexColor(textColor)) {
                    throwError(`The ${humanizeNumber(lineIndex + 2)} line of the color scheme "${name}" is not a valid hex color.`);
                    return;
                }
                // If the variant is the second variant, then we will return the variant and the variant name.
                return {
                    backgroundColor,
                    textColor,
                    variant,
                };
            };
            const firstVariant = checkVariant(2, false);
            const isFirstVariantLight = firstVariant.variant === 'LIGHT';
            delete firstVariant.variant;
            // If the interrupt variable is set, we should stop parsing.
            if (interrupt) {
                return;
            }
            let secondVariant = null;
            let isSecondVariantLight = false;
            // Check if the 7th line is defined otherwise we should stop parsing.
            if (lines[6]) {
                secondVariant = checkVariant(6, true);
                isSecondVariantLight = secondVariant.variant === 'LIGHT';
                delete secondVariant.variant;
                // If the interrupt variable is set, we should stop parsing.
                if (interrupt) {
                    return;
                }
                // Must end with 1 new line(two Variants).
                if (lines.length > 11 || lines[9] || lines[10]) {
                    throwError(`The color scheme "${name}" doesn't end with 1 new line.`);
                    return;
                }
            }
            else if (lines.length > 7) {
                throwError(`The color scheme "${name}" doesn't end with 1 new line.`);
                return;
            }
            if (secondVariant) {
                if (isFirstVariantLight === isSecondVariantLight) {
                    throwError(`The color scheme "${name}" has the same variant twice.`);
                    return;
                }
                if (isFirstVariantLight) {
                    definedColorSchemes.light[name] = firstVariant;
                    definedColorSchemes.dark[name] = secondVariant;
                }
                else {
                    definedColorSchemes.light[name] = secondVariant;
                    definedColorSchemes.dark[name] = firstVariant;
                }
            }
            else if (isFirstVariantLight) {
                definedColorSchemes.light[name] = firstVariant;
            }
            else {
                definedColorSchemes.dark[name] = firstVariant;
            }
        });
        return { result: definedColorSchemes, error: error };
    }

    function isBoolean(x) {
        return typeof x === 'boolean';
    }
    function isPlainObject(x) {
        return typeof x === 'object' && x != null && !Array.isArray(x);
    }
    function isArray(x) {
        return Array.isArray(x);
    }
    function isString(x) {
        return typeof x === 'string';
    }
    function isNonEmptyString(x) {
        return x && isString(x);
    }
    function isNonEmptyArrayOfNonEmptyStrings(x) {
        return Array.isArray(x) && x.length > 0 && x.every((s) => isNonEmptyString(s));
    }
    function isRegExpMatch(regexp) {
        return (x) => {
            return isString(x) && x.match(regexp) != null;
        };
    }
    const isTime = isRegExpMatch(/^((0?[0-9])|(1[0-9])|(2[0-3])):([0-5][0-9])$/);
    function isNumber(x) {
        return typeof x === 'number' && !isNaN(x);
    }
    function isNumberBetween(min, max) {
        return (x) => {
            return isNumber(x) && x >= min && x <= max;
        };
    }
    function isOneOf(...values) {
        return (x) => values.includes(x);
    }
    function hasRequiredProperties(obj, keys) {
        return keys.every((key) => obj.hasOwnProperty(key));
    }
    function createValidator() {
        const errors = [];
        function validateProperty(obj, key, validator, fallback) {
            if (!obj.hasOwnProperty(key) || validator(obj[key])) {
                return;
            }
            errors.push(`Unexpected value for "${key}": ${JSON.stringify(obj[key])}`);
            obj[key] = fallback[key];
        }
        function validateArray(obj, key, validator) {
            if (!obj.hasOwnProperty(key)) {
                return;
            }
            const wrongValues = new Set();
            const arr = obj[key];
            for (let i = 0; i < arr.length; i++) {
                if (!validator(arr[i])) {
                    wrongValues.add(arr[i]);
                    arr.splice(i, 1);
                    i--;
                }
            }
            if (wrongValues.size > 0) {
                errors.push(`Array "${key}" has wrong values: ${Array.from(wrongValues).map((v) => JSON.stringify(v)).join('; ')}`);
            }
        }
        return { validateProperty, validateArray, errors };
    }
    function validateSettings(settings) {
        if (!isPlainObject(settings)) {
            return { errors: ['Settings are not a plain object'], settings: DEFAULT_SETTINGS };
        }
        const { validateProperty, validateArray, errors } = createValidator();
        const isValidPresetTheme = (theme) => {
            if (!isPlainObject(theme)) {
                return false;
            }
            const { errors: themeErrors } = validateTheme(theme);
            return themeErrors.length === 0;
        };
        validateProperty(settings, 'schemeVersion', isNumber, DEFAULT_SETTINGS);
        validateProperty(settings, 'enabled', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'fetchNews', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'theme', isPlainObject, DEFAULT_SETTINGS);
        const { errors: themeErrors } = validateTheme(settings.theme);
        errors.push(...themeErrors);
        validateProperty(settings, 'presets', isArray, DEFAULT_SETTINGS);
        validateArray(settings, 'presets', (preset) => {
            const presetValidator = createValidator();
            if (!(isPlainObject(preset) && hasRequiredProperties(preset, ['id', 'name', 'urls', 'theme']))) {
                return false;
            }
            presetValidator.validateProperty(preset, 'id', isNonEmptyString, preset);
            presetValidator.validateProperty(preset, 'name', isNonEmptyString, preset);
            presetValidator.validateProperty(preset, 'urls', isNonEmptyArrayOfNonEmptyStrings, preset);
            presetValidator.validateProperty(preset, 'theme', isValidPresetTheme, preset);
            return presetValidator.errors.length === 0;
        });
        validateProperty(settings, 'customThemes', isArray, DEFAULT_SETTINGS);
        validateArray(settings, 'customThemes', (custom) => {
            if (!(isPlainObject(custom) && hasRequiredProperties(custom, ['url', 'theme']))) {
                return false;
            }
            const presetValidator = createValidator();
            presetValidator.validateProperty(custom, 'url', isNonEmptyArrayOfNonEmptyStrings, custom);
            presetValidator.validateProperty(custom, 'theme', isValidPresetTheme, custom);
            return presetValidator.errors.length === 0;
        });
        validateProperty(settings, 'enabledFor', isArray, DEFAULT_SETTINGS);
        validateArray(settings, 'enabledFor', isNonEmptyString);
        validateProperty(settings, 'disabledFor', isArray, DEFAULT_SETTINGS);
        validateArray(settings, 'disabledFor', isNonEmptyString);
        validateProperty(settings, 'enabledByDefault', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'changeBrowserTheme', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'syncSettings', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'syncSitesFixes', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'automation', (automation) => {
            if (!isPlainObject(automation)) {
                return false;
            }
            const automationValidator = createValidator();
            automationValidator.validateProperty(automation, 'enabled', isBoolean, automation);
            automationValidator.validateProperty(automation, 'mode', isOneOf(AutomationMode.SYSTEM, AutomationMode.TIME, AutomationMode.LOCATION, AutomationMode.NONE), automation);
            automationValidator.validateProperty(automation, 'behavior', isOneOf('OnOff', 'Scheme'), automation);
            return automationValidator.errors.length === 0;
        }, DEFAULT_SETTINGS);
        validateProperty(settings, AutomationMode.TIME, (time) => {
            if (!isPlainObject(time)) {
                return false;
            }
            const timeValidator = createValidator();
            timeValidator.validateProperty(time, 'activation', isTime, time);
            timeValidator.validateProperty(time, 'deactivation', isTime, time);
            return timeValidator.errors.length === 0;
        }, DEFAULT_SETTINGS);
        validateProperty(settings, AutomationMode.LOCATION, (location) => {
            if (!isPlainObject(location)) {
                return false;
            }
            const locValidator = createValidator();
            const isValidLoc = (x) => x === null || isNumber(x);
            locValidator.validateProperty(location, 'latitude', isValidLoc, location);
            locValidator.validateProperty(location, 'longitude', isValidLoc, location);
            return locValidator.errors.length === 0;
        }, DEFAULT_SETTINGS);
        validateProperty(settings, 'previewNewDesign', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'previewNewestDesign', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'enableForPDF', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'enableForProtectedPages', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'enableContextMenus', isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, 'detectDarkTheme', isBoolean, DEFAULT_SETTINGS);
        return { errors, settings };
    }
    function validateTheme(theme) {
        if (!isPlainObject(theme)) {
            return { errors: ['Theme is not a plain object'], theme: DEFAULT_THEME };
        }
        const { validateProperty, errors } = createValidator();
        validateProperty(theme, 'mode', isOneOf(0, 1), DEFAULT_THEME);
        validateProperty(theme, 'brightness', isNumberBetween(0, 200), DEFAULT_THEME);
        validateProperty(theme, 'contrast', isNumberBetween(0, 200), DEFAULT_THEME);
        validateProperty(theme, 'grayscale', isNumberBetween(0, 100), DEFAULT_THEME);
        validateProperty(theme, 'sepia', isNumberBetween(0, 100), DEFAULT_THEME);
        validateProperty(theme, 'useFont', isBoolean, DEFAULT_THEME);
        validateProperty(theme, 'fontFamily', isNonEmptyString, DEFAULT_THEME);
        validateProperty(theme, 'textStroke', isNumberBetween(0, 1), DEFAULT_THEME);
        validateProperty(theme, 'engine', isOneOf('dynamicTheme', 'staticTheme', 'cssFilter', 'svgFilter'), DEFAULT_THEME);
        validateProperty(theme, 'stylesheet', isString, DEFAULT_THEME);
        validateProperty(theme, 'darkSchemeBackgroundColor', isRegExpMatch(/^#[0-9a-f]{6}$/i), DEFAULT_THEME);
        validateProperty(theme, 'darkSchemeTextColor', isRegExpMatch(/^#[0-9a-f]{6}$/i), DEFAULT_THEME);
        validateProperty(theme, 'lightSchemeBackgroundColor', isRegExpMatch(/^#[0-9a-f]{6}$/i), DEFAULT_THEME);
        validateProperty(theme, 'lightSchemeTextColor', isRegExpMatch(/^#[0-9a-f]{6}$/i), DEFAULT_THEME);
        validateProperty(theme, 'scrollbarColor', (x) => x === '' || isRegExpMatch(/^(auto)|(#[0-9a-f]{6})$/i)(x), DEFAULT_THEME);
        validateProperty(theme, 'selectionColor', isRegExpMatch(/^(auto)|(#[0-9a-f]{6})$/i), DEFAULT_THEME);
        validateProperty(theme, 'styleSystemControls', isBoolean, DEFAULT_THEME);
        validateProperty(theme, 'lightColorScheme', isNonEmptyString, DEFAULT_THEME);
        validateProperty(theme, 'darkColorScheme', isNonEmptyString, DEFAULT_THEME);
        validateProperty(theme, 'immediateModify', isBoolean, DEFAULT_THEME);
        return { errors, theme };
    }

    function sendLog(level, ...args) {
        {
            return;
        }
    }

    function logInfo(...args) {
        {
            console.info(...args);
            sendLog('info', args);
        }
    }
    function logWarn(...args) {
        {
            console.warn(...args);
            sendLog('warn', args);
        }
    }
    function logAssert(...args) {
        {
            console.assert(...args);
            sendLog('assert', ...args);
        }
    }
    function ASSERT(description, condition) {
        if ((typeof condition === 'function' && !condition()) || !condition) {
            logAssert(description);
        }
    }

    const SAVE_TIMEOUT = 1000;
    class UserStorage {
        static loadBarrier;
        static saveStorageBarrier;
        static settings;
        static async loadSettings() {
            if (!UserStorage.settings) {
                UserStorage.settings = await UserStorage.loadSettingsFromStorage();
            }
        }
        static fillDefaults(settings) {
            settings.theme = { ...DEFAULT_THEME, ...settings.theme };
            settings.time = { ...DEFAULT_SETTINGS.time, ...settings.time };
            settings.presets.forEach((preset) => {
                preset.theme = { ...DEFAULT_THEME, ...preset.theme };
            });
            settings.customThemes.forEach((site) => {
                site.theme = { ...DEFAULT_THEME, ...site.theme };
            });
            if (settings.customThemes.length === 0) {
                settings.customThemes = DEFAULT_SETTINGS.customThemes;
            }
        }
        // migrateAutomationSettings migrates old automation settings to the new interface.
        // It will move settings.automation & settings.automationBehavior into,
        // settings.automation = { enabled, mode, behavior }.
        // Remove this over two years(mid-2024).
        // This won't always work, because browsers can decide to instead use the default settings
        // when they notice a different type being requested for automation, in that case it's a data-loss
        // and not something we can encounter for, except for doing always two extra requests to explicitly
        // check for this case which is inefficient usage of requesting storage.
        static migrateAutomationSettings(settings) {
            if (typeof settings.automation === 'string') {
                const automationMode = settings.automation;
                const automationBehavior = settings.automationBehaviour;
                if (settings.automation === '') {
                    settings.automation = {
                        enabled: false,
                        mode: automationMode,
                        behavior: automationBehavior,
                    };
                }
                else {
                    settings.automation = {
                        enabled: true,
                        mode: automationMode,
                        behavior: automationBehavior,
                    };
                }
                delete settings.automationBehaviour;
            }
        }
        static migrateSiteListsV2(deprecated) {
            const settings = {};
            settings.enabledByDefault = !deprecated.applyToListedOnly;
            if (settings.enabledByDefault) {
                settings.disabledFor = deprecated.siteList ?? [];
                settings.enabledFor = deprecated.siteListEnabled ?? [];
            }
            else {
                settings.disabledFor = [];
                settings.enabledFor = deprecated.siteList ?? [];
            }
            return settings;
        }
        static migrateBuiltInSVGFilterToCSSFilter(settings) {
            settings?.customThemes?.forEach((c) => {
                if (c?.theme?.engine === ThemeEngine.svgFilter &&
                    (c.builtIn || c.url?.includes('docs.google.com'))) {
                    c.theme.engine = ThemeEngine.cssFilter;
                }
            });
        }
        static async loadSettingsFromStorage() {
            if (UserStorage.loadBarrier) {
                return await UserStorage.loadBarrier.entry();
            }
            UserStorage.loadBarrier = new PromiseBarrier();
            let local = await readLocalStorage(DEFAULT_SETTINGS);
            if (local.schemeVersion < 2) {
                const sync = await readSyncStorage({ schemeVersion: 0 });
                if (!sync || sync.schemeVersion < 2) {
                    const deprecatedDefaults = {
                        siteList: [],
                        siteListEnabled: [],
                        applyToListedOnly: false,
                    };
                    const localDeprecated = await readLocalStorage(deprecatedDefaults);
                    const localTransformed = UserStorage.migrateSiteListsV2(localDeprecated);
                    await writeLocalStorage({ schemeVersion: 2, ...localTransformed });
                    await removeLocalStorage(Object.keys(deprecatedDefaults));
                    const syncDeprecated = await readSyncStorage(deprecatedDefaults);
                    const syncTransformed = UserStorage.migrateSiteListsV2(syncDeprecated);
                    await writeSyncStorage({ schemeVersion: 2, ...syncTransformed });
                    await removeSyncStorage(Object.keys(deprecatedDefaults));
                    local = await readLocalStorage(DEFAULT_SETTINGS);
                }
            }
            const { errors: localCfgErrors } = validateSettings(local);
            localCfgErrors.forEach((err) => logWarn(err));
            if (local.syncSettings == null) {
                local.syncSettings = DEFAULT_SETTINGS.syncSettings;
            }
            if (!local.syncSettings) {
                UserStorage.migrateAutomationSettings(local);
                UserStorage.migrateBuiltInSVGFilterToCSSFilter(local);
                UserStorage.fillDefaults(local);
                UserStorage.loadBarrier.resolve(local);
                return local;
            }
            const $sync = await readSyncStorage(DEFAULT_SETTINGS);
            if (!$sync) {
                logWarn('Sync settings are missing');
                local.syncSettings = false;
                UserStorage.set({ syncSettings: false });
                UserStorage.saveSyncSetting(false);
                UserStorage.loadBarrier.resolve(local);
                return local;
            }
            const { errors: syncCfgErrors } = validateSettings($sync);
            syncCfgErrors.forEach((err) => logWarn(err));
            UserStorage.migrateAutomationSettings($sync);
            UserStorage.migrateBuiltInSVGFilterToCSSFilter($sync);
            UserStorage.fillDefaults($sync);
            UserStorage.loadBarrier.resolve($sync);
            return $sync;
        }
        static async saveSettings() {
            if (!UserStorage.settings) {
                // This path is never taken because Extension always calls UserStorage.loadSettings()
                // before calling UserStorage.saveSettings().
                logWarn('Could not save settings into storage because the settings are missing.');
                return;
            }
            await UserStorage.saveSettingsIntoStorage();
        }
        static async saveSyncSetting(sync) {
            const obj = { syncSettings: sync };
            await writeLocalStorage(obj);
            try {
                await writeSyncStorage(obj);
            }
            catch (err) {
                logWarn('Settings synchronization was disabled due to error:', chrome.runtime.lastError);
                UserStorage.set({ syncSettings: false });
            }
        }
        static saveSettingsIntoStorage = debounce(SAVE_TIMEOUT, async () => {
            if (UserStorage.saveStorageBarrier) {
                await UserStorage.saveStorageBarrier.entry();
                return;
            }
            UserStorage.saveStorageBarrier = new PromiseBarrier();
            const settings = UserStorage.settings;
            if (settings.syncSettings) {
                try {
                    await writeSyncStorage(settings);
                }
                catch (err) {
                    logWarn('Settings synchronization was disabled due to error:', chrome.runtime.lastError);
                    UserStorage.set({ syncSettings: false });
                    await UserStorage.saveSyncSetting(false);
                    await writeLocalStorage(settings);
                }
            }
            else {
                await writeLocalStorage(settings);
            }
            UserStorage.saveStorageBarrier.resolve();
            UserStorage.saveStorageBarrier = null;
        });
        static set($settings) {
            if (!UserStorage.settings) {
                // This path is never taken because Extension always calls UserStorage.loadSettings()
                // before calling UserStorage.set().
                logWarn('Could not modify settings because the settings are missing.');
                return;
            }
            const filterSiteList = (siteList) => {
                if (!Array.isArray(siteList)) {
                    const list = [];
                    for (const key in siteList) {
                        const index = Number(key);
                        if (!isNaN(index)) {
                            list[index] = siteList[key];
                        }
                    }
                    siteList = list;
                }
                return siteList.filter((pattern) => {
                    let isOK = false;
                    try {
                        isURLMatched('https://google.com/', pattern);
                        isURLMatched('[::1]:1337', pattern);
                        isOK = true;
                    }
                    catch (err) {
                        logWarn(`Pattern "${pattern}" excluded`);
                    }
                    return isOK && pattern !== '/';
                });
            };
            const { enabledFor, disabledFor } = $settings;
            const updatedSettings = { ...UserStorage.settings, ...$settings };
            if (enabledFor) {
                updatedSettings.enabledFor = filterSiteList(enabledFor);
            }
            if (disabledFor) {
                updatedSettings.disabledFor = filterSiteList(disabledFor);
            }
            UserStorage.settings = updatedSettings;
        }
    }

    async function getOKResponse(url, mimeType, origin) {
        const credentials = origin && url.startsWith(`${origin}/`) ? undefined : 'omit';
        const response = await fetch(url, {
            cache: 'force-cache',
            credentials,
            referrer: origin,
        });
        if (mimeType && !response.headers.get('Content-Type').startsWith(mimeType)) {
            throw new Error(`Mime type mismatch when loading ${url}`);
        }
        if (!response.ok) {
            throw new Error(`Unable to load ${url} ${response.status} ${response.statusText}`);
        }
        return response;
    }
    async function loadAsDataURL(url, mimeType) {
        const response = await getOKResponse(url, mimeType);
        return await readResponseAsDataURL(response);
    }
    async function readResponseAsDataURL(response) {
        const blob = await response.blob();
        const dataURL = await (new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        }));
        return dataURL;
    }
    async function loadAsText(url, mimeType, origin) {
        const response = await getOKResponse(url, mimeType, origin);
        return await response.text();
    }

    async function readText(params) {
        return new Promise((resolve, reject) => {
            if (isXMLHttpRequestSupported) {
                // Use XMLHttpRequest if it is available
                const request = new XMLHttpRequest();
                request.overrideMimeType('text/plain');
                request.open('GET', params.url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(request.responseText);
                    }
                    else {
                        reject(new Error(`${request.status}: ${request.statusText}`));
                    }
                };
                request.onerror = () => reject(new Error(`${request.status}: ${request.statusText}`));
                if (params.timeout) {
                    request.timeout = params.timeout;
                    request.ontimeout = () => reject(new Error('File loading stopped due to timeout'));
                }
                request.send();
            }
            else if (isFetchSupported) {
                // XMLHttpRequest is not available in Service Worker contexts like
                // Manifest V3 background context
                let abortController;
                let signal;
                let timedOut = false;
                if (params.timeout) {
                    abortController = new AbortController();
                    signal = abortController.signal;
                    setTimeout(() => {
                        abortController.abort();
                        timedOut = true;
                    }, params.timeout);
                }
                fetch(params.url, { signal })
                    .then((response) => {
                    if (response.status >= 200 && (response.status < 300)) {
                        resolve(response.text());
                    }
                    else {
                        reject(new Error(`${response.status}: ${response.statusText}`));
                    }
                }).catch((error) => {
                    if (timedOut) {
                        reject(new Error('File loading stopped due to timeout'));
                    }
                    else {
                        reject(error);
                    }
                });
            }
            else {
                reject(new Error(`Neither XMLHttpRequest nor Fetch API are accessible!`));
            }
        });
    }
    class LimitedCacheStorage {
        // TODO: remove type cast after dependency update
        static QUOTA_BYTES = ((navigator.deviceMemory) || 4) * 16 * 1024 * 1024;
        static TTL = getDuration({ minutes: 10 });
        static ALARM_NAME = 'network';
        bytesInUse = 0;
        records = new Map();
        static alarmIsActive = false;
        constructor() {
            chrome.alarms.onAlarm.addListener(async (alarm) => {
                if (alarm.name === LimitedCacheStorage.ALARM_NAME) {
                    // We schedule only one-time alarms, so once it goes off,
                    // there are no more alarms scheduled.
                    LimitedCacheStorage.alarmIsActive = false;
                    this.removeExpiredRecords();
                }
            });
        }
        static ensureAlarmIsScheduled() {
            if (!this.alarmIsActive) {
                chrome.alarms.create(LimitedCacheStorage.ALARM_NAME, { delayInMinutes: 1 });
                this.alarmIsActive = true;
            }
        }
        has(url) {
            return this.records.has(url);
        }
        get(url) {
            if (this.records.has(url)) {
                const record = this.records.get(url);
                record.expires = Date.now() + LimitedCacheStorage.TTL;
                this.records.delete(url);
                this.records.set(url, record);
                return record.value;
            }
            return null;
        }
        set(url, value) {
            LimitedCacheStorage.ensureAlarmIsScheduled();
            const size = getStringSize(value);
            if (size > LimitedCacheStorage.QUOTA_BYTES) {
                return;
            }
            for (const [url, record] of this.records) {
                if (this.bytesInUse + size > LimitedCacheStorage.QUOTA_BYTES) {
                    this.records.delete(url);
                    this.bytesInUse -= record.size;
                }
                else {
                    break;
                }
            }
            if (this.records.size === 0) {
                this.bytesInUse = 0;
            }
            const expires = Date.now() + LimitedCacheStorage.TTL;
            this.records.set(url, { url, value, size, expires });
            this.bytesInUse += size;
        }
        removeExpiredRecords() {
            const now = Date.now();
            for (const [url, record] of this.records) {
                if (record.expires < now) {
                    this.records.delete(url);
                    this.bytesInUse -= record.size;
                }
                else {
                    break;
                }
            }
            if (this.records.size === 0) {
                this.bytesInUse = 0;
            }
            else {
                LimitedCacheStorage.ensureAlarmIsScheduled();
            }
        }
    }
    function createLimiter() {
        const loadingUrls = new Set();
        const awaitingUrls = new Map();
        function loading(url) {
            const result = loadingUrls.has(url);
            loadingUrls.add(url);
            return result;
        }
        async function wait(url) {
            return new Promise((resolve) => {
                if (!awaitingUrls.has(url)) {
                    awaitingUrls.set(url, new Set());
                }
                awaitingUrls.get(url)?.add(resolve);
            });
        }
        async function loaded(url, data) {
            loadingUrls.delete(url);
            if (awaitingUrls.has(url)) {
                const response = { data };
                awaitingUrls.get(url).forEach((callback) => callback(response));
                awaitingUrls.delete(url);
            }
        }
        async function failed(url, error) {
            loadingUrls.delete(url);
            if (awaitingUrls.has(url)) {
                const response = { error };
                awaitingUrls.get(url).forEach((callback) => callback(response));
                awaitingUrls.delete(url);
            }
        }
        return { loading, wait, loaded, failed };
    }
    function createFileLoader() {
        const caches = {
            'data-url': new LimitedCacheStorage(),
            'text': new LimitedCacheStorage(),
        };
        const loaders = {
            'data-url': loadAsDataURL,
            'text': loadAsText,
        };
        const limiters = {
            'data-url': createLimiter(),
            'text': createLimiter(),
        };
        async function get({ url, responseType, mimeType, origin }) {
            const cache = caches[responseType];
            const load = loaders[responseType];
            const limiter = limiters[responseType];
            if (cache.has(url)) {
                const data = cache.get(url);
                return { data };
            }
            if (limiter.loading(url)) {
                return limiter.wait(url);
            }
            try {
                const data = await load(url, mimeType, origin);
                cache.set(url, data);
                limiter.loaded(url, data);
                return { data };
            }
            catch (error) {
                limiter.failed(url, error);
                return { error };
            }
        }
        return { get };
    }

    const CONFIG_URLs = {
        darkSites: {
            remote: `${CONFIG_URL_BASE}/dark-sites.config`,
            local: '../config/dark-sites.config',
        },
        dynamicThemeFixes: {
            remote: `${CONFIG_URL_BASE}/dynamic-theme-fixes.config`,
            local: '../config/dynamic-theme-fixes.config',
        },
        inversionFixes: {
            remote: `${CONFIG_URL_BASE}/inversion-fixes.config`,
            local: '../config/inversion-fixes.config',
        },
        staticThemes: {
            remote: `${CONFIG_URL_BASE}/static-themes.config`,
            local: '../config/static-themes.config',
        },
        colorSchemes: {
            remote: `${CONFIG_URL_BASE}/color-schemes.drconf`,
            local: '../config/color-schemes.drconf',
        },
        detectorHints: {
            remote: `${CONFIG_URL_BASE}/detector-hints.config`,
            local: '../config/detector-hints.config',
        },
    };
    const REMOTE_TIMEOUT_MS = getDuration({ seconds: 10 });
    class ConfigManager {
        static DARK_SITES_INDEX;
        static DETECTOR_HINTS_INDEX;
        static DETECTOR_HINTS_RAW;
        static DYNAMIC_THEME_FIXES_INDEX;
        static DYNAMIC_THEME_FIXES_RAW;
        static INVERSION_FIXES_INDEX;
        static INVERSION_FIXES_RAW;
        static STATIC_THEMES_INDEX;
        static STATIC_THEMES_RAW;
        static COLOR_SCHEMES_RAW;
        static raw = {
            darkSites: null,
            detectorHints: null,
            dynamicThemeFixes: null,
            inversionFixes: null,
            staticThemes: null,
            colorSchemes: null,
        };
        static overrides = {
            darkSites: null,
            detectorHints: null,
            dynamicThemeFixes: null,
            inversionFixes: null,
            staticThemes: null,
        };
        static async loadConfig({ name, local, localURL, remoteURL, }) {
            let $config;
            const loadLocal = async () => await readText({ url: localURL });
            if (local) {
                $config = await loadLocal();
            }
            else {
                try {
                    $config = await readText({
                        url: `${remoteURL}?nocache=${Date.now()}`,
                        timeout: REMOTE_TIMEOUT_MS,
                    });
                }
                catch (err) {
                    console.error(`${name} remote load error`, err);
                    $config = await loadLocal();
                }
            }
            return $config;
        }
        static async loadColorSchemes({ local }) {
            const $config = await ConfigManager.loadConfig({
                name: 'Color Schemes',
                local,
                localURL: CONFIG_URLs.colorSchemes.local,
                remoteURL: CONFIG_URLs.colorSchemes.remote,
            });
            ConfigManager.raw.colorSchemes = $config;
            ConfigManager.handleColorSchemes();
        }
        static async loadDarkSites({ local }) {
            const sites = await ConfigManager.loadConfig({
                name: 'Dark Sites',
                local,
                localURL: CONFIG_URLs.darkSites.local,
                remoteURL: CONFIG_URLs.darkSites.remote,
            });
            ConfigManager.raw.darkSites = sites;
            ConfigManager.handleDarkSites();
        }
        static async loadDetectorHints({ local }) {
            const $config = await ConfigManager.loadConfig({
                name: 'Detector Hints',
                local,
                localURL: CONFIG_URLs.detectorHints.local,
                remoteURL: CONFIG_URLs.detectorHints.remote,
            });
            ConfigManager.raw.detectorHints = $config;
            ConfigManager.handleDetectorHints();
        }
        static async loadDynamicThemeFixes({ local }) {
            const fixes = await ConfigManager.loadConfig({
                name: 'Dynamic Theme Fixes',
                local,
                localURL: CONFIG_URLs.dynamicThemeFixes.local,
                remoteURL: CONFIG_URLs.dynamicThemeFixes.remote,
            });
            ConfigManager.raw.dynamicThemeFixes = fixes;
            ConfigManager.handleDynamicThemeFixes();
        }
        static async loadInversionFixes({ local }) {
            const fixes = await ConfigManager.loadConfig({
                name: 'Inversion Fixes',
                local,
                localURL: CONFIG_URLs.inversionFixes.local,
                remoteURL: CONFIG_URLs.inversionFixes.remote,
            });
            ConfigManager.raw.inversionFixes = fixes;
            ConfigManager.handleInversionFixes();
        }
        static async loadStaticThemes({ local }) {
            const themes = await ConfigManager.loadConfig({
                name: 'Static Themes',
                local,
                localURL: CONFIG_URLs.staticThemes.local,
                remoteURL: CONFIG_URLs.staticThemes.remote,
            });
            ConfigManager.raw.staticThemes = themes;
            ConfigManager.handleStaticThemes();
        }
        static async load(config) {
            if (!config) {
                await UserStorage.loadSettings();
                config = {
                    local: !UserStorage.settings.syncSitesFixes,
                };
            }
            await Promise.all([
                ConfigManager.loadColorSchemes(config),
                ConfigManager.loadDarkSites(config),
                ConfigManager.loadDetectorHints(config),
                ConfigManager.loadDynamicThemeFixes(config),
                ConfigManager.loadInversionFixes(config),
                ConfigManager.loadStaticThemes(config),
            ]).catch((err) => console.error('Fatality', err));
        }
        static handleColorSchemes() {
            const $config = ConfigManager.raw.colorSchemes;
            const { result, error } = parseColorSchemeConfig($config || '');
            if (error) {
                logWarn(`Color Schemes parse error, defaulting to fallback. ${error}.`);
                ConfigManager.COLOR_SCHEMES_RAW = DEFAULT_COLORSCHEME;
                return;
            }
            ConfigManager.COLOR_SCHEMES_RAW = result;
        }
        static handleDarkSites() {
            const $sites = ConfigManager.raw.darkSites;
            ConfigManager.DARK_SITES_INDEX = indexSiteListConfig($sites || '');
        }
        static handleDetectorHints() {
            const $hints = ConfigManager.raw.detectorHints || '';
            ConfigManager.DETECTOR_HINTS_INDEX = indexSitesFixesConfig($hints);
            ConfigManager.DETECTOR_HINTS_RAW = $hints;
        }
        static handleDynamicThemeFixes() {
            const $fixes = ConfigManager.overrides.dynamicThemeFixes || ConfigManager.raw.dynamicThemeFixes || '';
            ConfigManager.DYNAMIC_THEME_FIXES_INDEX = indexSitesFixesConfig($fixes);
            ConfigManager.DYNAMIC_THEME_FIXES_RAW = $fixes;
        }
        static handleInversionFixes() {
            const $fixes = ConfigManager.overrides.inversionFixes || ConfigManager.raw.inversionFixes || '';
            ConfigManager.INVERSION_FIXES_INDEX = indexSitesFixesConfig($fixes);
            ConfigManager.INVERSION_FIXES_RAW = $fixes;
        }
        static handleStaticThemes() {
            const $themes = ConfigManager.overrides.staticThemes || ConfigManager.raw.staticThemes || '';
            ConfigManager.STATIC_THEMES_INDEX = indexSitesFixesConfig($themes);
            ConfigManager.STATIC_THEMES_RAW = $themes;
        }
        static isURLInDarkList(url) {
            return isURLInSiteList(url, ConfigManager.DARK_SITES_INDEX);
        }
    }

    class PersistentStorageWrapper {
        // Cache information within background context for future use without waiting.
        cache = {};
        async get(key) {
            if (key in this.cache) {
                return this.cache[key];
            }
            return new Promise((resolve) => {
                chrome.storage.local.get(key, (result) => {
                    // If cache received a new value (from call to set())
                    // before we retrieved the old value from storage,
                    // return the new value.
                    if (key in this.cache) {
                        logInfo(`Key ${key} was written to during read operation.`);
                        resolve(this.cache[key]);
                        return;
                    }
                    if (chrome.runtime.lastError) {
                        console.error('Failed to query DevTools data', chrome.runtime.lastError);
                        resolve(null);
                        return;
                    }
                    this.cache[key] = result[key];
                    resolve(result[key]);
                });
            });
        }
        async set(key, value) {
            this.cache[key] = value;
            return new Promise((resolve) => chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Failed to write DevTools data', chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            }));
        }
        async remove(key) {
            this.cache[key] = null;
            return new Promise((resolve) => chrome.storage.local.remove(key, () => {
                if (chrome.runtime.lastError) {
                    console.error('Failed to delete DevTools data', chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            }));
        }
        async has(key) {
            return Boolean(await this.get(key));
        }
    }
    class TempStorage {
        map = new Map();
        async get(key) {
            return this.map.get(key) || null;
        }
        set(key, value) {
            this.map.set(key, value);
        }
        remove(key) {
            this.map.delete(key);
        }
        async has(key) {
            return this.map.has(key);
        }
    }
    class DevTools {
        static onChange;
        static store;
        static init(onChange) {
            // Firefox don't seem to like using storage.local to store big data on the background-extension.
            // Disabling it for now and defaulting back to localStorage.
            if (typeof chrome.storage.local !== 'undefined' && chrome.storage.local !== null) {
                DevTools.store = new PersistentStorageWrapper();
            }
            else {
                DevTools.store = new TempStorage();
            }
            DevTools.loadConfigOverrides();
            DevTools.onChange = onChange;
        }
        static KEY_DYNAMIC = 'dev_dynamic_theme_fixes';
        static KEY_FILTER = 'dev_inversion_fixes';
        static KEY_STATIC = 'dev_static_themes';
        static async loadConfigOverrides() {
            const [dynamicThemeFixes, inversionFixes, staticThemes,] = await Promise.all([
                DevTools.getSavedDynamicThemeFixes(),
                DevTools.getSavedInversionFixes(),
                DevTools.getSavedStaticThemes(),
            ]);
            ConfigManager.overrides.dynamicThemeFixes = dynamicThemeFixes || null;
            ConfigManager.overrides.inversionFixes = inversionFixes || null;
            ConfigManager.overrides.staticThemes = staticThemes || null;
        }
        static async getSavedDynamicThemeFixes() {
            return DevTools.store.get(DevTools.KEY_DYNAMIC);
        }
        static saveDynamicThemeFixes(text) {
            DevTools.store.set(DevTools.KEY_DYNAMIC, text);
        }
        static async getDynamicThemeFixesText() {
            let rawFixes = await DevTools.getSavedDynamicThemeFixes();
            if (!rawFixes) {
                await ConfigManager.load();
                rawFixes = ConfigManager.DYNAMIC_THEME_FIXES_RAW || '';
            }
            const fixes = parseDynamicThemeFixes(rawFixes);
            return formatDynamicThemeFixes(fixes);
        }
        static resetDynamicThemeFixes() {
            DevTools.store.remove(DevTools.KEY_DYNAMIC);
            ConfigManager.overrides.dynamicThemeFixes = null;
            ConfigManager.handleDynamicThemeFixes();
            DevTools.onChange();
        }
        // TODO(Anton): remove any
        static applyDynamicThemeFixes(text) {
            try {
                const formatted = formatDynamicThemeFixes(parseDynamicThemeFixes(text));
                ConfigManager.overrides.dynamicThemeFixes = formatted;
                ConfigManager.handleDynamicThemeFixes();
                DevTools.saveDynamicThemeFixes(formatted);
                DevTools.onChange();
                return null;
            }
            catch (err) {
                return err;
            }
        }
        static async getSavedInversionFixes() {
            return this.store.get(DevTools.KEY_FILTER);
        }
        static saveInversionFixes(text) {
            this.store.set(DevTools.KEY_FILTER, text);
        }
        static async getInversionFixesText() {
            let rawFixes = await DevTools.getSavedInversionFixes();
            if (!rawFixes) {
                await ConfigManager.load();
                rawFixes = ConfigManager.INVERSION_FIXES_RAW || '';
            }
            const fixes = parseInversionFixes(rawFixes);
            return formatInversionFixes(fixes);
        }
        static resetInversionFixes() {
            DevTools.store.remove(DevTools.KEY_FILTER);
            ConfigManager.overrides.inversionFixes = null;
            ConfigManager.handleInversionFixes();
            DevTools.onChange();
        }
        // TODO(Anton): remove any
        static applyInversionFixes(text) {
            try {
                const formatted = formatInversionFixes(parseInversionFixes(text));
                ConfigManager.overrides.inversionFixes = formatted;
                ConfigManager.handleInversionFixes();
                DevTools.saveInversionFixes(formatted);
                DevTools.onChange();
                return null;
            }
            catch (err) {
                return err;
            }
        }
        static async getSavedStaticThemes() {
            return DevTools.store.get(DevTools.KEY_STATIC);
        }
        static saveStaticThemes(text) {
            DevTools.store.set(DevTools.KEY_STATIC, text);
        }
        static async getStaticThemesText() {
            let rawThemes = await DevTools.getSavedStaticThemes();
            if (!rawThemes) {
                await ConfigManager.load();
                rawThemes = ConfigManager.STATIC_THEMES_RAW || '';
            }
            const themes = parseStaticThemes(rawThemes);
            return formatStaticThemes(themes);
        }
        static resetStaticThemes() {
            DevTools.store.remove(DevTools.KEY_STATIC);
            ConfigManager.overrides.staticThemes = null;
            ConfigManager.handleStaticThemes();
            DevTools.onChange();
        }
        // TODO(Anton): remove any
        static applyStaticThemes(text) {
            try {
                const formatted = formatStaticThemes(parseStaticThemes(text));
                ConfigManager.overrides.staticThemes = formatted;
                ConfigManager.handleStaticThemes();
                DevTools.saveStaticThemes(formatted);
                DevTools.onChange();
                return null;
            }
            catch (err) {
                return err;
            }
        }
    }

    class IconManager {
        static ICON_PATHS = {
            activeDark: {
                19: '../icons/dr_active_19.png',
                38: '../icons/dr_active_38.png',
            },
            activeLight: {
                19: '../icons/dr_active_light_19.png',
                38: '../icons/dr_active_light_38.png',
            },
            // Temporary disable the gray icon
            /*
            inactiveDark: {
                19: '../icons/dr_inactive_dark_19.png',
                38: '../icons/dr_inactive_dark_38.png',
            },
            inactiveLight: {
                19: '../icons/dr_inactive_light_19.png',
                38: '../icons/dr_inactive_light_38.png',
            },
            */
        };
        static iconState = {
            badgeText: '',
            active: true,
        };
        static onStartup() {
            /**
             * This empty listener invokes extension background if extension has non-default
             * icon or badge. It is empty because all icon customizations will be initiated by
             * Extension class.
             * TODO: eventually, avoid running the whole Extension class on startup.
             */
        }
        /**
         * This method registers onStartup listener only if we are in non-persistent world and
         * icon is in non-default configuration.
         */
        static handleUpdate() {
            if (IconManager.iconState.badgeText !== '' || !IconManager.iconState.active) {
                chrome.runtime.onStartup.addListener(IconManager.onStartup);
            }
            else {
                chrome.runtime.onStartup.removeListener(IconManager.onStartup);
            }
        }
        static setIcon({ isActive = this.iconState.active, colorScheme = 'dark', tabId }) {
            if (!chrome.action.setIcon) {
                // Fix for Firefox Android and Thunderbird.
                return;
            }
            if (tabId) {
                return;
            }
            this.iconState.active = isActive;
            let path = this.ICON_PATHS.activeDark;
            if (isActive) {
                // Temporary disable the gray icon
                // path = colorScheme === 'dark' ? IconManager.ICON_PATHS.activeDark : IconManager.ICON_PATHS.activeLight;
                path = IconManager.ICON_PATHS.activeDark;
            }
            else {
                // Temporary disable the gray icon
                // path = colorScheme === 'dark' ? IconManager.ICON_PATHS.inactiveDark : IconManager.ICON_PATHS.inactiveLight;
                path = IconManager.ICON_PATHS.activeLight;
            }
            // Temporary disable per-site icons
            /*
            if (tabId) {
                chrome.action.setIcon({tabId, path});
            } else {
                chrome.action.setIcon({path});
                IconManager.handleUpdate();
            }
            */
            chrome.action.setIcon({ path });
            IconManager.handleUpdate();
        }
        static showBadge(text) {
            IconManager.iconState.badgeText = text;
            chrome.action.setBadgeBackgroundColor({ color: '#e96c4c' });
            chrome.action.setBadgeText({ text });
            IconManager.handleUpdate();
        }
        static hideBadge() {
            IconManager.iconState.badgeText = '';
            chrome.action.setBadgeText({ text: '' });
            IconManager.handleUpdate();
        }
    }

    class Messenger {
        static adapter;
        static changeListenerCount;
        static init(adapter) {
            Messenger.adapter = adapter;
            Messenger.changeListenerCount = 0;
            chrome.runtime.onMessage.addListener(Messenger.messageListener);
        }
        static messageListener(message, sender, sendResponse) {
            const allowedSenderURL = [
                chrome.runtime.getURL('/ui/popup/index.html'),
                chrome.runtime.getURL('/ui/devtools/index.html'),
                chrome.runtime.getURL('/ui/options/index.html'),
                chrome.runtime.getURL('/ui/stylesheet-editor/index.html'),
            ];
            if (allowedSenderURL.includes(sender.url) || (false)) {
                Messenger.onUIMessage(message, sendResponse);
                return ([
                    MessageTypeUItoBG.GET_DATA,
                    MessageTypeUItoBG.GET_DEVTOOLS_DATA,
                ].includes(message.type));
            }
        }
        static firefoxPortListener(port) {
            ASSERT('Messenger.firefoxPortListener() is used only on Firefox', isFirefox);
            {
                return;
            }
        }
        static onUIMessage({ type, data }, sendResponse) {
            switch (type) {
                case MessageTypeUItoBG.GET_DATA:
                    Messenger.adapter.collect().then((data) => sendResponse({ data }));
                    break;
                case MessageTypeUItoBG.GET_DEVTOOLS_DATA:
                    Messenger.adapter.collectDevToolsData().then((data) => sendResponse({ data }));
                    break;
                case MessageTypeUItoBG.SUBSCRIBE_TO_CHANGES:
                    Messenger.changeListenerCount++;
                    break;
                case MessageTypeUItoBG.UNSUBSCRIBE_FROM_CHANGES:
                    Messenger.changeListenerCount--;
                    break;
                case MessageTypeUItoBG.CHANGE_SETTINGS:
                    Messenger.adapter.changeSettings(data);
                    break;
                case MessageTypeUItoBG.SET_THEME:
                    Messenger.adapter.setTheme(data);
                    break;
                case MessageTypeUItoBG.TOGGLE_ACTIVE_TAB:
                    Messenger.adapter.toggleActiveTab();
                    break;
                case MessageTypeUItoBG.MARK_NEWS_AS_READ:
                    Messenger.adapter.markNewsAsRead(data);
                    break;
                case MessageTypeUItoBG.MARK_NEWS_AS_DISPLAYED:
                    Messenger.adapter.markNewsAsDisplayed(data);
                    break;
                case MessageTypeUItoBG.LOAD_CONFIG:
                    Messenger.adapter.loadConfig(data);
                    break;
                case MessageTypeUItoBG.APPLY_DEV_DYNAMIC_THEME_FIXES: {
                    const error = Messenger.adapter.applyDevDynamicThemeFixes(data);
                    sendResponse({ error: (error ? error.message : undefined) });
                    break;
                }
                case MessageTypeUItoBG.RESET_DEV_DYNAMIC_THEME_FIXES:
                    Messenger.adapter.resetDevDynamicThemeFixes();
                    break;
                case MessageTypeUItoBG.APPLY_DEV_INVERSION_FIXES: {
                    const error = Messenger.adapter.applyDevInversionFixes(data);
                    sendResponse({ error: (error ? error.message : undefined) });
                    break;
                }
                case MessageTypeUItoBG.RESET_DEV_INVERSION_FIXES:
                    Messenger.adapter.resetDevInversionFixes();
                    break;
                case MessageTypeUItoBG.APPLY_DEV_STATIC_THEMES: {
                    const error = Messenger.adapter.applyDevStaticThemes(data);
                    sendResponse({ error: error ? error.message : undefined });
                    break;
                }
                case MessageTypeUItoBG.RESET_DEV_STATIC_THEMES:
                    Messenger.adapter.resetDevStaticThemes();
                    break;
                case MessageTypeUItoBG.START_ACTIVATION:
                    Messenger.adapter.startActivation(data.email, data.key);
                    break;
                case MessageTypeUItoBG.RESET_ACTIVATION:
                    Messenger.adapter.resetActivation();
                    break;
                case MessageTypeUItoBG.HIDE_HIGHLIGHTS:
                    Messenger.adapter.hideHighlights(data);
                    break;
            }
        }
        static reportChanges(data) {
            if (Messenger.changeListenerCount > 0) {
                chrome.runtime.sendMessage({
                    type: MessageTypeBGtoUI.CHANGES,
                    data,
                });
            }
        }
    }

    class Newsmaker {
        static UPDATE_INTERVAL = getDurationInMinutes({ hours: 4 });
        static ALARM_NAME = 'newsmaker';
        static LOCAL_STORAGE_KEY = 'Newsmaker-state';
        static initialized;
        static stateManager;
        static latest;
        static latestTimestamp;
        static init() {
            if (Newsmaker.initialized) {
                // This path is never taken since Extension.constructor() ever creates one instance.
                logWarn('Attempting to re-initialize Newsmaker. Doing nothing.');
                return;
            }
            Newsmaker.initialized = true;
            Newsmaker.stateManager = new StateManager(Newsmaker.LOCAL_STORAGE_KEY, this, { latest: [], latestTimestamp: null }, logWarn);
            Newsmaker.latest = [];
            Newsmaker.latestTimestamp = null;
        }
        static onUpdate() {
            Newsmaker.init();
            const latestNews = Newsmaker.latest.length > 0 && Newsmaker.latest[0];
            if (latestNews && latestNews.badge && !latestNews.read && !latestNews.displayed) {
                IconManager.showBadge(latestNews.badge);
                return;
            }
            IconManager.hideBadge();
        }
        static async getLatest() {
            Newsmaker.init();
            await Newsmaker.stateManager.loadState();
            return Newsmaker.latest;
        }
        static alarmListener = (alarm) => {
            Newsmaker.init();
            if (alarm.name === Newsmaker.ALARM_NAME) {
                Newsmaker.updateNews();
            }
        };
        static subscribe() {
            Newsmaker.init();
            if ((Newsmaker.latestTimestamp === null) || (Newsmaker.latestTimestamp + Newsmaker.UPDATE_INTERVAL < Date.now())) {
                Newsmaker.updateNews();
            }
            chrome.alarms.onAlarm.addListener(Newsmaker.alarmListener);
            chrome.alarms.create(Newsmaker.ALARM_NAME, { periodInMinutes: Newsmaker.UPDATE_INTERVAL });
        }
        static unSubscribe() {
            // No need to call Newsmaker.init()
            chrome.alarms.onAlarm.removeListener(Newsmaker.alarmListener);
            chrome.alarms.clear(Newsmaker.ALARM_NAME);
        }
        static async updateNews() {
            Newsmaker.init();
            const news = await Newsmaker.getNews();
            if (Array.isArray(news)) {
                Newsmaker.latest = news;
                Newsmaker.latestTimestamp = Date.now();
                Newsmaker.onUpdate();
                await Newsmaker.stateManager.saveState();
            }
        }
        static async getReadNews() {
            Newsmaker.init();
            const [sync, local,] = await Promise.all([
                readSyncStorage({ readNews: [] }),
                readLocalStorage({ readNews: [] }),
            ]);
            return Array.from(new Set([
                ...sync ? sync.readNews : [],
                ...local ? local.readNews : [],
            ]));
        }
        static async getDisplayedNews() {
            Newsmaker.init();
            const [sync, local,] = await Promise.all([
                readSyncStorage({ displayedNews: [] }),
                readLocalStorage({ displayedNews: [] }),
            ]);
            return Array.from(new Set([
                ...sync ? sync.displayedNews : [],
                ...local ? local.displayedNews : [],
            ]));
        }
        static async getNews() {
            Newsmaker.init();
            try {
                const response = await fetch(NEWS_URL, { cache: 'no-cache' });
                const $news = await response.json();
                const readNews = await Newsmaker.getReadNews();
                const displayedNews = await Newsmaker.getDisplayedNews();
                const news = $news.map((n) => {
                    const url = getBlogPostURL(n.id);
                    const read = Newsmaker.wasRead(n.id, readNews);
                    const displayed = Newsmaker.wasDisplayed(n.id, displayedNews);
                    return { ...n, url, read, displayed };
                });
                for (let i = 0; i < news.length; i++) {
                    const date = new Date(news[i].date);
                    if (isNaN(date.getTime())) {
                        throw new Error(`Unable to parse date ${date}`);
                    }
                }
                return news;
            }
            catch (err) {
                console.error(err);
                return null;
            }
        }
        static async markAsRead(ids) {
            Newsmaker.init();
            const readNews = await Newsmaker.getReadNews();
            const results = readNews.slice();
            let changed = false;
            ids.forEach((id) => {
                if (readNews.indexOf(id) < 0) {
                    results.push(id);
                    changed = true;
                }
            });
            if (changed) {
                Newsmaker.latest = Newsmaker.latest.map((n) => {
                    const read = Newsmaker.wasRead(n.id, results);
                    return { ...n, read };
                });
                Newsmaker.onUpdate();
                const obj = { readNews: results };
                await Promise.all([
                    writeLocalStorage(obj),
                    writeSyncStorage(obj),
                    Newsmaker.stateManager.saveState(),
                ]);
            }
        }
        static async markAsDisplayed(ids) {
            Newsmaker.init();
            const displayedNews = await Newsmaker.getDisplayedNews();
            const results = displayedNews.slice();
            let changed = false;
            ids.forEach((id) => {
                if (displayedNews.indexOf(id) < 0) {
                    results.push(id);
                    changed = true;
                }
            });
            if (changed) {
                Newsmaker.latest = Newsmaker.latest.map((n) => {
                    const displayed = Newsmaker.wasDisplayed(n.id, results);
                    return { ...n, displayed };
                });
                Newsmaker.onUpdate();
                const obj = { displayedNews: results };
                await Promise.all([
                    writeLocalStorage(obj),
                    writeSyncStorage(obj),
                    Newsmaker.stateManager.saveState(),
                ]);
            }
        }
        static wasRead(id, readNews) {
            return readNews.includes(id);
        }
        static wasDisplayed(id, displayedNews) {
            return displayedNews.includes(id);
        }
    }

    // On Thunderbird, sometimes sender.tab is undefined but accessing it will throw a very nice error.
    // On Vivaldi, sometimes sender.tab is undefined as well, but error is not very helpful.
    // On Opera, sender.tab.index === -1.
    function isPanel(sender) {
        return typeof sender === 'undefined' || typeof sender.tab === 'undefined' || (isOpera && sender.tab.index === -1);
    }

    /**
     * These states correspond to possible document states in Page Lifecycle API:
     * https://developers.google.com/web/updates/2018/07/page-lifecycle-api#developer-recommendations-for-each-state
     * Some states are not currently used (they are declared for future-proofing).
     */
    var DocumentState;
    (function (DocumentState) {
        DocumentState[DocumentState["ACTIVE"] = 0] = "ACTIVE";
        DocumentState[DocumentState["PASSIVE"] = 1] = "PASSIVE";
        DocumentState[DocumentState["HIDDEN"] = 2] = "HIDDEN";
        DocumentState[DocumentState["FROZEN"] = 3] = "FROZEN";
        DocumentState[DocumentState["TERMINATED"] = 4] = "TERMINATED";
        DocumentState[DocumentState["DISCARDED"] = 5] = "DISCARDED";
    })(DocumentState || (DocumentState = {}));
    /**
     * Note: On Chromium builds, we use documentId if it is available.
     * We avoid messaging using frameId entirely since when document is pre-rendered, it gets a temporary frameId
     * and if we attempt to send to {frameId, documentId} with old frameId, then the message will be dropped.
     */
    class TabManager {
        static tabs;
        static stateManager;
        static fileLoader = null;
        static onColorSchemeChange;
        static getTabMessage;
        static timestamp;
        static LOCAL_STORAGE_KEY = 'TabManager-state';
        static init({ getConnectionMessage, onColorSchemeChange, getTabMessage }) {
            TabManager.stateManager = new StateManager(TabManager.LOCAL_STORAGE_KEY, this, { tabs: {}, timestamp: 0 }, logWarn);
            TabManager.tabs = {};
            TabManager.onColorSchemeChange = onColorSchemeChange;
            TabManager.getTabMessage = getTabMessage;
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                switch (message.type) {
                    case MessageTypeCStoBG.DOCUMENT_CONNECT: {
                        if (isPanel(sender)) {
                            sendResponse({
                                type: MessageTypeBGtoCS.UNSUPPORTED_SENDER,
                            });
                            return false;
                        }
                        TabManager.onColorSchemeMessage(message, sender);
                        const reply = (tabURL, url, isTopFrame, topFrameHasDarkTheme) => {
                            getConnectionMessage(tabURL, url, isTopFrame, topFrameHasDarkTheme).then((response) => {
                                if (!response) {
                                    return;
                                }
                                response.scriptId = message.scriptId;
                                TabManager.sendDocumentMessage(sender.tab.id, sender.documentId, response, sender.frameId);
                            });
                        };
                        if (isPanel(sender)) {
                            // NOTE: Vivaldi and Opera can show a page in a side panel,
                            // but it is not possible to handle messaging correctly (no tab ID, frame ID).
                            {
                                sendResponse('unsupportedSender');
                            }
                            return false;
                        }
                        const { frameId } = sender;
                        const isTopFrame = (frameId === 0 || message.data.isTopFrame) ;
                        const url = sender.url;
                        const tabId = sender.tab.id;
                        const scriptId = message.scriptId;
                        // Chromium 106+ may prerender frames resulting in top-level frames with chrome.runtime.MessageSender.tab.url
                        // set to chrome://newtab/ and positive chrome.runtime.MessageSender.frameId
                        const tabURL = (isTopFrame) ? url : sender.tab.url;
                        const documentId = sender.documentId ;
                        TabManager.stateManager.loadState().then(() => {
                            TabManager.addFrame(tabId, frameId, documentId, scriptId, url, isTopFrame);
                            const topFrameHasDarkTheme = isTopFrame ? false : TabManager.tabs[tabId]?.[0]?.darkThemeDetected;
                            reply(tabURL, url, isTopFrame, topFrameHasDarkTheme);
                            TabManager.stateManager.saveState();
                        });
                        break;
                    }
                    case MessageTypeCStoBG.DOCUMENT_FORGET:
                        if (!sender.tab) {
                            logWarn('Unexpected message', message, sender);
                            break;
                        }
                        ASSERT('Has a scriptId', () => Boolean(message.scriptId));
                        TabManager.removeFrame(sender.tab.id, sender.frameId);
                        break;
                    case MessageTypeCStoBG.DOCUMENT_FREEZE: {
                        TabManager.stateManager.loadState().then(() => {
                            const info = TabManager.tabs[sender.tab.id][sender.frameId];
                            info.state = DocumentState.FROZEN;
                            info.url = null;
                            TabManager.stateManager.saveState();
                        });
                        break;
                    }
                    case MessageTypeCStoBG.DOCUMENT_RESUME: {
                        TabManager.onColorSchemeMessage(message, sender);
                        const tabId = sender.tab.id;
                        const tabURL = sender.tab.url;
                        const frameId = sender.frameId;
                        const url = sender.url;
                        const documentId = sender.documentId ;
                        const isTopFrame = (frameId === 0 || message.data.isTopFrame) ;
                        TabManager.stateManager.loadState().then(() => {
                            if (TabManager.tabs[tabId][frameId].timestamp < TabManager.timestamp) {
                                const response = TabManager.getTabMessage(tabURL, url, isTopFrame);
                                response.scriptId = message.scriptId;
                                TabManager.sendDocumentMessage(tabId, documentId, response, frameId);
                            }
                            TabManager.tabs[sender.tab.id][sender.frameId] = {
                                documentId,
                                scriptId: message.scriptId,
                                url,
                                isTop: isTopFrame || undefined,
                                state: DocumentState.ACTIVE,
                                darkThemeDetected: false,
                                timestamp: TabManager.timestamp,
                            };
                            TabManager.stateManager.saveState();
                        });
                        break;
                    }
                    case MessageTypeCStoBG.DARK_THEME_DETECTED: {
                        const tabId = sender.tab.id;
                        const frames = TabManager.tabs[tabId];
                        if (!frames) {
                            break;
                        }
                        for (const entry of Object.entries(frames)) {
                            const frameId = Number(entry[0]);
                            const frame = entry[1];
                            frame.darkThemeDetected = true;
                            const { documentId, scriptId } = frame;
                            if (documentId) {
                                const message = {
                                    type: MessageTypeBGtoCS.CLEAN_UP,
                                    scriptId,
                                };
                                TabManager.sendDocumentMessage(tabId, documentId, message, frameId);
                            }
                            if (frameId === 0) {
                                IconManager.setIcon({ tabId, isActive: false });
                            }
                        }
                        break;
                    }
                    case MessageTypeCStoBG.FETCH: {
                        // Using custom response due to Chrome and Firefox incompatibility
                        // Sometimes fetch error behaves like synchronous and sends `undefined`
                        const id = message.id;
                        // We do not need to use scriptId here since every request has a unique id already
                        const sendResponse = (response) => {
                            TabManager.sendDocumentMessage(sender.tab.id, sender.documentId, { type: MessageTypeBGtoCS.FETCH_RESPONSE, id, ...response }, sender.frameId);
                        };
                        const { url, responseType, mimeType, origin } = message.data;
                        if (!TabManager.fileLoader) {
                            TabManager.fileLoader = createFileLoader();
                        }
                        TabManager.fileLoader.get({ url, responseType, mimeType, origin }).then((response) => {
                            if (response.error) {
                                const err = response.error;
                                sendResponse({ error: err?.message ?? err });
                            }
                            else {
                                sendResponse({ data: response.data });
                            }
                        });
                        return true;
                    }
                    case MessageTypeUItoBG.COLOR_SCHEME_CHANGE:
                    // fallthrough
                    case MessageTypeCStoBG.COLOR_SCHEME_CHANGE:
                        TabManager.onColorSchemeMessage(message, sender);
                        break;
                }
                return false;
            });
            chrome.tabs.onRemoved.addListener(async (tabId) => TabManager.removeFrame(tabId, 0));
        }
        static sendDocumentMessage(tabId, documentId, message, frameId) {
            if (frameId === 0) {
                const themeMessageTypes = [
                    MessageTypeBGtoCS.ADD_CSS_FILTER,
                    MessageTypeBGtoCS.ADD_DYNAMIC_THEME,
                    MessageTypeBGtoCS.ADD_STATIC_THEME,
                    MessageTypeBGtoCS.ADD_SVG_FILTER,
                ];
                if (themeMessageTypes.includes(message.type)) {
                    IconManager.setIcon({ tabId, isActive: true, colorScheme: message.data?.theme?.mode ? 'dark' : 'light' });
                }
                else if (message.type === MessageTypeBGtoCS.CLEAN_UP) {
                    const isActive = TabManager.tabs[tabId]?.[0]?.url?.startsWith('https://darkreader.org/');
                    IconManager.setIcon({ tabId, isActive });
                }
            }
            {
                // On MV3, Chromium has a bug which prevents sending messages to pre-rendered frames without specifying frameId
                // Furthermore, if we send a message addressed to a temporary frameId after the document exits prerender state,
                // the message will also fail to be delivered.
                //
                // To work around this:
                //  1. Attempt to send the message by documentId. If this fails, this means the document is in prerender state.
                //  2. Attempt to send the message by documentId and temporary frameId. If this fails, this means the document
                //     either already exited pre-rendered state or was discarded.
                //  3. Attempt to send the message by documentId (omitting the permanent frameId which is 0).If this fails, this
                //     means the document was already discarded.
                //
                // More info: https://crbug.com/1455817
                chrome.tabs.sendMessage(tabId, message, { documentId }).catch(() => chrome.tabs.sendMessage(tabId, message, { frameId, documentId }).catch(() => chrome.tabs.sendMessage(tabId, message, { documentId }).catch(() => { })));
                return;
            }
        }
        static onColorSchemeMessage(message, sender) {
            ASSERT('TabManager.onColorSchemeMessage is set', () => Boolean(TabManager.onColorSchemeChange));
            // We honor only messages which come from tab's top frame
            // because sub-frames color scheme can be overridden by style with prefers-color-scheme
            // TODO(MV3): instead of dropping these messages, consider making a query to an authoritative source
            // like offscreen document
            if (sender && sender.frameId === 0) {
                TabManager.onColorSchemeChange(message.data.isDark);
            }
        }
        static addFrame(tabId, frameId, documentId, scriptId, url, isTop) {
            let frames;
            if (TabManager.tabs[tabId]) {
                frames = TabManager.tabs[tabId];
            }
            else {
                frames = {};
                TabManager.tabs[tabId] = frames;
            }
            frames[frameId] = {
                documentId,
                scriptId,
                url,
                isTop: isTop || undefined,
                state: DocumentState.ACTIVE,
                darkThemeDetected: false,
                timestamp: TabManager.timestamp,
            };
        }
        static async removeFrame(tabId, frameId) {
            await TabManager.stateManager.loadState();
            if (frameId === 0) {
                delete TabManager.tabs[tabId];
            }
            if (TabManager.tabs[tabId] && TabManager.tabs[tabId][frameId]) {
                // We need to use delete here because Object.entries()
                // in sendMessage() would enumerate undefined as well.
                delete TabManager.tabs[tabId][frameId];
            }
            TabManager.stateManager.saveState();
        }
        static async cleanState() {
            await TabManager.stateManager.loadState();
            const actualTabs = await queryTabs({});
            const tabIds = Object.keys(TabManager.tabs).map((id) => Number(id));
            const staleTabs = new Set(tabIds);
            actualTabs.forEach((actualTab) => {
                const tabId = actualTab.id;
                if (tabId) {
                    staleTabs.delete(tabId);
                }
            });
            staleTabs.forEach((staleTabId) => {
                if (TabManager.tabs[staleTabId]) {
                    delete TabManager.tabs[staleTabId];
                }
            });
            TabManager.stateManager.saveState();
        }
        static async getTabURL(tab) {
            {
                if (!tab) {
                    return 'about:blank';
                }
                try {
                    return (await chrome.tabs.get(tab.id)).url || 'about:blank';
                }
                catch (e) {
                    try {
                        return (await chrome.scripting.executeScript({
                            target: {
                                tabId: tab.id,
                                frameIds: [0],
                            },
                            world: 'MAIN',
                            injectImmediately: true,
                            func: () => window.location.href,
                        }))[0].result || 'about:blank';
                    }
                    catch (e) {
                        const errMessage = String(e);
                        if (errMessage.includes('chrome://') ||
                            errMessage.includes('chrome-extension://') ||
                            errMessage.includes('gallery')) {
                            return 'chrome://protected';
                        }
                        return 'about:blank';
                    }
                }
            }
            // It can happen in cases whereby the tab.url is empty.
            // Luckily this only and will only happen on `about:blank`-like pages.
            // Due to this we can safely use `about:blank` as fallback value.
            // In some extraordinary circumstances tab may be undefined.
            return tab && tab.url || 'about:blank';
        }
        static async updateContentScript(options) {
            (await queryTabs({ discarded: false }))
                .filter((tab) => true)
                .filter((tab) => !TabManager.tabs[tab.id])
                .forEach((tab) => {
                {
                    chrome.scripting.executeScript({
                        target: {
                            tabId: tab.id,
                            allFrames: true,
                        },
                        files: ['/inject/index.js'],
                    }, () => logInfo('Could not update content script in tab', tab, chrome.runtime.lastError));
                }
            });
        }
        static async registerMailDisplayScript() {
            await chrome.messageDisplayScripts.register({
                js: [
                    { file: '/inject/fallback.js' },
                    { file: '/inject/index.js' },
                ],
            });
        }
        // sendMessage will send a tab messages to all active tabs and their frames.
        // If onlyUpdateActiveTab is specified, it will only send a new message to any
        // tab that matches the active tab's hostname. This is to ensure that when a user
        // has multiple tabs of the same website, every tab will receive the new message
        // and not just that tab as Dark Reader currently doesn't have per-tab operations,
        // this should be the expected behavior.
        static async sendMessage(onlyUpdateActiveTab = false) {
            TabManager.timestamp++;
            const activeTabHostname = onlyUpdateActiveTab ? getURLHostOrProtocol(await TabManager.getActiveTabURL()) : null;
            (await queryTabs({ discarded: false }))
                .filter((tab) => Boolean(TabManager.tabs[tab.id]))
                .forEach((tab) => {
                const frames = TabManager.tabs[tab.id];
                Object.entries(frames)
                    .filter(([, { state }]) => state === DocumentState.ACTIVE || state === DocumentState.PASSIVE)
                    .forEach(async ([id, { url, documentId, scriptId, isTop }]) => {
                    const frameId = Number(id);
                    const tabURL = await TabManager.getTabURL(tab);
                    // Check if hostname are equal when we only want to update active tab.
                    if (onlyUpdateActiveTab && getURLHostOrProtocol(tabURL) !== activeTabHostname) {
                        return;
                    }
                    const message = TabManager.getTabMessage(tabURL, url, isTop || false);
                    message.scriptId = scriptId;
                    if (tab.active && isTop) {
                        TabManager.sendDocumentMessage(tab.id, documentId, message, frameId);
                    }
                    else {
                        setTimeout(() => {
                            TabManager.sendDocumentMessage(tab.id, documentId, message, frameId);
                        });
                    }
                    if (TabManager.tabs[tab.id][frameId]) {
                        TabManager.tabs[tab.id][frameId].timestamp = TabManager.timestamp;
                    }
                });
            });
        }
        static canAccessTab(tab) {
            return tab && Boolean(TabManager.tabs[tab.id]) || false;
        }
        static getTabDocumentId(tab) {
            return tab && TabManager.tabs[tab.id] && TabManager.tabs[tab.id][0] && TabManager.tabs[tab.id][0].documentId;
        }
        static isTabDarkThemeDetected(tab) {
            return tab && TabManager.tabs[tab.id] && TabManager.tabs[tab.id][0] && TabManager.tabs[tab.id][0].darkThemeDetected || null;
        }
        static async getActiveTabURL() {
            return TabManager.getTabURL(await getActiveTab());
        }
    }

    const proposedHighlights = [
        'anniversary',
    ];
    const KEY_UI_HIDDEN_HIGHLIGHTS = 'ui-hidden-highlights';
    async function getHiddenHighlights() {
        const options = await readLocalStorage({ [KEY_UI_HIDDEN_HIGHLIGHTS]: [] });
        return options[KEY_UI_HIDDEN_HIGHLIGHTS];
    }
    async function getHighlightsToShow() {
        const hiddenHighlights = await getHiddenHighlights();
        return proposedHighlights.filter((h) => !hiddenHighlights.includes(h));
    }
    async function hideHighlights(keys) {
        const hiddenHighlights = await getHiddenHighlights();
        const update = Array.from(new Set([...hiddenHighlights, ...keys]));
        await writeLocalStorage({ [KEY_UI_HIDDEN_HIGHLIGHTS]: update });
    }
    async function restoreHighlights(keys) {
        const hiddenHighlights = await getHiddenHighlights();
        const update = Array.from(new Set([...hiddenHighlights.filter((h) => !keys.includes(h))]));
        await writeLocalStorage({ [KEY_UI_HIDDEN_HIGHLIGHTS]: update });
    }
    var UIHighlights = {
        getHighlightsToShow,
        hideHighlights,
        restoreHighlights,
    };

    // evalMath is a function that's able to evaluates a mathematical expression and return it's output.
    //
    // Internally it uses the Shunting Yard algorithm. First it produces a reverse polish notation(RPN) stack.
    // Example: 1 + 2 * 3 -> [1, 2, 3, *, +] which with parentheses means 1 (2 3 *) +
    //
    // Then it evaluates the RPN stack and returns the output.
    function evalMath(expression) {
        // Stack where operators & numbers are stored in RPN.
        const rpnStack = [];
        // The working stack where new tokens are pushed.
        const workingStack = [];
        let lastToken;
        // Iterate over the expression.
        for (let i = 0, len = expression.length; i < len; i++) {
            const token = expression[i];
            // Skip if the token is empty or a whitespace.
            if (!token || token === ' ') {
                continue;
            }
            // Is the token a operator?
            if (operators.has(token)) {
                const op = operators.get(token);
                // Go trough the workingstack and determine it's place in the workingStack
                while (workingStack.length) {
                    const currentOp = operators.get(workingStack[0]);
                    if (!currentOp) {
                        break;
                    }
                    // Is the current operation equal or less than the current operation?
                    // Then move that operation to the rpnStack.
                    if (op.lessOrEqualThan(currentOp)) {
                        rpnStack.push(workingStack.shift());
                    }
                    else {
                        break;
                    }
                }
                // Add the operation to the workingStack.
                workingStack.unshift(token);
                // Otherwise was the last token a operator?
            }
            else if (!lastToken || operators.has(lastToken)) {
                rpnStack.push(token);
                // Otherwise just append the result to the last token(e.g. multiple digits numbers).
            }
            else {
                rpnStack[rpnStack.length - 1] += token;
            }
            // Set the last token.
            lastToken = token;
        }
        // Push the working stack on top of the rpnStack.
        rpnStack.push(...workingStack);
        // Now evaluate the rpnStack.
        const stack = [];
        for (let i = 0, len = rpnStack.length; i < len; i++) {
            const op = operators.get(rpnStack[i]);
            if (op) {
                // Get the arguments of for the operation(first two in the stack).
                const args = stack.splice(0, 2);
                // Excute it, because of reverse notation we first pass second item then the first item.
                stack.push(op.exec(args[1], args[0]));
            }
            else {
                // Add the number to the stack.
                stack.unshift(parseFloat(rpnStack[i]));
            }
        }
        return stack[0];
    }
    // Operator class  defines a operator that can be parsed & evaluated by evalMath.
    class Operator {
        precendce;
        execMethod;
        constructor(precedence, method) {
            this.precendce = precedence;
            this.execMethod = method;
        }
        exec(left, right) {
            return this.execMethod(left, right);
        }
        lessOrEqualThan(op) {
            return this.precendce <= op.precendce;
        }
    }
    const operators = new Map([
        ['+', new Operator(1, (left, right) => left + right)],
        ['-', new Operator(1, (left, right) => left - right)],
        ['*', new Operator(2, (left, right) => left * right)],
        ['/', new Operator(2, (left, right) => left / right)],
    ]);

    const hslaParseCache = new Map();
    const rgbaParseCache = new Map();
    function parseColorWithCache($color) {
        $color = $color.trim();
        if (rgbaParseCache.has($color)) {
            return rgbaParseCache.get($color);
        }
        // We cannot _really_ parse any color which has the calc() expression,
        // so we try our best to remove those and then parse the value.
        if ($color.includes('calc(')) {
            $color = lowerCalcExpression($color);
        }
        const color = parse($color);
        if (color) {
            rgbaParseCache.set($color, color);
            return color;
        }
        return null;
    }
    function parseToHSLWithCache(color) {
        if (hslaParseCache.has(color)) {
            return hslaParseCache.get(color);
        }
        const rgb = parseColorWithCache(color);
        if (!rgb) {
            return null;
        }
        const hsl = rgbToHSL(rgb);
        hslaParseCache.set(color, hsl);
        return hsl;
    }
    // https://en.wikipedia.org/wiki/HSL_and_HSV
    function hslToRGB({ h, s, l, a = 1 }) {
        if (s === 0) {
            const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
            return { r, g, b, a };
        }
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        const [r, g, b] = (h < 60 ? [c, x, 0] :
            h < 120 ? [x, c, 0] :
                h < 180 ? [0, c, x] :
                    h < 240 ? [0, x, c] :
                        h < 300 ? [x, 0, c] :
                            [c, 0, x]).map((n) => Math.round((n + m) * 255));
        return { r, g, b, a };
    }
    // https://en.wikipedia.org/wiki/HSL_and_HSV
    function rgbToHSL({ r: r255, g: g255, b: b255, a = 1 }) {
        const r = r255 / 255;
        const g = g255 / 255;
        const b = b255 / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const c = max - min;
        const l = (max + min) / 2;
        if (c === 0) {
            return { h: 0, s: 0, l, a };
        }
        let h = (max === r ? (((g - b) / c) % 6) :
            max === g ? ((b - r) / c + 2) :
                ((r - g) / c + 4)) * 60;
        if (h < 0) {
            h += 360;
        }
        const s = c / (1 - Math.abs(2 * l - 1));
        return { h, s, l, a };
    }
    function toFixed(n, digits = 0) {
        const fixed = n.toFixed(digits);
        if (digits === 0) {
            return fixed;
        }
        const dot = fixed.indexOf('.');
        if (dot >= 0) {
            const zerosMatch = fixed.match(/0+$/);
            if (zerosMatch) {
                if (zerosMatch.index === dot + 1) {
                    return fixed.substring(0, dot);
                }
                return fixed.substring(0, zerosMatch.index);
            }
        }
        return fixed;
    }
    function rgbToString(rgb) {
        const { r, g, b, a } = rgb;
        if (a != null && a < 1) {
            return `rgba(${toFixed(r)}, ${toFixed(g)}, ${toFixed(b)}, ${toFixed(a, 2)})`;
        }
        return `rgb(${toFixed(r)}, ${toFixed(g)}, ${toFixed(b)})`;
    }
    function rgbToHexString({ r, g, b, a }) {
        return `#${(a != null && a < 1 ? [r, g, b, Math.round(a * 255)] : [r, g, b]).map((x) => {
        return `${x < 16 ? '0' : ''}${x.toString(16)}`;
    }).join('')}`;
    }
    const rgbMatch = /^rgba?\([^\(\)]+\)$/;
    const hslMatch = /^hsla?\([^\(\)]+\)$/;
    const hexMatch = /^#[0-9a-f]+$/i;
    const supportedColorFuncs = [
        'color',
        'color-mix',
        'hwb',
        'lab',
        'lch',
        'oklab',
        'oklch',
    ];
    function parse($color) {
        const c = $color.trim().toLowerCase();
        if (c.includes('(from ')) {
            if (c.indexOf('(from') !== c.lastIndexOf('(from')) {
                return null;
            }
            return domParseColor(c);
        }
        if (c.match(rgbMatch)) {
            if (c.startsWith('rgb(#') || c.startsWith('rgba(#')) {
                if (c.lastIndexOf('rgb') > 0) {
                    return null;
                }
                return domParseColor(c);
            }
            return parseRGB(c);
        }
        if (c.match(hslMatch)) {
            return parseHSL(c);
        }
        if (c.match(hexMatch)) {
            return parseHex(c);
        }
        if (knownColors.has(c)) {
            return getColorByName(c);
        }
        if (systemColors.has(c)) {
            return getSystemColor(c);
        }
        if (c === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        if (c.endsWith(')') &&
            supportedColorFuncs.some((fn) => c.startsWith(fn) && c[fn.length] === '(' && c.lastIndexOf(fn) === 0)) {
            return domParseColor(c);
        }
        if (c.startsWith('light-dark(') && c.endsWith(')')) {
            // light-dark([color()], [color()])
            const match = c.match(/^light-dark\(\s*([a-z]+(\(.*\))?),\s*([a-z]+(\(.*\))?)\s*\)$/);
            if (match) {
                const schemeColor = isSystemDarkModeEnabled() ? match[3] : match[1];
                return parse(schemeColor);
            }
        }
        return null;
    }
    function getNumbers($color) {
        const numbers = [];
        let prevPos = 0;
        let isMining = false;
        // Get the first `(`.
        const startIndex = $color.indexOf('(');
        $color = $color.substring(startIndex + 1, $color.length - 1);
        for (let i = 0; i < $color.length; i++) {
            const c = $color[i];
            // Check if `c` is a digit.
            if (c >= '0' && c <= '9' || c === '.' || c === '+' || c === '-') {
                // Enable the mining flag.
                isMining = true;
            }
            else if (isMining && (c === ' ' || c === ',' || c === '/')) {
                // isMining is true and we got a terminating
                // character. So we can push the current number
                // into the array.
                numbers.push($color.substring(prevPos, i));
                // Disable the mining flag.
                isMining = false;
                // Ensure the prevPos is correct.
                prevPos = i + 1;
            }
            else if (!isMining) {
                // Ensure the prevPos is correct.
                prevPos = i + 1;
            }
        }
        // Push the last number.
        if (isMining) {
            numbers.push($color.substring(prevPos, $color.length));
        }
        return numbers;
    }
    function getNumbersFromString(str, range, units) {
        const raw = getNumbers(str);
        const unitsList = Object.entries(units);
        const numbers = raw.map((r) => r.trim()).map((r, i) => {
            let n;
            const unit = unitsList.find(([u]) => r.endsWith(u));
            if (unit) {
                n = parseFloat(r.substring(0, r.length - unit[0].length)) / unit[1] * range[i];
            }
            else {
                n = parseFloat(r);
            }
            if (range[i] > 1) {
                return Math.round(n);
            }
            return n;
        });
        return numbers;
    }
    const rgbRange = [255, 255, 255, 1];
    const rgbUnits = { '%': 100 };
    function parseRGB($rgb) {
        const [r, g, b, a = 1] = getNumbersFromString($rgb, rgbRange, rgbUnits);
        if (r == null || g == null || b == null || a == null) {
            return null;
        }
        return { r, g, b, a };
    }
    const hslRange = [360, 1, 1, 1];
    const hslUnits = { '%': 100, 'deg': 360, 'rad': 2 * Math.PI, 'turn': 1 };
    function parseHSL($hsl) {
        const [h, s, l, a = 1] = getNumbersFromString($hsl, hslRange, hslUnits);
        if (h == null || s == null || l == null || a == null) {
            return null;
        }
        return hslToRGB({ h, s, l, a });
    }
    function parseHex($hex) {
        const h = $hex.substring(1);
        switch (h.length) {
            case 3:
            case 4: {
                const [r, g, b] = [0, 1, 2].map((i) => parseInt(`${h[i]}${h[i]}`, 16));
                const a = h.length === 3 ? 1 : (parseInt(`${h[3]}${h[3]}`, 16) / 255);
                return { r, g, b, a };
            }
            case 6:
            case 8: {
                const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16));
                const a = h.length === 6 ? 1 : (parseInt(h.substring(6, 8), 16) / 255);
                return { r, g, b, a };
            }
        }
        return null;
    }
    function getColorByName($color) {
        const n = knownColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1,
        };
    }
    function getSystemColor($color) {
        const n = systemColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1,
        };
    }
    // lowerCalcExpression is a helper function that tries to remove `calc(...)`
    // expressions from the given string. It can only lower expressions to a certain
    // degree so we can keep this function easy and simple to understand.
    function lowerCalcExpression(color) {
        // searchIndex will be used as searchIndex and as a "cursor" within
        // the calc(...) expression.
        let searchIndex = 0;
        // Replace the content between two indices.
        const replaceBetweenIndices = (start, end, replacement) => {
            color = color.substring(0, start) + replacement + color.substring(end);
        };
        // Run this code until it doesn't find any `calc(...)`.
        while ((searchIndex = color.indexOf('calc(')) !== -1) {
            // Get the parentheses ranges of `calc(...)`.
            const range = getParenthesesRange(color, searchIndex);
            if (!range) {
                break;
            }
            // Get the content between the parentheses.
            let slice = color.slice(range.start + 1, range.end - 1);
            // Does the content include a percentage?
            const includesPercentage = slice.includes('%');
            // Remove all percentages.
            slice = slice.split('%').join('');
            // Pass the content to the evalMath library and round its output.
            const output = Math.round(evalMath(slice));
            // Replace `calc(...)` with the result.
            replaceBetweenIndices(range.start - 4, range.end, output + (includesPercentage ? '%' : ''));
        }
        return color;
    }
    const knownColors = new Map(Object.entries({
        aliceblue: 0xf0f8ff,
        antiquewhite: 0xfaebd7,
        aqua: 0x00ffff,
        aquamarine: 0x7fffd4,
        azure: 0xf0ffff,
        beige: 0xf5f5dc,
        bisque: 0xffe4c4,
        black: 0x000000,
        blanchedalmond: 0xffebcd,
        blue: 0x0000ff,
        blueviolet: 0x8a2be2,
        brown: 0xa52a2a,
        burlywood: 0xdeb887,
        cadetblue: 0x5f9ea0,
        chartreuse: 0x7fff00,
        chocolate: 0xd2691e,
        coral: 0xff7f50,
        cornflowerblue: 0x6495ed,
        cornsilk: 0xfff8dc,
        crimson: 0xdc143c,
        cyan: 0x00ffff,
        darkblue: 0x00008b,
        darkcyan: 0x008b8b,
        darkgoldenrod: 0xb8860b,
        darkgray: 0xa9a9a9,
        darkgrey: 0xa9a9a9,
        darkgreen: 0x006400,
        darkkhaki: 0xbdb76b,
        darkmagenta: 0x8b008b,
        darkolivegreen: 0x556b2f,
        darkorange: 0xff8c00,
        darkorchid: 0x9932cc,
        darkred: 0x8b0000,
        darksalmon: 0xe9967a,
        darkseagreen: 0x8fbc8f,
        darkslateblue: 0x483d8b,
        darkslategray: 0x2f4f4f,
        darkslategrey: 0x2f4f4f,
        darkturquoise: 0x00ced1,
        darkviolet: 0x9400d3,
        deeppink: 0xff1493,
        deepskyblue: 0x00bfff,
        dimgray: 0x696969,
        dimgrey: 0x696969,
        dodgerblue: 0x1e90ff,
        firebrick: 0xb22222,
        floralwhite: 0xfffaf0,
        forestgreen: 0x228b22,
        fuchsia: 0xff00ff,
        gainsboro: 0xdcdcdc,
        ghostwhite: 0xf8f8ff,
        gold: 0xffd700,
        goldenrod: 0xdaa520,
        gray: 0x808080,
        grey: 0x808080,
        green: 0x008000,
        greenyellow: 0xadff2f,
        honeydew: 0xf0fff0,
        hotpink: 0xff69b4,
        indianred: 0xcd5c5c,
        indigo: 0x4b0082,
        ivory: 0xfffff0,
        khaki: 0xf0e68c,
        lavender: 0xe6e6fa,
        lavenderblush: 0xfff0f5,
        lawngreen: 0x7cfc00,
        lemonchiffon: 0xfffacd,
        lightblue: 0xadd8e6,
        lightcoral: 0xf08080,
        lightcyan: 0xe0ffff,
        lightgoldenrodyellow: 0xfafad2,
        lightgray: 0xd3d3d3,
        lightgrey: 0xd3d3d3,
        lightgreen: 0x90ee90,
        lightpink: 0xffb6c1,
        lightsalmon: 0xffa07a,
        lightseagreen: 0x20b2aa,
        lightskyblue: 0x87cefa,
        lightslategray: 0x778899,
        lightslategrey: 0x778899,
        lightsteelblue: 0xb0c4de,
        lightyellow: 0xffffe0,
        lime: 0x00ff00,
        limegreen: 0x32cd32,
        linen: 0xfaf0e6,
        magenta: 0xff00ff,
        maroon: 0x800000,
        mediumaquamarine: 0x66cdaa,
        mediumblue: 0x0000cd,
        mediumorchid: 0xba55d3,
        mediumpurple: 0x9370db,
        mediumseagreen: 0x3cb371,
        mediumslateblue: 0x7b68ee,
        mediumspringgreen: 0x00fa9a,
        mediumturquoise: 0x48d1cc,
        mediumvioletred: 0xc71585,
        midnightblue: 0x191970,
        mintcream: 0xf5fffa,
        mistyrose: 0xffe4e1,
        moccasin: 0xffe4b5,
        navajowhite: 0xffdead,
        navy: 0x000080,
        oldlace: 0xfdf5e6,
        olive: 0x808000,
        olivedrab: 0x6b8e23,
        orange: 0xffa500,
        orangered: 0xff4500,
        orchid: 0xda70d6,
        palegoldenrod: 0xeee8aa,
        palegreen: 0x98fb98,
        paleturquoise: 0xafeeee,
        palevioletred: 0xdb7093,
        papayawhip: 0xffefd5,
        peachpuff: 0xffdab9,
        peru: 0xcd853f,
        pink: 0xffc0cb,
        plum: 0xdda0dd,
        powderblue: 0xb0e0e6,
        purple: 0x800080,
        rebeccapurple: 0x663399,
        red: 0xff0000,
        rosybrown: 0xbc8f8f,
        royalblue: 0x4169e1,
        saddlebrown: 0x8b4513,
        salmon: 0xfa8072,
        sandybrown: 0xf4a460,
        seagreen: 0x2e8b57,
        seashell: 0xfff5ee,
        sienna: 0xa0522d,
        silver: 0xc0c0c0,
        skyblue: 0x87ceeb,
        slateblue: 0x6a5acd,
        slategray: 0x708090,
        slategrey: 0x708090,
        snow: 0xfffafa,
        springgreen: 0x00ff7f,
        steelblue: 0x4682b4,
        tan: 0xd2b48c,
        teal: 0x008080,
        thistle: 0xd8bfd8,
        tomato: 0xff6347,
        turquoise: 0x40e0d0,
        violet: 0xee82ee,
        wheat: 0xf5deb3,
        white: 0xffffff,
        whitesmoke: 0xf5f5f5,
        yellow: 0xffff00,
        yellowgreen: 0x9acd32,
    }));
    const systemColors = new Map(Object.entries({
        ActiveBorder: 0x3b99fc,
        ActiveCaption: 0x000000,
        AppWorkspace: 0xaaaaaa,
        Background: 0x6363ce,
        ButtonFace: 0xffffff,
        ButtonHighlight: 0xe9e9e9,
        ButtonShadow: 0x9fa09f,
        ButtonText: 0x000000,
        CaptionText: 0x000000,
        GrayText: 0x7f7f7f,
        Highlight: 0xb2d7ff,
        HighlightText: 0x000000,
        InactiveBorder: 0xffffff,
        InactiveCaption: 0xffffff,
        InactiveCaptionText: 0x000000,
        InfoBackground: 0xfbfcc5,
        InfoText: 0x000000,
        Menu: 0xf6f6f6,
        MenuText: 0xffffff,
        Scrollbar: 0xaaaaaa,
        ThreeDDarkShadow: 0x000000,
        ThreeDFace: 0xc0c0c0,
        ThreeDHighlight: 0xffffff,
        ThreeDLightShadow: 0xffffff,
        ThreeDShadow: 0x000000,
        Window: 0xececec,
        WindowFrame: 0xaaaaaa,
        WindowText: 0x000000,
        '-webkit-focus-ring-color': 0xe59700,
    }).map(([key, value]) => [key.toLowerCase(), value]));
    let canvas;
    let context;
    function domParseColor($color) {
        if (!context) {
            canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            context = canvas.getContext('2d', { willReadFrequently: true });
        }
        context.fillStyle = $color;
        context.fillRect(0, 0, 1, 1);
        const d = context.getImageData(0, 0, 1, 1).data;
        const color = `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(2)})`;
        return parseRGB(color);
    }

    const registeredColors = new Map();
    function getRegisteredVariableValue(type, registered) {
        return `var(${registered[type].variable}, ${registered[type].value})`;
    }
    function getRegisteredColor(type, parsed) {
        const hex = rgbToHexString(parsed);
        const registered = registeredColors.get(hex);
        if (registered?.[type]) {
            return getRegisteredVariableValue(type, registered);
        }
        return null;
    }
    function registerColor(type, parsed, value) {
        const hex = rgbToHexString(parsed);
        let registered;
        if (registeredColors.has(hex)) {
            registered = registeredColors.get(hex);
        }
        else {
            const parsed = parseColorWithCache(hex);
            registered = { parsed };
            registeredColors.set(hex, registered);
        }
        const variable = `--darkreader-${type}-${hex.replace('#', '')}`;
        registered[type] = { variable, value };
        return getRegisteredVariableValue(type, registered);
    }

    function getBgPole(theme) {
        const isDarkScheme = theme.mode === 1;
        const prop = isDarkScheme ? 'darkSchemeBackgroundColor' : 'lightSchemeBackgroundColor';
        return theme[prop];
    }
    function getFgPole(theme) {
        const isDarkScheme = theme.mode === 1;
        const prop = isDarkScheme ? 'darkSchemeTextColor' : 'lightSchemeTextColor';
        return theme[prop];
    }
    const colorModificationCache = new Map();
    const rgbCacheKeys = ['r', 'g', 'b', 'a'];
    const themeCacheKeys = [
        'mode',
        'brightness',
        'contrast',
        'grayscale',
        'sepia',
        'darkSchemeBackgroundColor',
        'darkSchemeTextColor',
        'lightSchemeBackgroundColor',
        'lightSchemeTextColor',
    ];
    function getCacheId(rgb, theme) {
        let resultId = '';
        rgbCacheKeys.forEach((key) => {
            resultId += `${rgb[key]};`;
        });
        themeCacheKeys.forEach((key) => {
            resultId += `${theme[key]};`;
        });
        return resultId;
    }
    function modifyColorWithCache(rgb, theme, modifyHSL, poleColor, anotherPoleColor) {
        let fnCache;
        if (colorModificationCache.has(modifyHSL)) {
            fnCache = colorModificationCache.get(modifyHSL);
        }
        else {
            fnCache = new Map();
            colorModificationCache.set(modifyHSL, fnCache);
        }
        const id = getCacheId(rgb, theme);
        if (fnCache.has(id)) {
            return fnCache.get(id);
        }
        const hsl = rgbToHSL(rgb);
        const pole = poleColor == null ? null : parseToHSLWithCache(poleColor);
        const anotherPole = anotherPoleColor == null ? null : parseToHSLWithCache(anotherPoleColor);
        const modified = modifyHSL(hsl, pole, anotherPole);
        const { r, g, b, a } = hslToRGB(modified);
        const matrix = createFilterMatrix({ ...theme, mode: 0 });
        const [rf, gf, bf] = applyColorMatrix([r, g, b], matrix);
        const color = (a === 1 ?
            rgbToHexString({ r: rf, g: gf, b: bf }) :
            rgbToString({ r: rf, g: gf, b: bf, a }));
        fnCache.set(id, color);
        return color;
    }
    function modifyAndRegisterColor(type, rgb, theme, modifier) {
        const registered = getRegisteredColor(type, rgb);
        if (registered) {
            return registered;
        }
        const value = modifier(rgb, theme);
        return registerColor(type, rgb, value);
    }
    function modifyLightSchemeColor(rgb, theme) {
        const poleBg = getBgPole(theme);
        const poleFg = getFgPole(theme);
        return modifyColorWithCache(rgb, theme, modifyLightModeHSL, poleFg, poleBg);
    }
    function modifyLightModeHSL({ h, s, l, a }, poleFg, poleBg) {
        const isDark = l < 0.5;
        let isNeutral;
        if (isDark) {
            isNeutral = l < 0.2 || s < 0.12;
        }
        else {
            const isBlue = h > 200 && h < 280;
            isNeutral = s < 0.24 || (l > 0.8 && isBlue);
        }
        let hx = h;
        let sx = s;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            }
            else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        const lx = scale(l, 0, 1, poleFg.l, poleBg.l);
        return { h: hx, s: sx, l: lx, a };
    }
    const MAX_BG_LIGHTNESS = 0.4;
    function modifyBgHSL({ h, s, l, a }, pole) {
        const isDark = l < 0.5;
        const isBlue = h > 200 && h < 280;
        const isNeutral = s < 0.12 || (l > 0.8 && isBlue);
        if (isDark) {
            const lx = scale(l, 0, 0.5, 0, MAX_BG_LIGHTNESS);
            if (isNeutral) {
                const hx = pole.h;
                const sx = pole.s;
                return { h: hx, s: sx, l: lx, a };
            }
            return { h, s, l: lx, a };
        }
        let lx = scale(l, 0.5, 1, MAX_BG_LIGHTNESS, pole.l);
        if (isNeutral) {
            const hx = pole.h;
            const sx = pole.s;
            return { h: hx, s: sx, l: lx, a };
        }
        let hx = h;
        const isYellow = h > 60 && h < 180;
        if (isYellow) {
            const isCloserToGreen = h > 120;
            if (isCloserToGreen) {
                hx = scale(h, 120, 180, 135, 180);
            }
            else {
                hx = scale(h, 60, 120, 60, 105);
            }
        }
        // Lower the lightness, if the resulting
        // hue is in lower yellow spectrum.
        if (hx > 40 && hx < 80) {
            lx *= 0.75;
        }
        return { h: hx, s, l: lx, a };
    }
    function _modifyBackgroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const pole = getBgPole(theme);
        return modifyColorWithCache(rgb, theme, modifyBgHSL, pole);
    }
    function modifyBackgroundColor(rgb, theme, shouldRegisterColorVariable = true) {
        if (!shouldRegisterColorVariable) {
            return _modifyBackgroundColor(rgb, theme);
        }
        return modifyAndRegisterColor('background', rgb, theme, _modifyBackgroundColor);
    }
    const MIN_FG_LIGHTNESS = 0.55;
    function modifyBlueFgHue(hue) {
        return scale(hue, 205, 245, 205, 220);
    }
    function modifyFgHSL({ h, s, l, a }, pole) {
        const isLight = l > 0.5;
        const isNeutral = l < 0.2 || s < 0.24;
        const isBlue = !isNeutral && h > 205 && h < 245;
        if (isLight) {
            const lx = scale(l, 0.5, 1, MIN_FG_LIGHTNESS, pole.l);
            if (isNeutral) {
                const hx = pole.h;
                const sx = pole.s;
                return { h: hx, s: sx, l: lx, a };
            }
            let hx = h;
            if (isBlue) {
                hx = modifyBlueFgHue(h);
            }
            return { h: hx, s, l: lx, a };
        }
        if (isNeutral) {
            const hx = pole.h;
            const sx = pole.s;
            const lx = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
            return { h: hx, s: sx, l: lx, a };
        }
        let hx = h;
        let lx;
        if (isBlue) {
            hx = modifyBlueFgHue(h);
            lx = scale(l, 0, 0.5, pole.l, Math.min(1, MIN_FG_LIGHTNESS + 0.05));
        }
        else {
            lx = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
        }
        return { h: hx, s, l: lx, a };
    }
    function _modifyForegroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const pole = getFgPole(theme);
        return modifyColorWithCache(rgb, theme, modifyFgHSL, pole);
    }
    function modifyForegroundColor(rgb, theme, shouldRegisterColorVariable = true) {
        if (!shouldRegisterColorVariable) {
            return _modifyForegroundColor(rgb, theme);
        }
        return modifyAndRegisterColor('text', rgb, theme, _modifyForegroundColor);
    }
    function modifyBorderHSL({ h, s, l, a }, poleFg, poleBg) {
        const isDark = l < 0.5;
        const isNeutral = l < 0.2 || s < 0.24;
        let hx = h;
        let sx = s;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            }
            else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        const lx = scale(l, 0, 1, 0.5, 0.2);
        return { h: hx, s: sx, l: lx, a };
    }
    function _modifyBorderColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const poleFg = getFgPole(theme);
        const poleBg = getBgPole(theme);
        return modifyColorWithCache(rgb, theme, modifyBorderHSL, poleFg, poleBg);
    }
    function modifyBorderColor(rgb, theme, shouldRegisterColorVariable = true) {
        if (!shouldRegisterColorVariable) {
            return _modifyBorderColor(rgb, theme);
        }
        return modifyAndRegisterColor('border', rgb, theme, _modifyBorderColor);
    }

    const themeColorTypes = {
        accentcolor: 'bg',
        button_background_active: 'text',
        button_background_hover: 'text',
        frame: 'bg',
        icons: 'text',
        icons_attention: 'text',
        ntp_background: 'bg',
        ntp_text: 'text',
        popup: 'bg',
        popup_border: 'bg',
        popup_highlight: 'bg',
        popup_highlight_text: 'text',
        popup_text: 'text',
        sidebar: 'bg',
        sidebar_border: 'border',
        sidebar_text: 'text',
        tab_background_text: 'text',
        tab_line: 'bg',
        tab_loading: 'bg',
        tab_selected: 'bg',
        textcolor: 'text',
        toolbar: 'bg',
        toolbar_bottom_separator: 'border',
        toolbar_field: 'bg',
        toolbar_field_border: 'border',
        toolbar_field_border_focus: 'border',
        toolbar_field_focus: 'bg',
        toolbar_field_separator: 'border',
        toolbar_field_text: 'text',
        toolbar_field_text_focus: 'text',
        toolbar_text: 'text',
        toolbar_top_separator: 'border',
        toolbar_vertical_separator: 'border',
    };
    const $colors = {
        // 'accentcolor' is the deprecated predecessor of 'frame'.
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme#colors
        accentcolor: '#111111',
        frame: '#111111',
        ntp_background: 'white',
        ntp_text: 'black',
        popup: '#cccccc',
        popup_text: 'black',
        sidebar: '#cccccc',
        sidebar_border: '#333',
        sidebar_text: 'black',
        tab_background_text: 'white',
        tab_loading: '#23aeff',
        // 'textcolor' is the predecessor of 'tab_background_text'.
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme#colors
        textcolor: 'white',
        toolbar: '#707070',
        toolbar_field: 'lightgray',
        toolbar_field_text: 'black',
    };
    function setWindowTheme(theme) {
        const colors = Object.entries($colors).reduce((obj, [key, value]) => {
            const type = themeColorTypes[key];
            const modify = {
                'bg': modifyBackgroundColor,
                'text': modifyForegroundColor,
                'border': modifyBorderColor,
            }[type];
            const rgb = parseColorWithCache(value);
            const modified = modify(rgb, theme, false);
            obj[key] = modified;
            return obj;
        }, {});
        if (typeof browser !== 'undefined' && browser.theme && browser.theme.update) {
            browser.theme.update({ colors });
        }
    }
    function resetWindowTheme() {
        if (typeof browser !== 'undefined' && browser.theme && browser.theme.reset) {
            // BUG: resets browser theme to entire
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1415267
            browser.theme.reset();
        }
    }

    class Extension {
        static autoState = '';
        static wasEnabledOnLastCheck = null;
        static registeredContextMenus = null;
        /**
         * This value is used for two purposes:
         *  - to bypass Firefox bug
         *  - to filter out excessive Extension.onColorSchemeChange() invocations
         */
        static wasLastColorSchemeDark = null;
        static startBarrier = null;
        static stateManager = null;
        static ALARM_NAME = 'auto-time-alarm';
        static LOCAL_STORAGE_KEY = 'Extension-state';
        // Store system color theme
        static SYSTEM_COLOR_LOCAL_STORAGE_KEY = 'system-color-state';
        static systemColorStateManager;
        // Record whether Extension.init() already ran since the last GB start
        static initialized = false;
        static isFirstLoad = false;
        // This sync initializer needs to run on every BG restart before anything else can happen
        static init() {
            if (Extension.initialized) {
                return;
            }
            Extension.initialized = true;
            DevTools.init(Extension.onSettingsChanged);
            Messenger.init(Extension.getMessengerAdapter());
            TabManager.init({
                getConnectionMessage: Extension.getConnectionMessage,
                getTabMessage: Extension.getTabMessage,
                onColorSchemeChange: Extension.onColorSchemeChange,
            });
            Extension.startBarrier = new PromiseBarrier();
            Extension.stateManager = new StateManager(Extension.LOCAL_STORAGE_KEY, Extension, {
                autoState: '',
                wasEnabledOnLastCheck: null,
                registeredContextMenus: null,
            }, logWarn);
            chrome.alarms.onAlarm.addListener(Extension.alarmListener);
            if (chrome.commands) {
                // Firefox Android does not support chrome.commands
                {
                    chrome.commands.onCommand.addListener(async (command, tab) => Extension.onCommand(command, tab && tab.id || null, 0, null));
                }
            }
            if (chrome.permissions.onRemoved) {
                chrome.permissions.onRemoved.addListener((permissions) => {
                    // As far as we know, this code is never actually run because there
                    // is no browser UI for removing 'contextMenus' permission.
                    // This code exists for future-proofing in case browsers ever add such UI.
                    if (!permissions?.permissions?.includes('contextMenus')) {
                        Extension.registeredContextMenus = false;
                    }
                });
            }
        }
        static async MV3syncSystemColorStateManager(isDark) {
            if (!Extension.systemColorStateManager) {
                Extension.systemColorStateManager = new StateManager(Extension.SYSTEM_COLOR_LOCAL_STORAGE_KEY, Extension, {
                    wasLastColorSchemeDark: isDark,
                }, logWarn);
            }
            if (isDark === null) {
                // Attempt to restore data from storage
                return Extension.systemColorStateManager.loadState();
            }
            else if (Extension.wasLastColorSchemeDark !== isDark) {
                Extension.wasLastColorSchemeDark = isDark;
                return Extension.systemColorStateManager.saveState();
            }
        }
        static alarmListener = (alarm) => {
            if (alarm.name === Extension.ALARM_NAME) {
                Extension.loadData().then(() => Extension.handleAutomationCheck());
            }
        };
        static isExtensionSwitchedOn() {
            return (Extension.autoState === 'turn-on' ||
                Extension.autoState === 'scheme-dark' ||
                Extension.autoState === 'scheme-light' ||
                (Extension.autoState === '' && UserStorage.settings.enabled));
        }
        static updateAutoState() {
            const { mode, behavior, enabled } = UserStorage.settings.automation;
            let isAutoDark;
            let nextCheck;
            switch (mode) {
                case AutomationMode.TIME: {
                    const { time } = UserStorage.settings;
                    isAutoDark = isInTimeIntervalLocal(time.activation, time.deactivation);
                    nextCheck = nextTimeInterval(time.activation, time.deactivation);
                    break;
                }
                case AutomationMode.SYSTEM:
                    {
                        isAutoDark = Extension.wasLastColorSchemeDark;
                        if (Extension.wasLastColorSchemeDark === null) {
                            logWarn('System color scheme is unknown. Defaulting to Dark.');
                            isAutoDark = true;
                        }
                        break;
                    }
                case AutomationMode.LOCATION: {
                    const { latitude, longitude } = UserStorage.settings.location;
                    if (latitude != null && longitude != null) {
                        isAutoDark = isNightAtLocation(latitude, longitude);
                        nextCheck = nextTimeChangeAtLocation(latitude, longitude);
                    }
                    break;
                }
                case AutomationMode.NONE:
                    break;
            }
            let state = '';
            if (enabled) {
                if (behavior === 'OnOff') {
                    state = isAutoDark ? 'turn-on' : 'turn-off';
                }
                else if (behavior === 'Scheme') {
                    state = isAutoDark ? 'scheme-dark' : 'scheme-light';
                }
            }
            Extension.autoState = state;
            if (nextCheck) {
                if (nextCheck < Date.now()) {
                    logWarn(`Alarm is set in the past: ${nextCheck}. The time is: ${new Date()}. ISO: ${(new Date()).toISOString()}`);
                }
                else {
                    chrome.alarms.create(Extension.ALARM_NAME, { when: nextCheck });
                }
            }
        }
        static wakeInterval = -1;
        static runWakeDetector() {
            const WAKE_CHECK_INTERVAL = getDuration({ minutes: 1 });
            const WAKE_CHECK_INTERVAL_ERROR = getDuration({ seconds: 10 });
            if (this.wakeInterval >= 0) {
                clearInterval(this.wakeInterval);
            }
            let lastRun = Date.now();
            this.wakeInterval = setInterval(() => {
                const now = Date.now();
                if (now - lastRun > WAKE_CHECK_INTERVAL + WAKE_CHECK_INTERVAL_ERROR) {
                    Extension.handleAutomationCheck();
                }
                lastRun = now;
            }, WAKE_CHECK_INTERVAL);
        }
        static async start() {
            Extension.init();
            await TabManager.cleanState();
            await Promise.all([
                ConfigManager.load({ local: true }),
                Extension.MV3syncSystemColorStateManager(null),
                UserStorage.loadSettings(),
            ]);
            if (UserStorage.settings.enableContextMenus && !Extension.registeredContextMenus) {
                chrome.permissions.contains({ permissions: ['contextMenus'] }, (permitted) => {
                    if (permitted) {
                        Extension.registerContextMenus();
                    }
                    else {
                        logWarn('User has enabled context menus, but did not provide permission.');
                    }
                });
            }
            if (UserStorage.settings.syncSitesFixes) {
                await ConfigManager.load({ local: false });
            }
            Extension.updateAutoState();
            Extension.runWakeDetector();
            Extension.onAppToggle();
            logInfo('loaded', UserStorage.settings);
            if (Extension.isFirstLoad) {
                TabManager.updateContentScript({ runOnProtectedPages: UserStorage.settings.enableForProtectedPages });
            }
            UserStorage.settings.fetchNews && Newsmaker.subscribe();
            Extension.startBarrier.resolve();
        }
        static getMessengerAdapter() {
            return {
                collect: async () => {
                    return await Extension.collectData();
                },
                collectDevToolsData: async () => {
                    return await Extension.collectDevToolsData();
                },
                changeSettings: Extension.changeSettings,
                setTheme: Extension.setTheme,
                toggleActiveTab: Extension.toggleActiveTab,
                markNewsAsRead: Newsmaker.markAsRead,
                markNewsAsDisplayed: Newsmaker.markAsDisplayed,
                loadConfig: ConfigManager.load,
                applyDevDynamicThemeFixes: DevTools.applyDynamicThemeFixes,
                resetDevDynamicThemeFixes: DevTools.resetDynamicThemeFixes,
                applyDevInversionFixes: DevTools.applyInversionFixes,
                resetDevInversionFixes: DevTools.resetInversionFixes,
                applyDevStaticThemes: DevTools.applyStaticThemes,
                resetDevStaticThemes: DevTools.resetStaticThemes,
                startActivation: Extension.startActivation,
                resetActivation: Extension.resetActivation,
                hideHighlights: UIHighlights.hideHighlights,
            };
        }
        static onCommandInternal = async (command, tabId, frameId, frameURL) => {
            if (Extension.startBarrier.isPending()) {
                await Extension.startBarrier.entry();
            }
            Extension.stateManager.loadState();
            switch (command) {
                case 'toggle':
                    logInfo('Toggle command entered');
                    Extension.changeSettings({
                        enabled: !Extension.isExtensionSwitchedOn(),
                        automation: { ...UserStorage.settings.automation, ...{ enabled: false } },
                    });
                    break;
                case 'addSite': {
                    logInfo('Add Site command entered');
                    async function scriptPDF(tabId, frameId) {
                        // We can not detect PDF if we do not know where we are looking for it
                        if (!(Number.isInteger(tabId) && Number.isInteger(frameId))) {
                            return false;
                        }
                        function detectPDF() {
                            if (document.body.childElementCount !== 1) {
                                return false;
                            }
                            const { nodeName, type } = document.body.childNodes[0];
                            return nodeName === 'EMBED' && type === 'application/pdf';
                        }
                        {
                            return (await chrome.scripting.executeScript({
                                target: { tabId, frameIds: [frameId] },
                                func: detectPDF,
                            }))[0].result || false;
                        }
                    }
                    const pdf = async () => isPDF(frameURL || await TabManager.getActiveTabURL());
                    if ((await scriptPDF(tabId, frameId)) || await pdf()) {
                        Extension.changeSettings({ enableForPDF: !UserStorage.settings.enableForPDF });
                    }
                    else {
                        Extension.toggleActiveTab();
                    }
                    break;
                }
                case 'switchEngine': {
                    logInfo('Switch Engine command entered');
                    const engines = Object.values(ThemeEngine);
                    const index = engines.indexOf(UserStorage.settings.theme.engine);
                    const next = engines[(index + 1) % engines.length];
                    Extension.setTheme({ engine: next });
                    break;
                }
            }
        };
        // 75 is small enough to not notice it, and still catches when someone
        // is holding down a certain shortcut.
        static onCommand = debounce(75, Extension.onCommandInternal);
        static registerContextMenus() {
            chrome.contextMenus.onClicked.addListener(async ({ menuItemId, frameId, frameUrl, pageUrl }, tab) => Extension.onCommand(menuItemId, tab && tab.id || null, frameId || null, frameUrl || pageUrl || null));
            chrome.contextMenus.removeAll(() => {
                Extension.registeredContextMenus = false;
                chrome.contextMenus.create({
                    id: 'DarkReader-top',
                    title: 'Dark Reader',
                }, () => {
                    if (chrome.runtime.lastError) {
                        // Failed to create the context menu
                        return;
                    }
                    const msgToggle = chrome.i18n.getMessage('toggle_extension');
                    const msgAddSite = chrome.i18n.getMessage('toggle_current_site');
                    const msgSwitchEngine = chrome.i18n.getMessage('theme_generation_mode');
                    chrome.contextMenus.create({
                        id: 'toggle',
                        parentId: 'DarkReader-top',
                        title: msgToggle || 'Toggle everywhere',
                    });
                    chrome.contextMenus.create({
                        id: 'addSite',
                        parentId: 'DarkReader-top',
                        title: msgAddSite || 'Toggle for current site',
                    });
                    chrome.contextMenus.create({
                        id: 'switchEngine',
                        parentId: 'DarkReader-top',
                        title: msgSwitchEngine || 'Switch engine',
                    });
                    Extension.registeredContextMenus = true;
                });
            });
        }
        static async getShortcuts() {
            const commands = await getCommands();
            return commands.reduce((map, cmd) => Object.assign(map, { [cmd.name]: cmd.shortcut }), {});
        }
        static async collectData() {
            await Extension.loadData();
            const [news, shortcuts, activeTab, isAllowedFileSchemeAccess, uiHighlights,] = await Promise.all([
                Newsmaker.getLatest(),
                Extension.getShortcuts(),
                Extension.getActiveTabInfo(),
                new Promise((r) => chrome.extension.isAllowedFileSchemeAccess(r)),
                UIHighlights.getHighlightsToShow(),
            ]);
            return {
                isEnabled: Extension.isExtensionSwitchedOn(),
                isReady: true,
                isAllowedFileSchemeAccess,
                settings: UserStorage.settings,
                news,
                shortcuts,
                colorScheme: ConfigManager.COLOR_SCHEMES_RAW,
                forcedScheme: Extension.autoState === 'scheme-dark' ? 'dark' : Extension.autoState === 'scheme-light' ? 'light' : null,
                activeTab,
                uiHighlights,
            };
        }
        static async collectDevToolsData() {
            const [dynamicFixesText, filterFixesText, staticThemesText,] = await Promise.all([
                DevTools.getDynamicThemeFixesText(),
                DevTools.getInversionFixesText(),
                DevTools.getStaticThemesText(),
            ]);
            return {
                dynamicFixesText,
                filterFixesText,
                staticThemesText,
            };
        }
        static async getActiveTabInfo() {
            await Extension.loadData();
            const tab = await getActiveTab();
            const url = await TabManager.getTabURL(tab);
            const { isInDarkList, isProtected } = Extension.getTabInfo(url);
            const isInjected = TabManager.canAccessTab(tab);
            const documentId = TabManager.getTabDocumentId(tab);
            let isDarkThemeDetected = null;
            if (UserStorage.settings.detectDarkTheme) {
                isDarkThemeDetected = TabManager.isTabDarkThemeDetected(tab);
            }
            const id = tab && tab.id || null;
            return {
                id,
                documentId,
                url,
                isInDarkList,
                isProtected,
                isInjected,
                isDarkThemeDetected,
            };
        }
        static async getConnectionMessage(tabURL, url, isTopFrame, topFrameHasDarkTheme) {
            await Extension.loadData();
            return Extension.getTabMessage(tabURL, url, isTopFrame, topFrameHasDarkTheme);
        }
        static async loadData() {
            Extension.init();
            await Promise.all([
                Extension.stateManager.loadState(),
                UserStorage.loadSettings(),
            ]);
        }
        static onColorSchemeChange = async (isDark) => {
            if (Extension.wasLastColorSchemeDark === isDark) {
                // If color scheme was already correct, we do not need to do anything
                return;
            }
            Extension.wasLastColorSchemeDark = isDark;
            Extension.MV3syncSystemColorStateManager(isDark);
            await Extension.loadData();
            if (UserStorage.settings.automation.mode !== AutomationMode.SYSTEM) {
                return;
            }
            Extension.handleAutomationCheck();
        };
        static handleAutomationCheck = () => {
            Extension.updateAutoState();
            const isSwitchedOn = Extension.isExtensionSwitchedOn();
            if (Extension.wasEnabledOnLastCheck === null ||
                Extension.wasEnabledOnLastCheck !== isSwitchedOn ||
                Extension.autoState === 'scheme-dark' ||
                Extension.autoState === 'scheme-light') {
                Extension.wasEnabledOnLastCheck = isSwitchedOn;
                Extension.onAppToggle();
                TabManager.sendMessage();
                Extension.reportChanges();
                Extension.stateManager.saveState();
            }
        };
        static async changeSettings($settings, onlyUpdateActiveTab = false) {
            const promises = [];
            const prev = { ...UserStorage.settings };
            UserStorage.set($settings);
            if ((prev.enabled !== UserStorage.settings.enabled) ||
                (prev.automation.enabled !== UserStorage.settings.automation.enabled) ||
                (prev.automation.mode !== UserStorage.settings.automation.mode) ||
                (prev.automation.behavior !== UserStorage.settings.automation.behavior) ||
                (prev.time.activation !== UserStorage.settings.time.activation) ||
                (prev.time.deactivation !== UserStorage.settings.time.deactivation) ||
                (prev.location.latitude !== UserStorage.settings.location.latitude) ||
                (prev.location.longitude !== UserStorage.settings.location.longitude)) {
                Extension.updateAutoState();
                Extension.onAppToggle();
            }
            if (prev.syncSettings !== UserStorage.settings.syncSettings) {
                const promise = UserStorage.saveSyncSetting(UserStorage.settings.syncSettings);
                promises.push(promise);
            }
            if (Extension.isExtensionSwitchedOn() && $settings.changeBrowserTheme != null && prev.changeBrowserTheme !== $settings.changeBrowserTheme) {
                if ($settings.changeBrowserTheme) {
                    setWindowTheme(UserStorage.settings.theme);
                }
                else {
                    resetWindowTheme();
                }
            }
            if (prev.fetchNews !== UserStorage.settings.fetchNews) {
                UserStorage.settings.fetchNews ? Newsmaker.subscribe() : Newsmaker.unSubscribe();
            }
            if (prev.enableContextMenus !== UserStorage.settings.enableContextMenus) {
                if (UserStorage.settings.enableContextMenus) {
                    Extension.registerContextMenus();
                }
                else {
                    chrome.contextMenus.removeAll();
                }
            }
            const promise = Extension.onSettingsChanged(onlyUpdateActiveTab);
            promises.push(promise);
            await Promise.all(promises);
        }
        static setTheme($theme) {
            UserStorage.set({ theme: { ...UserStorage.settings.theme, ...$theme } });
            if (Extension.isExtensionSwitchedOn() && UserStorage.settings.changeBrowserTheme) {
                setWindowTheme(UserStorage.settings.theme);
            }
            Extension.onSettingsChanged();
        }
        static async reportChanges() {
            const info = await Extension.collectData();
            Messenger.reportChanges(info);
        }
        static async toggleActiveTab() {
            const settings = UserStorage.settings;
            const tab = await Extension.getActiveTabInfo();
            if (!tab) {
                return;
            }
            const { url } = tab;
            const isInDarkList = ConfigManager.isURLInDarkList(url);
            const host = getURLHostOrProtocol(url);
            function getToggledList(sourceList) {
                const list = sourceList.slice();
                let index = list.indexOf(host);
                if (index < 0 && host.startsWith('www.')) {
                    const noWwwHost = host.substring(4);
                    index = list.indexOf(noWwwHost);
                }
                if (index < 0) {
                    list.push(host);
                }
                else {
                    list.splice(index, 1);
                }
                return list;
            }
            const darkThemeDetected = settings.enabledByDefault && settings.detectDarkTheme && tab.isDarkThemeDetected;
            if (!settings.enabledByDefault || isInDarkList || darkThemeDetected) {
                const toggledList = getToggledList(settings.enabledFor);
                Extension.changeSettings({ enabledFor: toggledList }, true);
                return;
            }
            if (settings.enabledByDefault && settings.enabledFor.includes(host)) {
                const enabledFor = getToggledList(settings.enabledFor);
                const disabledFor = getToggledList(settings.disabledFor);
                Extension.changeSettings({ enabledFor, disabledFor }, true);
                return;
            }
            const toggledList = getToggledList(settings.disabledFor);
            Extension.changeSettings({ disabledFor: toggledList }, true);
        }
        //------------------------------------
        //
        //       Handle config changes
        //
        static onAppToggle() {
            if (Extension.isExtensionSwitchedOn()) {
                IconManager.setIcon({ isActive: true, colorScheme: UserStorage.settings.theme.mode ? 'dark' : 'light' });
            }
            else {
                IconManager.setIcon({ isActive: false, colorScheme: UserStorage.settings.theme.mode ? 'dark' : 'light' });
            }
            if (UserStorage.settings.changeBrowserTheme) {
                if (Extension.isExtensionSwitchedOn() && Extension.autoState !== 'scheme-light') {
                    setWindowTheme(UserStorage.settings.theme);
                }
                else {
                    resetWindowTheme();
                }
            }
        }
        static async onSettingsChanged(onlyUpdateActiveTab = false) {
            await Extension.loadData();
            Extension.wasEnabledOnLastCheck = Extension.isExtensionSwitchedOn();
            TabManager.sendMessage(onlyUpdateActiveTab);
            Extension.saveUserSettings();
            Extension.reportChanges();
            IconManager.setIcon({ colorScheme: UserStorage.settings.theme.mode ? 'dark' : 'light' });
            Extension.stateManager.saveState();
        }
        static async startActivation(email, key) {
            const delay = 2000 + Math.round(Math.random() * 2000);
            const checkEmail = (email) => email && email.trim().includes('@');
            const checkKey = (key) => key.replaceAll('-', '').length === 25 && key.toLocaleLowerCase().startsWith('dr') && key.replaceAll('-', '').match(/^[0-9a-z]{25}$/i);
            setTimeout(async () => {
                await writeLocalStorage({ activationEmail: email, activationKey: key });
                if (checkEmail(email) && checkKey(key)) {
                    await UIHighlights.hideHighlights(['anniversary']);
                }
                Extension.reportChanges();
            }, delay);
        }
        static async resetActivation() {
            await removeLocalStorage(['activationEmail', 'activationKey']);
            await UIHighlights.restoreHighlights(['anniversary']);
            Extension.reportChanges();
        }
        //----------------------
        //
        // Add/remove css to tab
        //
        //----------------------
        static getTabInfo(tabURL) {
            const isInDarkList = ConfigManager.isURLInDarkList(tabURL);
            const isProtected = !canInjectScript(tabURL);
            return {
                isInDarkList,
                isProtected,
            };
        }
        static getTabMessage = (tabURL, url, isTopFrame, topFrameHasDarkTheme) => {
            const settings = UserStorage.settings;
            const tabInfo = Extension.getTabInfo(tabURL);
            if (Extension.isExtensionSwitchedOn() && isURLEnabled(tabURL, settings, tabInfo) && !topFrameHasDarkTheme) {
                const custom = settings.customThemes.find(({ url: urlList }) => isURLInList(tabURL, urlList));
                const preset = custom ? null : settings.presets.find(({ urls }) => isURLInList(tabURL, urls));
                let theme = custom ? custom.theme : preset ? preset.theme : settings.theme;
                if (Extension.autoState === 'scheme-dark' || Extension.autoState === 'scheme-light') {
                    const mode = Extension.autoState === 'scheme-dark' ? 1 : 0;
                    theme = { ...theme, mode };
                }
                const detectorHints = settings.detectDarkTheme ? getDetectorHintsFor(url, ConfigManager.DETECTOR_HINTS_RAW, ConfigManager.DETECTOR_HINTS_INDEX) : null;
                const detectDarkTheme = (settings.detectDarkTheme &&
                    (isTopFrame || detectorHints?.some((h) => h.iframe)) &&
                    !isURLInList(tabURL, settings.enabledFor) &&
                    !isPDF(tabURL));
                logInfo(`Creating CSS for url: ${url}`);
                logInfo(`Custom theme ${custom ? 'was found' : 'was not found'}, Preset theme ${preset ? 'was found' : 'was not found'}
            The theme(${custom ? 'custom' : preset ? 'preset' : 'global'} settings) used is: ${JSON.stringify(theme)}`);
                switch (theme.engine) {
                    case ThemeEngine.cssFilter: {
                        return {
                            type: MessageTypeBGtoCS.ADD_CSS_FILTER,
                            data: {
                                css: createCSSFilterStyleSheet(theme, url, isTopFrame, ConfigManager.INVERSION_FIXES_RAW, ConfigManager.INVERSION_FIXES_INDEX),
                                detectDarkTheme,
                                detectorHints,
                                theme,
                            },
                        };
                    }
                    case ThemeEngine.svgFilter: {
                        return {
                            type: MessageTypeBGtoCS.ADD_SVG_FILTER,
                            data: {
                                css: createSVGFilterStylesheet(theme, url, isTopFrame, ConfigManager.INVERSION_FIXES_RAW, ConfigManager.INVERSION_FIXES_INDEX),
                                svgMatrix: getSVGFilterMatrixValue(theme),
                                svgReverseMatrix: getSVGReverseFilterMatrixValue(),
                                detectDarkTheme,
                                detectorHints,
                                theme,
                            },
                        };
                    }
                    case ThemeEngine.staticTheme: {
                        return {
                            type: MessageTypeBGtoCS.ADD_STATIC_THEME,
                            data: {
                                css: theme.stylesheet && theme.stylesheet.trim() ?
                                    theme.stylesheet :
                                    createStaticStylesheet(theme, url, isTopFrame, ConfigManager.STATIC_THEMES_RAW, ConfigManager.STATIC_THEMES_INDEX),
                                detectDarkTheme: settings.detectDarkTheme,
                                detectorHints,
                                theme,
                            },
                        };
                    }
                    case ThemeEngine.dynamicTheme: {
                        const fixes = getDynamicThemeFixesFor(url, isTopFrame, ConfigManager.DYNAMIC_THEME_FIXES_RAW, ConfigManager.DYNAMIC_THEME_FIXES_INDEX, UserStorage.settings.enableForPDF);
                        return {
                            type: MessageTypeBGtoCS.ADD_DYNAMIC_THEME,
                            data: {
                                theme,
                                fixes,
                                isIFrame: !isTopFrame,
                                detectDarkTheme,
                                detectorHints,
                            },
                        };
                    }
                    default:
                        throw new Error(`Unknown engine ${theme.engine}`);
                }
            }
            logInfo(`Site is not inverted: ${tabURL}`);
            return {
                type: MessageTypeBGtoCS.CLEAN_UP,
            };
        };
        //-------------------------------------
        //          User settings
        static async saveUserSettings() {
            await UserStorage.saveSettings();
            logInfo('saved', UserStorage.settings);
        }
    }

    // Start extension
    Extension.start();
    const welcome = `  /''''\\
 (0)==(0)
/__||||__\\
Welcome to Dark Reader!`;
    console.log(welcome);
    {
        chrome.runtime.onInstalled.addListener(async () => {
            Extension.isFirstLoad = true;
        });
        keepListeningToEvents();
    }
    function writeInstallationVersion(storage, details) {
        storage.get({ installation: { version: '' } }, (data) => {
            if (data?.installation?.version) {
                return;
            }
            storage.set({ installation: {
                    date: Date.now(),
                    reason: details.reason,
                    version: details.previousVersion ?? chrome.runtime.getManifest().version,
                } });
        });
    }
    chrome.runtime.onInstalled.addListener((details) => {
        writeInstallationVersion(chrome.storage.local, details);
        writeInstallationVersion(chrome.storage.sync, details);
    });

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9wbGF0Zm9ybS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy90aW1lLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL2NhY2hlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3VybC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iYWNrZ3JvdW5kL3V0aWxzL2V4dGVuc2lvbi1hcGkudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvbGlua3MudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvbWVkaWEtcXVlcnkudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvbWVzc2FnZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy90ZXh0LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvdGV4dC1zdHlsZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9hcnJheS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9nZW5lcmF0b3JzL3V0aWxzL2Zvcm1hdC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9tYXRoLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvdXRpbHMvbWF0cml4LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvdXRpbHMvcGFyc2UudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZ2VuZXJhdG9ycy9jc3MtZmlsdGVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvZGV0ZWN0b3ItaGludHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvY3NzLXRleHQvY3NzLXRleHQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvY3NzLXRleHQvcGFyc2UtY3NzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL2Nzcy10ZXh0L2Zvcm1hdC1jc3MudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZ2VuZXJhdG9ycy9keW5hbWljLXRoZW1lLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvc3RhdGljLXRoZW1lLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dlbmVyYXRvcnMvc3ZnLWZpbHRlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9nZW5lcmF0b3JzL3RoZW1lLWVuZ2luZXMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvYXV0b21hdGlvbi50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9kZWJvdW5jZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9wcm9taXNlLWJhcnJpZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvc3RhdGUtbWFuYWdlci1pbXBsLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3N0YXRlLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvdGFicy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9kZWZhdWx0cy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9jb2xvcnNjaGVtZS1wYXJzZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvdmFsaWRhdGlvbi50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iYWNrZ3JvdW5kL3V0aWxzL3NlbmRMb2cudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC91dGlscy9sb2cudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC91c2VyLXN0b3JhZ2UudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvbmV0d29yay50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iYWNrZ3JvdW5kL3V0aWxzL25ldHdvcmsudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9jb25maWctbWFuYWdlci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iYWNrZ3JvdW5kL2RldnRvb2xzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvaWNvbi1tYW5hZ2VyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvbWVzc2VuZ2VyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvbmV3c21ha2VyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvdXRpbHMvdGFiLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvdGFiLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC91aS1oaWdobGlnaHRzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL21hdGgtZXZhbC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy91dGlscy9jb2xvci50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9pbmplY3QvZHluYW1pYy10aGVtZS9wYWxldHRlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2luamVjdC9keW5hbWljLXRoZW1lL21vZGlmeS1jb2xvcnMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC93aW5kb3ctdGhlbWUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9leHRlbnNpb24udHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJkZWNsYXJlIGNvbnN0IF9fQ0hST01JVU1fTVYyX186IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IF9fQ0hST01JVU1fTVYzX186IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IF9fRklSRUZPWF9NVjJfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19USFVOREVSQklSRF9fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcblxuaW50ZXJmYWNlIFVzZXJBZ2VudERhdGEge1xuICAgIGJyYW5kczogQXJyYXk8e1xuICAgICAgICBicmFuZDogc3RyaW5nO1xuICAgICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgfT47XG4gICAgbW9iaWxlOiBib29sZWFuO1xuICAgIHBsYXRmb3JtOiBzdHJpbmc7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgTmF2aWdhdG9ySUQge1xuICAgICAgICB1c2VyQWdlbnREYXRhOiBVc2VyQWdlbnREYXRhO1xuICAgIH1cbn1cblxuZGVjbGFyZSBjb25zdCBfX1BMVVNfXzogYm9vbGVhbjtcblxuY29uc3QgaXNOYXZpZ2F0b3JEZWZpbmVkID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCc7XG5jb25zdCB1c2VyQWdlbnQgPSBpc05hdmlnYXRvckRlZmluZWQgPyAobmF2aWdhdG9yLnVzZXJBZ2VudERhdGEgJiYgQXJyYXkuaXNBcnJheShuYXZpZ2F0b3IudXNlckFnZW50RGF0YS5icmFuZHMpKSA/XG4gICAgbmF2aWdhdG9yLnVzZXJBZ2VudERhdGEuYnJhbmRzLm1hcCgoYnJhbmQpID0+IGAke2JyYW5kLmJyYW5kLnRvTG93ZXJDYXNlKCl9ICR7YnJhbmQudmVyc2lvbn1gKS5qb2luKCcgJykgOiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKClcbiAgICA6ICdzb21lIHVzZXJhZ2VudCc7XG5cbmNvbnN0IHBsYXRmb3JtID0gaXNOYXZpZ2F0b3JEZWZpbmVkID8gKG5hdmlnYXRvci51c2VyQWdlbnREYXRhICYmIHR5cGVvZiBuYXZpZ2F0b3IudXNlckFnZW50RGF0YS5wbGF0Zm9ybSA9PT0gJ3N0cmluZycpID9cbiAgICBuYXZpZ2F0b3IudXNlckFnZW50RGF0YS5wbGF0Zm9ybS50b0xvd2VyQ2FzZSgpIDogbmF2aWdhdG9yLnBsYXRmb3JtLnRvTG93ZXJDYXNlKClcbiAgICA6ICdzb21lIHBsYXRmb3JtJztcblxuLy8gTm90ZTogaWYgeW91IGFyZSB1c2luZyB0aGVzZSBjb25zdGFudHMgaW4gdGVzdHMsIG1ha2Ugc3VyZSB0aGV5IGFyZSBub3QgY29tcGlsZWQgb3V0IGJ5IGFkZGluZyBfX1RFU1RfXyB0byB0aGVtXG5leHBvcnQgY29uc3QgaXNDaHJvbWl1bSA9IF9fQ0hST01JVU1fTVYyX18gfHwgX19DSFJPTUlVTV9NVjNfXyB8fCAoIV9fRklSRUZPWF9NVjJfXyAmJiAhX19USFVOREVSQklSRF9fICYmICh1c2VyQWdlbnQuaW5jbHVkZXMoJ2Nocm9tZScpIHx8IHVzZXJBZ2VudC5pbmNsdWRlcygnY2hyb21pdW0nKSkpO1xuZXhwb3J0IGNvbnN0IGlzRmlyZWZveCA9IF9fRklSRUZPWF9NVjJfXyB8fCBfX1RIVU5ERVJCSVJEX18gfHwgKChfX1RFU1RfXyB8fCAoIV9fQ0hST01JVU1fTVYyX18gJiYgIV9fQ0hST01JVU1fTVYzX18pKSAmJiAodXNlckFnZW50LmluY2x1ZGVzKCdmaXJlZm94JykgfHwgdXNlckFnZW50LmluY2x1ZGVzKCd0aHVuZGVyYmlyZCcpIHx8IHVzZXJBZ2VudC5pbmNsdWRlcygnbGlicmV3b2xmJykpKTtcbmV4cG9ydCBjb25zdCBpc1ZpdmFsZGkgPSAoX19DSFJPTUlVTV9NVjJfXyB8fCBfX0NIUk9NSVVNX01WM19fKSAmJiAoIV9fRklSRUZPWF9NVjJfXyAmJiAhX19USFVOREVSQklSRF9fICYmIHVzZXJBZ2VudC5pbmNsdWRlcygndml2YWxkaScpKTtcbmV4cG9ydCBjb25zdCBpc1lhQnJvd3NlciA9IChfX0NIUk9NSVVNX01WMl9fIHx8IF9fQ0hST01JVU1fTVYzX18pICYmICghX19GSVJFRk9YX01WMl9fICYmICFfX1RIVU5ERVJCSVJEX18gJiYgdXNlckFnZW50LmluY2x1ZGVzKCd5YWJyb3dzZXInKSk7XG5leHBvcnQgY29uc3QgaXNPcGVyYSA9IChfX0NIUk9NSVVNX01WMl9fIHx8IF9fQ0hST01JVU1fTVYzX18pICYmICghX19GSVJFRk9YX01WMl9fICYmICFfX1RIVU5ERVJCSVJEX18gJiYgKHVzZXJBZ2VudC5pbmNsdWRlcygnb3ByJykgfHwgdXNlckFnZW50LmluY2x1ZGVzKCdvcGVyYScpKSk7XG5leHBvcnQgY29uc3QgaXNFZGdlID0gKF9fQ0hST01JVU1fTVYyX18gfHwgX19DSFJPTUlVTV9NVjNfXykgJiYgKCFfX0ZJUkVGT1hfTVYyX18gJiYgIV9fVEhVTkRFUkJJUkRfXyAmJiB1c2VyQWdlbnQuaW5jbHVkZXMoJ2VkZycpKTtcbmV4cG9ydCBjb25zdCBpc1NhZmFyaSA9ICFfX0NIUk9NSVVNX01WMl9fICYmICFfX0NIUk9NSVVNX01WM19fICYmICFfX0ZJUkVGT1hfTVYyX18gJiYgIV9fVEhVTkRFUkJJUkRfXyAmJiB1c2VyQWdlbnQuaW5jbHVkZXMoJ3NhZmFyaScpICYmICFpc0Nocm9taXVtO1xuZXhwb3J0IGNvbnN0IGlzV2luZG93cyA9IHBsYXRmb3JtLnN0YXJ0c1dpdGgoJ3dpbicpO1xuZXhwb3J0IGNvbnN0IGlzTWFjT1MgPSBwbGF0Zm9ybS5zdGFydHNXaXRoKCdtYWMnKTtcbmV4cG9ydCBjb25zdCBpc01vYmlsZSA9IChpc05hdmlnYXRvckRlZmluZWQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudERhdGEpID8gbmF2aWdhdG9yLnVzZXJBZ2VudERhdGEubW9iaWxlIDogKHVzZXJBZ2VudC5pbmNsdWRlcygnbW9iaWxlJykgfHwgKF9fUExVU19fICYmIHVzZXJBZ2VudC5pbmNsdWRlcygnZWRnaW9zJykpKTtcbmV4cG9ydCBjb25zdCBpc1NoYWRvd0RvbVN1cHBvcnRlZCA9IHR5cGVvZiBTaGFkb3dSb290ID09PSAnZnVuY3Rpb24nO1xuZXhwb3J0IGNvbnN0IGlzTWF0Y2hNZWRpYUNoYW5nZUV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQgPSBfX0NIUk9NSVVNX01WM19fIHx8IChcbiAgICB0eXBlb2YgTWVkaWFRdWVyeUxpc3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgTWVkaWFRdWVyeUxpc3QucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbidcbik7XG5leHBvcnQgY29uc3QgaXNMYXllclJ1bGVTdXBwb3J0ZWQgPSB0eXBlb2YgQ1NTTGF5ZXJCbG9ja1J1bGUgPT09ICdmdW5jdGlvbic7XG4vLyBSZXR1cm4gdHJ1ZSBpZiBicm93c2VyIGlzIGtub3duIHRvIGhhdmUgYSBidWcgd2l0aCBNZWRpYSBRdWVyaWVzLCBzcGVjaWZpY2FsbHkgQ2hyb21pdW0gb24gTGludXggYW5kIEtpd2kgb24gQW5kcm9pZFxuLy8gV2UgYXNzdW1lIHRoYXQgaWYgd2UgYXJlIG9uIEFuZHJvaWQsIHRoZW4gd2UgYXJlIHJ1bm5pbmcgaW4gS2l3aSBzaW5jZSBpdCBpcyB0aGUgb25seSBtb2JpbGUgYnJvd3NlciB3ZSBjYW4gaW5zdGFsbCBEYXJrIFJlYWRlciBpblxuZXhwb3J0IGNvbnN0IGlzTWF0Y2hNZWRpYUNoYW5nZUV2ZW50TGlzdGVuZXJCdWdneSA9ICFfX1RFU1RfXyAmJiAhX19GSVJFRk9YX01WMl9fICYmICFfX1RIVU5ERVJCSVJEX18gJiYgKF9fQ0hST01JVU1fTVYyX18gfHwgX19DSFJPTUlVTV9NVjNfXykgJiYgKFxuICAgICgoaXNOYXZpZ2F0b3JEZWZpbmVkICYmIG5hdmlnYXRvci51c2VyQWdlbnREYXRhKSAmJiBbJ0xpbnV4JywgJ0FuZHJvaWQnXS5pbmNsdWRlcyhuYXZpZ2F0b3IudXNlckFnZW50RGF0YS5wbGF0Zm9ybSkpXG4gICAgfHwgcGxhdGZvcm0uc3RhcnRzV2l0aCgnbGludXgnKSk7XG4vLyBOb3RlOiBtYWtlIHN1cmUgdGhhdCB0aGlzIHZhbHVlIG1hdGNoZXMgbWFuaWZlc3QuanNvbiBrZXlzXG5leHBvcnQgY29uc3QgaXNOb25QZXJzaXN0ZW50ID0gIV9fRklSRUZPWF9NVjJfXyAmJiAhX19USFVOREVSQklSRF9fICYmIChfX0NIUk9NSVVNX01WM19fIHx8IGlzU2FmYXJpKTtcblxuZXhwb3J0IGNvbnN0IGNocm9taXVtVmVyc2lvbiA9ICgoKSA9PiB7XG4gICAgY29uc3QgbSA9IHVzZXJBZ2VudC5tYXRjaCgvY2hyb20oPzplfGl1bSkoPzpcXC98ICkoW14gXSspLyk7XG4gICAgaWYgKG0gJiYgbVsxXSkge1xuICAgICAgICByZXR1cm4gbVsxXTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGZpcmVmb3hWZXJzaW9uID0gKCgpID0+IHtcbiAgICBjb25zdCBtID0gdXNlckFnZW50Lm1hdGNoKC8oPzpmaXJlZm94fGxpYnJld29sZikoPzpcXC98ICkoW14gXSspLyk7XG4gICAgaWYgKG0gJiYgbVsxXSkge1xuICAgICAgICByZXR1cm4gbVsxXTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGlzRGVmaW5lZFNlbGVjdG9yU3VwcG9ydGVkID0gKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCc6ZGVmaW5lZCcpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlQ2hyb21lVmVyc2lvbnMoJGE6IHN0cmluZywgJGI6IHN0cmluZyk6IC0xIHwgMCB8IDEge1xuICAgIGNvbnN0IGEgPSAkYS5zcGxpdCgnLicpLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCkpO1xuICAgIGNvbnN0IGIgPSAkYi5zcGxpdCgnLicpLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCkpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gPCBiW2ldID8gLTEgOiAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwO1xufVxuXG5leHBvcnQgY29uc3QgaXNYTUxIdHRwUmVxdWVzdFN1cHBvcnRlZCA9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCA9PT0gJ2Z1bmN0aW9uJztcblxuZXhwb3J0IGNvbnN0IGlzRmV0Y2hTdXBwb3J0ZWQgPSB0eXBlb2YgZmV0Y2ggPT09ICdmdW5jdGlvbic7XG5cbmV4cG9ydCBjb25zdCBpc0NTU0NvbG9yU2NoZW1lUHJvcFN1cHBvcnRlZCA9IF9fQ0hST01JVU1fTVYzX18gfHwgKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGlmICghZWwgfHwgdHlwZW9mIGVsLnN0eWxlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZWwuc3R5bGUuY29sb3JTY2hlbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGUgZm9sbG93aW5nIGNvZGUgYWZ0ZXIgZW5mb3JjaW5nIHN0cm9uZyBDU1AgaW4gYWxsIGJ1aWxkc1xuICAgICAgICAvLyBUaGlzIGZlYXR1cmUgZGV0ZWN0aW9uIG1ldGhvZCByZXF1aXJlcyB3ZWFrIG9yIG1pc3NpbmcgQ1NQIGluIG1hbmlmZXN0Lmpzb25cbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdzdHlsZScsICdjb2xvci1zY2hlbWU6IGRhcmsnKTtcbiAgICAgICAgcmV0dXJuIGVsLnN0eWxlLmNvbG9yU2NoZW1lID09PSAnZGFyayc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSkoKTtcbiIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWUoJHRpbWU6IHN0cmluZyk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGNvbnN0IHBhcnRzID0gJHRpbWUuc3BsaXQoJzonKS5zbGljZSgwLCAyKTtcbiAgICBjb25zdCBsb3dlcmNhc2VkID0gJHRpbWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgaXNBTSA9IGxvd2VyY2FzZWQuZW5kc1dpdGgoJ2FtJykgfHwgbG93ZXJjYXNlZC5lbmRzV2l0aCgnYS5tLicpO1xuICAgIGNvbnN0IGlzUE0gPSBsb3dlcmNhc2VkLmVuZHNXaXRoKCdwbScpIHx8IGxvd2VyY2FzZWQuZW5kc1dpdGgoJ3AubS4nKTtcblxuICAgIGxldCBob3VycyA9IHBhcnRzLmxlbmd0aCA+IDAgPyBwYXJzZUludChwYXJ0c1swXSkgOiAwO1xuICAgIGlmIChpc05hTihob3VycykgfHwgaG91cnMgPiAyMykge1xuICAgICAgICBob3VycyA9IDA7XG4gICAgfVxuICAgIGlmIChpc0FNICYmIGhvdXJzID09PSAxMikge1xuICAgICAgICBob3VycyA9IDA7XG4gICAgfVxuICAgIGlmIChpc1BNICYmIGhvdXJzIDwgMTIpIHtcbiAgICAgICAgaG91cnMgKz0gMTI7XG4gICAgfVxuXG4gICAgbGV0IG1pbnV0ZXMgPSBwYXJ0cy5sZW5ndGggPiAxID8gcGFyc2VJbnQocGFydHNbMV0pIDogMDtcbiAgICBpZiAoaXNOYU4obWludXRlcykgfHwgbWludXRlcyA+IDU5KSB7XG4gICAgICAgIG1pbnV0ZXMgPSAwO1xuICAgIH1cblxuICAgIHJldHVybiBbaG91cnMsIG1pbnV0ZXNdO1xufVxuXG5mdW5jdGlvbiBwYXJzZTI0SFRpbWUodGltZTogc3RyaW5nKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aW1lLnNwbGl0KCc6JykubWFwKCh4KSA9PiBwYXJzZUludCh4KSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVUaW1lKHRpbWUxOiBudW1iZXJbXSwgdGltZTI6IG51bWJlcltdKTogLTEgfCAwIHwgMSB7XG4gICAgaWYgKHRpbWUxWzBdID09PSB0aW1lMlswXSAmJiB0aW1lMVsxXSA9PT0gdGltZTJbMV0pIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmICh0aW1lMVswXSA8IHRpbWUyWzBdIHx8ICh0aW1lMVswXSA9PT0gdGltZTJbMF0gJiYgdGltZTFbMV0gPCB0aW1lMlsxXSkpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRUaW1lSW50ZXJ2YWwodGltZTA6IHN0cmluZywgdGltZTE6IHN0cmluZywgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCkpOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCBhID0gcGFyc2UyNEhUaW1lKHRpbWUwKTtcbiAgICBjb25zdCBiID0gcGFyc2UyNEhUaW1lKHRpbWUxKTtcbiAgICBjb25zdCB0ID0gW2RhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCldO1xuXG4gICAgLy8gRW5zdXJlIGEgPD0gYlxuICAgIGlmIChjb21wYXJlVGltZShhLCBiKSA+IDApIHtcbiAgICAgICAgcmV0dXJuIG5leHRUaW1lSW50ZXJ2YWwodGltZTEsIHRpbWUwLCBkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoY29tcGFyZVRpbWUoYSwgYikgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGNvbXBhcmVUaW1lKHQsIGEpIDwgMCkge1xuICAgICAgICAvLyB0IDwgYSA8PSBiXG4gICAgICAgIC8vIFNjaGVkdWxlIGZvciB0b2RhdGUgYXQgdGltZSBhXG4gICAgICAgIGRhdGUuc2V0SG91cnMoYVswXSk7XG4gICAgICAgIGRhdGUuc2V0TWludXRlcyhhWzFdKTtcbiAgICAgICAgZGF0ZS5zZXRTZWNvbmRzKDApO1xuICAgICAgICBkYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xuICAgIH1cblxuICAgIGlmIChjb21wYXJlVGltZSh0LCBiKSA8IDApIHtcbiAgICAgICAgLy8gYSA8PSB0IDwgYlxuICAgICAgICAvLyBTY2hlZHVsZSBmb3IgdG9kYXkgYXQgdGltZSBiXG4gICAgICAgIGRhdGUuc2V0SG91cnMoYlswXSk7XG4gICAgICAgIGRhdGUuc2V0TWludXRlcyhiWzFdKTtcbiAgICAgICAgZGF0ZS5zZXRTZWNvbmRzKDApO1xuICAgICAgICBkYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xuICAgIH1cblxuICAgIC8vIGEgPD0gYiA8PSB0XG4gICAgLy8gU2NoZWR1bGUgZm9yIHRvbW9ycm93IGF0IHRpbWUgYVxuICAgIHJldHVybiAobmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpICsgMSwgYVswXSwgYVsxXSkpLmdldFRpbWUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5UaW1lSW50ZXJ2YWxMb2NhbCh0aW1lMDogc3RyaW5nLCB0aW1lMTogc3RyaW5nLCBkYXRlOiBEYXRlID0gbmV3IERhdGUoKSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGEgPSBwYXJzZTI0SFRpbWUodGltZTApO1xuICAgIGNvbnN0IGIgPSBwYXJzZTI0SFRpbWUodGltZTEpO1xuICAgIGNvbnN0IHQgPSBbZGF0ZS5nZXRIb3VycygpLCBkYXRlLmdldE1pbnV0ZXMoKV07XG4gICAgaWYgKGNvbXBhcmVUaW1lKGEsIGIpID4gMCkge1xuICAgICAgICByZXR1cm4gY29tcGFyZVRpbWUoYSwgdCkgPD0gMCB8fCBjb21wYXJlVGltZSh0LCBiKSA8IDA7XG4gICAgfVxuICAgIHJldHVybiBjb21wYXJlVGltZShhLCB0KSA8PSAwICYmIGNvbXBhcmVUaW1lKHQsIGIpIDwgMDtcbn1cblxuZnVuY3Rpb24gaXNJblRpbWVJbnRlcnZhbFVUQyh0aW1lMDogbnVtYmVyLCB0aW1lMTogbnVtYmVyLCB0aW1lc3RhbXA6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aW1lMSA8IHRpbWUwKSB7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXAgPD0gdGltZTEgfHwgdGltZTAgPD0gdGltZXN0YW1wO1xuICAgIH1cbiAgICByZXR1cm4gdGltZTAgPCB0aW1lc3RhbXAgJiYgdGltZXN0YW1wIDwgdGltZTE7XG59XG5cbmludGVyZmFjZSBEdXJhdGlvbiB7XG4gICAgZGF5cz86IG51bWJlcjtcbiAgICBob3Vycz86IG51bWJlcjtcbiAgICBtaW51dGVzPzogbnVtYmVyO1xuICAgIHNlY29uZHM/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREdXJhdGlvbih0aW1lOiBEdXJhdGlvbik6IG51bWJlciB7XG4gICAgbGV0IGR1cmF0aW9uID0gMDtcbiAgICBpZiAodGltZS5zZWNvbmRzKSB7XG4gICAgICAgIGR1cmF0aW9uICs9IHRpbWUuc2Vjb25kcyAqIDEwMDA7XG4gICAgfVxuICAgIGlmICh0aW1lLm1pbnV0ZXMpIHtcbiAgICAgICAgZHVyYXRpb24gKz0gdGltZS5taW51dGVzICogNjAgKiAxMDAwO1xuICAgIH1cbiAgICBpZiAodGltZS5ob3Vycykge1xuICAgICAgICBkdXJhdGlvbiArPSB0aW1lLmhvdXJzICogNjAgKiA2MCAqIDEwMDA7XG4gICAgfVxuICAgIGlmICh0aW1lLmRheXMpIHtcbiAgICAgICAgZHVyYXRpb24gKz0gdGltZS5kYXlzICogMjQgKiA2MCAqIDYwICogMTAwMDtcbiAgICB9XG4gICAgcmV0dXJuIGR1cmF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHVyYXRpb25Jbk1pbnV0ZXModGltZTogRHVyYXRpb24pOiBudW1iZXIge1xuICAgIHJldHVybiBnZXREdXJhdGlvbih0aW1lKSAvIDEwMDAgLyA2MDtcbn1cblxuZnVuY3Rpb24gZ2V0U3Vuc2V0U3VucmlzZVVUQ1RpbWUoXG4gICAgbGF0aXR1ZGU6IG51bWJlcixcbiAgICBsb25naXR1ZGU6IG51bWJlcixcbiAgICBkYXRlOiBEYXRlLFxuKSB7XG4gICAgY29uc3QgZGVjMzEgPSBEYXRlLlVUQyhkYXRlLmdldFVUQ0Z1bGxZZWFyKCksIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgIGNvbnN0IG9uZURheSA9IGdldER1cmF0aW9uKHtkYXlzOiAxfSk7XG4gICAgY29uc3QgZGF5T2ZZZWFyID0gTWF0aC5mbG9vcigoZGF0ZS5nZXRUaW1lKCkgLSBkZWMzMSkgLyBvbmVEYXkpO1xuXG4gICAgY29uc3QgemVuaXRoID0gOTAuODMzMzMzMzMzMzMzMzM7XG4gICAgY29uc3QgRDJSID0gTWF0aC5QSSAvIDE4MDtcbiAgICBjb25zdCBSMkQgPSAxODAgLyBNYXRoLlBJO1xuXG4gICAgLy8gY29udmVydCB0aGUgbG9uZ2l0dWRlIHRvIGhvdXIgdmFsdWUgYW5kIGNhbGN1bGF0ZSBhbiBhcHByb3hpbWF0ZSB0aW1lXG4gICAgY29uc3QgbG5Ib3VyID0gbG9uZ2l0dWRlIC8gMTU7XG5cbiAgICBmdW5jdGlvbiBnZXRUaW1lKGlzU3VucmlzZTogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB0ID0gZGF5T2ZZZWFyICsgKCgoaXNTdW5yaXNlID8gNiA6IDE4KSAtIGxuSG91cikgLyAyNCk7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBTdW4ncyBtZWFuIGFub21hbHlcbiAgICAgICAgY29uc3QgTSA9ICgwLjk4NTYgKiB0KSAtIDMuMjg5O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgU3VuJ3MgdHJ1ZSBsb25naXR1ZGVcbiAgICAgICAgbGV0IEwgPSBNICsgKDEuOTE2ICogTWF0aC5zaW4oTSAqIEQyUikpICsgKDAuMDIwICogTWF0aC5zaW4oMiAqIE0gKiBEMlIpKSArIDI4Mi42MzQ7XG4gICAgICAgIGlmIChMID4gMzYwKSB7XG4gICAgICAgICAgICBMIC09IDM2MDtcbiAgICAgICAgfSBlbHNlIGlmIChMIDwgMCkge1xuICAgICAgICAgICAgTCArPSAzNjA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIFN1bidzIHJpZ2h0IGFzY2Vuc2lvblxuICAgICAgICBsZXQgUkEgPSBSMkQgKiBNYXRoLmF0YW4oMC45MTc2NCAqIE1hdGgudGFuKEwgKiBEMlIpKTtcbiAgICAgICAgaWYgKFJBID4gMzYwKSB7XG4gICAgICAgICAgICBSQSAtPSAzNjA7XG4gICAgICAgIH0gZWxzZSBpZiAoUkEgPCAwKSB7XG4gICAgICAgICAgICBSQSArPSAzNjA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByaWdodCBhc2NlbnNpb24gdmFsdWUgbmVlZHMgdG8gYmUgaW4gdGhlIHNhbWUgcXVhXG4gICAgICAgIGNvbnN0IExxdWFkcmFudCA9IChNYXRoLmZsb29yKEwgLyAoOTApKSkgKiA5MDtcbiAgICAgICAgY29uc3QgUkFxdWFkcmFudCA9IChNYXRoLmZsb29yKFJBIC8gOTApKSAqIDkwO1xuICAgICAgICBSQSArPSAoTHF1YWRyYW50IC0gUkFxdWFkcmFudCk7XG5cbiAgICAgICAgLy8gcmlnaHQgYXNjZW5zaW9uIHZhbHVlIG5lZWRzIHRvIGJlIGNvbnZlcnRlZCBpbnRvIGhvdXJzXG4gICAgICAgIFJBIC89IDE1O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgU3VuJ3MgZGVjbGluYXRpb25cbiAgICAgICAgY29uc3Qgc2luRGVjID0gMC4zOTc4MiAqIE1hdGguc2luKEwgKiBEMlIpO1xuICAgICAgICBjb25zdCBjb3NEZWMgPSBNYXRoLmNvcyhNYXRoLmFzaW4oc2luRGVjKSk7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBTdW4ncyBsb2NhbCBob3VyIGFuZ2xlXG4gICAgICAgIGNvbnN0IGNvc0ggPSAoTWF0aC5jb3MoemVuaXRoICogRDJSKSAtIChzaW5EZWMgKiBNYXRoLnNpbihsYXRpdHVkZSAqIEQyUikpKSAvIChjb3NEZWMgKiBNYXRoLmNvcyhsYXRpdHVkZSAqIEQyUikpO1xuICAgICAgICBpZiAoY29zSCA+IDEpIHtcbiAgICAgICAgICAgIC8vIGFsd2F5cyBuaWdodFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhbHdheXNEYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFsd2F5c05pZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpbWU6IDAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGNvc0ggPCAtMSkge1xuICAgICAgICAgICAgLy8gYWx3YXlzIGRheVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhbHdheXNEYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgYWx3YXlzTmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRpbWU6IDAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgSCA9IChpc1N1bnJpc2UgPyAoMzYwIC0gUjJEICogTWF0aC5hY29zKGNvc0gpKSA6IChSMkQgKiBNYXRoLmFjb3MoY29zSCkpKSAvIDE1O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBsb2NhbCBtZWFuIHRpbWUgb2YgcmlzaW5nL3NldHRpbmdcbiAgICAgICAgY29uc3QgVCA9IEggKyBSQSAtICgwLjA2NTcxICogdCkgLSA2LjYyMjtcblxuICAgICAgICAvLyBhZGp1c3QgYmFjayB0byBVVENcbiAgICAgICAgbGV0IFVUID0gVCAtIGxuSG91cjtcbiAgICAgICAgaWYgKFVUID4gMjQpIHtcbiAgICAgICAgICAgIFVUIC09IDI0O1xuICAgICAgICB9IGVsc2UgaWYgKFVUIDwgMCkge1xuICAgICAgICAgICAgVVQgKz0gMjQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb252ZXJ0IHRvIG1pbGxpc2Vjb25kc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWx3YXlzRGF5OiBmYWxzZSxcbiAgICAgICAgICAgIGFsd2F5c05pZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIHRpbWU6IE1hdGgucm91bmQoVVQgKiBnZXREdXJhdGlvbih7aG91cnM6IDF9KSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3VucmlzZVRpbWUgPSBnZXRUaW1lKHRydWUpO1xuICAgIGNvbnN0IHN1bnNldFRpbWUgPSBnZXRUaW1lKGZhbHNlKTtcblxuICAgIGlmIChzdW5yaXNlVGltZS5hbHdheXNEYXkgfHwgc3Vuc2V0VGltZS5hbHdheXNEYXkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFsd2F5c0RheTogdHJ1ZSxcbiAgICAgICAgICAgIGFsd2F5c05pZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIHN1bnJpc2VUaW1lOiAwLFxuICAgICAgICAgICAgc3Vuc2V0VGltZTogMCxcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHN1bnJpc2VUaW1lLmFsd2F5c05pZ2h0IHx8IHN1bnNldFRpbWUuYWx3YXlzTmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFsd2F5c0RheTogZmFsc2UsXG4gICAgICAgICAgICBhbHdheXNOaWdodDogdHJ1ZSxcbiAgICAgICAgICAgIHN1bnJpc2VUaW1lOiAwLFxuICAgICAgICAgICAgc3Vuc2V0VGltZTogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhbHdheXNEYXk6IGZhbHNlLFxuICAgICAgICBhbHdheXNOaWdodDogZmFsc2UsXG4gICAgICAgIHN1bnJpc2VUaW1lOiBzdW5yaXNlVGltZS50aW1lLFxuICAgICAgICBzdW5zZXRUaW1lOiBzdW5zZXRUaW1lLnRpbWUsXG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmlnaHRBdExvY2F0aW9uKFxuICAgIGxhdGl0dWRlOiBudW1iZXIsXG4gICAgbG9uZ2l0dWRlOiBudW1iZXIsXG4gICAgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCksXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCB0aW1lID0gZ2V0U3Vuc2V0U3VucmlzZVVUQ1RpbWUobGF0aXR1ZGUsIGxvbmdpdHVkZSwgZGF0ZSk7XG5cbiAgICBpZiAodGltZS5hbHdheXNEYXkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodGltZS5hbHdheXNOaWdodCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBzdW5yaXNlVGltZSA9IHRpbWUuc3VucmlzZVRpbWU7XG4gICAgY29uc3Qgc3Vuc2V0VGltZSA9IHRpbWUuc3Vuc2V0VGltZTtcbiAgICBjb25zdCBjdXJyZW50VGltZSA9IChcbiAgICAgICAgZGF0ZS5nZXRVVENIb3VycygpICogZ2V0RHVyYXRpb24oe2hvdXJzOiAxfSkgK1xuICAgICAgICBkYXRlLmdldFVUQ01pbnV0ZXMoKSAqIGdldER1cmF0aW9uKHttaW51dGVzOiAxfSkgK1xuICAgICAgICBkYXRlLmdldFVUQ1NlY29uZHMoKSAqIGdldER1cmF0aW9uKHtzZWNvbmRzOiAxfSkgK1xuICAgICAgICBkYXRlLmdldFVUQ01pbGxpc2Vjb25kcygpXG4gICAgKTtcblxuICAgIHJldHVybiBpc0luVGltZUludGVydmFsVVRDKHN1bnNldFRpbWUsIHN1bnJpc2VUaW1lLCBjdXJyZW50VGltZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXh0VGltZUNoYW5nZUF0TG9jYXRpb24oXG4gICAgbGF0aXR1ZGU6IG51bWJlcixcbiAgICBsb25naXR1ZGU6IG51bWJlcixcbiAgICBkYXRlOiBEYXRlID0gbmV3IERhdGUoKSxcbik6IG51bWJlciB7XG4gICAgY29uc3QgdGltZSA9IGdldFN1bnNldFN1bnJpc2VVVENUaW1lKGxhdGl0dWRlLCBsb25naXR1ZGUsIGRhdGUpO1xuXG4gICAgaWYgKHRpbWUuYWx3YXlzRGF5KSB7XG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSArIGdldER1cmF0aW9uKHtkYXlzOiAxfSk7XG4gICAgfSBlbHNlIGlmICh0aW1lLmFsd2F5c05pZ2h0KSB7XG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSArIGdldER1cmF0aW9uKHtkYXlzOiAxfSk7XG4gICAgfVxuXG4gICAgY29uc3QgW2ZpcnN0VGltZU9uRGF5LCBsYXN0VGltZU9uRGF5XSA9IHRpbWUuc3VucmlzZVRpbWUgPCB0aW1lLnN1bnNldFRpbWUgPyBbdGltZS5zdW5yaXNlVGltZSwgdGltZS5zdW5zZXRUaW1lXSA6IFt0aW1lLnN1bnNldFRpbWUsIHRpbWUuc3VucmlzZVRpbWVdO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gKFxuICAgICAgICBkYXRlLmdldFVUQ0hvdXJzKCkgKiBnZXREdXJhdGlvbih7aG91cnM6IDF9KSArXG4gICAgICAgIGRhdGUuZ2V0VVRDTWludXRlcygpICogZ2V0RHVyYXRpb24oe21pbnV0ZXM6IDF9KSArXG4gICAgICAgIGRhdGUuZ2V0VVRDU2Vjb25kcygpICogZ2V0RHVyYXRpb24oe3NlY29uZHM6IDF9KSArXG4gICAgICAgIGRhdGUuZ2V0VVRDTWlsbGlzZWNvbmRzKClcbiAgICApO1xuXG4gICAgaWYgKGN1cnJlbnRUaW1lIDw9IGZpcnN0VGltZU9uRGF5ISkge1xuICAgICAgICAvLyBUaW1lbGluZTpcbiAgICAgICAgLy8gLS0tIGZpcnN0VGltZU9uRGF5IDwtLS0+IGxhc3RUaW1lT25EYXkgLS0tXG4gICAgICAgIC8vICBeXG4gICAgICAgIC8vIEN1cnJlbnQgdGltZVxuICAgICAgICByZXR1cm4gRGF0ZS5VVEMoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCBkYXRlLmdldFVUQ01vbnRoKCksIGRhdGUuZ2V0VVRDRGF0ZSgpLCAwLCAwLCAwLCBmaXJzdFRpbWVPbkRheSk7XG4gICAgfVxuICAgIGlmIChjdXJyZW50VGltZSA8PSBsYXN0VGltZU9uRGF5ISkge1xuICAgICAgICAvLyBUaW1lbGluZTpcbiAgICAgICAgLy8gLS0tIGZpcnN0VGltZU9uRGF5IDwtLS0+IGxhc3RUaW1lT25EYXkgLS0tXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIF5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIEN1cnJlbnQgdGltZVxuICAgICAgICByZXR1cm4gRGF0ZS5VVEMoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCBkYXRlLmdldFVUQ01vbnRoKCksIGRhdGUuZ2V0VVRDRGF0ZSgpLCAwLCAwLCAwLCBsYXN0VGltZU9uRGF5KTtcbiAgICB9XG4gICAgLy8gVGltZWxpbmU6XG4gICAgLy8gLS0tIGZpcnN0VGltZU9uRGF5IDwtLS0+IGxhc3RUaW1lT25EYXkgLS0tXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEN1cnJlbnQgdGltZVxuICAgIHJldHVybiBEYXRlLlVUQyhkYXRlLmdldFVUQ0Z1bGxZZWFyKCksIGRhdGUuZ2V0VVRDTW9udGgoKSwgZGF0ZS5nZXRVVENEYXRlKCkgKyAxLCAwLCAwLCAwLCBmaXJzdFRpbWVPbkRheSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY2FjaGVkRmFjdG9yeTxLLCBWPihmYWN0b3J5OiAoa2V5OiBLKSA9PiBWLCBzaXplOiBudW1iZXIpOiAoa2V5OiBLKSA9PiBWIHtcbiAgICBjb25zdCBjYWNoZSA9IG5ldyBNYXA8SywgVj4oKTtcblxuICAgIHJldHVybiAoa2V5OiBLKSA9PiB7XG4gICAgICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlLmdldChrZXkpITtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGZhY3Rvcnkoa2V5KTtcbiAgICAgICAgY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICBpZiAoY2FjaGUuc2l6ZSA+IHNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0ID0gY2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShmaXJzdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG59XG4iLCJpbXBvcnQgdHlwZSB7VXNlclNldHRpbmdzLCBUYWJJbmZvfSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5cbmltcG9ydCB7Y2FjaGVkRmFjdG9yeX0gZnJvbSAnLi9jYWNoZSc7XG5cbmRlY2xhcmUgY29uc3QgX19USFVOREVSQklSRF9fOiBib29sZWFuO1xuXG5sZXQgYW5jaG9yOiBIVE1MQW5jaG9yRWxlbWVudDtcblxuZXhwb3J0IGNvbnN0IHBhcnNlZFVSTENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFVSTD4oKTtcblxuZnVuY3Rpb24gZml4QmFzZVVSTCgkdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghYW5jaG9yKSB7XG4gICAgICAgIGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG4gICAgYW5jaG9yLmhyZWYgPSAkdXJsO1xuICAgIHJldHVybiBhbmNob3IuaHJlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVVJMKCR1cmw6IHN0cmluZywgJGJhc2U6IHN0cmluZyB8IG51bGwgPSBudWxsKTogVVJMIHtcbiAgICBjb25zdCBrZXkgPSBgJHskdXJsfSR7JGJhc2UgPyBgOyR7JGJhc2V9YCA6ICcnfWA7XG4gICAgaWYgKHBhcnNlZFVSTENhY2hlLmhhcyhrZXkpKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWRVUkxDYWNoZS5nZXQoa2V5KSE7XG4gICAgfVxuICAgIGlmICgkYmFzZSkge1xuICAgICAgICBjb25zdCBwYXJzZWRVUkwgPSBuZXcgVVJMKCR1cmwsIGZpeEJhc2VVUkwoJGJhc2UpKTtcbiAgICAgICAgcGFyc2VkVVJMQ2FjaGUuc2V0KGtleSwgcGFyc2VkVVJMKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlZFVSTDtcbiAgICB9XG4gICAgY29uc3QgcGFyc2VkVVJMID0gbmV3IFVSTChmaXhCYXNlVVJMKCR1cmwpKTtcbiAgICBwYXJzZWRVUkxDYWNoZS5zZXQoJHVybCwgcGFyc2VkVVJMKTtcbiAgICByZXR1cm4gcGFyc2VkVVJMO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWJzb2x1dGVVUkwoJGJhc2U6IHN0cmluZywgJHJlbGF0aXZlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICgkcmVsYXRpdmUubWF0Y2goL15kYXRhXFxcXD9cXDovKSkge1xuICAgICAgICByZXR1cm4gJHJlbGF0aXZlO1xuICAgIH1cbiAgICAvLyBDaGVjayBpZiByZWxhdGl2ZSBzdGFydHMgd2l0aCBgLy9ob3N0bmFtZS4uLmAuXG4gICAgLy8gV2UgaGF2ZSB0byBhZGQgYSBwcm90b2NvbCB0byBtYWtlIGl0IGFic29sdXRlLlxuICAgIGlmICgvXlxcL1xcLy8udGVzdCgkcmVsYXRpdmUpKSB7XG4gICAgICAgIHJldHVybiBgJHtsb2NhdGlvbi5wcm90b2NvbH0keyRyZWxhdGl2ZX1gO1xuICAgIH1cbiAgICBjb25zdCBiID0gcGFyc2VVUkwoJGJhc2UpO1xuICAgIGNvbnN0IGEgPSBwYXJzZVVSTCgkcmVsYXRpdmUsIGIuaHJlZik7XG4gICAgcmV0dXJuIGEuaHJlZjtcbn1cblxuLy8gQ2hlY2sgaWYgYW55IHJlbGF0aXZlIFVSTCBpcyBvbiB0aGUgd2luZG93LmxvY2F0aW9uO1xuLy8gU28gdGhhdCBodHRwczovL2R1Y2suY29tL2V4dC5jc3Mgd291bGQgcmV0dXJuIHRydWUgb24gaHR0cHM6Ly9kdWNrLmNvbS9cbi8vIEJ1dCBodHRwczovL2R1Y2suY29tL3N0eWxlcy9leHQuY3NzIHdvdWxkIHJldHVybiBmYWxzZSBvbiBodHRwczovL2R1Y2suY29tL1xuLy8gVmlzYSB2ZXJzYSBodHRwczovL2R1Y2suY29tL2V4dC5jc3Mgc2hvdWxkIHJldHVybiBmYXNsZSBvbiBodHRwczovL2R1Y2suY29tL3NlYXJjaC9cbi8vIFdlJ3JlIGNoZWNraW5nIGlmIGFueSByZWxhdGl2ZSB2YWx1ZSB3aXRoaW4gZXh0LmNzcyBjb3VsZCBwb3RlbnRpYWxseSBub3QgYmUgb24gdGhlIHNhbWUgcGF0aC5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlbGF0aXZlSHJlZk9uQWJzb2x1dGVQYXRoKGhyZWY6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IHBhcnNlVVJMKGhyZWYpO1xuXG4gICAgaWYgKHVybC5wcm90b2NvbCAhPT0gbG9jYXRpb24ucHJvdG9jb2wpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodXJsLmhvc3RuYW1lICE9PSBsb2NhdGlvbi5ob3N0bmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh1cmwucG9ydCAhPT0gbG9jYXRpb24ucG9ydCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIE5vdyBjaGVjayBpZiB0aGUgcGF0aCBpcyBvbiB0aGUgc2FtZSBwYXRoIGFzIHRoZSBiYXNlXG4gICAgLy8gV2UgZG8gdGhpcyBieSBnZXR0aW5nIHRoZSBwYXRobmFtZSB1cCB1bnRpbCB0aGUgbGFzdCBzbGFzaC5cbiAgICByZXR1cm4gdXJsLnBhdGhuYW1lID09PSBsb2NhdGlvbi5wYXRobmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVSTEhvc3RPclByb3RvY29sKCR1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTCgkdXJsKTtcbiAgICBpZiAodXJsLmhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHVybC5ob3N0O1xuICAgIH0gZWxzZSBpZiAodXJsLnByb3RvY29sID09PSAnZmlsZTonKSB7XG4gICAgICAgIHJldHVybiB1cmwucGF0aG5hbWU7XG4gICAgfVxuICAgIHJldHVybiB1cmwucHJvdG9jb2w7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlVVJMUGF0dGVybnMoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiBhLmxvY2FsZUNvbXBhcmUoYik7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIFVSTCBoYXMgYSBtYXRjaCBpbiBVUkwgdGVtcGxhdGUgbGlzdC5cbiAqIEBwYXJhbSB1cmwgU2l0ZSBVUkwuXG4gKiBAcGFyYW1saXN0IExpc3QgdG8gc2VhcmNoIGludG8uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1VSTEluTGlzdCh1cmw6IHN0cmluZywgbGlzdDogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGlzVVJMTWF0Y2hlZCh1cmwsIGxpc3RbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIFVSTCBtYXRjaGVzIHRoZSB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB1cmwgVVJMLlxuICogQHBhcmFtIHVybFRlbXBsYXRlIFVSTCB0ZW1wbGF0ZSAoXCJnb29nbGUuKlwiLCBcInlvdXR1YmUuY29tXCIgZXRjKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVVJMTWF0Y2hlZCh1cmw6IHN0cmluZywgdXJsVGVtcGxhdGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChpc1JlZ0V4cCh1cmxUZW1wbGF0ZSkpIHtcbiAgICAgICAgY29uc3QgcmVnZXhwID0gY3JlYXRlUmVnRXhwKHVybFRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIHJlZ2V4cCA/IHJlZ2V4cC50ZXN0KHVybCkgOiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoVVJMUGF0dGVybih1cmwsIHVybFRlbXBsYXRlKTtcbn1cblxuY29uc3QgVVJMX0NBQ0hFX1NJWkUgPSAzMjtcbmNvbnN0IHByZXBhcmVVUkwgPSBjYWNoZWRGYWN0b3J5KCh1cmw6IHN0cmluZykgPT4ge1xuICAgIGxldCBwYXJzZWQ6IFVSTDtcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBhdGhuYW1lLCBwcm90b2NvbCwgcG9ydH0gPSBwYXJzZWQ7XG4gICAgY29uc3QgaG9zdFBhcnRzID0gaG9zdG5hbWUuc3BsaXQoJy4nKS5yZXZlcnNlKCk7XG4gICAgY29uc3QgcGF0aFBhcnRzID0gcGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgxKTtcbiAgICBpZiAoIXBhdGhQYXJ0c1twYXRoUGFydHMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgcGF0aFBhcnRzLnNwbGljZShwYXRoUGFydHMubGVuZ3RoIC0gMSwgMSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGhvc3RQYXJ0cyxcbiAgICAgICAgcGF0aFBhcnRzLFxuICAgICAgICBwb3J0LFxuICAgICAgICBwcm90b2NvbCxcbiAgICB9O1xufSwgVVJMX0NBQ0hFX1NJWkUpO1xuXG5jb25zdCBVUkxfTUFUQ0hfQ0FDSEVfU0laRSA9IDMyICogMTAyNDtcbmNvbnN0IHByZXBhcmVQYXR0ZXJuID0gY2FjaGVkRmFjdG9yeSgocGF0dGVybjogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCFwYXR0ZXJuKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGV4YWN0U3RhcnQgPSBwYXR0ZXJuLnN0YXJ0c1dpdGgoJ14nKTtcbiAgICBjb25zdCBleGFjdEVuZCA9IHBhdHRlcm4uZW5kc1dpdGgoJyQnKTtcbiAgICBpZiAoZXhhY3RTdGFydCkge1xuICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChleGFjdEVuZCkge1xuICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcoMCwgcGF0dGVybi5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICBsZXQgcHJvdG9jb2wgPSAnJztcbiAgICBjb25zdCBwcm90b2NvbEluZGV4ID0gcGF0dGVybi5pbmRleE9mKCc6Ly8nKTtcbiAgICBpZiAocHJvdG9jb2xJbmRleCA+IDApIHtcbiAgICAgICAgcHJvdG9jb2wgPSBwYXR0ZXJuLnN1YnN0cmluZygwLCBwcm90b2NvbEluZGV4ICsgMSk7XG4gICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cmluZyhwcm90b2NvbEluZGV4ICsgMyk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2xhc2hJbmRleCA9IHBhdHRlcm4uaW5kZXhPZignLycpO1xuICAgIGNvbnN0IGhvc3QgPSBzbGFzaEluZGV4IDwgMCA/IHBhdHRlcm4gOiBwYXR0ZXJuLnN1YnN0cmluZygwLCBzbGFzaEluZGV4KTtcblxuICAgIGxldCBob3N0TmFtZSA9IGhvc3Q7XG5cbiAgICBsZXQgaXNJUHY2ID0gZmFsc2U7XG4gICAgbGV0IGlwVjZFbmQgPSAtMTtcbiAgICBpZiAoaG9zdC5zdGFydHNXaXRoKCdbJykpIHtcbiAgICAgICAgaXBWNkVuZCA9IGhvc3QuaW5kZXhPZignXScpO1xuICAgICAgICBpZiAoaXBWNkVuZCA+IDApIHtcbiAgICAgICAgICAgIGlzSVB2NiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcG9ydCA9ICcqJztcbiAgICBjb25zdCBwb3J0SW5kZXggPSBob3N0Lmxhc3RJbmRleE9mKCc6Jyk7XG4gICAgaWYgKHBvcnRJbmRleCA+PSAwICYmICghaXNJUHY2IHx8IGlwVjZFbmQgPCBwb3J0SW5kZXgpKSB7XG4gICAgICAgIGhvc3ROYW1lID0gaG9zdC5zdWJzdHJpbmcoMCwgcG9ydEluZGV4KTtcbiAgICAgICAgcG9ydCA9IGhvc3Quc3Vic3RyaW5nKHBvcnRJbmRleCArIDEpO1xuICAgIH1cblxuICAgIGlmIChpc0lQdjYpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlwVjZVUkwgPSBuZXcgVVJMKGBodHRwOi8vJHtob3N0TmFtZX1gKTtcbiAgICAgICAgICAgIGhvc3ROYW1lID0gaXBWNlVSTC5ob3N0bmFtZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBob3N0UGFydHMgPSBob3N0TmFtZS5zcGxpdCgnLicpLnJldmVyc2UoKTtcblxuICAgIGNvbnN0IHBhdGggPSBzbGFzaEluZGV4IDwgMCA/ICcnIDogcGF0dGVybi5zdWJzdHJpbmcoc2xhc2hJbmRleCArIDEpO1xuICAgIGNvbnN0IHBhdGhQYXJ0cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICBpZiAoIXBhdGhQYXJ0c1twYXRoUGFydHMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgcGF0aFBhcnRzLnNwbGljZShwYXRoUGFydHMubGVuZ3RoIC0gMSwgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaG9zdFBhcnRzLFxuICAgICAgICBwYXRoUGFydHMsXG4gICAgICAgIHBvcnQsXG4gICAgICAgIGV4YWN0U3RhcnQsXG4gICAgICAgIGV4YWN0RW5kLFxuICAgICAgICBwcm90b2NvbCxcbiAgICB9O1xufSwgVVJMX01BVENIX0NBQ0hFX1NJWkUpO1xuXG5mdW5jdGlvbiBtYXRjaFVSTFBhdHRlcm4odXJsOiBzdHJpbmcsIHBhdHRlcm46IHN0cmluZykge1xuICAgIGNvbnN0IHUgPSBwcmVwYXJlVVJMKHVybCk7XG4gICAgY29uc3QgcCA9IHByZXBhcmVQYXR0ZXJuKHBhdHRlcm4pO1xuXG4gICAgaWYgKFxuICAgICAgICAhKHUgJiYgcClcbiAgICAgICAgfHwgKHAuaG9zdFBhcnRzLmxlbmd0aCA+IHUuaG9zdFBhcnRzLmxlbmd0aClcbiAgICAgICAgfHwgKHAuZXhhY3RTdGFydCAmJiBwLmhvc3RQYXJ0cy5sZW5ndGggIT09IHUuaG9zdFBhcnRzLmxlbmd0aClcbiAgICAgICAgfHwgKHAuZXhhY3RFbmQgJiYgcC5wYXRoUGFydHMubGVuZ3RoICE9PSB1LnBhdGhQYXJ0cy5sZW5ndGgpXG4gICAgICAgIHx8IChwLnBvcnQgIT09ICcqJyAmJiBwLnBvcnQgIT09IHUucG9ydClcbiAgICAgICAgfHwgKHAucHJvdG9jb2wgJiYgcC5wcm90b2NvbCAhPT0gdS5wcm90b2NvbClcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcC5ob3N0UGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcEhvc3RQYXJ0ID0gcC5ob3N0UGFydHNbaV07XG4gICAgICAgIGNvbnN0IHVIb3N0UGFydCA9IHUuaG9zdFBhcnRzW2ldO1xuICAgICAgICBpZiAocEhvc3RQYXJ0ICE9PSAnKicgJiYgcEhvc3RQYXJ0ICE9PSB1SG9zdFBhcnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgICAgcC5ob3N0UGFydHMubGVuZ3RoID49IDJcbiAgICAgICAgJiYgcC5ob3N0UGFydHMuYXQoLTEpICE9PSAnKidcbiAgICAgICAgJiYgKFxuICAgICAgICAgICAgcC5ob3N0UGFydHMubGVuZ3RoIDwgdS5ob3N0UGFydHMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIHAuaG9zdFBhcnRzLmxlbmd0aCA9PT0gdS5ob3N0UGFydHMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICAgICYmIHUuaG9zdFBhcnRzLmF0KC0xKSAhPT0gJ3d3dydcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHAucGF0aFBhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocC5wYXRoUGFydHMubGVuZ3RoID4gdS5wYXRoUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHAucGF0aFBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBQYXRoUGFydCA9IHAucGF0aFBhcnRzW2ldO1xuICAgICAgICBjb25zdCB1UGF0aFBhcnQgPSB1LnBhdGhQYXJ0c1tpXTtcbiAgICAgICAgaWYgKHBQYXRoUGFydCAhPT0gJyonICYmIHBQYXRoUGFydCAhPT0gdVBhdGhQYXJ0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaXNSZWdFeHAocGF0dGVybjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4uc3RhcnRzV2l0aCgnLycpICYmIHBhdHRlcm4uZW5kc1dpdGgoJy8nKSAmJiBwYXR0ZXJuLmxlbmd0aCA+IDI7XG59XG5cbmNvbnN0IFJFR0VYUF9DQUNIRV9TSVpFID0gMTAyNDtcbmNvbnN0IGNyZWF0ZVJlZ0V4cCA9IGNhY2hlZEZhY3RvcnkoKHBhdHRlcm46IHN0cmluZykgPT4ge1xuICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChwYXR0ZXJuLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyaW5nKDAsIHBhdHRlcm4ubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59LCBSRUdFWFBfQ0FDSEVfU0laRSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BERih1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aG5hbWV9ID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICBpZiAocGF0aG5hbWUuaW5jbHVkZXMoJy5wZGYnKSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIChob3N0bmFtZS5tYXRjaCgvKHdpa2lwZWRpYXx3aWtpbWVkaWEpXFwub3JnJC9pKSAmJiBwYXRobmFtZS5tYXRjaCgvXlxcLy4qXFwvW2Etel0rXFw6W15cXDpcXC9dK1xcLnBkZi9pKSkgfHxcbiAgICAgICAgICAgICAgICAoaG9zdG5hbWUubWF0Y2goL3RpbWV0cmF2ZWxcXC5tZW1lbnRvd2ViXFwub3JnJC9pKSAmJiBwYXRobmFtZS5tYXRjaCgvXlxcL3JlY29uc3RydWN0L2kpICYmIHBhdGhuYW1lLm1hdGNoKC9cXC5wZGYkL2kpKSB8fFxuICAgICAgICAgICAgICAgIChob3N0bmFtZS5tYXRjaCgvZHJvcGJveFxcLmNvbSQvaSkgJiYgcGF0aG5hbWUubWF0Y2goL15cXC9zXFwvL2kpICYmIHBhdGhuYW1lLm1hdGNoKC9cXC5wZGYkL2kpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhdGhuYW1lLmVuZHNXaXRoKCcucGRmJykpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcGF0aG5hbWUubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aG5hbWVbaV0gPT09ICc9Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhuYW1lW2ldID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVUkxFbmFibGVkKHVybDogc3RyaW5nLCB1c2VyU2V0dGluZ3M6IFVzZXJTZXR0aW5ncywge2lzUHJvdGVjdGVkLCBpc0luRGFya0xpc3QsIGlzRGFya1RoZW1lRGV0ZWN0ZWR9OiBQYXJ0aWFsPFRhYkluZm8+LCBpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgIGlmIChpc0xvY2FsRmlsZSh1cmwpICYmICFpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGlzUHJvdGVjdGVkICYmICF1c2VyU2V0dGluZ3MuZW5hYmxlRm9yUHJvdGVjdGVkUGFnZXMpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBPbmx5IFVSTCdzIHdpdGggZW1haWxzIGFyZSBnZXR0aW5nIGhlcmUgb24gdGh1bmRlcmJpcmRcbiAgICAvLyBTbyB3ZSBjYW4gc2tpcCB0aGUgY2hlY2tzIGFuZCBqdXN0IHJldHVybiB0cnVlLlxuICAgIGlmIChfX1RIVU5ERVJCSVJEX18pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpc1BERih1cmwpKSB7XG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3MuZW5hYmxlRm9yUERGO1xuICAgIH1cbiAgICBjb25zdCBpc1VSTEluRGlzYWJsZWRMaXN0ID0gaXNVUkxJbkxpc3QodXJsLCB1c2VyU2V0dGluZ3MuZGlzYWJsZWRGb3IpO1xuICAgIGNvbnN0IGlzVVJMSW5FbmFibGVkTGlzdCA9IGlzVVJMSW5MaXN0KHVybCwgdXNlclNldHRpbmdzLmVuYWJsZWRGb3IpO1xuXG4gICAgaWYgKCF1c2VyU2V0dGluZ3MuZW5hYmxlZEJ5RGVmYXVsdCkge1xuICAgICAgICByZXR1cm4gaXNVUkxJbkVuYWJsZWRMaXN0O1xuICAgIH1cbiAgICBpZiAoaXNVUkxJbkVuYWJsZWRMaXN0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNJbkRhcmtMaXN0IHx8ICh1c2VyU2V0dGluZ3MuZGV0ZWN0RGFya1RoZW1lICYmIGlzRGFya1RoZW1lRGV0ZWN0ZWQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICFpc1VSTEluRGlzYWJsZWRMaXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxseVF1YWxpZmllZERvbWFpbihjYW5kaWRhdGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAvXlthLXowLTlcXC5cXC1dKyQvaS50ZXN0KGNhbmRpZGF0ZSkgJiYgY2FuZGlkYXRlLmluZGV4T2YoJy4uJykgPT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxseVF1YWxpZmllZERvbWFpbldpbGRjYXJkKGNhbmRpZGF0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFjYW5kaWRhdGUuaW5jbHVkZXMoJyonKSB8fCAhL15bYS16MC05XFwuXFwtXFwqXSskL2kudGVzdChjYW5kaWRhdGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgbGFiZWxzID0gY2FuZGlkYXRlLnNwbGl0KCcuJyk7XG4gICAgZm9yIChjb25zdCBsYWJlbCBvZiBsYWJlbHMpIHtcbiAgICAgICAgaWYgKGxhYmVsICE9PSAnKicgJiYgIS9eW2EtejAtOVxcLV0rJC9pLnRlc3QobGFiZWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmdWxseVF1YWxpZmllZERvbWFpbk1hdGNoZXNXaWxkY2FyZCh3aWxkY2FyZDogc3RyaW5nLCBjYW5kaWRhdGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHdpbGRjYXJkTGFiZWxzID0gd2lsZGNhcmQudG9Mb3dlckNhc2UoKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGNhbmRpZGF0ZUxhYmVscyA9IGNhbmRpZGF0ZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcuJyk7XG4gICAgaWYgKGNhbmRpZGF0ZUxhYmVscy5sZW5ndGggPCB3aWxkY2FyZExhYmVscy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAod2lsZGNhcmRMYWJlbHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHdpbGRjYXJkTGFiZWwgPSB3aWxkY2FyZExhYmVscy5wb3AoKTtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlTGFiZWwgPSBjYW5kaWRhdGVMYWJlbHMucG9wKCk7XG4gICAgICAgIGlmICh3aWxkY2FyZExhYmVsICE9PSAnKicgJiYgd2lsZGNhcmRMYWJlbCAhPT0gY2FuZGlkYXRlTGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9jYWxGaWxlKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEJvb2xlYW4odXJsKSAmJiB1cmwuc3RhcnRzV2l0aCgnZmlsZTovLy8nKTtcbn1cbiIsImltcG9ydCB7aXNGaXJlZm94LCBpc0VkZ2V9IGZyb20gJy4uLy4uL3V0aWxzL3BsYXRmb3JtJztcbmltcG9ydCB7Z2V0RHVyYXRpb259IGZyb20gJy4uLy4uL3V0aWxzL3RpbWUnO1xuaW1wb3J0IHtpc1BERn0gZnJvbSAnLi4vLi4vdXRpbHMvdXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkluamVjdFNjcmlwdCh1cmw6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICBpZiAodXJsID09PSAnYWJvdXQ6YmxhbmsnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGlzRmlyZWZveCkge1xuICAgICAgICByZXR1cm4gQm9vbGVhbih1cmxcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnYWJvdXQ6JylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnbW96JylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgndmlldy1zb3VyY2U6JylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgncmVzb3VyY2U6JylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnY2hyb21lOicpXG4gICAgICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2phcjonKVxuICAgICAgICAgICAgJiYgIXVybC5zdGFydHNXaXRoKCdodHRwczovL2FkZG9ucy5tb3ppbGxhLm9yZy8nKVxuICAgICAgICAgICAgJiYgIWlzUERGKHVybClcbiAgICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGlzRWRnZSkge1xuICAgICAgICByZXR1cm4gQm9vbGVhbih1cmxcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnY2hyb21lJylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnZGF0YScpXG4gICAgICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2RldnRvb2xzJylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnZWRnZScpXG4gICAgICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUnKVxuICAgICAgICAgICAgJiYgIXVybC5zdGFydHNXaXRoKCdodHRwczovL2Nocm9tZXdlYnN0b3JlLmdvb2dsZS5jb20vJylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly9taWNyb3NvZnRlZGdlLm1pY3Jvc29mdC5jb20vYWRkb25zJylcbiAgICAgICAgICAgICYmICF1cmwuc3RhcnRzV2l0aCgndmlldy1zb3VyY2UnKVxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gQm9vbGVhbih1cmxcbiAgICAgICAgJiYgIXVybC5zdGFydHNXaXRoKCdjaHJvbWUnKVxuICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUnKVxuICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vY2hyb21ld2Vic3RvcmUuZ29vZ2xlLmNvbS8nKVxuICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2RhdGEnKVxuICAgICAgICAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2RldnRvb2xzJylcbiAgICAgICAgJiYgIXVybC5zdGFydHNXaXRoKCd2aWV3LXNvdXJjZScpXG4gICAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRTeW5jU3RvcmFnZTxUIGV4dGVuZHMge1trZXk6IHN0cmluZ106IGFueX0+KGRlZmF1bHRzOiBUKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUIHwgbnVsbD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCwgKHN5bmM6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzeW5jKSB7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCB0byBiZSBzdXJlOiBodHRwczovL2dpdGh1Yi5jb20vZGFya3JlYWRlci9kYXJrcmVhZGVyL2lzc3Vlcy83MjcwXG4gICAgICAgICAgICAgICAgLy8gVGhlIHZhbHVlIG9mIHN5bmNba2V5XSBzaG91bGRuJ3QgYmUgbnVsbC5cbiAgICAgICAgICAgICAgICBpZiAoIXN5bmNba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YUtleXNDb3VudCA9IHN5bmNba2V5XS5fX21ldGFfc3BsaXRfY291bnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRhS2V5c0NvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGFLZXlzQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gc3luY1tgJHtrZXl9XyR7aS50b1N0cmluZygzNil9YF07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzeW5jW2Ake2tleX1fJHtpLnRvU3RyaW5nKDM2KX1gXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3luY1trZXldID0gSlNPTi5wYXJzZShzdHJpbmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHN5bmNbJHtrZXl9XTogQ291bGQgbm90IHBhcnNlIHJlY29yZCBmcm9tIHN5bmMgc3RvcmFnZTogJHtzdHJpbmd9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN5bmMgPSB7XG4gICAgICAgICAgICAgICAgLi4uZGVmYXVsdHMsXG4gICAgICAgICAgICAgICAgLi4uc3luYyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlc29sdmUoc3luYyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZExvY2FsU3RvcmFnZTxUIGV4dGVuZHMge1trZXk6IHN0cmluZ106IGFueX0+KGRlZmF1bHRzOiBUKTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChkZWZhdWx0cywgKGxvY2FsOiBUKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkZWZhdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShsb2NhbCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlU3luY1N0b3JhZ2U8VCBleHRlbmRzIHtba2V5OiBzdHJpbmddOiBhbnl9Pih2YWx1ZXM6IFQpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2tleV07XG4gICAgICAgIGNvbnN0IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgLy8gVGhlIG1heGltdW0gc2l6ZSBvZiBhbnkgb25lIGl0ZW0gdGhhdCBlYWNoIGV4dGVuc2lvbiBpcyBhbGxvd2VkIHRvIHN0b3JlIGluIHRoZSBzeW5jIHN0b3JhZ2UgYXJlYSxcbiAgICAgICAgLy8gYXMgbWVhc3VyZWQgYnkgdGhlIEpTT04gc3RyaW5naWZpY2F0aW9uIG9mIHRoZSBpdGVtJ3MgdmFsdWUgcGx1cyB0aGUgbGVuZ3RoIG9mIGl0cyBrZXkuXG4gICAgICAgIC8vIFNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvc3RvcmFnZS9zeW5jXG4gICAgICAgIGNvbnN0IHRvdGFsTGVuZ3RoID0gc3RyaW5nLmxlbmd0aCArIGtleS5sZW5ndGg7XG4gICAgICAgIGlmICh0b3RhbExlbmd0aCA+IGNocm9tZS5zdG9yYWdlLnN5bmMuUVVPVEFfQllURVNfUEVSX0lURU0pIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbGVuZ3RoIGxpbWl0IHBlcm1pdHMgdXMgdG8gc3RvcmUgdXAgdG8gMTAwMCA9IChwYXJzZUludCgncnInLCAzNikgKyAxKSByZWNvcmRzLlxuICAgICAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gY2hyb21lLnN0b3JhZ2Uuc3luYy5RVU9UQV9CWVRFU19QRVJfSVRFTSAtIGtleS5sZW5ndGggLSAxIC0gMjtcbiAgICAgICAgICAgIGNvbnN0IG1pbmltYWxLZXlzTmVlZGVkID0gTWF0aC5jZWlsKHN0cmluZy5sZW5ndGggLyBtYXhMZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaW5pbWFsS2V5c05lZWRlZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgKHZhbHVlcyBhcyBhbnkpW2Ake2tleX1fJHtpLnRvU3RyaW5nKDM2KX1gXSA9IHN0cmluZy5zdWJzdHJpbmcoaSAqIG1heExlbmd0aCwgKGkgKyAxKSAqIG1heExlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAodmFsdWVzIGFzIGFueSlba2V5XSA9IHtcbiAgICAgICAgICAgICAgICBfX21ldGFfc3BsaXRfY291bnQ6IG1pbmltYWxLZXlzTmVlZGVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVTeW5jU3RvcmFnZTxUIGV4dGVuZHMge1trZXk6IHN0cmluZ106IGFueX0+KHZhbHVlczogVCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VkID0gcHJlcGFyZVN5bmNTdG9yYWdlKHZhbHVlcyk7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHBhY2thZ2VkLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlTG9jYWxTdG9yYWdlPFQgZXh0ZW5kcyB7W2tleTogc3RyaW5nXTogYW55fT4odmFsdWVzOiBUKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh2YWx1ZXMsICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVTeW5jU3RvcmFnZShrZXlzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnJlbW92ZShrZXlzLCAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlTG9jYWxTdG9yYWdlKGtleXM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShrZXlzLCAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWFuZHMoKTogUHJvbWlzZTxjaHJvbWUuY29tbWFuZHMuQ29tbWFuZFtdPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGNocm9tZS5jb21tYW5kcy5Db21tYW5kW10+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGlmICghY2hyb21lLmNvbW1hbmRzKSB7XG4gICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjaHJvbWUuY29tbWFuZHMuZ2V0QWxsKChjb21tYW5kcykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmRzKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21tYW5kcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtlZXBMaXN0ZW5pbmdUb0V2ZW50cygpOiAoKSA9PiB2b2lkIHtcbiAgICBsZXQgaW50ZXJ2YWxJZCA9IDA7XG4gICAgY29uc3Qga2VlcEhvcGVBbGl2ZSA9ICgpID0+IHtcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbywgZ2V0RHVyYXRpb24oe3NlY29uZHM6IDEwfSkpO1xuICAgIH07XG4gICAgY2hyb21lLnJ1bnRpbWUub25TdGFydHVwLmFkZExpc3RlbmVyKGtlZXBIb3BlQWxpdmUpO1xuICAgIGtlZXBIb3BlQWxpdmUoKTtcbiAgICBjb25zdCBzdG9wTGlzdGVuaW5nID0gKCkgPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICBjaHJvbWUucnVudGltZS5vblN0YXJ0dXAucmVtb3ZlTGlzdGVuZXIoa2VlcEhvcGVBbGl2ZSk7XG4gICAgfTtcbiAgICByZXR1cm4gc3RvcExpc3RlbmluZztcbn1cbiIsImltcG9ydCB7Z2V0VUlMYW5ndWFnZX0gZnJvbSAnLi9sb2NhbGVzJztcbmltcG9ydCB7aXNFZGdlLCBpc01vYmlsZX0gZnJvbSAnLi9wbGF0Zm9ybSc7XG5cbmV4cG9ydCBjb25zdCBIT01FUEFHRV9VUkwgPSAnaHR0cHM6Ly9kYXJrcmVhZGVyLm9yZyc7XG5leHBvcnQgY29uc3QgQkxPR19VUkwgPSAnaHR0cHM6Ly9kYXJrcmVhZGVyLm9yZy9ibG9nLyc7XG5leHBvcnQgY29uc3QgTkVXU19VUkwgPSAnaHR0cHM6Ly9kYXJrcmVhZGVyLm9yZy9ibG9nL3Bvc3RzLmpzb24nO1xuZXhwb3J0IGNvbnN0IERFVlRPT0xTX0RPQ1NfVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9kYXJrcmVhZGVyL2RhcmtyZWFkZXIvYmxvYi9tYWluL0NPTlRSSUJVVElORy5tZCc7XG5leHBvcnQgY29uc3QgRE9OQVRFX1VSTCA9ICdodHRwczovL2RhcmtyZWFkZXIub3JnL3N1cHBvcnQtdXMvJztcbmV4cG9ydCBjb25zdCBHSVRIVUJfVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9kYXJrcmVhZGVyL2RhcmtyZWFkZXInO1xuZXhwb3J0IGNvbnN0IE1PQklMRV9VUkwgPSAnaHR0cHM6Ly9kYXJrcmVhZGVyLm9yZy90aXBzL21vYmlsZS8nO1xuZXhwb3J0IGNvbnN0IFBSSVZBQ1lfVVJMID0gJ2h0dHBzOi8vZGFya3JlYWRlci5vcmcvcHJpdmFjeS8nO1xuZXhwb3J0IGNvbnN0IFRXSVRURVJfVVJMID0gJ2h0dHBzOi8vdHdpdHRlci5jb20vZGFya3JlYWRlcmFwcCc7XG5leHBvcnQgY29uc3QgVU5JTlNUQUxMX1VSTCA9ICdodHRwczovL2RhcmtyZWFkZXIub3JnL2dvb2RsdWNrLyc7XG5leHBvcnQgY29uc3QgSEVMUF9VUkwgPSAnaHR0cHM6Ly9kYXJrcmVhZGVyLm9yZy9oZWxwJztcbmV4cG9ydCBjb25zdCBDT05GSUdfVVJMX0JBU0UgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2RhcmtyZWFkZXIvZGFya3JlYWRlci9tYWluL3NyYy9jb25maWcnO1xuXG5jb25zdCBoZWxwTG9jYWxlcyA9IFtcbiAgICAnYmUnLFxuICAgICdjcycsXG4gICAgJ2RlJyxcbiAgICAnZW4nLFxuICAgICdlcycsXG4gICAgJ2ZyJyxcbiAgICAnaXQnLFxuICAgICdqYScsXG4gICAgJ25sJyxcbiAgICAncHQnLFxuICAgICdydScsXG4gICAgJ3NyJyxcbiAgICAndHInLFxuICAgICd6aC1DTicsXG4gICAgJ3poLVRXJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWxwVVJMKCk6IHN0cmluZyB7XG4gICAgaWYgKGlzRWRnZSAmJiBpc01vYmlsZSkge1xuICAgICAgICByZXR1cm4gYCR7SEVMUF9VUkx9L21vYmlsZS9gO1xuICAgIH1cbiAgICBjb25zdCBsb2NhbGUgPSBnZXRVSUxhbmd1YWdlKCk7XG4gICAgY29uc3QgbWF0Y2hMb2NhbGUgPSBoZWxwTG9jYWxlcy5maW5kKChobCkgPT4gaGwgPT09IGxvY2FsZSkgfHwgaGVscExvY2FsZXMuZmluZCgoaGwpID0+IGxvY2FsZS5zdGFydHNXaXRoKGhsKSkgfHwgJ2VuJztcbiAgICByZXR1cm4gYCR7SEVMUF9VUkx9LyR7bWF0Y2hMb2NhbGV9L2A7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCbG9nUG9zdFVSTChwb3N0SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke0JMT0dfVVJMfSR7cG9zdElkfS9gO1xufVxuIiwiaW1wb3J0IHtpc01hdGNoTWVkaWFDaGFuZ2VFdmVudExpc3RlbmVyU3VwcG9ydGVkfSBmcm9tICcuL3BsYXRmb3JtJztcblxuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcbmxldCBvdmVycmlkZTogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG5sZXQgcXVlcnk6IE1lZGlhUXVlcnlMaXN0IHwgbnVsbCA9IG51bGw7XG5jb25zdCBvbkNoYW5nZTogKHttYXRjaGVzfToge21hdGNoZXM6IGJvb2xlYW59KSA9PiB2b2lkID0gKHttYXRjaGVzfSkgPT4gbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihtYXRjaGVzKSk7XG5jb25zdCBsaXN0ZW5lcnMgPSBuZXcgU2V0PChpc0Rhcms6IGJvb2xlYW4pID0+IHZvaWQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5Db2xvclNjaGVtZUNoYW5nZURldGVjdG9yKGNhbGxiYWNrOiAoaXNEYXJrOiBib29sZWFuKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgbGlzdGVuZXJzLmFkZChjYWxsYmFjayk7XG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcXVlcnkgPSBtYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJyk7XG4gICAgaWYgKGlzTWF0Y2hNZWRpYUNoYW5nZUV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQpIHtcbiAgICAgICAgLy8gTWVkaWFRdWVyeUxpc3QgY2hhbmdlIGV2ZW50IGlzIG5vdCBjYW5jZWxsYWJsZSBhbmQgZG9lcyBub3QgYnViYmxlXG4gICAgICAgIHF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIG9uQ2hhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS5hZGRMaXN0ZW5lcihvbkNoYW5nZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcENvbG9yU2NoZW1lQ2hhbmdlRGV0ZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKCFxdWVyeSB8fCAhb25DaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNNYXRjaE1lZGlhQ2hhbmdlRXZlbnRMaXN0ZW5lclN1cHBvcnRlZCkge1xuICAgICAgICBxdWVyeS5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBvbkNoYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnkucmVtb3ZlTGlzdGVuZXIob25DaGFuZ2UpO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMuY2xlYXIoKTtcbiAgICBxdWVyeSA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbXVsYXRlQ29sb3JTY2hlbWUoY29sb3JTY2hlbWU6ICdsaWdodCcgfCAnZGFyaycpOiB2b2lkIHtcbiAgICBpZiAoX19URVNUX18pIHtcbiAgICAgICAgY29uc3QgaXNEYXJrID0gY29sb3JTY2hlbWUgPT09ICdkYXJrJztcbiAgICAgICAgb3ZlcnJpZGUgPSBpc0Rhcms7XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsKSA9PiBsKGlzRGFyaykpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzU3lzdGVtRGFya01vZGVFbmFibGVkID0gKCk6IGJvb2xlYW4gPT4gKF9fVEVTVF9fICYmIHR5cGVvZiBvdmVycmlkZSA9PT0gJ2Jvb2xlYW4nKSA/IG92ZXJyaWRlIDogKHF1ZXJ5IHx8IG1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKSkubWF0Y2hlcztcbiIsImV4cG9ydCBlbnVtIE1lc3NhZ2VUeXBlVUl0b0JHIHtcbiAgICBHRVRfREFUQSA9ICd1aS1iZy1nZXQtZGF0YScsXG4gICAgR0VUX0RFVlRPT0xTX0RBVEEgPSAndWktYmctZ2V0LWRldnRvb2xzLWRhdGEnLFxuICAgIFNVQlNDUklCRV9UT19DSEFOR0VTID0gJ3VpLWJnLXN1YnNjcmliZS10by1jaGFuZ2VzJyxcbiAgICBVTlNVQlNDUklCRV9GUk9NX0NIQU5HRVMgPSAndWktYmctdW5zdWJzY3JpYmUtZnJvbS1jaGFuZ2VzJyxcbiAgICBDSEFOR0VfU0VUVElOR1MgPSAndWktYmctY2hhbmdlLXNldHRpbmdzJyxcbiAgICBTRVRfVEhFTUUgPSAndWktYmctc2V0LXRoZW1lJyxcbiAgICBUT0dHTEVfQUNUSVZFX1RBQiA9ICd1aS1iZy10b2dnbGUtYWN0aXZlLXRhYicsXG4gICAgTUFSS19ORVdTX0FTX1JFQUQgPSAndWktYmctbWFyay1uZXdzLWFzLXJlYWQnLFxuICAgIE1BUktfTkVXU19BU19ESVNQTEFZRUQgPSAndWktYmctbWFyay1uZXdzLWFzLWRpc3BsYXllZCcsXG4gICAgTE9BRF9DT05GSUcgPSAndWktYmctbG9hZC1jb25maWcnLFxuICAgIEFQUExZX0RFVl9EWU5BTUlDX1RIRU1FX0ZJWEVTID0gJ3VpLWJnLWFwcGx5LWRldi1keW5hbWljLXRoZW1lLWZpeGVzJyxcbiAgICBSRVNFVF9ERVZfRFlOQU1JQ19USEVNRV9GSVhFUyA9ICd1aS1iZy1yZXNldC1kZXYtZHluYW1pYy10aGVtZS1maXhlcycsXG4gICAgQVBQTFlfREVWX0lOVkVSU0lPTl9GSVhFUyA9ICd1aS1iZy1hcHBseS1kZXYtaW52ZXJzaW9uLWZpeGVzJyxcbiAgICBSRVNFVF9ERVZfSU5WRVJTSU9OX0ZJWEVTID0gJ3VpLWJnLXJlc2V0LWRldi1pbnZlcnNpb24tZml4ZXMnLFxuICAgIEFQUExZX0RFVl9TVEFUSUNfVEhFTUVTID0gJ3VpLWJnLWFwcGx5LWRldi1zdGF0aWMtdGhlbWVzJyxcbiAgICBSRVNFVF9ERVZfU1RBVElDX1RIRU1FUyA9ICd1aS1iZy1yZXNldC1kZXYtc3RhdGljLXRoZW1lcycsXG4gICAgU1RBUlRfQUNUSVZBVElPTiA9ICd1aS1iZy1zdGFydC1hY3RpdmF0aW9uJyxcbiAgICBSRVNFVF9BQ1RJVkFUSU9OID0gJ3VpLWJnLXJlc2V0LWFjdGl2YXRpb24nLFxuICAgIENPTE9SX1NDSEVNRV9DSEFOR0UgPSAndWktYmctY29sb3Itc2NoZW1lLWNoYW5nZScsXG4gICAgSElERV9ISUdITElHSFRTID0gJ3VpLWJnLWhpZGUtaGlnaGxpZ2h0cydcbn1cblxuZXhwb3J0IGVudW0gTWVzc2FnZVR5cGVCR3RvVUkge1xuICAgIENIQU5HRVMgPSAnYmctdWktY2hhbmdlcydcbn1cblxuZXhwb3J0IGVudW0gRGVidWdNZXNzYWdlVHlwZUJHdG9VSSB7XG4gICAgQ1NTX1VQREFURSA9ICdkZWJ1Zy1iZy11aS1jc3MtdXBkYXRlJyxcbiAgICBVUERBVEUgPSAnZGVidWctYmctdWktdXBkYXRlJ1xufVxuXG5leHBvcnQgZW51bSBNZXNzYWdlVHlwZUJHdG9DUyB7XG4gICAgQUREX0NTU19GSUxURVIgPSAnYmctY3MtYWRkLWNzcy1maWx0ZXInLFxuICAgIEFERF9EWU5BTUlDX1RIRU1FID0gJ2JnLWNzLWFkZC1keW5hbWljLXRoZW1lJyxcbiAgICBBRERfU1RBVElDX1RIRU1FID0gJ2JnLWNzLWFkZC1zdGF0aWMtdGhlbWUnLFxuICAgIEFERF9TVkdfRklMVEVSID0gJ2JnLWNzLWFkZC1zdmctZmlsdGVyJyxcbiAgICBDTEVBTl9VUCA9ICdiZy1jcy1jbGVhbi11cCcsXG4gICAgRkVUQ0hfUkVTUE9OU0UgPSAnYmctY3MtZmV0Y2gtcmVzcG9uc2UnLFxuICAgIFVOU1VQUE9SVEVEX1NFTkRFUiA9ICdiZy1jcy11bnN1cHBvcnRlZC1zZW5kZXInXG59XG5cbmV4cG9ydCBlbnVtIERlYnVnTWVzc2FnZVR5cGVCR3RvQ1Mge1xuICAgIFJFTE9BRCA9ICdkZWJ1Zy1iZy1jcy1yZWxvYWQnXG59XG5cbmV4cG9ydCBlbnVtIE1lc3NhZ2VUeXBlQ1N0b0JHIHtcbiAgICBDT0xPUl9TQ0hFTUVfQ0hBTkdFID0gJ2NzLWJnLWNvbG9yLXNjaGVtZS1jaGFuZ2UnLFxuICAgIERBUktfVEhFTUVfREVURUNURUQgPSAnY3MtYmctZGFyay10aGVtZS1kZXRlY3RlZCcsXG4gICAgREFSS19USEVNRV9OT1RfREVURUNURUQgPSAnY3MtYmctZGFyay10aGVtZS1ub3QtZGV0ZWN0ZWQnLFxuICAgIEZFVENIID0gJ2NzLWJnLWZldGNoJyxcbiAgICBET0NVTUVOVF9DT05ORUNUID0gJ2NzLWJnLWRvY3VtZW50LWNvbm5lY3QnLFxuICAgIERPQ1VNRU5UX0ZPUkdFVCA9ICdjcy1iZy1kb2N1bWVudC1mb3JnZXQnLFxuICAgIERPQ1VNRU5UX0ZSRUVaRSA9ICdjcy1iZy1kb2N1bWVudC1mcmVlemUnLFxuICAgIERPQ1VNRU5UX1JFU1VNRSA9ICdjcy1iZy1kb2N1bWVudC1yZXN1bWUnXG59XG5cbmV4cG9ydCBlbnVtIERlYnVnTWVzc2FnZVR5cGVDU3RvQkcge1xuICAgIExPRyA9ICdkZWJ1Zy1jcy1iZy1sb2cnXG59XG5cbmV4cG9ydCBlbnVtIE1lc3NhZ2VUeXBlQ1N0b1VJIHtcbiAgICBFWFBPUlRfQ1NTX1JFU1BPTlNFID0gJ2NzLXVpLWV4cG9ydC1jc3MtcmVzcG9uc2UnXG59XG5cbmV4cG9ydCBlbnVtIE1lc3NhZ2VUeXBlVUl0b0NTIHtcbiAgICBFWFBPUlRfQ1NTID0gJ3VpLWNzLWV4cG9ydC1jc3MnXG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFRleHRSYW5nZSB7XG4gICAgc3RhcnQ6IG51bWJlcjtcbiAgICBlbmQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRleHRQb3NpdGlvbk1lc3NhZ2UodGV4dDogc3RyaW5nLCBpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBpZiAoIWlzRmluaXRlKGluZGV4KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdyb25nIGNoYXIgaW5kZXggJHtpbmRleH1gKTtcbiAgICB9XG4gICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICBsZXQgbGluZSA9IDA7XG4gICAgbGV0IHByZXZMbjogbnVtYmVyO1xuICAgIGxldCBuZXh0TG4gPSAwO1xuICAgIGRvIHtcbiAgICAgICAgbGluZSsrO1xuICAgICAgICBwcmV2TG4gPSBuZXh0TG47XG4gICAgICAgIG5leHRMbiA9IHRleHQuaW5kZXhPZignXFxuJywgcHJldkxuICsgMSk7XG4gICAgfSB3aGlsZSAobmV4dExuID49IDAgJiYgbmV4dExuIDw9IGluZGV4KTtcbiAgICBjb25zdCBjb2x1bW4gPSBpbmRleCAtIHByZXZMbjtcbiAgICBtZXNzYWdlICs9IGBsaW5lICR7bGluZX0sIGNvbHVtbiAke2NvbHVtbn1gO1xuICAgIG1lc3NhZ2UgKz0gJ1xcbic7XG4gICAgaWYgKGluZGV4IDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgbWVzc2FnZSArPSB0ZXh0LnN1YnN0cmluZyhwcmV2TG4gKyAxLCBuZXh0TG4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2UgKz0gdGV4dC5zdWJzdHJpbmcodGV4dC5sYXN0SW5kZXhPZignXFxuJykgKyAxKTtcbiAgICB9XG4gICAgbWVzc2FnZSArPSAnXFxuJztcbiAgICBtZXNzYWdlICs9IGAke25ldyBBcnJheShjb2x1bW4pLmpvaW4oJy0nKX1eYDtcbiAgICByZXR1cm4gbWVzc2FnZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRleHREaWZmSW5kZXgoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHNob3J0ID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3J0OyBpKyspIHtcbiAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHNob3J0O1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFycmF5KHRleHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9cXHIvZywgJycpXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcCgocykgPT4gcy50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoKHMpID0+IHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0QXJyYXkoYXJyOiByZWFkb25seSBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGFyci5jb25jYXQoJycpLmpvaW4oJ1xcbicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlcyhyZWdleDogUmVnRXhwLCBpbnB1dDogc3RyaW5nLCBncm91cCA9IDApOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbWF0Y2hlczogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgbTogUmVnRXhwTWF0Y2hBcnJheSB8IG51bGw7XG4gICAgd2hpbGUgKChtID0gcmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgIG1hdGNoZXMucHVzaChtW2dyb3VwXSk7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlc1dpdGhPZmZzZXRzKHJlZ2V4OiBSZWdFeHAsIGlucHV0OiBzdHJpbmcsIGdyb3VwID0gMCk6IEFycmF5PHt0ZXh0OiBzdHJpbmc7IG9mZnNldDogbnVtYmVyfT4ge1xuICAgIGNvbnN0IG1hdGNoZXM6IEFycmF5PHt0ZXh0OiBzdHJpbmc7IG9mZnNldDogbnVtYmVyfT4gPSBbXTtcbiAgICBsZXQgbTogUmVnRXhwTWF0Y2hBcnJheSB8IG51bGw7XG4gICAgd2hpbGUgKChtID0gcmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgIG1hdGNoZXMucHVzaCh7dGV4dDogbVtncm91cF0sIG9mZnNldDogbS5pbmRleCF9KTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdHJpbmdTaXplKHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggKiAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFzaENvZGUodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCBsZW4gPSB0ZXh0Lmxlbmd0aDtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCBjID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCArIGMpICYgNDI5NDk2NzI5NTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdFeHBTcGVjaWFsQ2hhcnMoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2VBbGwoL1tcXF4kLiorP1xcKFxcKVxcW1xcXXt9fFxcLVxcXFxdL2csICdcXFxcJCYnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudGhlc2VzUmFuZ2UoaW5wdXQ6IHN0cmluZywgc2VhcmNoU3RhcnRJbmRleCA9IDApOiBUZXh0UmFuZ2UgfCBudWxsIHtcbiAgICByZXR1cm4gZ2V0T3BlbkNsb3NlUmFuZ2UoaW5wdXQsIHNlYXJjaFN0YXJ0SW5kZXgsICcoJywgJyknLCBbXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVuQ2xvc2VSYW5nZShcbiAgICBpbnB1dDogc3RyaW5nLFxuICAgIHNlYXJjaFN0YXJ0SW5kZXg6IG51bWJlcixcbiAgICBvcGVuVG9rZW46IHN0cmluZyxcbiAgICBjbG9zZVRva2VuOiBzdHJpbmcsXG4gICAgZXhjbHVkZVJhbmdlczogVGV4dFJhbmdlW10sXG4pOiBUZXh0UmFuZ2UgfCBudWxsIHtcbiAgICBsZXQgaW5kZXhPZjogKHRva2VuOiBzdHJpbmcsIHBvczogbnVtYmVyKSA9PiBudW1iZXI7XG4gICAgaWYgKGV4Y2x1ZGVSYW5nZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGluZGV4T2YgPSAodG9rZW46IHN0cmluZywgcG9zOiBudW1iZXIpID0+IGlucHV0LmluZGV4T2YodG9rZW4sIHBvcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXhPZiA9ICh0b2tlbjogc3RyaW5nLCBwb3M6IG51bWJlcikgPT4gaW5kZXhPZkV4Y2x1ZGluZyhpbnB1dCwgdG9rZW4sIHBvcywgZXhjbHVkZVJhbmdlcyk7XG4gICAgfVxuXG4gICAgY29uc3Qge2xlbmd0aH0gPSBpbnB1dDtcbiAgICBsZXQgZGVwdGggPSAwO1xuICAgIGxldCBmaXJzdE9wZW5JbmRleCA9IC0xO1xuICAgIGZvciAobGV0IGkgPSBzZWFyY2hTdGFydEluZGV4OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBvcGVuSW5kZXggPSBpbmRleE9mKG9wZW5Ub2tlbiwgaSk7XG4gICAgICAgICAgICBpZiAob3BlbkluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlyc3RPcGVuSW5kZXggPSBvcGVuSW5kZXg7XG4gICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICAgICAgaSA9IG9wZW5JbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNsb3NlSW5kZXggPSBpbmRleE9mKGNsb3NlVG9rZW4sIGkpO1xuICAgICAgICAgICAgaWYgKGNsb3NlSW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvcGVuSW5kZXggPSBpbmRleE9mKG9wZW5Ub2tlbiwgaSk7XG4gICAgICAgICAgICBpZiAob3BlbkluZGV4IDwgMCB8fCBjbG9zZUluZGV4IDw9IG9wZW5JbmRleCkge1xuICAgICAgICAgICAgICAgIGRlcHRoLS07XG4gICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7c3RhcnQ6IGZpcnN0T3BlbkluZGV4LCBlbmQ6IGNsb3NlSW5kZXggKyAxfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSA9IGNsb3NlSW5kZXg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgaSA9IG9wZW5JbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaW5kZXhPZkV4Y2x1ZGluZyhpbnB1dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgcG9zaXRpb246IG51bWJlciwgZXhjbHVkZVJhbmdlczogVGV4dFJhbmdlW10pIHtcbiAgICBjb25zdCBpID0gaW5wdXQuaW5kZXhPZihzZWFyY2gsIHBvc2l0aW9uKTtcbiAgICBjb25zdCBleGNsdXNpb24gPSBleGNsdWRlUmFuZ2VzLmZpbmQoKHIpID0+IGkgPj0gci5zdGFydCAmJiBpIDwgci5lbmQpO1xuICAgIGlmIChleGNsdXNpb24pIHtcbiAgICAgICAgcmV0dXJuIGluZGV4T2ZFeGNsdWRpbmcoaW5wdXQsIHNlYXJjaCwgZXhjbHVzaW9uLmVuZCwgZXhjbHVkZVJhbmdlcyk7XG4gICAgfVxuICAgIHJldHVybiBpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRFeGNsdWRpbmcoaW5wdXQ6IHN0cmluZywgc2VwYXJhdG9yOiBzdHJpbmcsIGV4Y2x1ZGVSYW5nZXM6IFRleHRSYW5nZVtdKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBjb21tYUluZGV4ID0gLTE7XG4gICAgbGV0IGN1cnJJbmRleCA9IDA7XG4gICAgd2hpbGUgKChjb21tYUluZGV4ID0gaW5kZXhPZkV4Y2x1ZGluZyhpbnB1dCwgc2VwYXJhdG9yLCBjdXJySW5kZXgsIGV4Y2x1ZGVSYW5nZXMpKSA+PSAwKSB7XG4gICAgICAgIHBhcnRzLnB1c2goaW5wdXQuc3Vic3RyaW5nKGN1cnJJbmRleCwgY29tbWFJbmRleCkudHJpbSgpKTtcbiAgICAgICAgY3VyckluZGV4ID0gY29tbWFJbmRleCArIDE7XG4gICAgfVxuICAgIHBhcnRzLnB1c2goaW5wdXQuc3Vic3RyaW5nKGN1cnJJbmRleCkudHJpbSgpKTtcbiAgICByZXR1cm4gcGFydHM7XG59XG4iLCJpbXBvcnQgdHlwZSB7VGhlbWV9IGZyb20gJy4uL2RlZmluaXRpb25zJztcblxuLy8gRXhjbHVkZSBmb250IGxpYnJhcmllcyB0byBwcmVzZXJ2ZSBpY29uc1xuY29uc3QgZXhjbHVkZWRTZWxlY3RvcnMgPSBbXG4gICAgJ3ByZScsICdwcmUgKicsICdjb2RlJyxcbiAgICAnW2FyaWEtaGlkZGVuPVwidHJ1ZVwiXScsXG5cbiAgICAvLyBGb250IEF3ZXNvbWVcbiAgICAnW2NsYXNzKj1cImZhLVwiXScsXG4gICAgJy5mYScsICcuZmFiJywgJy5mYWQnLCAnLmZhbCcsICcuZmFyJywgJy5mYXMnLCAnLmZhc3MnLCAnLmZhc3InLCAnLmZhdCcsXG5cbiAgICAvLyBHZW5lcmljIG1hdGNoZXMgZm9yIGljb24vc3ltYm9sIGZvbnRzXG4gICAgJy5pY29mb250JywgJ1tzdHlsZSo9XCJmb250LVwiXScsXG4gICAgJ1tjbGFzcyo9XCJpY29uXCJdJywgJ1tjbGFzcyo9XCJJY29uXCJdJyxcbiAgICAnW2NsYXNzKj1cInN5bWJvbFwiXScsICdbY2xhc3MqPVwiU3ltYm9sXCJdJyxcblxuICAgIC8vIEdseXBoIEljb25zXG4gICAgJy5nbHlwaGljb24nLFxuXG4gICAgLy8gTWF0ZXJpYWwgRGVzaWduXG4gICAgJ1tjbGFzcyo9XCJtYXRlcmlhbC1zeW1ib2xcIl0nLCAnW2NsYXNzKj1cIm1hdGVyaWFsLWljb25cIl0nLFxuXG4gICAgLy8gTVVJXG4gICAgJ211JywgJ1tjbGFzcyo9XCJtdS1cIl0nLFxuXG4gICAgLy8gVHlwaWNvbnNcbiAgICAnLnR5cGNuJyxcblxuICAgIC8vIFZpZGVvanMgZm9udFxuICAgICdbY2xhc3MqPVwidmpzLVwiXScsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGV4dFN0eWxlKGNvbmZpZzogVGhlbWUpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxpbmVzLnB1c2goYCo6bm90KCR7ZXhjbHVkZWRTZWxlY3RvcnMuam9pbignLCAnKX0pIHtgKTtcblxuICAgIGlmIChjb25maWcudXNlRm9udCAmJiBjb25maWcuZm9udEZhbWlseSkge1xuICAgICAgICBsaW5lcy5wdXNoKGAgIGZvbnQtZmFtaWx5OiAke2NvbmZpZy5mb250RmFtaWx5fSAhaW1wb3J0YW50O2ApO1xuICAgIH1cblxuICAgIGlmIChjb25maWcudGV4dFN0cm9rZSA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgICAtd2Via2l0LXRleHQtc3Ryb2tlOiAke2NvbmZpZy50ZXh0U3Ryb2tlfXB4ICFpbXBvcnRhbnQ7YCk7XG4gICAgICAgIGxpbmVzLnB1c2goYCAgdGV4dC1zdHJva2U6ICR7Y29uZmlnLnRleHRTdHJva2V9cHggIWltcG9ydGFudDtgKTtcbiAgICB9XG5cbiAgICBsaW5lcy5wdXNoKCd9Jyk7XG5cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG4iLCJmdW5jdGlvbiBpc0FycmF5TGlrZTxUPihpdGVtczogSXRlcmFibGU8VD4gfCBBcnJheUxpa2U8VD4pOiBpdGVtcyBpcyBBcnJheUxpa2U8VD4ge1xuICAgIHJldHVybiAoaXRlbXMgYXMgQXJyYXlMaWtlPFQ+KS5sZW5ndGggIT0gbnVsbDtcbn1cblxuLy8gTk9URTogSXRlcmF0aW5nIEFycmF5LWxpa2UgaXRlbXMgdXNpbmcgYGZvciAuLiBvZmAgaXMgM3ggc2xvd2VyIGluIEZpcmVmb3hcbi8vIGh0dHBzOi8vanNiZW4uY2gva2lkT3BcbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoPFQ+KGl0ZW1zOiBJdGVyYWJsZTxUPiB8IEFycmF5TGlrZTxUPiB8IFNldDxUPiwgaXRlcmF0b3I6IChpdGVtOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKGlzQXJyYXlMaWtlKGl0ZW1zKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gaXRlbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGl0ZW1zW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgaXRlcmF0b3IoaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIE5PVEU6IFB1c2hpbmcgaXRlbXMgbGlrZSBgYXJyLnB1c2goLi4uaXRlbXMpYCBpcyAzeCBzbG93ZXIgaW4gRmlyZWZveFxuLy8gaHR0cHM6Ly9qc2Jlbi5jaC9ucjlPRlxuZXhwb3J0IGZ1bmN0aW9uIHB1c2g8VD4oYXJyYXk6IFRbXSwgYWRkaXRpb246IEl0ZXJhYmxlPFQ+IHwgQXJyYXlMaWtlPFQ+KTogdm9pZCB7XG4gICAgZm9yRWFjaChhZGRpdGlvbiwgKGEpID0+IGFycmF5LnB1c2goYSkpO1xufVxuXG4vLyBOT1RFOiBVc2luZyBgQXJyYXkuZnJvbSgpYCBpcyAyeCAoRkYpIOKAlCA1eCAoQ2hyb21lKSBzbG93ZXIgZm9yIEFycmF5TGlrZSAobm90IGZvciBJdGVyYWJsZSlcbi8vIGh0dHBzOi8vanNiZW4uY2gvRkoxbU9cbi8vIGh0dHBzOi8vanNiZW4uY2gvWm1WaUxcbmV4cG9ydCBmdW5jdGlvbiB0b0FycmF5PFQ+KGl0ZW1zOiBBcnJheUxpa2U8VD4pOiBUW10ge1xuICAgIGNvbnN0IHJlc3VsdHM6IFRbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBpdGVtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICByZXN1bHRzLnB1c2goaXRlbXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbn1cbiIsImltcG9ydCB7cHVzaH0gZnJvbSAnLi4vLi4vdXRpbHMvYXJyYXknO1xuXG5pbnRlcmZhY2UgU2l0ZUZpeCB7XG4gICAgdXJsOiBzdHJpbmdbXTtcbiAgICBbcHJvcDogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgU2l0ZXNGaXhlc0Zvcm1hdE9wdGlvbnMge1xuICAgIHByb3BzOiBzdHJpbmdbXTtcbiAgICBnZXRQcm9wQ29tbWFuZE5hbWU6IChwcm9wOiBzdHJpbmcpID0+IHN0cmluZztcbiAgICBmb3JtYXRQcm9wVmFsdWU6IChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4gc3RyaW5nO1xuICAgIHNob3VsZElnbm9yZVByb3A6IChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4gYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFNpdGVzRml4ZXNDb25maWcoZml4ZXM6IFNpdGVGaXhbXSwgb3B0aW9uczogU2l0ZXNGaXhlc0Zvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZml4ZXMuZm9yRWFjaCgoZml4LCBpKSA9PiB7XG4gICAgICAgIHB1c2gobGluZXMsIGZpeC51cmwpO1xuICAgICAgICBvcHRpb25zLnByb3BzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBvcHRpb25zLmdldFByb3BDb21tYW5kTmFtZShwcm9wKTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZml4W3Byb3BdO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvdWxkSWdub3JlUHJvcChwcm9wLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goY29tbWFuZCk7XG4gICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRWYWx1ZSA9IG9wdGlvbnMuZm9ybWF0UHJvcFZhbHVlKHByb3AsIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChmb3JtYXR0ZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goZm9ybWF0dGVkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGkgPCBmaXhlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goJz0nLnJlcGVhdCgzMikpO1xuICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGxpbmVzLnB1c2goJycpO1xuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cbiIsImV4cG9ydCB0eXBlIE1hdHJpeDV4NSA9IFtcbiAgICBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLFxuICAgIFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sXG4gICAgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcbiAgICBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLFxuICAgIFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl1cbl07XG5cbmV4cG9ydCB0eXBlIE1hdHJpeDV4MSA9IFtcbiAgICBbbnVtYmVyXSxcbiAgICBbbnVtYmVyXSxcbiAgICBbbnVtYmVyXSxcbiAgICBbbnVtYmVyXSxcbiAgICBbbnVtYmVyXVxuXTtcblxuZXhwb3J0IHR5cGUgTWF0cml4ID0gTWF0cml4NXg1IHwgTWF0cml4NXgxO1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUoeDogbnVtYmVyLCBpbkxvdzogbnVtYmVyLCBpbkhpZ2g6IG51bWJlciwgb3V0TG93OiBudW1iZXIsIG91dEhpZ2g6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuICh4IC0gaW5Mb3cpICogKG91dEhpZ2ggLSBvdXRMb3cpIC8gKGluSGlnaCAtIGluTG93KSArIG91dExvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKHg6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHgpKTtcbn1cblxuLy8gTm90ZTogdGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgZW5zdXJpbmcgdGhhdCBtYXRyaXggZGltZW5zaW9ucyBtYWtlIHNlbnNlXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlNYXRyaWNlczxNIGV4dGVuZHMgTWF0cml4PihtMTogTWF0cml4NXg1LCBtMjogTWF0cml4NXg1IHwgTWF0cml4NXgxKTogTSB7XG4gICAgY29uc3QgcmVzdWx0OiBudW1iZXJbXVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG0xLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqID0gMCwgbGVuMiA9IG0yWzBdLmxlbmd0aDsgaiA8IGxlbjI7IGorKykge1xuICAgICAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMCwgbGVuMyA9IG0xWzBdLmxlbmd0aDsgayA8IGxlbjM7IGsrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBtMVtpXVtrXSAqIG0yW2tdW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2ldW2pdID0gc3VtO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgYXMgTTtcbn1cbiIsImltcG9ydCB0eXBlIHtUaGVtZX0gZnJvbSAnLi4vLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtjbGFtcCwgbXVsdGlwbHlNYXRyaWNlc30gZnJvbSAnLi4vLi4vdXRpbHMvbWF0aCc7XG5pbXBvcnQgdHlwZSB7TWF0cml4NXgxLCBNYXRyaXg1eDV9IGZyb20gJy4uLy4uL3V0aWxzL21hdGgnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaWx0ZXJNYXRyaXgoY29uZmlnOiBUaGVtZSk6IE1hdHJpeDV4NSB7XG4gICAgbGV0IG06IE1hdHJpeDV4NSA9IE1hdHJpeC5pZGVudGl0eSgpO1xuICAgIGlmIChjb25maWcuc2VwaWEgIT09IDApIHtcbiAgICAgICAgbSA9IG11bHRpcGx5TWF0cmljZXMobSwgTWF0cml4LnNlcGlhKGNvbmZpZy5zZXBpYSAvIDEwMCkpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdyYXlzY2FsZSAhPT0gMCkge1xuICAgICAgICBtID0gbXVsdGlwbHlNYXRyaWNlcyhtLCBNYXRyaXguZ3JheXNjYWxlKGNvbmZpZy5ncmF5c2NhbGUgLyAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5jb250cmFzdCAhPT0gMTAwKSB7XG4gICAgICAgIG0gPSBtdWx0aXBseU1hdHJpY2VzKG0sIE1hdHJpeC5jb250cmFzdChjb25maWcuY29udHJhc3QgLyAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5icmlnaHRuZXNzICE9PSAxMDApIHtcbiAgICAgICAgbSA9IG11bHRpcGx5TWF0cmljZXMobSwgTWF0cml4LmJyaWdodG5lc3MoY29uZmlnLmJyaWdodG5lc3MgLyAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5tb2RlID09PSAxKSB7XG4gICAgICAgIG0gPSBtdWx0aXBseU1hdHJpY2VzKG0sIE1hdHJpeC5pbnZlcnROSHVlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Q29sb3JNYXRyaXgoW3IsIGcsIGJdOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sIG1hdHJpeDogTWF0cml4NXg1KTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHtcbiAgICBjb25zdCByZ2I6IE1hdHJpeDV4MSA9IFtbciAvIDI1NV0sIFtnIC8gMjU1XSwgW2IgLyAyNTVdLCBbMV0sIFsxXV07XG4gICAgY29uc3QgcmVzdWx0ID0gbXVsdGlwbHlNYXRyaWNlczxNYXRyaXg1eDE+KG1hdHJpeCwgcmdiKTtcbiAgICByZXR1cm4gWzAsIDEsIDJdLm1hcCgoaSkgPT4gY2xhbXAoTWF0aC5yb3VuZChyZXN1bHRbaV1bMF0gKiAyNTUpLCAwLCAyNTUpKSBhcyBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG59XG5cbmV4cG9ydCBjb25zdCBNYXRyaXggPSB7XG5cbiAgICBpZGVudGl0eSgpOiBNYXRyaXg1eDUge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDAsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIDEsIDAsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDEsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDFdLFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBpbnZlcnROSHVlKCk6IE1hdHJpeDV4NSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMC4zMzMsIC0wLjY2NywgLTAuNjY3LCAwLCAxXSxcbiAgICAgICAgICAgIFstMC42NjcsIDAuMzMzLCAtMC42NjcsIDAsIDFdLFxuICAgICAgICAgICAgWy0wLjY2NywgLTAuNjY3LCAwLjMzMywgMCwgMV0sXG4gICAgICAgICAgICBbMCwgMCwgMCwgMSwgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMCwgMCwgMV0sXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGJyaWdodG5lc3ModjogbnVtYmVyKTogTWF0cml4NXg1IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFt2LCAwLCAwLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCB2LCAwLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCB2LCAwLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAwLCAxLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAwLCAwLCAxXSxcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY29udHJhc3QodjogbnVtYmVyKTogTWF0cml4NXg1IHtcbiAgICAgICAgY29uc3QgdCA9ICgxIC0gdikgLyAyO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW3YsIDAsIDAsIDAsIHRdLFxuICAgICAgICAgICAgWzAsIHYsIDAsIDAsIHRdLFxuICAgICAgICAgICAgWzAsIDAsIHYsIDAsIHRdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDEsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDFdLFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBzZXBpYSh2OiBudW1iZXIpOiBNYXRyaXg1eDUge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWygwLjM5MyArIDAuNjA3ICogKDEgLSB2KSksICgwLjc2OSAtIDAuNzY5ICogKDEgLSB2KSksICgwLjE4OSAtIDAuMTg5ICogKDEgLSB2KSksIDAsIDBdLFxuICAgICAgICAgICAgWygwLjM0OSAtIDAuMzQ5ICogKDEgLSB2KSksICgwLjY4NiArIDAuMzE0ICogKDEgLSB2KSksICgwLjE2OCAtIDAuMTY4ICogKDEgLSB2KSksIDAsIDBdLFxuICAgICAgICAgICAgWygwLjI3MiAtIDAuMjcyICogKDEgLSB2KSksICgwLjUzNCAtIDAuNTM0ICogKDEgLSB2KSksICgwLjEzMSArIDAuODY5ICogKDEgLSB2KSksIDAsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDEsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDAsIDAsIDFdLFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBncmF5c2NhbGUodjogbnVtYmVyKTogTWF0cml4NXg1IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFsoMC4yMTI2ICsgMC43ODc0ICogKDEgLSB2KSksICgwLjcxNTIgLSAwLjcxNTIgKiAoMSAtIHYpKSwgKDAuMDcyMiAtIDAuMDcyMiAqICgxIC0gdikpLCAwLCAwXSxcbiAgICAgICAgICAgIFsoMC4yMTI2IC0gMC4yMTI2ICogKDEgLSB2KSksICgwLjcxNTIgKyAwLjI4NDggKiAoMSAtIHYpKSwgKDAuMDcyMiAtIDAuMDcyMiAqICgxIC0gdikpLCAwLCAwXSxcbiAgICAgICAgICAgIFsoMC4yMTI2IC0gMC4yMTI2ICogKDEgLSB2KSksICgwLjcxNTIgLSAwLjcxNTIgKiAoMSAtIHYpKSwgKDAuMDcyMiArIDAuOTI3OCAqICgxIC0gdikpLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAwLCAxLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAwLCAwLCAxXSxcbiAgICAgICAgXTtcbiAgICB9LFxufTtcbiIsImltcG9ydCB7cGFyc2VBcnJheX0gZnJvbSAnLi4vLi4vdXRpbHMvdGV4dCc7XG5pbXBvcnQge2lzRnVsbHlRdWFsaWZpZWREb21haW4sIGlzRnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZCwgZnVsbHlRdWFsaWZpZWREb21haW5NYXRjaGVzV2lsZGNhcmQsIGlzVVJMSW5MaXN0LCBpc1VSTE1hdGNoZWR9IGZyb20gJy4uLy4uL3V0aWxzL3VybCc7XG5cbmRlY2xhcmUgY29uc3QgX19URVNUX186IGJvb2xlYW47XG5cbmNvbnN0IElOREVYX0NBQ0hFX0NMRUFOVVBfSU5URVJWQUxfSU5fTVMgPSA2MDAwMDtcblxuLy8gVE9ETzogcmVtb3ZlIGNhc3Qgb25jZSB0eXBlcyBhcmUgdXBkYXRlZFxuZGVjbGFyZSBmdW5jdGlvbiBjbGVhclRpbWVvdXQoaWQ6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZvaWQ7XG5cbmludGVyZmFjZSBTaXRlUHJvcHNNdXQge1xuICAgIHVybDogcmVhZG9ubHkgc3RyaW5nW107XG59XG5cbnR5cGUgU2l0ZVByb3BzID0gUmVhZG9ubHk8U2l0ZVByb3BzTXV0PjtcblxuZXhwb3J0IGludGVyZmFjZSBTaXRlUHJvcHNJbmRleDxTaXRlRml4IGV4dGVuZHMgU2l0ZVByb3BzPiB7XG4gICAgb2Zmc2V0czogUmVhZG9ubHk8c3RyaW5nPjtcbiAgICBkb21haW5zOiBSZWFkb25seTx7W2RvbWFpbjogc3RyaW5nXTogcmVhZG9ubHkgbnVtYmVyW119PjtcbiAgICBkb21haW5MYWJlbHM6IFJlYWRvbmx5PHtbZG9tYWluTGFiZWw6IHN0cmluZ106IHJlYWRvbmx5IG51bWJlcltdfT47XG4gICAgbm9uc3RhbmRhcmQ6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIGNhY2hlU2l0ZUZpeDoge1tvZmZzZXRJZDogbnVtYmVyXTogUmVhZG9ubHk8U2l0ZUZpeD59O1xuICAgIGNhY2hlRG9tYWluSW5kZXg6IHtbZG9tYWluOiBzdHJpbmddOiByZWFkb25seSBudW1iZXJbXX07XG4gICAgY2FjaGVDbGVhbnVwVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbDtcbn1cblxuaW50ZXJmYWNlIENvbmZpZ0luZGV4IHtcbiAgICBkb21haW5zOiBSZWFkb25seTx7W2RvbWFpbjogc3RyaW5nXTogcmVhZG9ubHkgbnVtYmVyW119PjtcbiAgICBkb21haW5MYWJlbHM6IFJlYWRvbmx5PHtbZG9tYWluTGFiZWw6IHN0cmluZ106IHJlYWRvbmx5IG51bWJlcltdfT47XG4gICAgbm9uc3RhbmRhcmQ6IFJlYWRvbmx5PG51bWJlcltdIHwgbnVsbD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2l0ZUxpc3RJbmRleCB7XG4gICAgdXJsczogcmVhZG9ubHkgc3RyaW5nW107XG4gICAgZG9tYWluczogUmVhZG9ubHk8e1tkb21haW46IHN0cmluZ106IG51bWJlcltdfT47XG4gICAgZG9tYWluTGFiZWxzOiBSZWFkb25seTx7W2RvbWFpbkxhYmVsOiBzdHJpbmddOiByZWFkb25seSBudW1iZXJbXX0+O1xuICAgIG5vbnN0YW5kYXJkOiByZWFkb25seSBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaXRlc0ZpeGVzUGFyc2VyT3B0aW9uczxUPiB7XG4gICAgY29tbWFuZHM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICAgIGdldENvbW1hbmRQcm9wTmFtZTogKGNvbW1hbmQ6IHN0cmluZykgPT4ga2V5b2YgVDtcbiAgICBwYXJzZUNvbW1hbmRWYWx1ZTogKGNvbW1hbmQ6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4gYW55O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTaXRlc0ZpeGVzQ29uZmlnPFQgZXh0ZW5kcyBTaXRlUHJvcHM+KHRleHQ6IHN0cmluZywgb3B0aW9uczogU2l0ZXNGaXhlc1BhcnNlck9wdGlvbnM8VD4pOiBUW10ge1xuICAgIGNvbnN0IHNpdGVzOiBUW10gPSBbXTtcblxuICAgIGNvbnN0IGJsb2NrcyA9IHRleHQucmVwbGFjZSgvXFxyL2csICcnKS5zcGxpdCgvXlxccyo9ezIsfVxccyokL2dtKTtcbiAgICBibG9ja3MuZm9yRWFjaCgoYmxvY2spID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBibG9jay5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICBsaW5lcy5mb3JFYWNoKChsbiwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGxuLm1hdGNoKC9eW0EtWl0rKFxcc1tBLVpdKyl7MCwyfSQvKSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmRJbmRpY2VzLnB1c2goaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjb21tYW5kSW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNpdGVGaXggPSB7XG4gICAgICAgICAgICB1cmw6IHBhcnNlQXJyYXkobGluZXMuc2xpY2UoMCwgY29tbWFuZEluZGljZXNbMF0pLmpvaW4oJ1xcbicpKSBhcyByZWFkb25seSBzdHJpbmdbXSxcbiAgICAgICAgfSBhcyBUO1xuXG4gICAgICAgIGNvbW1hbmRJbmRpY2VzLmZvckVhY2goKGNvbW1hbmRJbmRleCwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IGxpbmVzW2NvbW1hbmRJbmRleF0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWVUZXh0ID0gbGluZXMuc2xpY2UoY29tbWFuZEluZGV4ICsgMSwgaSA9PT0gY29tbWFuZEluZGljZXMubGVuZ3RoIC0gMSA/IGxpbmVzLmxlbmd0aCA6IGNvbW1hbmRJbmRpY2VzW2kgKyAxXSkuam9pbignXFxuJyk7XG4gICAgICAgICAgICBjb25zdCBwcm9wID0gb3B0aW9ucy5nZXRDb21tYW5kUHJvcE5hbWUoY29tbWFuZCk7XG4gICAgICAgICAgICBpZiAoIXByb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbnMucGFyc2VDb21tYW5kVmFsdWUoY29tbWFuZCwgdmFsdWVUZXh0KTtcbiAgICAgICAgICAgIHNpdGVGaXhbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2l0ZXMucHVzaChzaXRlRml4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzaXRlcztcbn1cblxuLy8gVVJMIHBhdHRlcm5zIGFyZSBndWFyYW50ZWVkIHRvIG5vdCBoYXZlIHByb3RvY29sIGFuZCBsZWFkaW5nICcvJ1xuZXhwb3J0IGZ1bmN0aW9uIGdldERvbWFpbih1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIChuZXcgVVJMKHVybCkpLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHVybC5zcGxpdCgnLycpWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxufVxuXG4vKlxuICogRW5jb2RlIGFsbCBvZmZzZXRzIGludG8gYSBzdHJpbmcsIHdoZXJlIGVhY2ggcmVjb3JkIGlzIDcgYnl0ZXMgbG9uZzpcbiAqICAtIDQgYnl0ZXMgZm9yIHN0YXJ0IG9mZnNldFxuICogIC0gMyBieXRlcyBmb3IgcmVjb3JkIGxlbmd0aCAoZW5kIG9mZnNldCAtIHN0YXJ0IG9mZnNldClcbiAqIEJvdGggdmFsdWVzIGFyZSBzdG9yZWQgaW4gYmFzZSAzNiAocmFkaXggMzYpIG5vdGF0aW9uLlxuICogTWF4aW11bSBzdXBwb3J0ZWQgbnVtYmVyczpcbiAqICAtIHN0YXJ0IG9mZnNldCBtdXN0IGJlIG5vIG1vcmUgdGhhbiBwYXJzZUludCgnenp6eicsIDM2KSA9IDE2Nzk2MTVcbiAqICAtIGxlbmd0aCBtdXN0IGJlIG5vIG1vcmUgdGhhbiBwYXJzZUludCgnenp6JywgMzYpID0gNDY2NTVcbiAqXG4gKiBXZSBoYXZlIHRvIGVuY29kZSBvZmZzZXRzIGludG8gYSBzdHJpbmcgdG8gYmUgYWJsZSB0byBzYXZlIHRoZW0gaW5cbiAqIGNocm9tZS5zdG9yYWdlLmxvY2FsIGZvciB1c2UgaW4gbm9uLXBlcnNpc3RlbnQgYmFja2dyb3VuZCBjb250ZXh0cy5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlT2Zmc2V0cyhvZmZzZXRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPik6IHN0cmluZyB7XG4gICAgcmV0dXJuIG9mZnNldHMubWFwKChbb2Zmc2V0LCBsZW5ndGhdKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0cmluZ09mZnNldCA9IG9mZnNldC50b1N0cmluZygzNik7XG4gICAgICAgIGNvbnN0IHN0cmluZ0xlbmd0aCA9IGxlbmd0aC50b1N0cmluZygzNik7XG4gICAgICAgIHJldHVybiAnMCcucmVwZWF0KDQgLSBzdHJpbmdPZmZzZXQubGVuZ3RoKSArIHN0cmluZ09mZnNldCArICcwJy5yZXBlYXQoMyAtIHN0cmluZ0xlbmd0aC5sZW5ndGgpICsgc3RyaW5nTGVuZ3RoO1xuICAgIH0pLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPZmZzZXQob2Zmc2V0czogc3RyaW5nLCBpbmRleDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgY29uc3QgYmFzZSA9ICg0ICsgMykgKiBpbmRleDtcbiAgICBjb25zdCBvZmZzZXQgPSBwYXJzZUludChvZmZzZXRzLnN1YnN0cmluZyhiYXNlICsgMCwgYmFzZSArIDQpLCAzNik7XG4gICAgY29uc3QgbGVuZ3RoID0gcGFyc2VJbnQob2Zmc2V0cy5zdWJzdHJpbmcoYmFzZSArIDQsIGJhc2UgKyA0ICsgMyksIDM2KTtcbiAgICByZXR1cm4gW1xuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG9mZnNldCArIGxlbmd0aCxcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBhZGRMYWJlbChzZXQ6IHsgW2xhYmVsOiBzdHJpbmddOiBudW1iZXJbXSB9LCBsYWJlbDogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKCFzZXRbbGFiZWxdKSB7XG4gICAgICAgIHNldFtsYWJlbF0gPSBbaW5kZXhdO1xuICAgIH0gZWxzZSBpZiAoIShzZXRbbGFiZWxdLmluY2x1ZGVzKGluZGV4KSkpIHtcbiAgICAgICAgc2V0W2xhYmVsXS5wdXNoKGluZGV4KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3REb21haW5MYWJlbHNGcm9tRnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZChmdWxseVF1YWxpZmllZERvbWFpbldpbGRjYXJkOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgcG9zdGZpeFN0YXJ0ID0gZnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZC5sYXN0SW5kZXhPZignKicpO1xuICAgIGNvbnN0IHBvc3RmaXggPSBmdWxseVF1YWxpZmllZERvbWFpbldpbGRjYXJkLnN1YnN0cmluZyhwb3N0Zml4U3RhcnQgKyAyKTtcbiAgICBpZiAocG9zdGZpeFN0YXJ0IDwgMCB8fCBwb3N0Zml4Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZC5zcGxpdCgnLicpO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbHMgPSBbcG9zdGZpeF07XG4gICAgY29uc3QgcHJlZml4ID0gZnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZC5zdWJzdHJpbmcoMCwgcG9zdGZpeFN0YXJ0KTtcbiAgICBwcmVmaXguc3BsaXQoJy4nKS5maWx0ZXIoQm9vbGVhbikuZm9yRWFjaCgobCkgPT4gbGFiZWxzLmNvbmNhdChsKSk7XG4gICAgcmV0dXJuIGxhYmVscztcbn1cblxuZnVuY3Rpb24gaW5kZXhDb25maWdVUkxzKHVybHM6IHN0cmluZ1tdW10pOiB7ZG9tYWluczogeyBbZG9tYWluOiBzdHJpbmddOiBudW1iZXJbXSB9OyBkb21haW5MYWJlbHM6IHsgW2RvbWFpbkxhYmVsOiBzdHJpbmddOiBudW1iZXJbXSB9OyBub25zdGFuZGFyZDogbnVtYmVyW119IHtcbiAgICBjb25zdCBkb21haW5zOiB7IFtkb21haW46IHN0cmluZ106IG51bWJlcltdIH0gPSB7fTtcbiAgICBjb25zdCBkb21haW5MYWJlbHM6IHsgW2RvbWFpbkxhYmVsOiBzdHJpbmddOiBudW1iZXJbXSB9ID0ge307XG4gICAgY29uc3Qgbm9uc3RhbmRhcmQ6IG51bWJlcltdID0gW107XG5cbiAgICBjb25zdCBkb21haW5MYWJlbEZyZXF1ZW5jaWVzOiB7IFtkb21haW5MYWJlbDogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgICBjb25zdCBkb21haW5MYWJlbE1lbWJlcnM6IEFycmF5PHsgbGFiZWxzOiBzdHJpbmdbXTsgaW5kZXg6IG51bWJlciB9PiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHVybHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdXJsc1tpbmRleF07XG4gICAgICAgIGNvbnN0IGJsb2NrRG9tYWluTGFiZWxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGZvciAoY29uc3QgdXJsIG9mIGJsb2NrKSB7XG4gICAgICAgICAgICBjb25zdCBkb21haW4gPSBnZXREb21haW4odXJsKTtcbiAgICAgICAgICAgIGlmIChpc0Z1bGx5UXVhbGlmaWVkRG9tYWluKGRvbWFpbikpIHtcbiAgICAgICAgICAgICAgICBhZGRMYWJlbChkb21haW5zLCBkb21haW4sIGluZGV4KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNGdWxseVF1YWxpZmllZERvbWFpbldpbGRjYXJkKGRvbWFpbikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbHMgPSBleHRyYWN0RG9tYWluTGFiZWxzRnJvbUZ1bGx5UXVhbGlmaWVkRG9tYWluV2lsZGNhcmQoZG9tYWluKTtcbiAgICAgICAgICAgICAgICBkb21haW5MYWJlbE1lbWJlcnMucHVzaCh7bGFiZWxzLCBpbmRleH0pO1xuICAgICAgICAgICAgICAgIGxhYmVscy5mb3JFYWNoKChsKSA9PiBibG9ja0RvbWFpbkxhYmVscy5hZGQobCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTaXRlZml4IHBhcnNlciBlbmNvdW50ZXJlZCBub24tc3RhbmRhcmQgVVJMXG4gICAgICAgICAgICAgICAgbm9uc3RhbmRhcmQucHVzaChpbmRleCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb21wdXRlIGRvbWFpbiBsYWJlbCBmcmVxdWVuY2llcywgY291bnRpbmcgZWFjaCBsYWJlbCB3aXRoaW4gZWFjaCBmaXggb25seSBvbmNlXG4gICAgICAgIGZvciAoY29uc3QgbGFiZWwgb2YgYmxvY2tEb21haW5MYWJlbHMpIHtcbiAgICAgICAgICAgIGlmIChkb21haW5MYWJlbEZyZXF1ZW5jaWVzW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgIGRvbWFpbkxhYmVsRnJlcXVlbmNpZXNbbGFiZWxdKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbWFpbkxhYmVsRnJlcXVlbmNpZXNbbGFiZWxdID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZvciBlYWNoIGRvbWFpbiBuYW1lLCBmaW5kIHRoZSBtb3N0IHNwZWNpZmljIGxhYmVsXG4gICAgZm9yIChjb25zdCB7bGFiZWxzLCBpbmRleH0gb2YgZG9tYWluTGFiZWxNZW1iZXJzKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IGxhYmVsc1swXTtcbiAgICAgICAgZm9yIChjb25zdCBjdXJyTGFiZWwgb2YgbGFiZWxzKSB7XG4gICAgICAgICAgICBpZiAoZG9tYWluTGFiZWxGcmVxdWVuY2llc1tjdXJyTGFiZWxdIDwgZG9tYWluTGFiZWxGcmVxdWVuY2llc1tsYWJlbF0pIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGN1cnJMYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhZGRMYWJlbChkb21haW5MYWJlbHMsIGxhYmVsLCBpbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtkb21haW5zLCBkb21haW5MYWJlbHMsIG5vbnN0YW5kYXJkfTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1NpdGVGaXhlc0NvbmZpZ0Jsb2NrKHRleHQ6IHN0cmluZywgb2Zmc2V0czogQXJyYXk8W251bWJlciwgbnVtYmVyXT4sIHJlY29yZFN0YXJ0OiBudW1iZXIsIHJlY29yZEVuZDogbnVtYmVyLCB1cmxzOiBBcnJheTxyZWFkb25seSBzdHJpbmdbXT4pIHtcbiAgICAvLyBUT0RPOiBtb3JlIGZvcm1hbCBkZWZpbml0aW9uIG9mIFVSTHMgYW5kIGRlbGltaXRlcnNcbiAgICBjb25zdCBibG9jayA9IHRleHQuc3Vic3RyaW5nKHJlY29yZFN0YXJ0LCByZWNvcmRFbmQpO1xuICAgIGNvbnN0IGxpbmVzID0gYmxvY2suc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGNvbW1hbmRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxpbmVzLmZvckVhY2goKGxuLCBpKSA9PiB7XG4gICAgICAgIGlmIChsbi5tYXRjaCgvXltBLVpdKyhcXHNbQS1aXSspezAsMn0kLykpIHtcbiAgICAgICAgICAgIGNvbW1hbmRJbmRpY2VzLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChjb21tYW5kSW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG9mZnNldHMucHVzaChbcmVjb3JkU3RhcnQsIHJlY29yZEVuZCAtIHJlY29yZFN0YXJ0XSk7XG5cbiAgICBjb25zdCB1cmxzXyA9IHBhcnNlQXJyYXkobGluZXMuc2xpY2UoMCwgY29tbWFuZEluZGljZXNbMF0pLmpvaW4oJ1xcbicpKTtcbiAgICB1cmxzLnB1c2godXJsc18pO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0VVJMc0Zyb21TaXRlRml4ZXNDb25maWcodGV4dDogc3RyaW5nKToge3VybHM6IHN0cmluZ1tdW107IG9mZnNldHM6IEFycmF5PFtudW1iZXIsIG51bWJlcl0+fSB7XG4gICAgY29uc3QgdXJsczogc3RyaW5nW11bXSA9IFtdO1xuICAgIC8vIEFycmF5IG9mIHR1cGxlcywgd2hlcmUgZmlyc3QgbnVtYmVyIGlzIGFuIG9mZnNldCBvZiByZWNvcmQgc3RhcnQgYW5kIHNlY29uZCBudW1iZXIgaXMgcmVjb3JkIGxlbmd0aC5cbiAgICBjb25zdCBvZmZzZXRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtdO1xuXG4gICAgbGV0IHJlY29yZFN0YXJ0ID0gMDtcbiAgICAvLyBEZWxpbWl0ZXIgYmV0d2VlbiB0d28gYmxvY2tzXG4gICAgY29uc3QgZGVsaW1pdGVyUmVnZXggPSAvXlxccyo9ezIsfVxccyokL2dtO1xuICAgIGxldCBkZWxpbWl0ZXI6IFJlZ0V4cE1hdGNoQXJyYXkgfCBudWxsO1xuICAgIHdoaWxlICgoZGVsaW1pdGVyID0gZGVsaW1pdGVyUmVnZXguZXhlYyh0ZXh0KSkpIHtcbiAgICAgICAgY29uc3QgbmV4dERlbGltaXRlclN0YXJ0ID0gZGVsaW1pdGVyLmluZGV4ITtcbiAgICAgICAgY29uc3QgbmV4dERlbGltaXRlckVuZCA9IGRlbGltaXRlci5pbmRleCEgKyBkZWxpbWl0ZXJbMF0ubGVuZ3RoO1xuICAgICAgICBwcm9jZXNzU2l0ZUZpeGVzQ29uZmlnQmxvY2sodGV4dCwgb2Zmc2V0cywgcmVjb3JkU3RhcnQsIG5leHREZWxpbWl0ZXJTdGFydCwgdXJscyk7XG4gICAgICAgIHJlY29yZFN0YXJ0ID0gbmV4dERlbGltaXRlckVuZDtcbiAgICB9XG4gICAgcHJvY2Vzc1NpdGVGaXhlc0NvbmZpZ0Jsb2NrKHRleHQsIG9mZnNldHMsIHJlY29yZFN0YXJ0LCB0ZXh0Lmxlbmd0aCwgdXJscyk7XG5cbiAgICByZXR1cm4ge3VybHMsIG9mZnNldHN9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhTaXRlc0ZpeGVzQ29uZmlnPFQgZXh0ZW5kcyBTaXRlUHJvcHM+KHRleHQ6IHN0cmluZyk6IFNpdGVQcm9wc0luZGV4PFQ+IHtcbiAgICBjb25zdCB7dXJscywgb2Zmc2V0c30gPSBleHRyYWN0VVJMc0Zyb21TaXRlRml4ZXNDb25maWcodGV4dCk7XG4gICAgY29uc3Qge2RvbWFpbnMsIGRvbWFpbkxhYmVscywgbm9uc3RhbmRhcmR9ID0gaW5kZXhDb25maWdVUkxzKHVybHMpO1xuICAgIHJldHVybiB7b2Zmc2V0czogZW5jb2RlT2Zmc2V0cyhvZmZzZXRzKSwgZG9tYWlucywgZG9tYWluTGFiZWxzLCBub25zdGFuZGFyZCwgY2FjaGVEb21haW5JbmRleDoge30sIGNhY2hlU2l0ZUZpeDoge30sIGNhY2hlQ2xlYW51cFRpbWVyOiBudWxsfTtcbn1cblxuZnVuY3Rpb24gbG9va3VwQ29uZmlnVVJMc0luRG9tYWluTGFiZWxzKGRvbWFpbjogc3RyaW5nLCByZWNvcmRJZHM6IG51bWJlcltdLCBjdXJyUmVjb3JkSWRzOiByZWFkb25seSBudW1iZXJbXSwgZ2V0QWxsUmVjb3JkVVJMczogKGlkOiBudW1iZXIpID0+IHJlYWRvbmx5IHN0cmluZ1tdKSB7XG4gICAgZm9yIChjb25zdCByZWNvcmRJZCBvZiBjdXJyUmVjb3JkSWRzKSB7XG4gICAgICAgIGNvbnN0IHJlY29yZFVSTHMgPSBnZXRBbGxSZWNvcmRVUkxzKHJlY29yZElkKTtcbiAgICAgICAgZm9yIChjb25zdCBydWxlVXJsIG9mIHJlY29yZFVSTHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHdpbGRjYXJkID0gZ2V0RG9tYWluKHJ1bGVVcmwpO1xuICAgICAgICAgICAgaWYgKGlzRnVsbHlRdWFsaWZpZWREb21haW5XaWxkY2FyZCh3aWxkY2FyZCkgJiYgZnVsbHlRdWFsaWZpZWREb21haW5NYXRjaGVzV2lsZGNhcmQod2lsZGNhcmQsIGRvbWFpbikpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRJZHMucHVzaChyZWNvcmRJZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNraXAgdGhpcyBydWxlLCBzaW5jZSB0aGUgbGFiZWwgbWF0Y2ggbXVzdCBoYXZlIGNvbWUgZnJvbSBhIGRpZmZlcmVudCBVUkxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbG9va3VwQ29uZmlnVVJMcyhkb21haW46IHN0cmluZywgaW5kZXg6IENvbmZpZ0luZGV4LCBnZXRBbGxSZWNvcmRVUkxzOiAoaWQ6IG51bWJlcikgPT4gcmVhZG9ubHkgc3RyaW5nW10pOiBudW1iZXJbXSB7XG4gICAgY29uc3QgbGFiZWxzID0gZG9tYWluLnNwbGl0KCcuJyk7XG4gICAgbGV0IHJlY29yZElkczogbnVtYmVyW10gPSBbXTtcblxuICAgIC8vIENvbW1vbiBmaXhcbiAgICBpZiAoaW5kZXguZG9tYWluTGFiZWxzLmhhc093blByb3BlcnR5KCcqJykpIHtcbiAgICAgICAgcmVjb3JkSWRzID0gcmVjb3JkSWRzLmNvbmNhdChpbmRleC5kb21haW5MYWJlbHNbJyonXSk7XG4gICAgfVxuXG4gICAgLy8gV2lsZGNhcmQgZml4ZXNcbiAgICBmb3IgKGNvbnN0IGxhYmVsIG9mIGxhYmVscykge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHVzZSBpbiBvcGVyYXRvciBiZWNhdXNlIGlkcyBhcmUgMC1iYXNlZCBhbmQgMCBpcyBmYWxzeVxuICAgICAgICBpZiAoaW5kZXguZG9tYWluTGFiZWxzLmhhc093blByb3BlcnR5KGxhYmVsKSkge1xuICAgICAgICAgICAgY29uc3QgY3VyclJlY29yZElkcyA9IGluZGV4LmRvbWFpbkxhYmVsc1tsYWJlbF07XG4gICAgICAgICAgICBsb29rdXBDb25maWdVUkxzSW5Eb21haW5MYWJlbHMoZG9tYWluLCByZWNvcmRJZHMsIGN1cnJSZWNvcmRJZHMsIGdldEFsbFJlY29yZFVSTHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nID0gbGFiZWxzLnNsaWNlKGkpLmpvaW4oJy4nKTtcbiAgICAgICAgaWYgKGluZGV4LmRvbWFpbnMuaGFzT3duUHJvcGVydHkoc3Vic3RyaW5nKSkge1xuICAgICAgICAgICAgcmVjb3JkSWRzID0gcmVjb3JkSWRzLmNvbmNhdChpbmRleC5kb21haW5zW3N1YnN0cmluZ10pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleC5kb21haW5MYWJlbHMuaGFzT3duUHJvcGVydHkoc3Vic3RyaW5nKSkge1xuICAgICAgICAgICAgY29uc3QgY3VyclJlY29yZElkcyA9IGluZGV4LmRvbWFpbkxhYmVsc1tzdWJzdHJpbmddO1xuICAgICAgICAgICAgbG9va3VwQ29uZmlnVVJMc0luRG9tYWluTGFiZWxzKGRvbWFpbiwgcmVjb3JkSWRzLCBjdXJyUmVjb3JkSWRzLCBnZXRBbGxSZWNvcmRVUkxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5OiBjaGVjayBmb3Igbm9uc3NlbmQgb3ZlciBub25zdGFuZGFyZCBwYXR0ZXJucywgd2hpY2ggd2lsbCBiZSBmaWx0ZXJlZCBvdXRcbiAgICAvLyB2aWEgcmVnZXggaW4gY29udGVudCBzY3JpcHRcbiAgICBpZiAoaW5kZXgubm9uc3RhbmRhcmQpIHtcbiAgICAgICAgZm9yIChjb25zdCBjdXJyUmVjb3JkSWQgb2YgaW5kZXgubm9uc3RhbmRhcmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybHMgPSBnZXRBbGxSZWNvcmRVUkxzKGN1cnJSZWNvcmRJZCk7XG4gICAgICAgICAgICBpZiAodXJscy5zb21lKCh1cmwpID0+IGlzVVJMTWF0Y2hlZChkb21haW4sIGdldERvbWFpbih1cmwpKSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRJZHMucHVzaChjdXJyUmVjb3JkSWQpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdXBsaWNhdGUgYXJyYXkgZWxlbWVudHNcbiAgICByZWNvcmRJZHMgPSBBcnJheS5mcm9tKG5ldyBTZXQocmVjb3JkSWRzKSk7XG5cbiAgICByZXR1cm4gcmVjb3JkSWRzO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGEgc2luZ2xlIHNpdGUgZml4IGFuZCBwYXJzZXMgaXQgKGNhY2hlZClcbiAqIEBwYXJhbSB0ZXh0IHRoZSBmaXggZmlsZVxuICogQHBhcmFtIGluZGV4IHNpdGUgZml4IGluZGV4XG4gKiBAcGFyYW0gb3B0aW9ucyBmaXggcGFyc2luZyBvcHRpb25zXG4gKiBAcGFyYW0gaWQgbnVtZXJpYyBpbmRleCBvZiB0aGUgZml4XG4gKiBAcmV0dXJucyBhIHNpbmdsZSBmaXhcbiAqL1xuZnVuY3Rpb24gZ2V0U2l0ZUZpeDxUIGV4dGVuZHMgU2l0ZVByb3BzPih0ZXh0OiBzdHJpbmcsIGluZGV4OiBTaXRlUHJvcHNJbmRleDxUPiwgb3B0aW9uczogU2l0ZXNGaXhlc1BhcnNlck9wdGlvbnM8VD4sIGlkOiBudW1iZXIpOiBSZWFkb25seTxUPiB7XG4gICAgaWYgKGluZGV4LmNhY2hlU2l0ZUZpeC5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4LmNhY2hlU2l0ZUZpeFtpZF07XG4gICAgfVxuXG4gICAgY29uc3QgW2Jsb2NrU3RhcnQsIGJsb2NrRW5kXSA9IGRlY29kZU9mZnNldChpbmRleC5vZmZzZXRzLCBpZCk7XG4gICAgY29uc3QgYmxvY2sgPSB0ZXh0LnN1YnN0cmluZyhibG9ja1N0YXJ0LCBibG9ja0VuZCk7XG4gICAgY29uc3QgZml4ID0gcGFyc2VTaXRlc0ZpeGVzQ29uZmlnPFQ+KGJsb2NrLCBvcHRpb25zKVswXTtcbiAgICBpbmRleC5jYWNoZVNpdGVGaXhbaWRdID0gZml4O1xuICAgIHJldHVybiBmaXg7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB1c2VzIHNldFRpbWVvdXQgaW5zdGVhZCBvZiBBbGFybXMgQVBJIHNvIHRoYXQgYmFja2dyb3VuZCBjb250ZXh0IGNhblxuICogZ28gaW5jYXRpdmUgKHJlc3VsdGluZyBpbiBjbGVhbnVwIG9mIGFsbCBjb250ZXh0IHZhcmlhYmxlcykgYW5kIHRoZW4gbm90IGJlIGF3b2tlblxuICogYnkgdGhlIGFsYXJtLlxuICogQHBhcmFtIGluZGV4XG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQ2FjaGVDbGVhbnVwPFQgZXh0ZW5kcyBTaXRlUHJvcHM+KGluZGV4OiBTaXRlUHJvcHNJbmRleDxUPikge1xuICAgIGlmIChfX1RFU1RfXykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNsZWFyVGltZW91dChpbmRleC5jYWNoZUNsZWFudXBUaW1lcik7XG4gICAgaW5kZXguY2FjaGVDbGVhbnVwVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaW5kZXguY2FjaGVDbGVhbnVwVGltZXIgPSBudWxsO1xuICAgICAgICBpbmRleC5jYWNoZURvbWFpbkluZGV4ID0ge307XG4gICAgICAgIGluZGV4LmNhY2hlU2l0ZUZpeCA9IHt9O1xuICAgIH0sIElOREVYX0NBQ0hFX0NMRUFOVVBfSU5URVJWQUxfSU5fTVMpO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgVVJMLCByYXcgZml4ZXMsIGFuZCBhbiBpbmRleCwgZmluZHMgdGhlIGFwcGxpY2FibGUgZml4ZXMuXG4gKiBOb3RlIHRoYXQgZGVwZW5kZW50cyBhc3N1bWUgdGhhdCB0aGUgZmlyc3QgcmV0dXJuZWQgZml4IGlzIGEgZ2VuZXJpYyBmaXggKGhhcyBVUkwgcGF0dGVybiAnKicpLlxuICpcbiAqIFRoaXMgbWV0aG9kIHVzZXMgdHdvIGxldmVscyBvZiBjYWNoaW5nOlxuICogIC0gY2FjaGluZyB0aGUgc2l0ZSBmaXhlcyBrZXllZCBieSBhIG51bWVyaWMgaWQgKHRvIGF2b2lkIHJlLXBhcnNpbmcgdGhlIHNpdGUgZml4ZXMpXG4gKiAgLSBjYWNoaW5nIHRoZSBudW1lcmljIGlkcyBrZXllZCBieSBkb21haW4gKHRvIGF2b2lkIHJlLWNvbXB1dGluZyBsaXN0cyBvZiBzaXRlIGZpeGVzIGZvciB0aGUgc2FtZSBzaXRlLFxuICogICAgd2hpY2ggaXMgdXNlZnVsIGlmIHVzZXIgaGFzIG11bHRpcGxlIHRhYnMgb2YgdGhlIHNhbWUgc2l0ZSBhbmQgdG9nZ2xlcyBEYXJrIFJlYWRlciBvbilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNpdGVzRml4ZXNGb3I8VCBleHRlbmRzIFNpdGVQcm9wcz4odXJsOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgaW5kZXg6IFNpdGVQcm9wc0luZGV4PFQ+LCBvcHRpb25zOiBTaXRlc0ZpeGVzUGFyc2VyT3B0aW9uczxUPik6IEFycmF5PFJlYWRvbmx5PFQ+PiB7XG4gICAgY29uc3QgcmVjb3JkczogVFtdID0gW107XG4gICAgY29uc3QgZG9tYWluID0gZ2V0RG9tYWluKHVybCk7XG5cbiAgICBpZiAoIWluZGV4LmNhY2hlRG9tYWluSW5kZXhbZG9tYWluXSkge1xuICAgICAgICBpbmRleC5jYWNoZURvbWFpbkluZGV4W2RvbWFpbl0gPSBsb29rdXBDb25maWdVUkxzKGRvbWFpbiwgaW5kZXgsIChyZWNvcmRJZCkgPT4gZ2V0U2l0ZUZpeDxUPih0ZXh0LCBpbmRleCwgb3B0aW9ucywgcmVjb3JkSWQpLnVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb3JkSWRzID0gaW5kZXguY2FjaGVEb21haW5JbmRleFtkb21haW5dO1xuICAgIGZvciAoY29uc3QgcmVjb3JkSWQgb2YgcmVjb3JkSWRzKSB7XG4gICAgICAgIGNvbnN0IGZpeCA9IGdldFNpdGVGaXg8VD4odGV4dCwgaW5kZXgsIG9wdGlvbnMsIHJlY29yZElkKTtcbiAgICAgICAgcmVjb3Jkcy5wdXNoKGZpeCk7XG4gICAgfVxuXG4gICAgc2NoZWR1bGVDYWNoZUNsZWFudXAoaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhTaXRlTGlzdENvbmZpZyh0ZXh0OiBzdHJpbmcpOiBTaXRlTGlzdEluZGV4IHtcbiAgICBjb25zdCB1cmxzID0gcGFyc2VBcnJheSh0ZXh0KTtcbiAgICBjb25zdCB1cmxzMkQgPSB1cmxzLm1hcCgodSkgPT4gW3VdKTtcbiAgICBjb25zdCB7ZG9tYWlucywgZG9tYWluTGFiZWxzLCBub25zdGFuZGFyZH0gPSBpbmRleENvbmZpZ1VSTHModXJsczJEKTtcbiAgICByZXR1cm4ge2RvbWFpbnMsIGRvbWFpbkxhYmVscywgbm9uc3RhbmRhcmQsIHVybHN9O1xufVxuXG5mdW5jdGlvbiBnZXRTaXRlTGlzdEZvcih1cmw6IHN0cmluZywgaW5kZXg6IFNpdGVMaXN0SW5kZXgpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgZG9tYWluID0gZ2V0RG9tYWluKHVybCk7XG4gICAgY29uc3QgcmVjb3JkSWRzID0gbG9va3VwQ29uZmlnVVJMcyhkb21haW4sIGluZGV4LCAocmVjb3JkSWQpID0+IFtpbmRleC51cmxzW3JlY29yZElkXV0pO1xuICAgIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJlY29yZElkIG9mIHJlY29yZElkcykge1xuICAgICAgICByZXN1bHQucHVzaChpbmRleC51cmxzW3JlY29yZElkXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VSTEluU2l0ZUxpc3QodXJsOiBzdHJpbmcsIGluZGV4OiBTaXRlTGlzdEluZGV4IHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmIChpbmRleCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHVybHMgPSBnZXRTaXRlTGlzdEZvcih1cmwsIGluZGV4KTtcbiAgICByZXR1cm4gaXNVUkxJbkxpc3QodXJsLCB1cmxzKTtcbn1cbiIsImltcG9ydCB0eXBlIHtUaGVtZSwgSW52ZXJzaW9uRml4fSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2NvbXBhcmVDaHJvbWVWZXJzaW9ucywgY2hyb21pdW1WZXJzaW9uLCBpc0ZpcmVmb3gsIGZpcmVmb3hWZXJzaW9ufSBmcm9tICcuLi91dGlscy9wbGF0Zm9ybSc7XG5pbXBvcnQge3BhcnNlQXJyYXksIGZvcm1hdEFycmF5fSBmcm9tICcuLi91dGlscy90ZXh0JztcbmltcG9ydCB7Y29tcGFyZVVSTFBhdHRlcm5zLCBpc1VSTEluTGlzdH0gZnJvbSAnLi4vdXRpbHMvdXJsJztcblxuaW1wb3J0IHtjcmVhdGVUZXh0U3R5bGV9IGZyb20gJy4vdGV4dC1zdHlsZSc7XG5pbXBvcnQge2Zvcm1hdFNpdGVzRml4ZXNDb25maWd9IGZyb20gJy4vdXRpbHMvZm9ybWF0JztcbmltcG9ydCB7YXBwbHlDb2xvck1hdHJpeCwgY3JlYXRlRmlsdGVyTWF0cml4fSBmcm9tICcuL3V0aWxzL21hdHJpeCc7XG5pbXBvcnQge3BhcnNlU2l0ZXNGaXhlc0NvbmZpZywgZ2V0U2l0ZXNGaXhlc0Zvcn0gZnJvbSAnLi91dGlscy9wYXJzZSc7XG5pbXBvcnQgdHlwZSB7U2l0ZVByb3BzSW5kZXh9IGZyb20gJy4vdXRpbHMvcGFyc2UnO1xuXG5cbmRlY2xhcmUgY29uc3QgX19DSFJPTUlVTV9NVjJfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19DSFJPTUlVTV9NVjNfXzogYm9vbGVhbjtcblxuZXhwb3J0IGVudW0gRmlsdGVyTW9kZSB7XG4gICAgbGlnaHQgPSAwLFxuICAgIGRhcmsgPSAxXG59XG5cbi8qKlxuICogVGhpcyBjaGVja3MgaWYgdGhlIGN1cnJlbnQgY2hyb21pdW0gdmVyc2lvbiBoYXMgdGhlIHBhdGNoIGluIGl0LlxuICogQXMgb2YgQ2hyb21pdW0gdjgxLjAuNDAzNS4wIHRoaXMgaGFzIGJlZW4gdGhlIHNpdHVhdGlvblxuICpcbiAqIEJ1ZyByZXBvcnQ6IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTUwMTU4MlxuICogUGF0Y2g6IGh0dHBzOi8vY2hyb21pdW0tcmV2aWV3Lmdvb2dsZXNvdXJjZS5jb20vYy9jaHJvbWl1bS9zcmMvKy8xOTc5MjU4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNQYXRjaEZvckNocm9taXVtSXNzdWU1MDE1ODIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9fQ0hST01JVU1fTVYzX18gfHwgQm9vbGVhbihcbiAgICAgICAgX19DSFJPTUlVTV9NVjJfXyAmJlxuICAgICAgICBjb21wYXJlQ2hyb21lVmVyc2lvbnMoY2hyb21pdW1WZXJzaW9uLCAnODEuMC40MDM1LjAnKSA+PSAwXG4gICAgKTtcbn1cblxuLyoqXG4gKiBTaW5jZSBGaXJlZm94IHYxMDIuMCwgdGhleSBoYXZlIGNoYW5nZWQgdG8gdGhlIG5ldyByb290IGJlaGF2aW9yLlxuICogVGhpcyB3YXMgYWxyZWFkeSB0aGUgY2FzZSBmb3IgQ2hyb21pdW0gdjgxLjAuNDAzNS4wIGFuZCBGaXJlZm94IG5vd1xuICogc3dpdGNoZWQgb3ZlciBhcyB3ZWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzRmlyZWZveE5ld1Jvb3RCZWhhdmlvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgaXNGaXJlZm94ICYmXG4gICAgICAgIGNvbXBhcmVDaHJvbWVWZXJzaW9ucyhmaXJlZm94VmVyc2lvbiwgJzEwMi4wJykgPj0gMFxuICAgICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUNTU0ZpbHRlclN0eWxlU2hlZXQoY29uZmlnOiBUaGVtZSwgdXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIGZpeGVzOiBzdHJpbmcsIGluZGV4OiBTaXRlUHJvcHNJbmRleDxJbnZlcnNpb25GaXg+KTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWx0ZXJWYWx1ZSA9IGdldENTU0ZpbHRlclZhbHVlKGNvbmZpZykhO1xuICAgIGNvbnN0IHJldmVyc2VGaWx0ZXJWYWx1ZSA9ICdpbnZlcnQoMTAwJSkgaHVlLXJvdGF0ZSgxODBkZWcpJztcbiAgICByZXR1cm4gY3NzRmlsdGVyU3R5bGVTaGVldFRlbXBsYXRlKCdodG1sJywgZmlsdGVyVmFsdWUsIHJldmVyc2VGaWx0ZXJWYWx1ZSwgY29uZmlnLCB1cmwsIGlzVG9wRnJhbWUsIGZpeGVzLCBpbmRleCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjc3NGaWx0ZXJTdHlsZVNoZWV0VGVtcGxhdGUoZmlsdGVyUm9vdDogc3RyaW5nLCBmaWx0ZXJWYWx1ZTogc3RyaW5nLCByZXZlcnNlRmlsdGVyVmFsdWU6IHN0cmluZywgY29uZmlnOiBUaGVtZSwgdXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIGZpeGVzOiBzdHJpbmcsIGluZGV4OiBTaXRlUHJvcHNJbmRleDxJbnZlcnNpb25GaXg+KTogc3RyaW5nIHtcbiAgICBjb25zdCBmaXggPSBnZXRJbnZlcnNpb25GaXhlc0Zvcih1cmwsIGZpeGVzLCBpbmRleCk7XG5cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblxuICAgIGxpbmVzLnB1c2goJ0BtZWRpYSBzY3JlZW4geycpO1xuXG4gICAgLy8gQWRkIGxlYWRpbmcgcnVsZVxuICAgIGlmIChmaWx0ZXJWYWx1ZSAmJiBpc1RvcEZyYW1lKSB7XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICBsaW5lcy5wdXNoKCcvKiBMZWFkaW5nIHJ1bGUgKi8nKTtcbiAgICAgICAgbGluZXMucHVzaChjcmVhdGVMZWFkaW5nUnVsZShmaWx0ZXJSb290LCBmaWx0ZXJWYWx1ZSkpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcubW9kZSA9PT0gRmlsdGVyTW9kZS5kYXJrKSB7XG4gICAgICAgIC8vIEFkZCByZXZlcnNlIHJ1bGVcbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgIGxpbmVzLnB1c2goJy8qIFJldmVyc2UgcnVsZSAqLycpO1xuICAgICAgICBsaW5lcy5wdXNoKGNyZWF0ZVJldmVyc2VSdWxlKHJldmVyc2VGaWx0ZXJWYWx1ZSwgZml4KSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy51c2VGb250IHx8IGNvbmZpZy50ZXh0U3Ryb2tlID4gMCkge1xuICAgICAgICAvLyBBZGQgdGV4dCBydWxlXG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICBsaW5lcy5wdXNoKCcvKiBGb250ICovJyk7XG4gICAgICAgIGxpbmVzLnB1c2goY3JlYXRlVGV4dFN0eWxlKGNvbmZpZykpO1xuICAgIH1cblxuICAgIC8vIEZpeCBiYWQgZm9udCBoaW50aW5nIGFmdGVyIGludmVyc2lvblxuICAgIGxpbmVzLnB1c2goJycpO1xuICAgIGxpbmVzLnB1c2goJy8qIFRleHQgY29udHJhc3QgKi8nKTtcbiAgICBsaW5lcy5wdXNoKCdodG1sIHsnKTtcbiAgICBsaW5lcy5wdXNoKCcgIHRleHQtc2hhZG93OiAwIDAgMCAhaW1wb3J0YW50OycpO1xuICAgIGxpbmVzLnB1c2goJ30nKTtcblxuICAgIC8vIEZ1bGwgc2NyZWVuIGZpeFxuICAgIGxpbmVzLnB1c2goJycpO1xuICAgIGxpbmVzLnB1c2goJy8qIEZ1bGwgc2NyZWVuICovJyk7XG4gICAgWyc6LXdlYmtpdC1mdWxsLXNjcmVlbicsICc6LW1vei1mdWxsLXNjcmVlbicsICc6ZnVsbHNjcmVlbiddLmZvckVhY2goKGZ1bGxTY3JlZW4pID0+IHtcbiAgICAgICAgbGluZXMucHVzaChgJHtmdWxsU2NyZWVufSwgJHtmdWxsU2NyZWVufSAqIHtgKTtcbiAgICAgICAgbGluZXMucHVzaCgnICAtd2Via2l0LWZpbHRlcjogbm9uZSAhaW1wb3J0YW50OycpO1xuICAgICAgICBsaW5lcy5wdXNoKCcgIGZpbHRlcjogbm9uZSAhaW1wb3J0YW50OycpO1xuICAgICAgICBsaW5lcy5wdXNoKCd9Jyk7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNUb3BGcmFtZSkge1xuICAgICAgICBjb25zdCBsaWdodDogW251bWJlciwgbnVtYmVyLCBudW1iZXJdID0gWzI1NSwgMjU1LCAyNTVdO1xuICAgICAgICAvLyBJZiBicm93c2VyIGFmZmVjdGVkIGJ5IENocm9taXVtIElzc3VlIDUwMTU4Miwgc2V0IGRhcmsgYmFja2dyb3VuZCBvbiBodG1sXG4gICAgICAgIC8vIE9yIGlmIGJyb3dzZXIgaXMgRmlyZWZveCB2MTAyK1xuICAgICAgICBjb25zdCBiZ0NvbG9yID0gKCFoYXNQYXRjaEZvckNocm9taXVtSXNzdWU1MDE1ODIoKSAmJiAhaGFzRmlyZWZveE5ld1Jvb3RCZWhhdmlvcigpKSAmJiBjb25maWcubW9kZSA9PT0gRmlsdGVyTW9kZS5kYXJrID9cbiAgICAgICAgICAgIGFwcGx5Q29sb3JNYXRyaXgobGlnaHQsIGNyZWF0ZUZpbHRlck1hdHJpeChjb25maWcpKS5tYXAoTWF0aC5yb3VuZCkgOlxuICAgICAgICAgICAgbGlnaHQ7XG4gICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICBsaW5lcy5wdXNoKCcvKiBQYWdlIGJhY2tncm91bmQgKi8nKTtcbiAgICAgICAgbGluZXMucHVzaCgnaHRtbCB7Jyk7XG4gICAgICAgIGxpbmVzLnB1c2goYCAgYmFja2dyb3VuZDogcmdiKCR7YmdDb2xvci5qb2luKCcsJyl9KSAhaW1wb3J0YW50O2ApO1xuICAgICAgICBsaW5lcy5wdXNoKCd9Jyk7XG4gICAgfVxuXG4gICAgaWYgKGZpeC5jc3MgJiYgZml4LmNzcy5sZW5ndGggPiAwICYmIGNvbmZpZy5tb2RlID09PSBGaWx0ZXJNb2RlLmRhcmspIHtcbiAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgIGxpbmVzLnB1c2goJy8qIEN1c3RvbSBydWxlcyAqLycpO1xuICAgICAgICBsaW5lcy5wdXNoKGZpeC5jc3MpO1xuICAgIH1cblxuICAgIGxpbmVzLnB1c2goJycpO1xuICAgIGxpbmVzLnB1c2goJ30nKTtcblxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENTU0ZpbHRlclZhbHVlKGNvbmZpZzogVGhlbWUpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBmaWx0ZXJzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKGNvbmZpZy5tb2RlID09PSBGaWx0ZXJNb2RlLmRhcmspIHtcbiAgICAgICAgZmlsdGVycy5wdXNoKCdpbnZlcnQoMTAwJSkgaHVlLXJvdGF0ZSgxODBkZWcpJyk7XG4gICAgfVxuICAgIGlmIChjb25maWcuYnJpZ2h0bmVzcyAhPT0gMTAwKSB7XG4gICAgICAgIGZpbHRlcnMucHVzaChgYnJpZ2h0bmVzcygke2NvbmZpZy5icmlnaHRuZXNzfSUpYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuY29udHJhc3QgIT09IDEwMCkge1xuICAgICAgICBmaWx0ZXJzLnB1c2goYGNvbnRyYXN0KCR7Y29uZmlnLmNvbnRyYXN0fSUpYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ3JheXNjYWxlICE9PSAwKSB7XG4gICAgICAgIGZpbHRlcnMucHVzaChgZ3JheXNjYWxlKCR7Y29uZmlnLmdyYXlzY2FsZX0lKWApO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnNlcGlhICE9PSAwKSB7XG4gICAgICAgIGZpbHRlcnMucHVzaChgc2VwaWEoJHtjb25maWcuc2VwaWF9JSlgKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbHRlcnMuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMZWFkaW5nUnVsZShmaWx0ZXJSb290OiBzdHJpbmcsIGZpbHRlclZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBbXG4gICAgICAgIGAke2ZpbHRlclJvb3R9IHtgLFxuICAgICAgICBgICAtd2Via2l0LWZpbHRlcjogJHtmaWx0ZXJWYWx1ZX0gIWltcG9ydGFudDtgLFxuICAgICAgICBgICBmaWx0ZXI6ICR7ZmlsdGVyVmFsdWV9ICFpbXBvcnRhbnQ7YCxcbiAgICAgICAgJ30nLFxuICAgIF0uam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGpvaW5TZWxlY3RvcnMoc2VsZWN0b3JzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNlbGVjdG9ycy5tYXAoKHMpID0+IHMucmVwbGFjZSgvXFwsJC8sICcnKSkuam9pbignLFxcbicpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZXZlcnNlUnVsZShyZXZlcnNlRmlsdGVyVmFsdWU6IHN0cmluZywgZml4OiBJbnZlcnNpb25GaXgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKGZpeC5pbnZlcnQubGVuZ3RoID4gMCkge1xuICAgICAgICBsaW5lcy5wdXNoKGAke2pvaW5TZWxlY3RvcnMoZml4LmludmVydCl9IHtgKTtcbiAgICAgICAgbGluZXMucHVzaChgICAtd2Via2l0LWZpbHRlcjogJHtyZXZlcnNlRmlsdGVyVmFsdWV9ICFpbXBvcnRhbnQ7YCk7XG4gICAgICAgIGxpbmVzLnB1c2goYCAgZmlsdGVyOiAke3JldmVyc2VGaWx0ZXJWYWx1ZX0gIWltcG9ydGFudDtgKTtcbiAgICAgICAgbGluZXMucHVzaCgnfScpO1xuICAgIH1cblxuICAgIGlmIChmaXgubm9pbnZlcnQubGVuZ3RoID4gMCkge1xuICAgICAgICBsaW5lcy5wdXNoKGAke2pvaW5TZWxlY3RvcnMoZml4Lm5vaW52ZXJ0KX0ge2ApO1xuICAgICAgICBsaW5lcy5wdXNoKCcgIC13ZWJraXQtZmlsdGVyOiBub25lICFpbXBvcnRhbnQ7Jyk7XG4gICAgICAgIGxpbmVzLnB1c2goJyAgZmlsdGVyOiBub25lICFpbXBvcnRhbnQ7Jyk7XG4gICAgICAgIGxpbmVzLnB1c2goJ30nKTtcbiAgICB9XG5cbiAgICBpZiAoZml4LnJlbW92ZWJnLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaChgJHtqb2luU2VsZWN0b3JzKGZpeC5yZW1vdmViZyl9IHtgKTtcbiAgICAgICAgbGluZXMucHVzaCgnICBiYWNrZ3JvdW5kOiB3aGl0ZSAhaW1wb3J0YW50OycpO1xuICAgICAgICBsaW5lcy5wdXNoKCd9Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiogUmV0dXJucyBmaXhlcyBmb3IgYSBnaXZlbiBVUkwuXG4qIElmIG5vIG1hdGNoZXMgZm91bmQsIGNvbW1vbiBmaXhlcyB3aWxsIGJlIHJldHVybmVkLlxuKiBAcGFyYW0gdXJsIFNpdGUgVVJMLlxuKiBAcGFyYW0gaW52ZXJzaW9uRml4ZXMgTGlzdCBvZiBpbnZlcnNpb24gZml4ZXMuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEludmVyc2lvbkZpeGVzRm9yKHVybDogc3RyaW5nLCBmaXhlczogc3RyaW5nLCBpbmRleDogU2l0ZVByb3BzSW5kZXg8SW52ZXJzaW9uRml4Pik6IEludmVyc2lvbkZpeCB7XG4gICAgY29uc3QgaW52ZXJzaW9uRml4ZXMgPSBnZXRTaXRlc0ZpeGVzRm9yPEludmVyc2lvbkZpeD4odXJsLCBmaXhlcywgaW5kZXgsIHtcbiAgICAgICAgY29tbWFuZHM6IE9iamVjdC5rZXlzKGludmVyc2lvbkZpeGVzQ29tbWFuZHMpLFxuICAgICAgICBnZXRDb21tYW5kUHJvcE5hbWU6IChjb21tYW5kKSA9PiBpbnZlcnNpb25GaXhlc0NvbW1hbmRzW2NvbW1hbmRdLFxuICAgICAgICBwYXJzZUNvbW1hbmRWYWx1ZTogKGNvbW1hbmQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tbWFuZCA9PT0gJ0NTUycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlQXJyYXkodmFsdWUpO1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29tbW9uID0ge1xuICAgICAgICB1cmw6IGludmVyc2lvbkZpeGVzWzBdLnVybCxcbiAgICAgICAgaW52ZXJ0OiBpbnZlcnNpb25GaXhlc1swXS5pbnZlcnQgfHwgW10sXG4gICAgICAgIG5vaW52ZXJ0OiBpbnZlcnNpb25GaXhlc1swXS5ub2ludmVydCB8fCBbXSxcbiAgICAgICAgcmVtb3ZlYmc6IGludmVyc2lvbkZpeGVzWzBdLnJlbW92ZWJnIHx8IFtdLFxuICAgICAgICBjc3M6IGludmVyc2lvbkZpeGVzWzBdLmNzcyB8fCAnJyxcbiAgICB9O1xuXG4gICAgaWYgKHVybCkge1xuICAgICAgICAvLyBTZWFyY2ggZm9yIG1hdGNoIHdpdGggZ2l2ZW4gVVJMXG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBpbnZlcnNpb25GaXhlc1xuICAgICAgICAgICAgLnNsaWNlKDEpXG4gICAgICAgICAgICAuZmlsdGVyKChzKSA9PiBpc1VSTEluTGlzdCh1cmwsIHMudXJsKSlcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnVybFswXS5sZW5ndGggLSBhLnVybFswXS5sZW5ndGgpO1xuICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmb3VuZCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogZm91bmQudXJsLFxuICAgICAgICAgICAgICAgIGludmVydDogY29tbW9uLmludmVydC5jb25jYXQoZm91bmQuaW52ZXJ0IHx8IFtdKSxcbiAgICAgICAgICAgICAgICBub2ludmVydDogY29tbW9uLm5vaW52ZXJ0LmNvbmNhdChmb3VuZC5ub2ludmVydCB8fCBbXSksXG4gICAgICAgICAgICAgICAgcmVtb3ZlYmc6IGNvbW1vbi5yZW1vdmViZy5jb25jYXQoZm91bmQucmVtb3ZlYmcgfHwgW10pLFxuICAgICAgICAgICAgICAgIGNzczogW2NvbW1vbi5jc3MsIGZvdW5kLmNzc10uZmlsdGVyKChzKSA9PiBzKS5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1vbjtcbn1cblxuY29uc3QgaW52ZXJzaW9uRml4ZXNDb21tYW5kczogeyBba2V5OiBzdHJpbmddOiBrZXlvZiBJbnZlcnNpb25GaXggfSA9IHtcbiAgICAnSU5WRVJUJzogJ2ludmVydCcsXG4gICAgJ05PIElOVkVSVCc6ICdub2ludmVydCcsXG4gICAgJ1JFTU9WRSBCRyc6ICdyZW1vdmViZycsXG4gICAgJ0NTUyc6ICdjc3MnLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSW52ZXJzaW9uRml4ZXModGV4dDogc3RyaW5nKTogSW52ZXJzaW9uRml4W10ge1xuICAgIHJldHVybiBwYXJzZVNpdGVzRml4ZXNDb25maWc8SW52ZXJzaW9uRml4Pih0ZXh0LCB7XG4gICAgICAgIGNvbW1hbmRzOiBPYmplY3Qua2V5cyhpbnZlcnNpb25GaXhlc0NvbW1hbmRzKSxcbiAgICAgICAgZ2V0Q29tbWFuZFByb3BOYW1lOiAoY29tbWFuZCkgPT4gaW52ZXJzaW9uRml4ZXNDb21tYW5kc1tjb21tYW5kXSxcbiAgICAgICAgcGFyc2VDb21tYW5kVmFsdWU6IChjb21tYW5kLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT09ICdDU1MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUFycmF5KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEludmVyc2lvbkZpeGVzKGludmVyc2lvbkZpeGVzOiBJbnZlcnNpb25GaXhbXSk6IHN0cmluZyB7XG4gICAgY29uc3QgZml4ZXMgPSBpbnZlcnNpb25GaXhlcy5zbGljZSgpLnNvcnQoKGEsIGIpID0+IGNvbXBhcmVVUkxQYXR0ZXJucyhhLnVybFswXSwgYi51cmxbMF0pKTtcblxuICAgIHJldHVybiBmb3JtYXRTaXRlc0ZpeGVzQ29uZmlnKGZpeGVzLCB7XG4gICAgICAgIHByb3BzOiBPYmplY3QudmFsdWVzKGludmVyc2lvbkZpeGVzQ29tbWFuZHMpLFxuICAgICAgICBnZXRQcm9wQ29tbWFuZE5hbWU6IChwcm9wKSA9PiBPYmplY3QuZW50cmllcyhpbnZlcnNpb25GaXhlc0NvbW1hbmRzKS5maW5kKChbLCBwXSkgPT4gcCA9PT0gcHJvcCkhWzBdLFxuICAgICAgICBmb3JtYXRQcm9wVmFsdWU6IChwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdjc3MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSBhcyBzdHJpbmcpLnRyaW0oKS5yZXBsYWNlKC9cXG4rL2csICdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRBcnJheSh2YWx1ZSBhcyBzdHJpbmdbXSkudHJpbSgpO1xuICAgICAgICB9LFxuICAgICAgICBzaG91bGRJZ25vcmVQcm9wOiAocHJvcCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnY3NzJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAhdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gIShBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbiIsImltcG9ydCB0eXBlIHtEZXRlY3RvckhpbnR9IGZyb20gJy4uL2RlZmluaXRpb25zJztcbmltcG9ydCB7cGFyc2VBcnJheSwgZm9ybWF0QXJyYXl9IGZyb20gJy4uL3V0aWxzL3RleHQnO1xuaW1wb3J0IHtjb21wYXJlVVJMUGF0dGVybnN9IGZyb20gJy4uL3V0aWxzL3VybCc7XG5cbmltcG9ydCB7Zm9ybWF0U2l0ZXNGaXhlc0NvbmZpZ30gZnJvbSAnLi91dGlscy9mb3JtYXQnO1xuaW1wb3J0IHtwYXJzZVNpdGVzRml4ZXNDb25maWcsIGdldFNpdGVzRml4ZXNGb3J9IGZyb20gJy4vdXRpbHMvcGFyc2UnO1xuaW1wb3J0IHR5cGUge1NpdGVQcm9wc0luZGV4LCBTaXRlc0ZpeGVzUGFyc2VyT3B0aW9uc30gZnJvbSAnLi91dGlscy9wYXJzZSc7XG5cbmNvbnN0IGRldGVjdG9ySGludHNDb21tYW5kczogeyBba2V5OiBzdHJpbmddOiBrZXlvZiBEZXRlY3RvckhpbnQgfSA9IHtcbiAgICAnVEFSR0VUJzogJ3RhcmdldCcsXG4gICAgJ01BVENIJzogJ21hdGNoJyxcbiAgICAnTk8gREFSSyBUSEVNRSc6ICdub0RhcmtUaGVtZScsXG4gICAgJ1NZU1RFTSBUSEVNRSc6ICdzeXN0ZW1UaGVtZScsXG4gICAgJ0lGUkFNRSc6ICdpZnJhbWUnLFxufTtcblxuY29uc3QgZGV0ZWN0b3JQYXJzZXJPcHRpb25zOiBTaXRlc0ZpeGVzUGFyc2VyT3B0aW9uczxEZXRlY3RvckhpbnQ+ID0ge1xuICAgIGNvbW1hbmRzOiBPYmplY3Qua2V5cyhkZXRlY3RvckhpbnRzQ29tbWFuZHMpLFxuICAgIGdldENvbW1hbmRQcm9wTmFtZTogKGNvbW1hbmQpID0+IGRldGVjdG9ySGludHNDb21tYW5kc1tjb21tYW5kXSxcbiAgICBwYXJzZUNvbW1hbmRWYWx1ZTogKGNvbW1hbmQsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmIChjb21tYW5kID09PSAnVEFSR0VUJykge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCA9PT0gJ05PIERBUksgVEhFTUUnIHx8IGNvbW1hbmQgPT09ICdTWVNURU0gVEhFTUUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VBcnJheSh2YWx1ZSk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZURldGVjdG9ySGludHModGV4dDogc3RyaW5nKTogRGV0ZWN0b3JIaW50W10ge1xuICAgIHJldHVybiBwYXJzZVNpdGVzRml4ZXNDb25maWc8RGV0ZWN0b3JIaW50Pih0ZXh0LCBkZXRlY3RvclBhcnNlck9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGV0ZWN0b3JIaW50cyhkZXRlY3RvckhpbnRzOiBEZXRlY3RvckhpbnRbXSk6IHN0cmluZyB7XG4gICAgY29uc3QgZml4ZXMgPSBkZXRlY3RvckhpbnRzLnNsaWNlKCkuc29ydCgoYSwgYikgPT4gY29tcGFyZVVSTFBhdHRlcm5zKGEudXJsWzBdLCBiLnVybFswXSkpO1xuXG4gICAgcmV0dXJuIGZvcm1hdFNpdGVzRml4ZXNDb25maWcoZml4ZXMsIHtcbiAgICAgICAgcHJvcHM6IE9iamVjdC52YWx1ZXMoZGV0ZWN0b3JIaW50c0NvbW1hbmRzKSxcbiAgICAgICAgZ2V0UHJvcENvbW1hbmROYW1lOiAocHJvcCkgPT4gT2JqZWN0LmVudHJpZXMoZGV0ZWN0b3JIaW50c0NvbW1hbmRzKS5maW5kKChbLCBwXSkgPT4gcCA9PT0gcHJvcCkhWzBdLFxuICAgICAgICBmb3JtYXRQcm9wVmFsdWU6IChwcm9wOiBrZXlvZiBEZXRlY3RvckhpbnQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0QXJyYXkodmFsdWUpLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnbm9EYXJrVGhlbWUnIHx8IHByb3AgPT09ICdzeXN0ZW1UaGVtZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKS50cmltKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNob3VsZElnbm9yZVByb3A6IChfcHJvcCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdmFsdWU7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXRlY3RvckhpbnRzRm9yKHVybDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGluZGV4OiBTaXRlUHJvcHNJbmRleDxEZXRlY3RvckhpbnQ+KTogRGV0ZWN0b3JIaW50W10gfCBudWxsIHtcbiAgICBjb25zdCBmaXhlcyA9IGdldFNpdGVzRml4ZXNGb3IodXJsLCB0ZXh0LCBpbmRleCwgZGV0ZWN0b3JQYXJzZXJPcHRpb25zKTtcblxuICAgIGlmIChmaXhlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpeGVzO1xufVxuIiwiY29uc3QgY3NzQ29tbWVudHNSZWdleCA9IC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDU1NDb21tZW50cyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UoY3NzQ29tbWVudHNSZWdleCwgJycpO1xufVxuIiwiaW1wb3J0IHtnZXRPcGVuQ2xvc2VSYW5nZSwgc3BsaXRFeGNsdWRpbmd9IGZyb20gJy4uL3RleHQnO1xuaW1wb3J0IHR5cGUge1RleHRSYW5nZX0gZnJvbSAnLi4vdGV4dCc7XG5cbmltcG9ydCB7cmVtb3ZlQ1NTQ29tbWVudHN9IGZyb20gJy4vY3NzLXRleHQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZERlY2xhcmF0aW9uIHtcbiAgICBwcm9wZXJ0eTogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgaW1wb3J0YW50OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZFN0eWxlUnVsZSB7XG4gICAgc2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgICBkZWNsYXJhdGlvbnM6IFBhcnNlZERlY2xhcmF0aW9uW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQXRSdWxlIHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgcXVlcnk6IHN0cmluZztcbiAgICBydWxlczogQXJyYXk8UGFyc2VkQXRSdWxlIHwgUGFyc2VkU3R5bGVSdWxlPjtcbn1cblxuZXhwb3J0IHR5cGUgUGFyc2VkQ1NTID0gQXJyYXk8UGFyc2VkQXRSdWxlIHwgUGFyc2VkU3R5bGVSdWxlPjtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ1NTKGNzc1RleHQ6IHN0cmluZyk6IFBhcnNlZENTUyB7XG4gICAgY3NzVGV4dCA9IHJlbW92ZUNTU0NvbW1lbnRzKGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSBjc3NUZXh0LnRyaW0oKTtcbiAgICBpZiAoIWNzc1RleHQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHJ1bGVzOiBQYXJzZWRDU1MgPSBbXTtcblxuICAgIC8vIEZpbmQgey4uLn0gcmFuZ2VzIGV4Y2x1ZGluZyBpbnNpZGUgb2YgXCIuLi5cIiwgWy4uLl0gZXRjLlxuICAgIGNvbnN0IGV4Y2x1ZGVSYW5nZXMgPSBnZXRUb2tlbkV4Y2x1c2lvblJhbmdlcyhjc3NUZXh0KTtcbiAgICBjb25zdCBicmFja2V0UmFuZ2VzID0gZ2V0QWxsT3BlbkNsb3NlUmFuZ2VzKGNzc1RleHQsICd7JywgJ30nLCBleGNsdWRlUmFuZ2VzKTtcblxuICAgIGxldCBydWxlU3RhcnQgPSAwO1xuICAgIGJyYWNrZXRSYW5nZXMuZm9yRWFjaCgoYnJhY2tldHMpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gY3NzVGV4dC5zdWJzdHJpbmcocnVsZVN0YXJ0LCBicmFja2V0cy5zdGFydCkudHJpbSgpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gY3NzVGV4dC5zdWJzdHJpbmcoYnJhY2tldHMuc3RhcnQgKyAxLCBicmFja2V0cy5lbmQgLSAxKTtcblxuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ0AnKSkge1xuICAgICAgICAgICAgY29uc3QgdHlwZUVuZEluZGV4ID0ga2V5LnNlYXJjaCgvW1xcc1xcKF0vKTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGU6IFBhcnNlZEF0UnVsZSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlRW5kSW5kZXggPCAwID8ga2V5IDoga2V5LnN1YnN0cmluZygwLCB0eXBlRW5kSW5kZXgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5OiB0eXBlRW5kSW5kZXggPCAwID8gJycgOiBrZXkuc3Vic3RyaW5nKHR5cGVFbmRJbmRleCkudHJpbSgpLFxuICAgICAgICAgICAgICAgIHJ1bGVzOiBwYXJzZUNTUyhjb250ZW50KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcnVsZTogUGFyc2VkU3R5bGVSdWxlID0ge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yczogcGFyc2VTZWxlY3RvcnMoa2V5KSxcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHBhcnNlRGVjbGFyYXRpb25zKGNvbnRlbnQpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBydWxlU3RhcnQgPSBicmFja2V0cy5lbmQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcnVsZXM7XG59XG5cbmZ1bmN0aW9uIGdldEFsbE9wZW5DbG9zZVJhbmdlcyhcbiAgICBpbnB1dDogc3RyaW5nLFxuICAgIG9wZW5Ub2tlbjogc3RyaW5nLFxuICAgIGNsb3NlVG9rZW46IHN0cmluZyxcbiAgICBleGNsdWRlUmFuZ2VzOiBUZXh0UmFuZ2VbXSA9IFtdLFxuKSB7XG4gICAgY29uc3QgcmFuZ2VzOiBUZXh0UmFuZ2VbXSA9IFtdO1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgcmFuZ2U6IFRleHRSYW5nZSB8IG51bGw7XG4gICAgd2hpbGUgKChyYW5nZSA9IGdldE9wZW5DbG9zZVJhbmdlKGlucHV0LCBpLCBvcGVuVG9rZW4sIGNsb3NlVG9rZW4sIGV4Y2x1ZGVSYW5nZXMpKSkge1xuICAgICAgICByYW5nZXMucHVzaChyYW5nZSk7XG4gICAgICAgIGkgPSByYW5nZS5lbmQ7XG4gICAgfVxuICAgIHJldHVybiByYW5nZXM7XG59XG5cbmZ1bmN0aW9uIGdldFRva2VuRXhjbHVzaW9uUmFuZ2VzKGNzc1RleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IHNpbmdsZVF1b3RlR29lc0ZpcnN0ID0gY3NzVGV4dC5pbmRleE9mKFwiJ1wiKSA8IGNzc1RleHQuaW5kZXhPZignXCInKTtcbiAgICBjb25zdCBmaXJzdFF1b3RlID0gc2luZ2xlUXVvdGVHb2VzRmlyc3QgPyBcIidcIiA6ICdcIic7XG4gICAgY29uc3Qgc2Vjb25kUXVvdGUgPSBzaW5nbGVRdW90ZUdvZXNGaXJzdCA/ICdcIicgOiBcIidcIjtcbiAgICBjb25zdCBleGNsdWRlUmFuZ2VzOiBUZXh0UmFuZ2VbXSA9IGdldEFsbE9wZW5DbG9zZVJhbmdlcyhjc3NUZXh0LCBmaXJzdFF1b3RlLCBmaXJzdFF1b3RlKTtcbiAgICBleGNsdWRlUmFuZ2VzLnB1c2goLi4uZ2V0QWxsT3BlbkNsb3NlUmFuZ2VzKGNzc1RleHQsIHNlY29uZFF1b3RlLCBzZWNvbmRRdW90ZSwgZXhjbHVkZVJhbmdlcykpO1xuICAgIGV4Y2x1ZGVSYW5nZXMucHVzaCguLi5nZXRBbGxPcGVuQ2xvc2VSYW5nZXMoY3NzVGV4dCwgJ1snLCAnXScsIGV4Y2x1ZGVSYW5nZXMpKTtcbiAgICBleGNsdWRlUmFuZ2VzLnB1c2goLi4uZ2V0QWxsT3BlbkNsb3NlUmFuZ2VzKGNzc1RleHQsICcoJywgJyknLCBleGNsdWRlUmFuZ2VzKSk7XG4gICAgcmV0dXJuIGV4Y2x1ZGVSYW5nZXM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2VsZWN0b3JzKHNlbGVjdG9yVGV4dDogc3RyaW5nKSB7XG4gICAgY29uc3QgZXhjbHVkZVJhbmdlcyA9IGdldFRva2VuRXhjbHVzaW9uUmFuZ2VzKHNlbGVjdG9yVGV4dCk7XG4gICAgcmV0dXJuIHNwbGl0RXhjbHVkaW5nKHNlbGVjdG9yVGV4dCwgJywnLCBleGNsdWRlUmFuZ2VzKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEZWNsYXJhdGlvbnMoY3NzRGVjbGFyYXRpb25zVGV4dDogc3RyaW5nKSB7XG4gICAgY29uc3QgZGVjbGFyYXRpb25zOiBQYXJzZWREZWNsYXJhdGlvbltdID0gW107XG4gICAgY29uc3QgZXhjbHVkZVJhbmdlcyA9IGdldFRva2VuRXhjbHVzaW9uUmFuZ2VzKGNzc0RlY2xhcmF0aW9uc1RleHQpO1xuICAgIHNwbGl0RXhjbHVkaW5nKGNzc0RlY2xhcmF0aW9uc1RleHQsICc7JywgZXhjbHVkZVJhbmdlcykuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgICBjb25zdCBjb2xvbkluZGV4ID0gcGFydC5pbmRleE9mKCc6Jyk7XG4gICAgICAgIGlmIChjb2xvbkluZGV4ID4gMCkge1xuICAgICAgICAgICAgY29uc3QgaW1wb3J0YW50SW5kZXggPSBwYXJ0LmluZGV4T2YoJyFpbXBvcnRhbnQnKTtcbiAgICAgICAgICAgIGRlY2xhcmF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogcGFydC5zdWJzdHJpbmcoMCwgY29sb25JbmRleCkudHJpbSgpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJ0LnN1YnN0cmluZyhjb2xvbkluZGV4ICsgMSwgaW1wb3J0YW50SW5kZXggPiAwID8gaW1wb3J0YW50SW5kZXggOiBwYXJ0Lmxlbmd0aCkudHJpbSgpLFxuICAgICAgICAgICAgICAgIGltcG9ydGFudDogaW1wb3J0YW50SW5kZXggPiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGVjbGFyYXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQYXJzZWRTdHlsZVJ1bGUocnVsZTogUGFyc2VkQXRSdWxlIHwgUGFyc2VkU3R5bGVSdWxlKTogcnVsZSBpcyBQYXJzZWRTdHlsZVJ1bGUge1xuICAgIHJldHVybiAnc2VsZWN0b3JzJyBpbiBydWxlO1xufVxuIiwiaW1wb3J0IHtpc1BhcnNlZFN0eWxlUnVsZSwgcGFyc2VDU1N9IGZyb20gJy4uL2Nzcy10ZXh0L3BhcnNlLWNzcyc7XG5pbXBvcnQgdHlwZSB7UGFyc2VkQXRSdWxlLCBQYXJzZWRDU1MsIFBhcnNlZERlY2xhcmF0aW9uLCBQYXJzZWRTdHlsZVJ1bGV9IGZyb20gJy4uL2Nzcy10ZXh0L3BhcnNlLWNzcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDU1MoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUNTUyhjc3NUZXh0KTtcbiAgICByZXR1cm4gZm9ybWF0UGFyc2VkQ1NTKHBhcnNlZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRQYXJzZWRDU1MocGFyc2VkOiBQYXJzZWRDU1MpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHRhYiA9ICcgICAgJztcblxuICAgIGZ1bmN0aW9uIGZvcm1hdFJ1bGUocnVsZTogUGFyc2VkQXRSdWxlIHwgUGFyc2VkU3R5bGVSdWxlLCBpbmRlbnQ6IHN0cmluZykge1xuICAgICAgICBpZiAoaXNQYXJzZWRTdHlsZVJ1bGUocnVsZSkpIHtcbiAgICAgICAgICAgIGZvcm1hdFN0eWxlUnVsZShydWxlIGFzIFBhcnNlZFN0eWxlUnVsZSwgaW5kZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdEF0UnVsZShydWxlLCBpbmRlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0QXRSdWxlKHt0eXBlLCBxdWVyeSwgcnVsZXN9OiBQYXJzZWRBdFJ1bGUsIGluZGVudDogc3RyaW5nKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYCR7aW5kZW50fSR7dHlwZX0gJHtxdWVyeX0ge2ApO1xuICAgICAgICBydWxlcy5mb3JFYWNoKChjaGlsZCkgPT4gZm9ybWF0UnVsZShjaGlsZCwgYCR7aW5kZW50fSR7dGFifWApKTtcbiAgICAgICAgbGluZXMucHVzaChgJHtpbmRlbnR9fWApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdFN0eWxlUnVsZSh7c2VsZWN0b3JzLCBkZWNsYXJhdGlvbnN9OiBQYXJzZWRTdHlsZVJ1bGUsIGluZGVudDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGxhc3RTZWxlY3RvckluZGV4ID0gc2VsZWN0b3JzLmxlbmd0aCAtIDE7XG4gICAgICAgIHNlbGVjdG9ycy5mb3JFYWNoKChzZWxlY3RvciwgaSkgPT4ge1xuICAgICAgICAgICAgbGluZXMucHVzaChgJHtpbmRlbnR9JHtzZWxlY3Rvcn0ke2kgPCBsYXN0U2VsZWN0b3JJbmRleCA/ICcsJyA6ICcgeyd9YCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBzb3J0RGVjbGFyYXRpb25zKGRlY2xhcmF0aW9ucyk7XG4gICAgICAgIHNvcnRlZC5mb3JFYWNoKCh7cHJvcGVydHksIHZhbHVlLCBpbXBvcnRhbnR9KSA9PiB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAke2luZGVudH0ke3RhYn0ke3Byb3BlcnR5fTogJHt2YWx1ZX0ke2ltcG9ydGFudCA/ICcgIWltcG9ydGFudCcgOiAnJ307YCk7XG4gICAgICAgIH0pO1xuICAgICAgICBsaW5lcy5wdXNoKGAke2luZGVudH19YCk7XG4gICAgfVxuXG4gICAgY2xlYXJFbXB0eVJ1bGVzKHBhcnNlZCk7XG4gICAgcGFyc2VkLmZvckVhY2goKHJ1bGUpID0+IGZvcm1hdFJ1bGUocnVsZSwgJycpKTtcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIHNvcnREZWNsYXJhdGlvbnMoZGVjbGFyYXRpb25zOiBQYXJzZWREZWNsYXJhdGlvbltdKSB7XG4gICAgY29uc3QgcHJlZml4UmVnZXggPSAvXi1bYS16XS0vO1xuICAgIHJldHVybiBbLi4uZGVjbGFyYXRpb25zXS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGNvbnN0IGFQcm9wID0gYS5wcm9wZXJ0eTtcbiAgICAgICAgY29uc3QgYlByb3AgPSBiLnByb3BlcnR5O1xuICAgICAgICBjb25zdCBhUHJlZml4ID0gYVByb3AubWF0Y2gocHJlZml4UmVnZXgpPy5bMF0gPz8gJyc7XG4gICAgICAgIGNvbnN0IGJQcmVmaXggPSBiUHJvcC5tYXRjaChwcmVmaXhSZWdleCk/LlswXSA/PyAnJztcbiAgICAgICAgY29uc3QgYU5vcm0gPSBhUHJlZml4ID8gYVByb3AucmVwbGFjZShwcmVmaXhSZWdleCwgJycpIDogYVByb3A7XG4gICAgICAgIGNvbnN0IGJOb3JtID0gYlByZWZpeCA/IGJQcm9wLnJlcGxhY2UocHJlZml4UmVnZXgsICcnKSA6IGJQcm9wO1xuICAgICAgICBpZiAoYU5vcm0gPT09IGJOb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gYVByZWZpeC5sb2NhbGVDb21wYXJlKGJQcmVmaXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhTm9ybS5sb2NhbGVDb21wYXJlKGJOb3JtKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY2xlYXJFbXB0eVJ1bGVzKHJ1bGVzOiBBcnJheTxQYXJzZWRBdFJ1bGUgfCBQYXJzZWRTdHlsZVJ1bGU+KSB7XG4gICAgZm9yIChsZXQgaSA9IHJ1bGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHJ1bGUgPSBydWxlc1tpXTtcbiAgICAgICAgaWYgKGlzUGFyc2VkU3R5bGVSdWxlKHJ1bGUpKSB7XG4gICAgICAgICAgICBpZiAocnVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcnVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xlYXJFbXB0eVJ1bGVzKHJ1bGUucnVsZXMpO1xuICAgICAgICAgICAgaWYgKHJ1bGUucnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcnVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHR5cGUge0R5bmFtaWNUaGVtZUZpeH0gZnJvbSAnLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtmb3JtYXRDU1N9IGZyb20gJy4uL3V0aWxzL2Nzcy10ZXh0L2Zvcm1hdC1jc3MnO1xuaW1wb3J0IHtwYXJzZUFycmF5LCBmb3JtYXRBcnJheX0gZnJvbSAnLi4vdXRpbHMvdGV4dCc7XG5pbXBvcnQge2NvbXBhcmVVUkxQYXR0ZXJuc30gZnJvbSAnLi4vdXRpbHMvdXJsJztcblxuaW1wb3J0IHtmb3JtYXRTaXRlc0ZpeGVzQ29uZmlnfSBmcm9tICcuL3V0aWxzL2Zvcm1hdCc7XG5pbXBvcnQge3BhcnNlU2l0ZXNGaXhlc0NvbmZpZywgZ2V0U2l0ZXNGaXhlc0ZvciwgZ2V0RG9tYWlufSBmcm9tICcuL3V0aWxzL3BhcnNlJztcbmltcG9ydCB0eXBlIHtTaXRlUHJvcHNJbmRleH0gZnJvbSAnLi91dGlscy9wYXJzZSc7XG5cbmRlY2xhcmUgY29uc3QgX19DSFJPTUlVTV9NVjJfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19DSFJPTUlVTV9NVjNfXzogYm9vbGVhbjtcblxuY29uc3QgZHluYW1pY1RoZW1lRml4ZXNDb21tYW5kczogeyBba2V5OiBzdHJpbmddOiBrZXlvZiBEeW5hbWljVGhlbWVGaXggfSA9IHtcbiAgICAnSU5WRVJUJzogJ2ludmVydCcsXG4gICAgJ0NTUyc6ICdjc3MnLFxuICAgICdJR05PUkUgSU5MSU5FIFNUWUxFJzogJ2lnbm9yZUlubGluZVN0eWxlJyxcbiAgICAnSUdOT1JFIElNQUdFIEFOQUxZU0lTJzogJ2lnbm9yZUltYWdlQW5hbHlzaXMnLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRHluYW1pY1RoZW1lRml4ZXModGV4dDogc3RyaW5nKTogRHluYW1pY1RoZW1lRml4W10ge1xuICAgIHJldHVybiBwYXJzZVNpdGVzRml4ZXNDb25maWc8RHluYW1pY1RoZW1lRml4Pih0ZXh0LCB7XG4gICAgICAgIGNvbW1hbmRzOiBPYmplY3Qua2V5cyhkeW5hbWljVGhlbWVGaXhlc0NvbW1hbmRzKSxcbiAgICAgICAgZ2V0Q29tbWFuZFByb3BOYW1lOiAoY29tbWFuZCkgPT4gZHluYW1pY1RoZW1lRml4ZXNDb21tYW5kc1tjb21tYW5kXSxcbiAgICAgICAgcGFyc2VDb21tYW5kVmFsdWU6IChjb21tYW5kLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT09ICdDU1MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUFycmF5KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdER5bmFtaWNUaGVtZUZpeGVzKGR5bmFtaWNUaGVtZUZpeGVzOiBEeW5hbWljVGhlbWVGaXhbXSk6IHN0cmluZyB7XG4gICAgY29uc3QgZml4ZXMgPSBkeW5hbWljVGhlbWVGaXhlcy5zbGljZSgpLnNvcnQoKGEsIGIpID0+IGNvbXBhcmVVUkxQYXR0ZXJucyhhLnVybFswXSwgYi51cmxbMF0pKTtcblxuICAgIHJldHVybiBmb3JtYXRTaXRlc0ZpeGVzQ29uZmlnKGZpeGVzLCB7XG4gICAgICAgIHByb3BzOiBPYmplY3QudmFsdWVzKGR5bmFtaWNUaGVtZUZpeGVzQ29tbWFuZHMpLFxuICAgICAgICBnZXRQcm9wQ29tbWFuZE5hbWU6IChwcm9wKSA9PiBPYmplY3QuZW50cmllcyhkeW5hbWljVGhlbWVGaXhlc0NvbW1hbmRzKS5maW5kKChbLCBwXSkgPT4gcCA9PT0gcHJvcCkhWzBdLFxuICAgICAgICBmb3JtYXRQcm9wVmFsdWU6IChwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdjc3MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdENTUyh2YWx1ZSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEFycmF5KHZhbHVlIGFzIHN0cmluZ1tdKS50cmltKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNob3VsZElnbm9yZVByb3A6IChwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdjc3MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICF2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAhKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHluYW1pY1RoZW1lRml4ZXNGb3IodXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIHRleHQ6IHN0cmluZywgaW5kZXg6IFNpdGVQcm9wc0luZGV4PER5bmFtaWNUaGVtZUZpeD4sIGVuYWJsZWRGb3JQREY6IGJvb2xlYW4pOiBEeW5hbWljVGhlbWVGaXhbXSB8IG51bGwge1xuICAgIGNvbnN0IGZpeGVzID0gZ2V0U2l0ZXNGaXhlc0Zvcih1cmwsIHRleHQsIGluZGV4LCB7XG4gICAgICAgIGNvbW1hbmRzOiBPYmplY3Qua2V5cyhkeW5hbWljVGhlbWVGaXhlc0NvbW1hbmRzKSxcbiAgICAgICAgZ2V0Q29tbWFuZFByb3BOYW1lOiAoY29tbWFuZCkgPT4gZHluYW1pY1RoZW1lRml4ZXNDb21tYW5kc1tjb21tYW5kXSxcbiAgICAgICAgcGFyc2VDb21tYW5kVmFsdWU6IChjb21tYW5kLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT09ICdDU1MnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUFycmF5KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIGlmIChmaXhlcy5sZW5ndGggPT09IDAgfHwgZml4ZXNbMF0udXJsWzBdICE9PSAnKicpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGVuYWJsZWRGb3JQREYpIHtcbiAgICAgICAgLy8gQ29weSBwYXJ0IG9mIGZpeGVzIHdoaWNoIHdpbGwgYmUgbXV0YXRlZFxuICAgICAgICBjb25zdCBjb21tb25GaXggPSB7Li4uZml4ZXNbMF19O1xuICAgICAgICBjb25zdCBwZGZGaXhlczogRHluYW1pY1RoZW1lRml4W10gPSBbXG4gICAgICAgICAgICBjb21tb25GaXgsXG4gICAgICAgICAgICAuLi5maXhlcy5zbGljZSgxKSxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBpbnZlcnNpb25GaXggPSBfX0NIUk9NSVVNX01WMl9fIHx8IF9fQ0hST01JVU1fTVYzX18gP1xuICAgICAgICAgICAgJ1xcbmVtYmVkW3R5cGU9XCJhcHBsaWNhdGlvbi9wZGZcIl1bc3JjPVwiYWJvdXQ6YmxhbmtcIl0geyBmaWx0ZXI6IGludmVydCgxMDAlKSBjb250cmFzdCg5MCUpOyB9JyA6XG4gICAgICAgICAgICAnXFxuZW1iZWRbdHlwZT1cImFwcGxpY2F0aW9uL3BkZlwiXSB7IGZpbHRlcjogaW52ZXJ0KDEwMCUpIGNvbnRyYXN0KDkwJSk7IH0nO1xuICAgICAgICBpZiAoIWNvbW1vbkZpeC5jc3MuZW5kc1dpdGgoaW52ZXJzaW9uRml4KSkge1xuICAgICAgICAgICAgY29tbW9uRml4LmNzcyArPSBpbnZlcnNpb25GaXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoWydkcml2ZS5nb29nbGUuY29tJywgJ21haWwuZ29vZ2xlLmNvbSddLmluY2x1ZGVzKGdldERvbWFpbih1cmwpKSkge1xuICAgICAgICAgICAgY29uc3QgbmVzdGVkSW52ZXJzaW9uRml4ID0gJ2Rpdltyb2xlPVwiZGlhbG9nXCJdIGRpdltyb2xlPVwiZG9jdW1lbnRcIl0nO1xuICAgICAgICAgICAgaWYgKGNvbW1vbkZpeC5pbnZlcnQuYXQoLTEpICE9PSBuZXN0ZWRJbnZlcnNpb25GaXgpIHtcbiAgICAgICAgICAgICAgICBjb21tb25GaXguaW52ZXJ0LnB1c2gobmVzdGVkSW52ZXJzaW9uRml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwZGZGaXhlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZml4ZXM7XG59XG4iLCJpbXBvcnQgdHlwZSB7VGhlbWUsIFN0YXRpY1RoZW1lfSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge3BhcnNlQXJyYXksIGZvcm1hdEFycmF5fSBmcm9tICcuLi91dGlscy90ZXh0JztcbmltcG9ydCB7Y29tcGFyZVVSTFBhdHRlcm5zLCBpc1VSTEluTGlzdH0gZnJvbSAnLi4vdXRpbHMvdXJsJztcblxuaW1wb3J0IHtjcmVhdGVUZXh0U3R5bGV9IGZyb20gJy4vdGV4dC1zdHlsZSc7XG5pbXBvcnQge2Zvcm1hdFNpdGVzRml4ZXNDb25maWd9IGZyb20gJy4vdXRpbHMvZm9ybWF0JztcbmltcG9ydCB7YXBwbHlDb2xvck1hdHJpeCwgY3JlYXRlRmlsdGVyTWF0cml4fSBmcm9tICcuL3V0aWxzL21hdHJpeCc7XG5pbXBvcnQge3BhcnNlU2l0ZXNGaXhlc0NvbmZpZywgZ2V0U2l0ZXNGaXhlc0Zvcn0gZnJvbSAnLi91dGlscy9wYXJzZSc7XG5pbXBvcnQgdHlwZSB7U2l0ZVByb3BzSW5kZXh9IGZyb20gJy4vdXRpbHMvcGFyc2UnO1xuXG5pbnRlcmZhY2UgVGhlbWVDb2xvcnMge1xuICAgIFtwcm9wOiBzdHJpbmddOiBudW1iZXJbXTtcbiAgICBuZXV0cmFsQmc6IG51bWJlcltdO1xuICAgIG5ldXRyYWxUZXh0OiBudW1iZXJbXTtcbiAgICByZWRCZzogbnVtYmVyW107XG4gICAgcmVkVGV4dDogbnVtYmVyW107XG4gICAgZ3JlZW5CZzogbnVtYmVyW107XG4gICAgZ3JlZW5UZXh0OiBudW1iZXJbXTtcbiAgICBibHVlQmc6IG51bWJlcltdO1xuICAgIGJsdWVUZXh0OiBudW1iZXJbXTtcbiAgICBmYWRlQmc6IG51bWJlcltdO1xuICAgIGZhZGVUZXh0OiBudW1iZXJbXTtcbn1cblxuY29uc3QgZGFya1RoZW1lOiBUaGVtZUNvbG9ycyA9IHtcbiAgICBuZXV0cmFsQmc6IFsxNiwgMjAsIDIzXSxcbiAgICBuZXV0cmFsVGV4dDogWzE2NywgMTU4LCAxMzldLFxuICAgIHJlZEJnOiBbNjQsIDEyLCAzMl0sXG4gICAgcmVkVGV4dDogWzI0NywgMTQyLCAxMDJdLFxuICAgIGdyZWVuQmc6IFszMiwgNjQsIDQ4XSxcbiAgICBncmVlblRleHQ6IFsxMjgsIDIwNCwgMTQ4XSxcbiAgICBibHVlQmc6IFszMiwgNDgsIDY0XSxcbiAgICBibHVlVGV4dDogWzEyOCwgMTgyLCAyMDRdLFxuICAgIGZhZGVCZzogWzE2LCAyMCwgMjMsIDAuNV0sXG4gICAgZmFkZVRleHQ6IFsxNjcsIDE1OCwgMTM5LCAwLjVdLFxufTtcblxuY29uc3QgbGlnaHRUaGVtZTogVGhlbWVDb2xvcnMgPSB7XG4gICAgbmV1dHJhbEJnOiBbMjU1LCAyNDIsIDIyOF0sXG4gICAgbmV1dHJhbFRleHQ6IFswLCAwLCAwXSxcbiAgICByZWRCZzogWzI1NSwgODUsIDE3MF0sXG4gICAgcmVkVGV4dDogWzE0MCwgMTQsIDQ4XSxcbiAgICBncmVlbkJnOiBbMTkyLCAyNTUsIDE3MF0sXG4gICAgZ3JlZW5UZXh0OiBbMCwgMTI4LCAwXSxcbiAgICBibHVlQmc6IFsxNzMsIDIxNSwgMjI5XSxcbiAgICBibHVlVGV4dDogWzI4LCAxNiwgMTcxXSxcbiAgICBmYWRlQmc6IFswLCAwLCAwLCAwLjVdLFxuICAgIGZhZGVUZXh0OiBbMCwgMCwgMCwgMC41XSxcbn07XG5cbmZ1bmN0aW9uIHJnYihbciwgZywgYiwgYV06IG51bWJlcltdKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke2F9KWA7XG4gICAgfVxuICAgIHJldHVybiBgcmdiKCR7cn0sICR7Z30sICR7Yn0pYDtcbn1cblxuZnVuY3Rpb24gbWl4KGNvbG9yMTogbnVtYmVyW10sIGNvbG9yMjogbnVtYmVyW10sIHQ6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICByZXR1cm4gY29sb3IxLm1hcCgoYywgaSkgPT4gTWF0aC5yb3VuZChjICogKDEgLSB0KSArIGNvbG9yMltpXSAqIHQpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU3RhdGljU3R5bGVzaGVldChjb25maWc6IFRoZW1lLCB1cmw6IHN0cmluZywgaXNUb3BGcmFtZTogYm9vbGVhbiwgc3RhdGljVGhlbWVzOiBzdHJpbmcsIHN0YXRpY1RoZW1lc0luZGV4OiBTaXRlUHJvcHNJbmRleDxTdGF0aWNUaGVtZT4pOiBzdHJpbmcge1xuICAgIGNvbnN0IHNyY1RoZW1lID0gY29uZmlnLm1vZGUgPT09IDEgPyBkYXJrVGhlbWUgOiBsaWdodFRoZW1lO1xuICAgIGNvbnN0IHRoZW1lID0gT2JqZWN0LmVudHJpZXMoc3JjVGhlbWUpLnJlZHVjZSgodCwgW3Byb3AsIGNvbG9yXSkgPT4ge1xuICAgICAgICBjb25zdCBbciwgZywgYiwgYV0gPSBjb2xvcjtcbiAgICAgICAgdFtwcm9wXSA9IGFwcGx5Q29sb3JNYXRyaXgoW3IsIGcsIGJdLCBjcmVhdGVGaWx0ZXJNYXRyaXgoey4uLmNvbmZpZywgbW9kZTogMH0pKTtcbiAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdFtwcm9wXS5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0sIHt9IGFzIFRoZW1lQ29sb3JzKTtcblxuICAgIGNvbnN0IGNvbW1vblRoZW1lID0gZ2V0Q29tbW9uVGhlbWUoc3RhdGljVGhlbWVzLCBzdGF0aWNUaGVtZXNJbmRleCk7XG4gICAgY29uc3Qgc2l0ZVRoZW1lID0gZ2V0VGhlbWVGb3IodXJsLCBzdGF0aWNUaGVtZXMsIHN0YXRpY1RoZW1lc0luZGV4KTtcblxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKCFzaXRlVGhlbWUgfHwgIXNpdGVUaGVtZS5ub0NvbW1vbikge1xuICAgICAgICBsaW5lcy5wdXNoKCcvKiBDb21tb24gdGhlbWUgKi8nKTtcbiAgICAgICAgbGluZXMucHVzaCguLi5ydWxlR2VuZXJhdG9ycy5tYXAoKGdlbikgPT4gZ2VuKGNvbW1vblRoZW1lLCB0aGVtZSkhKSk7XG4gICAgfVxuXG4gICAgaWYgKHNpdGVUaGVtZSkge1xuICAgICAgICBsaW5lcy5wdXNoKGAvKiBUaGVtZSBmb3IgJHtzaXRlVGhlbWUudXJsLmpvaW4oJyAnKX0gKi9gKTtcbiAgICAgICAgbGluZXMucHVzaCguLi5ydWxlR2VuZXJhdG9ycy5tYXAoKGdlbikgPT4gZ2VuKHNpdGVUaGVtZSwgdGhlbWUpISkpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcudXNlRm9udCB8fCBjb25maWcudGV4dFN0cm9rZSA+IDApIHtcbiAgICAgICAgbGluZXMucHVzaCgnLyogRm9udCAqLycpO1xuICAgICAgICBsaW5lcy5wdXNoKGNyZWF0ZVRleHRTdHlsZShjb25maWcpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXNcbiAgICAgICAgLmZpbHRlcigobG4pID0+IGxuKVxuICAgICAgICAuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJ1bGVHZW4oZ2V0U2VsZWN0b3JzOiAoc2l0ZVRoZW1lOiBTdGF0aWNUaGVtZSkgPT4gc3RyaW5nW10gfCB1bmRlZmluZWQsIGdlbmVyYXRlRGVjbGFyYXRpb25zOiAodGhlbWU6IFRoZW1lQ29sb3JzKSA9PiBzdHJpbmdbXSwgbW9kaWZ5U2VsZWN0b3I6ICgoczogc3RyaW5nKSA9PiBzdHJpbmcpID0gKHMpID0+IHMpIHtcbiAgICByZXR1cm4gKHNpdGVUaGVtZTogU3RhdGljVGhlbWUsIHRoZW1lQ29sb3JzOiBUaGVtZUNvbG9ycykgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBnZXRTZWxlY3RvcnMoc2l0ZVRoZW1lKTtcbiAgICAgICAgaWYgKHNlbGVjdG9ycyA9PSBudWxsIHx8IHNlbGVjdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBzZWxlY3RvcnMuZm9yRWFjaCgocywgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IGxuID0gbW9kaWZ5U2VsZWN0b3Iocyk7XG4gICAgICAgICAgICBpZiAoaSA8IHNlbGVjdG9ycy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgbG4gKz0gJywnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsbiArPSAnIHsnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluZXMucHVzaChsbik7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbnMgPSBnZW5lcmF0ZURlY2xhcmF0aW9ucyh0aGVtZUNvbG9ycyk7XG4gICAgICAgIGRlY2xhcmF0aW9ucy5mb3JFYWNoKChkKSA9PiBsaW5lcy5wdXNoKGAgICAgJHtkfSAhaW1wb3J0YW50O2ApKTtcbiAgICAgICAgbGluZXMucHVzaCgnfScpO1xuICAgICAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gICAgfTtcbn1cblxuY29uc3QgbXggPSB7XG4gICAgYmc6IHtcbiAgICAgICAgaG92ZXI6IDAuMDc1LFxuICAgICAgICBhY3RpdmU6IDAuMSxcbiAgICB9LFxuICAgIGZnOiB7XG4gICAgICAgIGhvdmVyOiAwLjI1LFxuICAgICAgICBhY3RpdmU6IDAuNSxcbiAgICB9LFxuICAgIGJvcmRlcjogMC41LFxufTtcblxuY29uc3QgcnVsZUdlbmVyYXRvcnMgPSBbXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5uZXV0cmFsQmcsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKHQubmV1dHJhbEJnKX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5uZXV0cmFsQmdBY3RpdmUsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKHQubmV1dHJhbEJnKX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5uZXV0cmFsQmdBY3RpdmUsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKG1peCh0Lm5ldXRyYWxCZywgWzI1NSwgMjU1LCAyNTVdLCBteC5iZy5ob3ZlcikpfWBdLCAocykgPT4gYCR7c306aG92ZXJgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0Lm5ldXRyYWxCZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IobWl4KHQubmV1dHJhbEJnLCBbMjU1LCAyNTUsIDI1NV0sIG14LmJnLmFjdGl2ZSkpfWBdLCAocykgPT4gYCR7c306YWN0aXZlLCAke3N9OmZvY3VzYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5uZXV0cmFsVGV4dCwgKHQpID0+IFtgY29sb3I6ICR7cmdiKHQubmV1dHJhbFRleHQpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0Lm5ldXRyYWxUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IodC5uZXV0cmFsVGV4dCl9YF0pLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQubmV1dHJhbFRleHRBY3RpdmUsICh0KSA9PiBbYGNvbG9yOiAke3JnYihtaXgodC5uZXV0cmFsVGV4dCwgWzI1NSwgMjU1LCAyNTVdLCBteC5mZy5ob3ZlcikpfWBdLCAocykgPT4gYCR7c306aG92ZXJgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0Lm5ldXRyYWxUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IobWl4KHQubmV1dHJhbFRleHQsIFsyNTUsIDI1NSwgMjU1XSwgbXguZmcuYWN0aXZlKSl9YF0sIChzKSA9PiBgJHtzfTphY3RpdmUsICR7c306Zm9jdXNgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0Lm5ldXRyYWxCb3JkZXIsICh0KSA9PiBbYGJvcmRlci1jb2xvcjogJHtyZ2IobWl4KHQubmV1dHJhbEJnLCB0Lm5ldXRyYWxUZXh0LCBteC5ib3JkZXIpKX1gXSksXG5cbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LnJlZEJnLCAodCkgPT4gW2BiYWNrZ3JvdW5kLWNvbG9yOiAke3JnYih0LnJlZEJnKX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5yZWRCZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IodC5yZWRCZyl9YF0pLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQucmVkQmdBY3RpdmUsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKG1peCh0LnJlZEJnLCBbMjU1LCAwLCA2NF0sIG14LmJnLmhvdmVyKSl9YF0sIChzKSA9PiBgJHtzfTpob3ZlcmApLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQucmVkQmdBY3RpdmUsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKG1peCh0LnJlZEJnLCBbMjU1LCAwLCA2NF0sIG14LmJnLmFjdGl2ZSkpfWBdLCAocykgPT4gYCR7c306YWN0aXZlLCAke3N9OmZvY3VzYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5yZWRUZXh0LCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IodC5yZWRUZXh0KX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5yZWRUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IodC5yZWRUZXh0KX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5yZWRUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IobWl4KHQucmVkVGV4dCwgWzI1NSwgMjU1LCAwXSwgbXguZmcuaG92ZXIpKX1gXSwgKHMpID0+IGAke3N9OmhvdmVyYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5yZWRUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IobWl4KHQucmVkVGV4dCwgWzI1NSwgMjU1LCAwXSwgbXguZmcuYWN0aXZlKSl9YF0sIChzKSA9PiBgJHtzfTphY3RpdmUsICR7c306Zm9jdXNgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LnJlZEJvcmRlciwgKHQpID0+IFtgYm9yZGVyLWNvbG9yOiAke3JnYihtaXgodC5yZWRCZywgdC5yZWRUZXh0LCBteC5ib3JkZXIpKX1gXSksXG5cbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmdyZWVuQmcsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKHQuZ3JlZW5CZyl9YF0pLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQuZ3JlZW5CZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IodC5ncmVlbkJnKX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ncmVlbkJnQWN0aXZlLCAodCkgPT4gW2BiYWNrZ3JvdW5kLWNvbG9yOiAke3JnYihtaXgodC5ncmVlbkJnLCBbMTI4LCAyNTUsIDE4Ml0sIG14LmJnLmhvdmVyKSl9YF0sIChzKSA9PiBgJHtzfTpob3ZlcmApLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQuZ3JlZW5CZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IobWl4KHQuZ3JlZW5CZywgWzEyOCwgMjU1LCAxODJdLCBteC5iZy5hY3RpdmUpKX1gXSwgKHMpID0+IGAke3N9OmFjdGl2ZSwgJHtzfTpmb2N1c2ApLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQuZ3JlZW5UZXh0LCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IodC5ncmVlblRleHQpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmdyZWVuVGV4dEFjdGl2ZSwgKHQpID0+IFtgY29sb3I6ICR7cmdiKHQuZ3JlZW5UZXh0KX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ncmVlblRleHRBY3RpdmUsICh0KSA9PiBbYGNvbG9yOiAke3JnYihtaXgodC5ncmVlblRleHQsIFsxODIsIDI1NSwgMjI0XSwgbXguZmcuaG92ZXIpKX1gXSwgKHMpID0+IGAke3N9OmhvdmVyYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ncmVlblRleHRBY3RpdmUsICh0KSA9PiBbYGNvbG9yOiAke3JnYihtaXgodC5ncmVlblRleHQsIFsxODIsIDI1NSwgMjI0XSwgbXguZmcuYWN0aXZlKSl9YF0sIChzKSA9PiBgJHtzfTphY3RpdmUsICR7c306Zm9jdXNgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmdyZWVuQm9yZGVyLCAodCkgPT4gW2Bib3JkZXItY29sb3I6ICR7cmdiKG1peCh0LmdyZWVuQmcsIHQuZ3JlZW5UZXh0LCBteC5ib3JkZXIpKX1gXSksXG5cbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmJsdWVCZywgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IodC5ibHVlQmcpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmJsdWVCZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IodC5ibHVlQmcpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmJsdWVCZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IobWl4KHQuYmx1ZUJnLCBbMCwgMTI4LCAyNTVdLCBteC5iZy5ob3ZlcikpfWBdLCAocykgPT4gYCR7c306aG92ZXJgKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmJsdWVCZ0FjdGl2ZSwgKHQpID0+IFtgYmFja2dyb3VuZC1jb2xvcjogJHtyZ2IobWl4KHQuYmx1ZUJnLCBbMCwgMTI4LCAyNTVdLCBteC5iZy5hY3RpdmUpKX1gXSwgKHMpID0+IGAke3N9OmFjdGl2ZSwgJHtzfTpmb2N1c2ApLFxuICAgIGNyZWF0ZVJ1bGVHZW4oKHQpID0+IHQuYmx1ZVRleHQsICh0KSA9PiBbYGNvbG9yOiAke3JnYih0LmJsdWVUZXh0KX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ibHVlVGV4dEFjdGl2ZSwgKHQpID0+IFtgY29sb3I6ICR7cmdiKHQuYmx1ZVRleHQpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LmJsdWVUZXh0QWN0aXZlLCAodCkgPT4gW2Bjb2xvcjogJHtyZ2IobWl4KHQuYmx1ZVRleHQsIFsxODIsIDIyNCwgMjU1XSwgbXguZmcuaG92ZXIpKX1gXSwgKHMpID0+IGAke3N9OmhvdmVyYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ibHVlVGV4dEFjdGl2ZSwgKHQpID0+IFtgY29sb3I6ICR7cmdiKG1peCh0LmJsdWVUZXh0LCBbMTgyLCAyMjQsIDI1NV0sIG14LmZnLmFjdGl2ZSkpfWBdLCAocykgPT4gYCR7c306YWN0aXZlLCAke3N9OmZvY3VzYCksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ibHVlQm9yZGVyLCAodCkgPT4gW2Bib3JkZXItY29sb3I6ICR7cmdiKG1peCh0LmJsdWVCZywgdC5ibHVlVGV4dCwgbXguYm9yZGVyKSl9YF0pLFxuXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5mYWRlQmcsICh0KSA9PiBbYGJhY2tncm91bmQtY29sb3I6ICR7cmdiKHQuZmFkZUJnKX1gXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5mYWRlVGV4dCwgKHQpID0+IFtgY29sb3I6ICR7cmdiKHQuZmFkZVRleHQpfWBdKSxcbiAgICBjcmVhdGVSdWxlR2VuKCh0KSA9PiB0LnRyYW5zcGFyZW50QmcsICgpID0+IFsnYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQnXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5ub0ltYWdlLCAoKSA9PiBbJ2JhY2tncm91bmQtaW1hZ2U6IG5vbmUnXSksXG4gICAgY3JlYXRlUnVsZUdlbigodCkgPT4gdC5pbnZlcnQsICgpID0+IFsnZmlsdGVyOiBpbnZlcnQoMTAwJSkgaHVlLXJvdGF0ZSgxODBkZWcpJ10pLFxuXTtcblxuY29uc3Qgc3RhdGljVGhlbWVDb21tYW5kczogeyBba2V5OiBzdHJpbmddOiBrZXlvZiBTdGF0aWNUaGVtZSB9ID0ge1xuICAgICdOTyBDT01NT04nOiAnbm9Db21tb24nLFxuXG4gICAgJ05FVVRSQUwgQkcnOiAnbmV1dHJhbEJnJyxcbiAgICAnTkVVVFJBTCBCRyBBQ1RJVkUnOiAnbmV1dHJhbEJnQWN0aXZlJyxcbiAgICAnTkVVVFJBTCBURVhUJzogJ25ldXRyYWxUZXh0JyxcbiAgICAnTkVVVFJBTCBURVhUIEFDVElWRSc6ICduZXV0cmFsVGV4dEFjdGl2ZScsXG4gICAgJ05FVVRSQUwgQk9SREVSJzogJ25ldXRyYWxCb3JkZXInLFxuXG4gICAgJ1JFRCBCRyc6ICdyZWRCZycsXG4gICAgJ1JFRCBCRyBBQ1RJVkUnOiAncmVkQmdBY3RpdmUnLFxuICAgICdSRUQgVEVYVCc6ICdyZWRUZXh0JyxcbiAgICAnUkVEIFRFWFQgQUNUSVZFJzogJ3JlZFRleHRBY3RpdmUnLFxuICAgICdSRUQgQk9SREVSJzogJ3JlZEJvcmRlcicsXG5cbiAgICAnR1JFRU4gQkcnOiAnZ3JlZW5CZycsXG4gICAgJ0dSRUVOIEJHIEFDVElWRSc6ICdncmVlbkJnQWN0aXZlJyxcbiAgICAnR1JFRU4gVEVYVCc6ICdncmVlblRleHQnLFxuICAgICdHUkVFTiBURVhUIEFDVElWRSc6ICdncmVlblRleHRBY3RpdmUnLFxuICAgICdHUkVFTiBCT1JERVInOiAnZ3JlZW5Cb3JkZXInLFxuXG4gICAgJ0JMVUUgQkcnOiAnYmx1ZUJnJyxcbiAgICAnQkxVRSBCRyBBQ1RJVkUnOiAnYmx1ZUJnQWN0aXZlJyxcbiAgICAnQkxVRSBURVhUJzogJ2JsdWVUZXh0JyxcbiAgICAnQkxVRSBURVhUIEFDVElWRSc6ICdibHVlVGV4dEFjdGl2ZScsXG4gICAgJ0JMVUUgQk9SREVSJzogJ2JsdWVCb3JkZXInLFxuXG4gICAgJ0ZBREUgQkcnOiAnZmFkZUJnJyxcbiAgICAnRkFERSBURVhUJzogJ2ZhZGVUZXh0JyxcbiAgICAnVFJBTlNQQVJFTlQgQkcnOiAndHJhbnNwYXJlbnRCZycsXG5cbiAgICAnTk8gSU1BR0UnOiAnbm9JbWFnZScsXG4gICAgJ0lOVkVSVCc6ICdpbnZlcnQnLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3RhdGljVGhlbWVzKCR0aGVtZXM6IHN0cmluZyk6IFN0YXRpY1RoZW1lW10ge1xuICAgIHJldHVybiBwYXJzZVNpdGVzRml4ZXNDb25maWc8U3RhdGljVGhlbWU+KCR0aGVtZXMsIHtcbiAgICAgICAgY29tbWFuZHM6IE9iamVjdC5rZXlzKHN0YXRpY1RoZW1lQ29tbWFuZHMpLFxuICAgICAgICBnZXRDb21tYW5kUHJvcE5hbWU6IChjb21tYW5kKSA9PiBzdGF0aWNUaGVtZUNvbW1hbmRzW2NvbW1hbmRdLFxuICAgICAgICBwYXJzZUNvbW1hbmRWYWx1ZTogKGNvbW1hbmQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tbWFuZCA9PT0gJ05PIENPTU1PTicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUFycmF5KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9VcHBlckNhc2UodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEgJDInKS50b1VwcGVyQ2FzZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0U3RhdGljVGhlbWVzKHN0YXRpY1RoZW1lczogU3RhdGljVGhlbWVbXSk6IHN0cmluZyB7XG4gICAgY29uc3QgdGhlbWVzID0gc3RhdGljVGhlbWVzLnNsaWNlKCkuc29ydCgoYSwgYikgPT4gY29tcGFyZVVSTFBhdHRlcm5zKGEudXJsWzBdLCBiLnVybFswXSkpO1xuXG4gICAgcmV0dXJuIGZvcm1hdFNpdGVzRml4ZXNDb25maWcodGhlbWVzLCB7XG4gICAgICAgIHByb3BzOiBPYmplY3QudmFsdWVzKHN0YXRpY1RoZW1lQ29tbWFuZHMpLFxuICAgICAgICBnZXRQcm9wQ29tbWFuZE5hbWU6IGNhbWVsQ2FzZVRvVXBwZXJDYXNlLFxuICAgICAgICBmb3JtYXRQcm9wVmFsdWU6IChwcm9wLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdub0NvbW1vbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0QXJyYXkodmFsdWUgYXMgc3RyaW5nW10pLnRyaW0oKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdWxkSWdub3JlUHJvcDogKHByb3AsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ25vQ29tbW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAhdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gIShBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tbW9uVGhlbWUoc3RhdGljVGhlbWVzOiBzdHJpbmcsIHN0YXRpY1RoZW1lc0luZGV4OiBTaXRlUHJvcHNJbmRleDxTdGF0aWNUaGVtZT4pOiBTdGF0aWNUaGVtZSB7XG4gICAgY29uc3QgbGVuZ3RoID0gcGFyc2VJbnQoc3RhdGljVGhlbWVzSW5kZXgub2Zmc2V0cy5zdWJzdHJpbmcoNCwgNCArIDMpLCAzNik7XG4gICAgY29uc3Qgc3RhdGljVGhlbWVUZXh0ID0gc3RhdGljVGhlbWVzLnN1YnN0cmluZygwLCBsZW5ndGgpO1xuICAgIHJldHVybiBwYXJzZVN0YXRpY1RoZW1lcyhzdGF0aWNUaGVtZVRleHQpWzBdO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVtZUZvcih1cmw6IHN0cmluZywgc3RhdGljVGhlbWVzOiBzdHJpbmcsIHN0YXRpY1RoZW1lc0luZGV4OiBTaXRlUHJvcHNJbmRleDxTdGF0aWNUaGVtZT4pOiBSZWFkb25seTxTdGF0aWNUaGVtZT4gfCBudWxsIHtcbiAgICBjb25zdCB0aGVtZXMgPSBnZXRTaXRlc0ZpeGVzRm9yPFN0YXRpY1RoZW1lPih1cmwsIHN0YXRpY1RoZW1lcywgc3RhdGljVGhlbWVzSW5kZXgsIHtcbiAgICAgICAgY29tbWFuZHM6IE9iamVjdC5rZXlzKHN0YXRpY1RoZW1lQ29tbWFuZHMpLFxuICAgICAgICBnZXRDb21tYW5kUHJvcE5hbWU6IChjb21tYW5kKSA9PiBzdGF0aWNUaGVtZUNvbW1hbmRzW2NvbW1hbmRdLFxuICAgICAgICBwYXJzZUNvbW1hbmRWYWx1ZTogKGNvbW1hbmQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tbWFuZCA9PT0gJ05PIENPTU1PTicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUFycmF5KHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBzb3J0ZWRCeVNwZWNpZmljaXR5ID0gdGhlbWVzXG4gICAgICAgIC5zbGljZSgxKVxuICAgICAgICAubWFwKCh0aGVtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzcGVjaWZpY2l0eTogaXNVUkxJbkxpc3QodXJsLCB0aGVtZS51cmwpID8gdGhlbWUudXJsWzBdLmxlbmd0aCA6IDAsXG4gICAgICAgICAgICAgICAgdGhlbWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKCh7c3BlY2lmaWNpdHl9KSA9PiBzcGVjaWZpY2l0eSA+IDApXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnNwZWNpZmljaXR5IC0gYS5zcGVjaWZpY2l0eSk7XG5cbiAgICBpZiAoc29ydGVkQnlTcGVjaWZpY2l0eS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvcnRlZEJ5U3BlY2lmaWNpdHlbMF0udGhlbWU7XG59XG4iLCJpbXBvcnQgdHlwZSB7VGhlbWUsIEludmVyc2lvbkZpeH0gZnJvbSAnLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtpc0ZpcmVmb3h9IGZyb20gJy4uL3V0aWxzL3BsYXRmb3JtJztcblxuaW1wb3J0IHtjc3NGaWx0ZXJTdHlsZVNoZWV0VGVtcGxhdGV9IGZyb20gJy4vY3NzLWZpbHRlcic7XG5pbXBvcnQge2NyZWF0ZUZpbHRlck1hdHJpeCwgTWF0cml4fSBmcm9tICcuL3V0aWxzL21hdHJpeCc7XG5pbXBvcnQgdHlwZSB7U2l0ZVByb3BzSW5kZXh9IGZyb20gJy4vdXRpbHMvcGFyc2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU1ZHRmlsdGVyU3R5bGVzaGVldChjb25maWc6IFRoZW1lLCB1cmw6IHN0cmluZywgaXNUb3BGcmFtZTogYm9vbGVhbiwgZml4ZXM6IHN0cmluZywgaW5kZXg6IFNpdGVQcm9wc0luZGV4PEludmVyc2lvbkZpeD4pOiBzdHJpbmcge1xuICAgIGxldCBmaWx0ZXJWYWx1ZTogc3RyaW5nO1xuICAgIGxldCByZXZlcnNlRmlsdGVyVmFsdWU6IHN0cmluZztcbiAgICBpZiAoaXNGaXJlZm94KSB7XG4gICAgICAgIGZpbHRlclZhbHVlID0gZ2V0RW1iZWRkZWRTVkdGaWx0ZXJWYWx1ZShnZXRTVkdGaWx0ZXJNYXRyaXhWYWx1ZShjb25maWcpKTtcbiAgICAgICAgcmV2ZXJzZUZpbHRlclZhbHVlID0gZ2V0RW1iZWRkZWRTVkdGaWx0ZXJWYWx1ZShnZXRTVkdSZXZlcnNlRmlsdGVyTWF0cml4VmFsdWUoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hyb21lIGZhaWxzIHdpdGggXCJVbnNhZmUgYXR0ZW1wdCB0byBsb2FkIFVSTCAuLi4gRG9tYWlucywgcHJvdG9jb2xzIGFuZCBwb3J0cyBtdXN0IG1hdGNoLlxuICAgICAgICBmaWx0ZXJWYWx1ZSA9ICd1cmwoI2RhcmstcmVhZGVyLWZpbHRlciknO1xuICAgICAgICByZXZlcnNlRmlsdGVyVmFsdWUgPSAndXJsKCNkYXJrLXJlYWRlci1yZXZlcnNlLWZpbHRlciknO1xuICAgIH1cbiAgICBjb25zdCBmaWx0ZXJSb290ID0gaXNGaXJlZm94ID8gJ2JvZHknIDogJ2h0bWwnO1xuICAgIHJldHVybiBjc3NGaWx0ZXJTdHlsZVNoZWV0VGVtcGxhdGUoZmlsdGVyUm9vdCwgZmlsdGVyVmFsdWUsIHJldmVyc2VGaWx0ZXJWYWx1ZSwgY29uZmlnLCB1cmwsIGlzVG9wRnJhbWUsIGZpeGVzLCBpbmRleCk7XG59XG5cbmZ1bmN0aW9uIGdldEVtYmVkZGVkU1ZHRmlsdGVyVmFsdWUobWF0cml4VmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgaWQgPSAnZGFyay1yZWFkZXItZmlsdGVyJztcbiAgICBjb25zdCBzdmcgPSBbXG4gICAgICAgICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj4nLFxuICAgICAgICBgPGZpbHRlciBpZD1cIiR7aWR9XCIgc3R5bGU9XCJjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM6IHNSR0I7XCI+YCxcbiAgICAgICAgYDxmZUNvbG9yTWF0cml4IHR5cGU9XCJtYXRyaXhcIiB2YWx1ZXM9XCIke21hdHJpeFZhbHVlfVwiIC8+YCxcbiAgICAgICAgJzwvZmlsdGVyPicsXG4gICAgICAgICc8L3N2Zz4nLFxuICAgIF0uam9pbignJyk7XG4gICAgcmV0dXJuIGB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwke2J0b2Eoc3ZnKX0jJHtpZH0pYDtcbn1cblxuZnVuY3Rpb24gdG9TVkdNYXRyaXgobWF0cml4OiBudW1iZXJbXVtdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbWF0cml4LnNsaWNlKDAsIDQpLm1hcCgobSkgPT4gbS5tYXAoKG0pID0+IG0udG9GaXhlZCgzKSkuam9pbignICcpKS5qb2luKCcgJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTVkdGaWx0ZXJNYXRyaXhWYWx1ZShjb25maWc6IFRoZW1lKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9TVkdNYXRyaXgoY3JlYXRlRmlsdGVyTWF0cml4KGNvbmZpZykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U1ZHUmV2ZXJzZUZpbHRlck1hdHJpeFZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRvU1ZHTWF0cml4KE1hdHJpeC5pbnZlcnROSHVlKCkpO1xufVxuIiwiZXhwb3J0IGVudW0gVGhlbWVFbmdpbmUge1xuICAgIGNzc0ZpbHRlciA9ICdjc3NGaWx0ZXInLFxuICAgIHN2Z0ZpbHRlciA9ICdzdmdGaWx0ZXInLFxuICAgIHN0YXRpY1RoZW1lID0gJ3N0YXRpY1RoZW1lJyxcbiAgICBkeW5hbWljVGhlbWUgPSAnZHluYW1pY1RoZW1lJ1xufVxuIiwiZXhwb3J0IGVudW0gQXV0b21hdGlvbk1vZGUge1xuICAgIE5PTkUgPSAnJyxcbiAgICBUSU1FID0gJ3RpbWUnLFxuICAgIFNZU1RFTSA9ICdzeXN0ZW0nLFxuICAgIExPQ0FUSU9OID0gJ2xvY2F0aW9uJ1xufVxuIiwidHlwZSBBbnlGbiA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPEYgZXh0ZW5kcyBBbnlGbj4oZGVsYXk6IG51bWJlciwgZm46IEYpOiBGIHtcbiAgICBsZXQgdGltZW91dElkOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xuICAgIHJldHVybiAoKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbDtcbiAgICAgICAgICAgIGZuKC4uLmFyZ3MpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfSkgYXMgRjtcbn1cbiIsImV4cG9ydCBjbGFzcyBQcm9taXNlQmFycmllcjxSRVNPTFZVVElPTiwgUkVKRUNUSU9OPiB7XG4gICAgcHJpdmF0ZSByZXNvbHZlczogQXJyYXk8KHZhbHVlOiBSRVNPTFZVVElPTikgPT4gdm9pZD4gPSBbXTtcbiAgICBwcml2YXRlIHJlamVjdHM6IEFycmF5PChyZWFzb246IFJFSkVDVElPTikgPT4gdm9pZD4gPSBbXTtcbiAgICBwcml2YXRlIHdhc1Jlc29sdmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSB3YXNSZWplY3RlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVzb2x1dGlvbjogUkVTT0xWVVRJT047XG4gICAgcHJpdmF0ZSByZWFzb246IFJFSkVDVElPTjtcblxuICAgIGFzeW5jIGVudHJ5KCk6IFByb21pc2U8UkVTT0xWVVRJT04+e1xuICAgICAgICBpZiAodGhpcy53YXNSZXNvbHZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnJlc29sdXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLndhc1JlamVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVzLnB1c2gocmVzb2x2ZSk7XG4gICAgICAgICAgICB0aGlzLnJlamVjdHMucHVzaChyZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyByZXNvbHZlKHZhbHVlOiBSRVNPTFZVVElPTik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy53YXNSZWplY3RlZCB8fCB0aGlzLndhc1Jlc29sdmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53YXNSZXNvbHZlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucmVzb2x1dGlvbiA9IHZhbHVlO1xuICAgICAgICB0aGlzLnJlc29sdmVzLmZvckVhY2goKHJlc29sdmUpID0+IHJlc29sdmUodmFsdWUpKTtcbiAgICAgICAgdGhpcy5yZXNvbHZlcyA9IFtdO1xuICAgICAgICB0aGlzLnJlamVjdHMgPSBbXTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoKSkpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlamVjdChyZWFzb246IFJFSkVDVElPTik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy53YXNSZWplY3RlZCB8fCB0aGlzLndhc1Jlc29sdmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53YXNSZWplY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucmVhc29uID0gcmVhc29uO1xuICAgICAgICB0aGlzLnJlamVjdHMuZm9yRWFjaCgocmVqZWN0KSA9PiByZWplY3QocmVhc29uKSk7XG4gICAgICAgIHRoaXMucmVzb2x2ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5yZWplY3RzID0gW107XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4gc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKCkpKTtcbiAgICB9XG5cbiAgICBpc1BlbmRpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhdGhpcy53YXNSZXNvbHZlZCAmJiAhdGhpcy53YXNSZWplY3RlZDtcbiAgICB9XG5cbiAgICBpc0Z1bGZpbGxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzUmVzb2x2ZWQ7XG4gICAgfVxuXG4gICAgaXNSZWplY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzUmVqZWN0ZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtQcm9taXNlQmFycmllcn0gZnJvbSAnLi9wcm9taXNlLWJhcnJpZXInO1xuXG4vKlxuICogVGhpcyBjbGFzcyBzeW5jaHJvbml6ZXMgc29tZSBKUyBvYmplY3QncyBhdHRyaWJ1dGVzIGFuZCBkYXRhIHN0b3JlZCBpblxuICogY2hyb21lLnN0b3JhZ2UubG9jYWwsIHdpdGggbWluaW1hbCBkZWxheS4gSXQgZm9sbG93cyB0aGVzZSBwcmluY2lwbGVzOlxuICogIC0gbm8gZGVib3VuY2luZywgZGF0YSBpcyBzYXZlZCBhcyBzb29uIGFzIHNhdmVTdGF0ZSgpIGlzIGNhbGxlZFxuICogIC0gbm8gY29uY3VycmVudCB3cml0ZXMgKGNhbGxzIHRvIHMuYy5sLnNldCgpKTogaWYgc2F2ZVN0YXRlKCkgaXMgY2FsbGVkXG4gKiAgICByZXBlYXRlZGx5IGJlZm9yZSBwcmV2aW91cyBjYWxsIGlzIGNvbXBsZXRlLCB0aGlzIGNsYXNzIHdpbGwgd2FpdCBmb3JcbiAqICAgIGFjdGl2ZSB3cml0ZSB0byBjb21wbGV0ZSBhbmQgd2lsbCBzYXZlIG5ldyBkYXRhLlxuICogIC0gbm8gY29uY3VycmVudCByZWFkcyAoY2FsbHMgdG8gcy5jLmwuZ2V0KCkpOiBpZiBsb2FkU3RhdGUoKSBpcyBjYWxsZWRcbiAqICAgIHJlcGVhdGVkbHkgYmVmb3JlIHByZXZpb3VzIGNhbGwgaXMgY29tcGxldGUsIHRoaXMgY2xhc3Mgd2lsbCB3YWl0IGZvclxuICogICAgYWN0aXZlIHJlYWQgdG8gY29tcGxldGUgYW5kIHdpbGwgcmVzb2x2ZSBhbGwgbG9hZFN0YXRlKCkgY2FsbHMgYXQgb25jZS5cbiAqICAtIGFsbCBzaW11bHRhbmVvdXNseSBhY3RpdmUgY2FsbHMgdG8gc2F2ZVN0YXRlKCkgYW5kIGxvYWRTdGF0ZSgpIHdhaXQgZm9yXG4gKiAgICBkYXRhIHRvIHNldHRsZSBhbmQgcmVzb2x2ZSBvbmx5IGFmdGVyIGRhdGEgaXMgZ3VhcmFudGVlZCB0byBiZSBjb2hlcmVudC5cbiAqICAtIGRhdGEgc2F2ZWQgd2l0aCB0aGUgYnJvd3NlciBhbHdheXMgd2lucyAoYmVjYXVzZSBKUyB0eXBpY2FsbHkgaGFzIG9ubHlcbiAqICAgIGRlZmF1bHQgdmFsdWVzIGFuZCB0byBlbnN1cmUgdGhhdCBpZiB0aGUgc2FtZSBjbGFzcyBleGlzdHMgaW4gbXVsdGlwbGVcbiAqICAgIGNvbnRleHRzIGV2ZXJ5IGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgaGFzIHRoZSBzYW1lIHZhbHVlcylcbiAqIEluIHByYWN0aWNlLCB0aGVzZSBwcmluY2lwbGVzIGltcGx5IHRoYXQgYXQgYW55IGdpdmVuIG1vbWVudCB0aGVyZSBpcyBlaXRoZXJcbiAqIG5vIGFjdGl2ZSByZWFkIGFuZCB3cml0ZSBvcGVyYXRpb25zIG9yIHRoaXMgY2xhc3MgaXMgcGVyZm9ybWluZyBleGFjdGx5IG9uZVxuICogcmVhZCBvciBleGFjdGx5IG9uZSB3cml0ZSBvcGVyYXRpb24uXG4gKlxuICogU3RhdGUgbWFuYWdlciBpcyBhIHN0YXRlIG1hY2hpbmUgd2hpY2ggd29ya3MgYXMgZm9sbG93czpcbiAqICAgICAgICstLS0tLS0tLS0tLStcbiAqICAgICAgIHwgIEluaXRpYWwgIHxcbiAqICAgICAgICstLS0tLS0tLS0tLStcbiAqICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgfCBTdGF0ZU1hbmFnZXJJbXBsLmxvYWRTdGF0ZSgpIGlzIGNhbGxlZCxcbiAqICAgICAgICAgICAgICB8IFN0YXRlTWFuYWdlckltcGwgd2lsbCBjYWxsIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgpXG4gKiAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgIHZcbiAqICAgICAgICstLS0tLS0tLS0tLS0rXG4gKiArLS0tLS18ICBMb2FkaW5nIFIgfFxuICogfCAgICAgKy0tLS0tLS0tLS0tLStcbiAqIHwgICAgICAgICAgICB8XG4gKiB8ICAgICAgICAgICAgfCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoKSBjYWxsYmFjayBpcyBjYWxsZWQsXG4gKiB8IFsxXSAgICAgICAgfCBTdGF0ZU1hbmFnZXJJbXBsIGhhcyBsb2FkZWQgdGhlIGRhdGEuXG4gKiB8ICAgICAgICAgICAgfFxuICogfCAgICAgICAgICAgIHZcbiAqIHwgICAgICArLS0tLS0tLS0tLSs8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAqIHwgICAgICB8ICBSZWFkeSAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgICAgICArLS0tLS0tLS0tLSs8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgICAgIHxcbiAqIHwgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgICAgICAgICAgICB8IFN0YXRlTWFuYWdlckltcGwuc2F2ZVN0YXRlKCkgaXMgY2FsbGVkLCAgIHwgICAgIHxcbiAqIHwgICAgICAgICAgICB8IFN0YXRlTWFuYWdlckltcGwgd2lsbCBjYWxsZWN0IGRhdGEgYW5kICAgIHwgICAgIHxcbiAqIHwgICAgICAgICAgICB8IGNhbGwgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KCkgICAgICAgICAgIHwgICAgIHxcbiAqIHwgICAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgICAgICstLS0tLS0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgICAgIHxcbiAqIHwgICstLXwgIFNhdmluZyBXIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgIHwgICstLS0tLS0tLS0tLSs8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgICAgIHxcbiAqIHwgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgIHwgICAgICAgICB8IFN0YXRlTWFuYWdlckltcGwuc2F2ZVN0YXRlKCkgaXMgY2FsbGVkICAgIHwgICAgIHxcbiAqIHwgIHwgICAgICAgICB8IGJlZm9yZSBvbmdvaW5nIHdyaXRlIG9wZXJhdGlvbiBlbmRzLiAgICAgIHwgICAgIHxcbiAqIHwgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgIHwgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgIHwgICstLS0tLS0tLS0tLS0tLS0tLS0tKyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgIHxcbiAqIHwgIHwgIHwgU2F2aW5nIE92ZXJyaWRlIFcgfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgICAgIHxcbiAqIHwgIHwgICstLS0tLS0tLS0tLS0tLS0tLS0tKyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgIHwgICAgICAgICB8ICAgICBvbkNoYW5nZSBoYW5kbGVyIGlzIGNhbGxlZCBkdXJpbmcgYW4gYWN0aXZlIHxcbiAqIHwgIHwgWzFdICAgICB8IFsxXSByZWFkL3dyaXRlIG9wZXJhdGlvbiAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgIHwgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgICstPistLS0tLS0tLS0tLS0tLS0tLS0tKyAgICAgICArLS0tLS0tLS0tLS0tKyAgICAgICAgICAgICAgIHxcbiAqIHwgICAgIHwgT25DaGFuZ2UgUmFjZSBSL1cgfC0tLS0tLT58IFJlY292ZXJ5IFIgfC0tLS0tLS0tLS0tLS0tLStcbiAqICstLS0tPistLS0tLS0tLS0tLS0tLS0tLS0tKyAgICAgICArLS0tLS0tLS0tLS0tK1xuICogICAgICAgICAgICAgICAgIF4gICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSArXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWzFdXG4gKlxuICogUiBhbmQgVyBpbmRpY2F0ZSBhY3RpdmUgcmVhZCAoZ2V0KSBhbmQgd3JpdGUgKHNldCkgb3BlcmF0aW9ucy5cbiAqXG4gKiBJbml0aWFsIC0gT25seSBjb25zdHJ1Y3RvciB3YXMgY2FsbGVkLlxuICogTG9hZGluZyAtIGxvYWRTdGF0ZSgpIGlzIGNhbGxlZFxuICogUmVhZHkgLSBkYXRhIHdhcyByZXRyZWl2ZWQgZnJvbSBzdG9yYWdlLlxuICogU2F2aW5nIC0gc2F2ZVN0YXRlKCkgaXMgY2FsbGVkIGFuZCB0aGVyZSBpcyBubyBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoKVxuICogICBvcGVyYXRpb24gaW4gcHJvZ3Jlc3MuIFdlIGp1c3QgbmVlZCB0byBjb2xsZWN0IGFuZCBzYXZlIHRoZSBkYXRhLlxuICogU2F2aW5nIE92ZXJyaWRlIC0gc2F2ZVN0YXRlKCkgaXMgY2FsbGVkIGJlZm9yZSB0aGUgbGFzdCB3cml0ZSBvcGVyYXRpb25cbiAqICAgd2FzIGNvbXBsZXRlIChkYXRhIGJlY2FtZSBvYnNvbGV0ZSBldmVuIGJlZm9yZSBpdCB3YXMgd3JpdHRlbiB0byBzdG9yYWdlKS5cbiAqICAgV2Ugd2FpdCBmb3Igb25nb2luZyB3cml0ZSBvcGVyYXRpb24gdG8gZW5kIGFuZCBvbmx5IHRoZW4gc3RhcnQgYSBuZXcgb25lLlxuICogT25DaGFuZ2UgUmFjZSAtIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZCBsaXN0ZW5lciB3YXMgY2FsbGVkIGR1cmluZyBhbiBhY3RpdmVcbiAqICAgcmVhZC93cml0ZSBvcGVyYXRpb24uIFN0YXRlTWFuYWdlciBuZWVkcyB0byB3YWl0IGZvciB0aGF0IG9wZXJhdGlvbiB0byBlbmRcbiAqICAgYW5kIHJlLXJlcXVlc3QgZGF0YSBhZ2Fpbi5cbiAqIFJlY292ZXJ5IC0gc3RhdGUgbWFuYWdlciBkZXRlY3RlZCBhIHJhY2UgY29uZGl0aW9uLCBwcm9iYWJseSBjYXVzZWQgYnkgYW5cbiAqICAgb25DaGFuZ2VkIGV2ZW50IGR1cmluZyBkYXRhIGxvYWRpbmcgb3Igc2F2aW5nLiBTdGF0ZSBNYW5hZ2VyIHdpbGwgbG9hZCBkYXRhXG4gKiAgIGZyb20gYnJvd3NlciB0byBlbnN1cmUgZGF0YSBjb2hlcmVuY2UuXG4gKi9cblxuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcblxuZW51bSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUge1xuICAgIElOSVRJQUwgPSAwLFxuICAgIExPQURJTkcgPSAxLFxuICAgIFJFQURZID0gMixcbiAgICBTQVZJTkcgPSAzLFxuICAgIFNBVklOR19PVkVSUklERSA9IDQsXG4gICAgT05DSEFOR0VfUkFDRSA9IDUsXG4gICAgUkVDT1ZFUlkgPSA2XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZU1hbmFnZXJJbXBsPFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xuICAgIHByaXZhdGUgbG9jYWxTdG9yYWdlS2V5OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBwYXJlbnQ7XG4gICAgcHJpdmF0ZSBkZWZhdWx0czogVDtcbiAgICBwcml2YXRlIGxvZ1dhcm46IChsb2c6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIHByaXZhdGUgbWV0YTogU3RhdGVNYW5hZ2VySW1wbFN0YXRlO1xuICAgIHByaXZhdGUgYmFycmllcjogUHJvbWlzZUJhcnJpZXI8dm9pZCwgdm9pZD4gfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgc3RvcmFnZToge1xuICAgICAgICBnZXQ6IChzdG9yYWdlS2V5OiBzdHJpbmcsIGNhbGxiYWNrOiAoaXRlbXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgICAgIHNldDogKGl0ZW1zOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IFNldDwoKSA9PiB2b2lkPjtcblxuICAgIGNvbnN0cnVjdG9yKGxvY2FsU3RvcmFnZUtleTogc3RyaW5nLCBwYXJlbnQ6IGFueSwgZGVmYXVsdHM6IFQsIHN0b3JhZ2U6IHtnZXQ6IChzdG9yYWdlS2V5OiBzdHJpbmcsIGNhbGxiYWNrOiAoaXRlbXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pID0+IHZvaWQpID0+IHZvaWQ7IHNldDogKGl0ZW1zOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZH0sIGFkZExpc3RlbmVyOiAobGlzdGVuZXI6IChkYXRhOiBUKSA9PiB2b2lkKSA9PiB2b2lkLCBsb2dXYXJuOiAobG9nOiBzdHJpbmcpID0+IHZvaWQpe1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZUtleSA9IGxvY2FsU3RvcmFnZUtleTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICAgICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICAgICAgYWRkTGlzdGVuZXIoKGNoYW5nZSkgPT4gdGhpcy5vbkNoYW5nZShjaGFuZ2UpKTtcbiAgICAgICAgdGhpcy5sb2dXYXJuID0gbG9nV2FybjtcblxuICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuSU5JVElBTDtcbiAgICAgICAgdGhpcy5iYXJyaWVyID0gbmV3IFByb21pc2VCYXJyaWVyKCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgICAgIC8vIFRPRE8oQW50b24pOiBjb25zaWRlciBjYWxsaW5nIHRoaXMubG9hZFN0YXRlKCkgdG8gcHJlbG9hZCBkYXRhLFxuICAgICAgICAvLyBhbmQgcmVtb3ZlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5JTklUSUFMLlxuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdFN0YXRlKCkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHt9IGFzIFQ7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMuZGVmYXVsdHMpIGFzIEFycmF5PGtleW9mIFQ+KSB7XG4gICAgICAgICAgICBzdGF0ZVtrZXldID0gdGhpcy5wYXJlbnRba2V5XSB8fCB0aGlzLmRlZmF1bHRzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlTdGF0ZShzdG9yYWdlOiBUKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJlbnQsIHRoaXMuZGVmYXVsdHMsIHN0b3JhZ2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVsZWFzZUJhcnJpZXIoKSB7XG4gICAgICAgIGNvbnN0IGJhcnJpZXIgPSB0aGlzLmJhcnJpZXI7XG4gICAgICAgIHRoaXMuYmFycmllciA9IG5ldyBQcm9taXNlQmFycmllcigpO1xuICAgICAgICBiYXJyaWVyIS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBub3RpZnlMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlKHN0YXRlOiBUKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5tZXRhKSB7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5JTklUSUFMOlxuICAgICAgICAgICAgICAgIHRoaXMubWV0YSA9IFN0YXRlTWFuYWdlckltcGxTdGF0ZS5SRUFEWTtcbiAgICAgICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVBRFk6XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVN0YXRlKHN0YXRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLkxPQURJTkc6XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLk9OQ0hBTkdFX1JBQ0U7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuU0FWSU5HOlxuICAgICAgICAgICAgICAgIHRoaXMubWV0YSA9IFN0YXRlTWFuYWdlckltcGxTdGF0ZS5PTkNIQU5HRV9SQUNFO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklOR19PVkVSUklERTpcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuT05DSEFOR0VfUkFDRTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLk9OQ0hBTkdFX1JBQ0U6XG4gICAgICAgICAgICAgICAgLy8gV2UgYXJlIGFscmVhZHkgd2FpdGluZyBmb3IgYW4gYWN0aXZlIHJlYWQvd3JpdGUgb3BlcmF0aW9uIHRvIGVuZFxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVDT1ZFUlk6XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLk9OQ0hBTkdFX1JBQ0U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNhdmVTdGF0ZUludGVybmFsKCkge1xuICAgICAgICB0aGlzLnN0b3JhZ2Uuc2V0KHtbdGhpcy5sb2NhbFN0b3JhZ2VLZXldOiB0aGlzLmNvbGxlY3RTdGF0ZSgpfSwgKCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm1ldGEpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5JTklUSUFMOlxuICAgICAgICAgICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLkxPQURJTkc6XG4gICAgICAgICAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVBRFk6XG4gICAgICAgICAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVDT1ZFUlk6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nV2FybignVW5leHBlY3RlZCBzdGF0ZS4gUG9zc2libGUgZGF0YSByYWNlIScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuT05DSEFOR0VfUkFDRTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkU3RhdGVJbnRlcm5hbCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuU0FWSU5HOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVBRFk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZUJhcnJpZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklOR19PVkVSUklERTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklORztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlU3RhdGVJbnRlcm5hbCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuT05DSEFOR0VfUkFDRTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQ09WRVJZO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdGF0ZUludGVybmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgbm90IGd1YXJhbnRlZWQgdG8gc2F2ZSBzdGF0ZSBiZWZvcmUgcmV0dXJuaW5nXG4gICAgYXN5bmMgc2F2ZVN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWV0YSkge1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuSU5JVElBTDpcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgbm90IHRvIG92ZXJ3cml0ZSBkYXRhIGJlZm9yZSBpdCBpcyBsb2FkZWRcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ1dhcm4oJ1N0YXRlTWFuYWdlci5zYXZlU3RhdGUgd2FzIGNhbGxlZCBiZWZvcmUgU3RhdGVNYW5hZ2VyLmxvYWRTdGF0ZSgpLiBQb3NzaWJsZSBkYXRhIHJhY2UhIExvYWRpbmcgZGF0YSBpbnN0ZWFkLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRTdGF0ZSgpO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuTE9BRElORzpcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIHdhaXQgZm9yIGFjdGl2ZSByZWFkIG9wZXJhdGlvbiB0byBlbmRcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ1dhcm4oJ1N0YXRlTWFuYWdlci5zYXZlU3RhdGUgd2FzIGNhbGxlZCBiZWZvcmUgU3RhdGVNYW5hZ2VyLmxvYWRTdGF0ZSgpIHJlc29sdmVkLiBQb3NzaWJsZSBkYXRhIHJhY2UhIExvYWRpbmcgZGF0YSBpbnN0ZWFkLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJhcnJpZXIhLmVudHJ5KCk7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5SRUFEWToge1xuICAgICAgICAgICAgICAgIHRoaXMubWV0YSA9IFN0YXRlTWFuYWdlckltcGxTdGF0ZS5TQVZJTkc7XG4gICAgICAgICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmJhcnJpZXIhLmVudHJ5KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlU3RhdGVJbnRlcm5hbCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklORzpcbiAgICAgICAgICAgICAgICAvLyBBbm90aGVyIHNhdmUgaXMgaW4gcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuU0FWSU5HX09WRVJSSURFO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJhcnJpZXIhLmVudHJ5KCk7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5TQVZJTkdfT1ZFUlJJREU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFycmllciEuZW50cnkoKTtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLk9OQ0hBTkdFX1JBQ0U6XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dXYXJuKCdTdGF0ZU1hbmFnZXIuc2F2ZVN0YXRlIHdhcyBjYWxsZWQgZHVyaW5nIGFjdGl2ZSByZWFkL3dyaXRlIG9wZXJhdGlvbi4gUG9zc2libGUgZGF0YSByYWNlISBMb2FkaW5nIGRhdGEgaW5zdGVhZC4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5iYXJyaWVyIS5lbnRyeSgpO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVDT1ZFUlk6XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dXYXJuKCdTdGF0ZU1hbmFnZXIuc2F2ZVN0YXRlIHdhcyBjYWxsZWQgZHVyaW5nIGFjdGl2ZSByZWFkIG9wZXJhdGlvbi4gUG9zc2libGUgZGF0YSByYWNlISBXYWl0aW5nIGZvciBkYXRhIGxvYWQgaW5zdGVhZC4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5iYXJyaWVyIS5lbnRyeSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkU3RhdGVJbnRlcm5hbCgpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlLmdldCh0aGlzLmxvY2FsU3RvcmFnZUtleSwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm1ldGEpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5JTklUSUFMOlxuICAgICAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQURZOlxuICAgICAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklORzpcbiAgICAgICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5TQVZJTkdfT1ZFUlJJREU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nV2FybignVW5leHBlY3RlZCBzdGF0ZS4gUG9zc2libGUgZGF0YSByYWNlIScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuTE9BRElORzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQURZO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U3RhdGUoZGF0YVt0aGlzLmxvY2FsU3RvcmFnZUtleV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2VCYXJyaWVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5PTkNIQU5HRV9SQUNFOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVDT1ZFUlk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZFN0YXRlSW50ZXJuYWwoKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5SRUNPVkVSWTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXRhID0gU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQURZO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U3RhdGUoZGF0YVt0aGlzLmxvY2FsU3RvcmFnZUtleV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2VCYXJyaWVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGxvYWRTdGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1ldGEpIHtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLklOSVRJQUw6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGEgPSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuTE9BRElORztcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuYmFycmllciEuZW50cnkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdGF0ZUludGVybmFsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuUkVBRFk6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuU0FWSU5HOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJhcnJpZXIhLmVudHJ5KCk7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5TQVZJTkdfT1ZFUlJJREU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFycmllciEuZW50cnkoKTtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLkxPQURJTkc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFycmllciEuZW50cnkoKTtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLk9OQ0hBTkdFX1JBQ0U6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFycmllciEuZW50cnkoKTtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQ09WRVJZOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJhcnJpZXIhLmVudHJ5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcihjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGdldFN0YXRlRm9yVGVzdGluZygpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIV9fVEVTVF9fKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoICh0aGlzLm1ldGEpIHtcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLklOSVRJQUw6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdJbml0aWFsJztcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLkxPQURJTkc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdMb2FkaW5nJztcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlJFQURZOlxuICAgICAgICAgICAgICAgIHJldHVybiAnUmVhZHknO1xuICAgICAgICAgICAgY2FzZSBTdGF0ZU1hbmFnZXJJbXBsU3RhdGUuU0FWSU5HOlxuICAgICAgICAgICAgICAgIHJldHVybiAnU2F2aW5nJztcbiAgICAgICAgICAgIGNhc2UgU3RhdGVNYW5hZ2VySW1wbFN0YXRlLlNBVklOR19PVkVSUklERTpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1NhdmluZyBPdmVycmlkZSc7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5PTkNIQU5HRV9SQUNFOlxuICAgICAgICAgICAgICAgIHJldHVybiAnT25jaGFuZ2UgUmFjZSc7XG4gICAgICAgICAgICBjYXNlIFN0YXRlTWFuYWdlckltcGxTdGF0ZS5SRUNPVkVSWTpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1JlY292ZXJ5JztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qKlxuICogVGhpcyBjbGFzcyBleGlzdHMgb25seSB0byBzaW1wbGlmeSBKZXN0IHRlc3Rpbmcgb2YgdGhlIHJlYWwgaW1wbGVtZW50YXRpb25cbiAqIHdoaWNoIGlzIGluIFN0YXRlTWFuYWdlckltcGwgY2xhc3MuXG4gKi9cblxuaW1wb3J0IHtpc05vblBlcnNpc3RlbnR9IGZyb20gJy4vcGxhdGZvcm0nO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXJJbXBsfSBmcm9tICcuL3N0YXRlLW1hbmFnZXItaW1wbCc7XG5cblxuZXhwb3J0IGNsYXNzIFN0YXRlTWFuYWdlcjxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcbiAgICBwcml2YXRlIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VySW1wbDxUPiB8IG51bGw7XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2NhbFN0b3JhZ2VLZXk6IHN0cmluZywgcGFyZW50OiBhbnksIGRlZmF1bHRzOiBULCBsb2dXYXJuOiAobG9nOiBzdHJpbmcpID0+IHZvaWQpe1xuICAgICAgICBpZiAoaXNOb25QZXJzaXN0ZW50KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihsaXN0ZW5lcjogKGRhdGE6IFQpID0+IHZvaWQpIHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsU3RvcmFnZUtleSBpbiBjaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcihjaGFuZ2VzW2xvY2FsU3RvcmFnZUtleV0ubmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlckltcGwoXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlS2V5LFxuICAgICAgICAgICAgICAgIHBhcmVudCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyxcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbCxcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICBsb2dXYXJuLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHNhdmVTdGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVNYW5hZ2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZU1hbmFnZXIuc2F2ZVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBsb2FkU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlTWFuYWdlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGVNYW5hZ2VyLmxvYWRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19ERUJVR19fOiBib29sZWFuO1xuXG4vLyBQcm9taXNzaWZpZWQgdmVyc2lvbiBvZiBjaHJvbWUudGFicy5xdWVyeVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5VGFicyhxdWVyeTogY2hyb21lLnRhYnMuUXVlcnlJbmZvID0ge30pOiBQcm9taXNlPGNocm9tZS50YWJzLlRhYltdPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGNocm9tZS50YWJzLlRhYltdPigocmVzb2x2ZSkgPT4gY2hyb21lLnRhYnMucXVlcnkocXVlcnksIHJlc29sdmUpKTtcbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byBmaW5kIHRoZSBjdXJyZW50IGFjdGl2ZSB0YWJcbiAqIERlc3BpdGUgYWxsIGVmZm9ydHMsIHNvbWV0aW1lcyBhY3RpdmUgdGFiIG1heSBub3QgYmUgZGV0ZXJtaW5lZCBzbyB3ZSBleHBsaWNpdGx5IHJldHVybiBudWxsYWJsZSB2YWx1ZSxcbiAqIGFuZCBoYW5kbGUgdGhpcyBjYXNlIGluIGNhbGxlcnMgZXhwbGljaXRseVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKCk6IFByb21pc2U8Y2hyb21lLnRhYnMuVGFiIHwgbnVsbD4ge1xuICAgIGxldCBsb2c6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGxldCB0YWIgPSAoYXdhaXQgcXVlcnlUYWJzKHtcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICBsYXN0Rm9jdXNlZFdpbmRvdzogdHJ1ZSxcbiAgICAgICAgLy8gRXhwbGljaXRseSBleGNsdWRlIERhcmsgUmVhZGVyJ3MgRGV2IFRvb2xzIGFuZCBvdGhlciBzcGVjaWFsIHdpbmRvd3MgZnJvbSB0aGUgcXVlcnlcbiAgICAgICAgd2luZG93VHlwZTogJ25vcm1hbCcsXG4gICAgfSkpWzBdO1xuICAgIGlmICghdGFiKSB7XG4gICAgICAgIHRhYiA9IChhd2FpdCBxdWVyeVRhYnMoe1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgbGFzdEZvY3VzZWRXaW5kb3c6IHRydWUsXG4gICAgICAgICAgICB3aW5kb3dUeXBlOiAnYXBwJyxcbiAgICAgICAgfSkpWzBdO1xuICAgIH1cbiAgICBpZiAoIXRhYikge1xuICAgICAgICBpZiAoX19ERUJVR19fIHx8IF9fVEVTVF9fKSB7XG4gICAgICAgICAgICBsb2cgPSAnbWV0aG9kIDEnO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdoZW4gRGFyayBSZWFkZXIncyBEZXZUb29scyBhcmUgb3BlbiwgbGFzdCBmb2N1c2VkIHdpbmRvdyBtaWdodCBiZSB0aGUgRGV2VG9vbHMgd2luZG93XG4gICAgICAgIC8vIHNvIHdlIGxpZnQgdGhpcyByZXN0cmljdGlvbiBhbmQgdHJ5IGFnYWluICh3aXRoIHRoZSBiZXN0IGd1ZXNzKVxuICAgICAgICB0YWIgPSAoYXdhaXQgcXVlcnlUYWJzKHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHdpbmRvd1R5cGU6ICdub3JtYWwnLFxuICAgICAgICB9KSlbMF07XG4gICAgfVxuICAgIGlmICghdGFiKSB7XG4gICAgICAgIGlmIChfX0RFQlVHX18gfHwgX19URVNUX18pIHtcbiAgICAgICAgICAgIGxvZyA9ICdtZXRob2QgMic7XG4gICAgICAgIH1cbiAgICAgICAgdGFiID0gKGF3YWl0IHF1ZXJ5VGFicyh7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB3aW5kb3dUeXBlOiAnYXBwJyxcbiAgICAgICAgfSkpWzBdO1xuICAgIH1cbiAgICBpZiAobG9nKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGFiTWFuYWdlci5nZXRBY3RpdmVUYWIoKSBjb3VsZCBub3QgcmVsaWFibHkgZmluZCB0aGUgYWN0aXZlIHRhYiwgcGlja2luZyB0aGUgYmVzdCBndWVzcyAke2xvZ31gLCB0YWIpO1xuICAgIH1cbiAgICAvLyBJbiByYXJlIGNhc2VzIHRhYiBjYW4gYmUgbnVsbCwgZGVzcGl0ZSB3aGF0IFR5cGVTY3JpcHQgc2F5c1xuICAgIHJldHVybiB0YWIgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYlVSTCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCB0YWIgPSBhd2FpdCBnZXRBY3RpdmVUYWIoKTtcbiAgICByZXR1cm4gdGFiICYmIHRhYi51cmwgfHwgbnVsbDtcbn1cbiIsImltcG9ydCB7ZXh0ZW5kVGhlbWVEZWZhdWx0c30gZnJvbSAnQHBsdXMvZGVmYXVsdHMnO1xuaW1wb3J0IHR5cGUge1RoZW1lLCBVc2VyU2V0dGluZ3N9IGZyb20gJy4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtUaGVtZUVuZ2luZX0gZnJvbSAnLi9nZW5lcmF0b3JzL3RoZW1lLWVuZ2luZXMnO1xuaW1wb3J0IHtBdXRvbWF0aW9uTW9kZX0gZnJvbSAnLi91dGlscy9hdXRvbWF0aW9uJztcbmltcG9ydCB0eXBlIHtQYXJzZWRDb2xvclNjaGVtZUNvbmZpZ30gZnJvbSAnLi91dGlscy9jb2xvcnNjaGVtZS1wYXJzZXInO1xuaW1wb3J0IHtpc01hY09TLCBpc1dpbmRvd3MsIGlzQ1NTQ29sb3JTY2hlbWVQcm9wU3VwcG9ydGVkLCBpc0VkZ2UsIGlzTW9iaWxlfSBmcm9tICcuL3V0aWxzL3BsYXRmb3JtJztcblxuZGVjbGFyZSBjb25zdCBfX0NIUk9NSVVNX01WM19fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1BMVVNfXzogYm9vbGVhbjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1JTID0ge1xuICAgIGRhcmtTY2hlbWU6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMxODFhMWInLFxuICAgICAgICB0ZXh0OiAnI2U4ZTZlMycsXG4gICAgfSxcbiAgICBsaWdodFNjaGVtZToge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnI2RjZGFkNycsXG4gICAgICAgIHRleHQ6ICcjMTgxYTFiJyxcbiAgICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEhFTUU6IFRoZW1lID0ge1xuICAgIG1vZGU6IDEsXG4gICAgYnJpZ2h0bmVzczogMTAwLFxuICAgIGNvbnRyYXN0OiAxMDAsXG4gICAgZ3JheXNjYWxlOiAwLFxuICAgIHNlcGlhOiAwLFxuICAgIHVzZUZvbnQ6IGZhbHNlLFxuICAgIGZvbnRGYW1pbHk6IGlzTWFjT1MgPyAnSGVsdmV0aWNhIE5ldWUnIDogaXNXaW5kb3dzID8gJ1NlZ29lIFVJJyA6ICdPcGVuIFNhbnMnLFxuICAgIHRleHRTdHJva2U6IDAsXG4gICAgZW5naW5lOiBUaGVtZUVuZ2luZS5keW5hbWljVGhlbWUsXG4gICAgc3R5bGVzaGVldDogJycsXG4gICAgZGFya1NjaGVtZUJhY2tncm91bmRDb2xvcjogREVGQVVMVF9DT0xPUlMuZGFya1NjaGVtZS5iYWNrZ3JvdW5kLFxuICAgIGRhcmtTY2hlbWVUZXh0Q29sb3I6IERFRkFVTFRfQ09MT1JTLmRhcmtTY2hlbWUudGV4dCxcbiAgICBsaWdodFNjaGVtZUJhY2tncm91bmRDb2xvcjogREVGQVVMVF9DT0xPUlMubGlnaHRTY2hlbWUuYmFja2dyb3VuZCxcbiAgICBsaWdodFNjaGVtZVRleHRDb2xvcjogREVGQVVMVF9DT0xPUlMubGlnaHRTY2hlbWUudGV4dCxcbiAgICBzY3JvbGxiYXJDb2xvcjogJycsXG4gICAgc2VsZWN0aW9uQ29sb3I6ICdhdXRvJyxcbiAgICBzdHlsZVN5c3RlbUNvbnRyb2xzOiBfX0NIUk9NSVVNX01WM19fID8gZmFsc2UgOiAhaXNDU1NDb2xvclNjaGVtZVByb3BTdXBwb3J0ZWQsXG4gICAgbGlnaHRDb2xvclNjaGVtZTogJ0RlZmF1bHQnLFxuICAgIGRhcmtDb2xvclNjaGVtZTogJ0RlZmF1bHQnLFxuICAgIGltbWVkaWF0ZU1vZGlmeTogZmFsc2UsXG59O1xuXG5pZiAoX19QTFVTX18pIHtcbiAgICBleHRlbmRUaGVtZURlZmF1bHRzKERFRkFVTFRfVEhFTUUpO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT0xPUlNDSEVNRTogUGFyc2VkQ29sb3JTY2hlbWVDb25maWcgPSB7XG4gICAgbGlnaHQ6IHtcbiAgICAgICAgRGVmYXVsdDoge1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBERUZBVUxUX0NPTE9SUy5saWdodFNjaGVtZS5iYWNrZ3JvdW5kLFxuICAgICAgICAgICAgdGV4dENvbG9yOiBERUZBVUxUX0NPTE9SUy5saWdodFNjaGVtZS50ZXh0LFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgZGFyazoge1xuICAgICAgICBEZWZhdWx0OiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IERFRkFVTFRfQ09MT1JTLmRhcmtTY2hlbWUuYmFja2dyb3VuZCxcbiAgICAgICAgICAgIHRleHRDb2xvcjogREVGQVVMVF9DT0xPUlMuZGFya1NjaGVtZS50ZXh0LFxuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG5jb25zdCBmaWx0ZXJNb2RlU2l0ZXMgPSBbXG4gICAgJyoub2ZmaWNlYXBwcy5saXZlLmNvbScsXG4gICAgJyouc2hhcmVwb2ludC5jb20nLFxuICAgICdkb2NzLmdvb2dsZS5jb20nLFxuICAgICdvbmVkcml2ZS5saXZlLmNvbScsXG5dO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogVXNlclNldHRpbmdzID0ge1xuICAgIHNjaGVtZVZlcnNpb246IDAsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBmZXRjaE5ld3M6IHRydWUsXG4gICAgdGhlbWU6IERFRkFVTFRfVEhFTUUsXG4gICAgcHJlc2V0czogW10sXG4gICAgY3VzdG9tVGhlbWVzOiBmaWx0ZXJNb2RlU2l0ZXMubWFwKCh1cmwpID0+IHtcbiAgICAgICAgY29uc3QgZW5naW5lOiBUaGVtZUVuZ2luZSA9IFRoZW1lRW5naW5lLmNzc0ZpbHRlcjtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVybDogW3VybF0sXG4gICAgICAgICAgICB0aGVtZTogey4uLkRFRkFVTFRfVEhFTUUsIGVuZ2luZX0sXG4gICAgICAgICAgICBidWlsdEluOiB0cnVlLFxuICAgICAgICB9O1xuICAgIH0pLFxuICAgIGVuYWJsZWRCeURlZmF1bHQ6IHRydWUsXG4gICAgZW5hYmxlZEZvcjogW10sXG4gICAgZGlzYWJsZWRGb3I6IFtdLFxuICAgIGNoYW5nZUJyb3dzZXJUaGVtZTogZmFsc2UsXG4gICAgc3luY1NldHRpbmdzOiB0cnVlLFxuICAgIHN5bmNTaXRlc0ZpeGVzOiBmYWxzZSxcbiAgICBhdXRvbWF0aW9uOiB7XG4gICAgICAgIGVuYWJsZWQ6IGlzRWRnZSAmJiBpc01vYmlsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgbW9kZTogaXNFZGdlICYmIGlzTW9iaWxlID8gQXV0b21hdGlvbk1vZGUuU1lTVEVNIDogQXV0b21hdGlvbk1vZGUuTk9ORSxcbiAgICAgICAgYmVoYXZpb3I6ICdPbk9mZicsXG4gICAgfSxcbiAgICB0aW1lOiB7XG4gICAgICAgIGFjdGl2YXRpb246ICcxODowMCcsXG4gICAgICAgIGRlYWN0aXZhdGlvbjogJzk6MDAnLFxuICAgIH0sXG4gICAgbG9jYXRpb246IHtcbiAgICAgICAgbGF0aXR1ZGU6IG51bGwsXG4gICAgICAgIGxvbmdpdHVkZTogbnVsbCxcbiAgICB9LFxuICAgIHByZXZpZXdOZXdEZXNpZ246IGZhbHNlLFxuICAgIHByZXZpZXdOZXdlc3REZXNpZ246IGZhbHNlLFxuICAgIGVuYWJsZUZvclBERjogdHJ1ZSxcbiAgICBlbmFibGVGb3JQcm90ZWN0ZWRQYWdlczogZmFsc2UsXG4gICAgZW5hYmxlQ29udGV4dE1lbnVzOiBmYWxzZSxcbiAgICBkZXRlY3REYXJrVGhlbWU6IHRydWUsXG59O1xuIiwiLy8gU2VwZXJhdG9yIGlzIHRvIGluZGljYXRlIHRoYXQgdGhlIGl0IHNob3VsZCBzdGFydCB3aXRoIGEgbmV3IGRlZmluZWQgY29sb3JzY2hlbWUuXG5jb25zdCBTRVBFUkFUT1IgPSAnPScucmVwZWF0KDMyKTtcblxuLy8gSnVzdCBhIGZldyBjb25zdGFudHMgdG8gbWFrZSB0aGUgY29kZSBtb3JlIHJlYWRhYmxlLlxuY29uc3QgYmFja2dyb3VuZFByb3BlcnR5TGVuZ3RoID0gJ2JhY2tncm91bmQ6ICcubGVuZ3RoO1xuY29uc3QgdGV4dFByb3BlcnR5TGVuZ3RoID0gJ3RleHQ6ICcubGVuZ3RoO1xuXG4vLyBTaG91bGQgcmV0dXJuIGEgaHVtYW5pemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIG51bWJlci5cbi8vIEZvciBleGFtcGxlOlxuLy8gaHVtYW5pemVOdW1iZXIoMCkgPT4gJzAnXG4vLyBodW1hbml6ZU51bWJlcigxKSA9PiAnMXN0J1xuLy8gaHVtYW5pemVOdW1iZXIoMikgPT4gJzJuZCdcbi8vIGh1bWFuaXplTnVtYmVyKDMpID0+ICczcmQnXG4vLyBodW1hbml6ZU51bWJlcig0KSA9PiAnNHRoJ1xuLy8gVE9ETyhBbnRvbik6IHJld3JpdGUgbWUgd2l0aCBjYXNlLWRlZmF1bHRcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuLy8gQHRzLWlnbm9yZVxuY29uc3QgaHVtYW5pemVOdW1iZXIgPSAobnVtYmVyOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChudW1iZXIgPiAzKSB7XG4gICAgICAgIHJldHVybiBgJHtudW1iZXJ9dGhgO1xuICAgIH1cbiAgICBzd2l0Y2ggKG51bWJlcikge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gJzAnO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gJzFzdCc7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiAnMm5kJztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuICczcmQnO1xuICAgIH1cbn07XG5cbi8vIFNob3VsZCByZXR1cm4gaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBhIHZhbGlkIDMgb3IgNiBkaWdpdCBoZXggY29sb3IuXG5jb25zdCBpc1ZhbGlkSGV4Q29sb3IgPSAoY29sb3I6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAvXiMoWzAtOWEtZkEtRl17M30pezEsMn0kLy50ZXN0KGNvbG9yKTtcbn07XG5cbmludGVyZmFjZSBDb2xvclNjaGVtZVZhcmlhbnQge1xuICAgIC8vIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBjb2xvciBzY2hlbWUgaW4gaGV4IGZvcm1hdC5cbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZztcbiAgICAvLyBUaGUgdGV4dCBjb2xvciBvZiB0aGUgY29sb3Igc2NoZW1lIGluIGhleCBmb3JtYXQuXG4gICAgdGV4dENvbG9yOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29sb3JTY2hlbWVDb25maWcge1xuICAgIC8vIEFsbCBkZWZpbmVkIGxpZ2h0IGNvbG9yIHNjaGVtZXMuXG4gICAgbGlnaHQ6IHsgW25hbWU6IHN0cmluZ106IENvbG9yU2NoZW1lVmFyaWFudCB9O1xuICAgIC8vIEFsbCBkZWZpbmVkIGRhcmsgY29sb3Igc2NoZW1lcy5cbiAgICBkYXJrOiB7IFtuYW1lOiBzdHJpbmddOiBDb2xvclNjaGVtZVZhcmlhbnQgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29sb3JTY2hlbWVDb25maWcoY29uZmlnOiBzdHJpbmcpOiB7IHJlc3VsdDogUGFyc2VkQ29sb3JTY2hlbWVDb25maWc7IGVycm9yOiBzdHJpbmcgfCBudWxsIH0ge1xuICAgIC8vIExldCdzIGZpcnN0IGdldCBhbGwgXCJwb3NzaWJsZVwiIHNlY3Rpb25zIG9mIHRoZSB0ZXh0LlxuICAgIC8vIFdlJ3JlIGFkZGluZyBgXFxuYCBzbyB0aGUgc2VjdGlvbnMgXCJmaXJzdFwiIHdvcmQgaXMgdGhlXG4gICAgLy8gbmFtZSBvZiB0aGUgY29sb3Igc2NoZW1lLiBXZSBjb3VsZCByZW1vdmUgdGhpcyBhbmRcbiAgICAvLyBza2lwIHRoaXMgaW4gdGhlIHByb2Nlc3Mgb2YgcGFyc2luZywgYnV0IGJlY2F1c2VcbiAgICAvLyB0aGUgZmlyc3QgZW50cnkgd2lsbCBub3QgaGF2ZSB0aGlzIGZpcnN0ICdcXG4nIGl0IHdpbGxcbiAgICAvLyBiZSBtb3JlIGNvbXBsaWNhdGVkIHRvIG90aGVyd2lzZSBqdXN0IGFkZCB0aGlzICdcXG4nIGhlcmUuXG4gICAgY29uc3Qgc2VjdGlvbnMgPSBjb25maWcuc3BsaXQoYCR7U0VQRVJBVE9SIH1cXG5cXG5gKTtcblxuICAgIGNvbnN0IGRlZmluZWRDb2xvclNjaGVtZU5hbWVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBsZXQgbGFzdERlZmluZWRDb2xvclNjaGVtZU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9ICcnO1xuXG4gICAgY29uc3QgZGVmaW5lZENvbG9yU2NoZW1lczogUGFyc2VkQ29sb3JTY2hlbWVDb25maWcgPSB7XG4gICAgICAgIGxpZ2h0OiB7fSxcbiAgICAgICAgZGFyazoge30sXG4gICAgfTtcblxuICAgIC8vIERlZmluZSB0aGUgaW50ZXJydXB0IGFuZCBlcnJvciB2YXJpYWJsZXMuXG4gICAgLy8gSW50ZXJydXB0IGlzIHRvIGluZGljYXRlIHRoYXQgdGhlIHBhcnNpbmcgc2hvdWxkIHN0b3AuXG4gICAgLy8gQnV0IGJlY2F1c2Ugd2UgY2Fubm90IGJyZWFrIG91dCBvZiBhIGZvckVhY2ggbG9vcCxcbiAgICAvLyB3ZSBuZWVkIHRvIHVzZSBhbiBpbnRlcnJ1cHQgdmFyaWFibGUuXG4gICAgLy8gVGhlIGVycm9yIGlzIHRvIGluZGljYXRlIHRoYXQgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgIC8vIEFuZCBhbHNvIHRoZSByZWFzb24gd2h5IHRoZSBwYXJzaW5nIGZhaWxlZC5cbiAgICAvLyBJdCB3aWxsIGJlIHRoZSBmaXJzdCBlcnJvciB0aGF0IGlzIGZvdW5kLlxuICAgIGxldCBpbnRlcnJ1cHQgPSBmYWxzZTtcbiAgICBsZXQgZXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3QgdGhyb3dFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCFpbnRlcnJ1cHQpIHtcbiAgICAgICAgICAgIGludGVycnVwdCA9IHRydWU7XG4gICAgICAgICAgICBlcnJvciA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gTm93IHdlIHdpbGwgaXRlcmF0ZSB0cm91Z2hvdXQgZWFjaCBzZWN0aW9uLlxuICAgIC8vIFdlIHdpbGwgYWx3YXlzIGFzc3VtZSBiYWQtZmFpdGggYW5kIG1ha2Ugc3VyZSB0byBoYXZlXG4gICAgLy8gZ3VhcmRzIGluIHBsYWNlLiBBcyB0aGlzIGNvdWxkIGFsc28gYmUgYmFkIGNvZGUuXG4gICAgLy8gV2Ugc2hvdWxkbid0IHJlbHkgb24gdGhhdCB0aGUgaW5wdXQgaXMgY29ycmVjdC5cbiAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBpbnRlcnJ1cHQgdmFyaWFibGUgaXMgc2V0LlxuICAgICAgICAvLyBJZiBpdCBpcywgd2Ugc2hvdWxkIHN0b3AgcGFyc2luZy5cbiAgICAgICAgaWYgKGludGVycnVwdCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyc3Qgd2Ugc3BsaXQgdGhlIHNlY3Rpb24gaW50byBsaW5lcy5cbiAgICAgICAgY29uc3QgbGluZXMgPSBzZWN0aW9uLnNwbGl0KCdcXG4nKTtcblxuICAgICAgICAvLyBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBmaXJzdCBsaW5lIGlzIGEgdmFsaWQgY29sb3Igc2NoZW1lIG5hbWUuXG4gICAgICAgIC8vIFdlIHdpbGwgYWxzbyBtYWtlIHN1cmUgdGhhdCB0aGUgbmFtZSBpcyBub3QgYWxyZWFkeSBkZWZpbmVkLlxuICAgICAgICBjb25zdCBuYW1lID0gbGluZXNbMF07XG4gICAgICAgIGlmICghbmFtZSkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcignTm8gY29sb3Igc2NoZW1lIG5hbWUgd2FzIGZvdW5kLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWZpbmVkQ29sb3JTY2hlbWVOYW1lcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSBjb2xvciBzY2hlbWUgbmFtZSBcIiR7bmFtZX1cIiBpcyBhbHJlYWR5IGRlZmluZWQuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIG5hbWUgaXMgb24gYWxwaGFiZXRpY2FsIG9yZGVyLlxuICAgICAgICBpZiAobGFzdERlZmluZWRDb2xvclNjaGVtZU5hbWUgJiYgbGFzdERlZmluZWRDb2xvclNjaGVtZU5hbWUgIT09ICdEZWZhdWx0JyAmJiBuYW1lLmxvY2FsZUNvbXBhcmUobGFzdERlZmluZWRDb2xvclNjaGVtZU5hbWUpIDwgMCkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihgVGhlIGNvbG9yIHNjaGVtZSBuYW1lIFwiJHtuYW1lfVwiIGlzIG5vdCBpbiBhbHBoYWJldGljYWwgb3JkZXIuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGFzdERlZmluZWRDb2xvclNjaGVtZU5hbWUgPSBuYW1lO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgbmFtZSB0byB0aGUgc2V0IG9mIGRlZmluZWQgY29sb3Igc2NoZW1lIG5hbWVzLlxuICAgICAgICBkZWZpbmVkQ29sb3JTY2hlbWVOYW1lcy5hZGQobmFtZSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgbGluZVsxXSBpcyBlbXB0eSwgd2hpY2ggaXMgbXVzdCBiZS5cbiAgICAgICAgaWYgKGxpbmVzWzFdKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKGBUaGUgc2Vjb25kIGxpbmUgb2YgdGhlIGNvbG9yIHNjaGVtZSBcIiR7bmFtZX1cIiBpcyBub3QgZW1wdHkuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja1ZhcmlhbnQgPSAobGluZUluZGV4OiBudW1iZXIsIGlzU2Vjb25kVmFyaWFudDogYm9vbGVhbik6IChDb2xvclNjaGVtZVZhcmlhbnQgJiB7IHZhcmlhbnQ/OiBzdHJpbmcgfSkgfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBwb3NzaWJsZSB2YXJpYW50IG5hbWUuXG4gICAgICAgICAgICBjb25zdCB2YXJpYW50ID0gbGluZXNbbGluZUluZGV4XTtcbiAgICAgICAgICAgIGlmICghdmFyaWFudCkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSB0aGlyZCBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IGRlZmluZWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgdmFyaWFudCBpcyB2YWxpZC5cbiAgICAgICAgICAgIC8vIGlmIGlzU2Vjb25kVmFyaWFudCBpcyB0cnVlLCB0aGVuIHdlIHdpbGwgY2hlY2sgaWYgdGhlIHZhcmlhbnQgaXMgJ0xpZ2h0JywgJ0RhcmsnIGlzIG5vdCBjb25zaWRlcmVkIHZhbGlkLlxuICAgICAgICAgICAgaWYgKHZhcmlhbnQgIT09ICdMSUdIVCcgJiYgdmFyaWFudCAhPT0gJ0RBUksnICYmIChpc1NlY29uZFZhcmlhbnQgJiYgdmFyaWFudCA9PT0gJ0xpZ2h0JykpIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKGBUaGUgJHtodW1hbml6ZU51bWJlcihsaW5lSW5kZXgpfSBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IGEgdmFsaWQgdmFyaWFudC5gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgcG9zc2libGUgYmFja2dyb3VuZCBjb2xvci5cbiAgICAgICAgICAgIGNvbnN0IGZpcnN0UHJvcGVydHkgPSBsaW5lc1tsaW5lSW5kZXggKyAxXTtcbiAgICAgICAgICAgIGlmICghZmlyc3RQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSAke2h1bWFuaXplTnVtYmVyKGxpbmVJbmRleCArIDEpfSBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IGRlZmluZWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgYmFja2dyb3VuZCBjb2xvci5cbiAgICAgICAgICAgIGlmICghZmlyc3RQcm9wZXJ0eS5zdGFydHNXaXRoKCdiYWNrZ3JvdW5kOiAnKSkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSAke2h1bWFuaXplTnVtYmVyKGxpbmVJbmRleCArIDEpfSBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IGJhY2tncm91bmQtY29sb3IgcHJvcGVydHkuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGJhY2tncm91bmQgY29sb3IgYW5kIGNoZWNrIGlmIGl0IGlzIGEgdmFsaWQgaGV4IGNvbG9yLlxuICAgICAgICAgICAgY29uc3QgYmFja2dyb3VuZENvbG9yID0gZmlyc3RQcm9wZXJ0eS5zbGljZShiYWNrZ3JvdW5kUHJvcGVydHlMZW5ndGgpO1xuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSGV4Q29sb3IoYmFja2dyb3VuZENvbG9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSAke2h1bWFuaXplTnVtYmVyKGxpbmVJbmRleCArIDEpfSBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IGEgdmFsaWQgaGV4IGNvbG9yLmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IHRoZSBwb3NzaWJsZSB0ZXh0IGNvbG9yLlxuICAgICAgICAgICAgY29uc3Qgc2Vjb25kUHJvcGVydHkgPSBsaW5lc1tsaW5lSW5kZXggKyAyXTtcbiAgICAgICAgICAgIGlmICghc2Vjb25kUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKGBUaGUgJHtodW1hbml6ZU51bWJlcihsaW5lSW5kZXggKyAyKX0gbGluZSBvZiB0aGUgY29sb3Igc2NoZW1lIFwiJHtuYW1lfVwiIGlzIG5vdCBkZWZpbmVkLmApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyB0ZXh0IGNvbG9yLlxuICAgICAgICAgICAgaWYgKCFzZWNvbmRQcm9wZXJ0eS5zdGFydHNXaXRoKCd0ZXh0OiAnKSkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSAke2h1bWFuaXplTnVtYmVyKGxpbmVJbmRleCArIDIpfSBsaW5lIG9mIHRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaXMgbm90IHRleHQtY29sb3IgcHJvcGVydHkuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZXh0IGNvbG9yIGFuZCBjaGVjayBpZiBpdCBpcyBhIHZhbGlkIGhleCBjb2xvci5cbiAgICAgICAgICAgIGNvbnN0IHRleHRDb2xvciA9IHNlY29uZFByb3BlcnR5LnNsaWNlKHRleHRQcm9wZXJ0eUxlbmd0aCk7XG4gICAgICAgICAgICBpZiAoIWlzVmFsaWRIZXhDb2xvcih0ZXh0Q29sb3IpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dFcnJvcihgVGhlICR7aHVtYW5pemVOdW1iZXIobGluZUluZGV4ICsgMil9IGxpbmUgb2YgdGhlIGNvbG9yIHNjaGVtZSBcIiR7bmFtZX1cIiBpcyBub3QgYSB2YWxpZCBoZXggY29sb3IuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgdGhlIHZhcmlhbnQgaXMgdGhlIHNlY29uZCB2YXJpYW50LCB0aGVuIHdlIHdpbGwgcmV0dXJuIHRoZSB2YXJpYW50IGFuZCB0aGUgdmFyaWFudCBuYW1lLlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3IsXG4gICAgICAgICAgICAgICAgdGV4dENvbG9yLFxuICAgICAgICAgICAgICAgIHZhcmlhbnQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGZpcnN0VmFyaWFudCA9IGNoZWNrVmFyaWFudCgyLCBmYWxzZSkhO1xuICAgICAgICBjb25zdCBpc0ZpcnN0VmFyaWFudExpZ2h0ID0gZmlyc3RWYXJpYW50LnZhcmlhbnQgPT09ICdMSUdIVCc7XG4gICAgICAgIGRlbGV0ZSBmaXJzdFZhcmlhbnQudmFyaWFudDtcbiAgICAgICAgLy8gSWYgdGhlIGludGVycnVwdCB2YXJpYWJsZSBpcyBzZXQsIHdlIHNob3VsZCBzdG9wIHBhcnNpbmcuXG4gICAgICAgIGlmIChpbnRlcnJ1cHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2Vjb25kVmFyaWFudDogdHlwZW9mIGZpcnN0VmFyaWFudCB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgaXNTZWNvbmRWYXJpYW50TGlnaHQgPSBmYWxzZTtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIDd0aCBsaW5lIGlzIGRlZmluZWQgb3RoZXJ3aXNlIHdlIHNob3VsZCBzdG9wIHBhcnNpbmcuXG4gICAgICAgIGlmIChsaW5lc1s2XSkge1xuICAgICAgICAgICAgc2Vjb25kVmFyaWFudCA9IGNoZWNrVmFyaWFudCg2LCB0cnVlKSE7XG4gICAgICAgICAgICBpc1NlY29uZFZhcmlhbnRMaWdodCA9IHNlY29uZFZhcmlhbnQudmFyaWFudCA9PT0gJ0xJR0hUJztcbiAgICAgICAgICAgIGRlbGV0ZSBzZWNvbmRWYXJpYW50LnZhcmlhbnQ7XG4gICAgICAgICAgICAvLyBJZiB0aGUgaW50ZXJydXB0IHZhcmlhYmxlIGlzIHNldCwgd2Ugc2hvdWxkIHN0b3AgcGFyc2luZy5cbiAgICAgICAgICAgIGlmIChpbnRlcnJ1cHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNdXN0IGVuZCB3aXRoIDEgbmV3IGxpbmUodHdvIFZhcmlhbnRzKS5cbiAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxMSB8fCBsaW5lc1s5XSB8fCBsaW5lc1sxMF0pIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKGBUaGUgY29sb3Igc2NoZW1lIFwiJHtuYW1lfVwiIGRvZXNuJ3QgZW5kIHdpdGggMSBuZXcgbGluZS5gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobGluZXMubGVuZ3RoID4gNykge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihgVGhlIGNvbG9yIHNjaGVtZSBcIiR7bmFtZX1cIiBkb2Vzbid0IGVuZCB3aXRoIDEgbmV3IGxpbmUuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlY29uZFZhcmlhbnQpIHtcbiAgICAgICAgICAgIGlmIChpc0ZpcnN0VmFyaWFudExpZ2h0ID09PSBpc1NlY29uZFZhcmlhbnRMaWdodCkge1xuICAgICAgICAgICAgICAgIHRocm93RXJyb3IoYFRoZSBjb2xvciBzY2hlbWUgXCIke25hbWV9XCIgaGFzIHRoZSBzYW1lIHZhcmlhbnQgdHdpY2UuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRmlyc3RWYXJpYW50TGlnaHQpIHtcbiAgICAgICAgICAgICAgICBkZWZpbmVkQ29sb3JTY2hlbWVzLmxpZ2h0W25hbWVdID0gZmlyc3RWYXJpYW50O1xuICAgICAgICAgICAgICAgIGRlZmluZWRDb2xvclNjaGVtZXMuZGFya1tuYW1lXSA9IHNlY29uZFZhcmlhbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmluZWRDb2xvclNjaGVtZXMubGlnaHRbbmFtZV0gPSBzZWNvbmRWYXJpYW50O1xuICAgICAgICAgICAgICAgIGRlZmluZWRDb2xvclNjaGVtZXMuZGFya1tuYW1lXSA9IGZpcnN0VmFyaWFudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0ZpcnN0VmFyaWFudExpZ2h0KSB7XG4gICAgICAgICAgICBkZWZpbmVkQ29sb3JTY2hlbWVzLmxpZ2h0W25hbWVdID0gZmlyc3RWYXJpYW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmaW5lZENvbG9yU2NoZW1lcy5kYXJrW25hbWVdID0gZmlyc3RWYXJpYW50O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge3Jlc3VsdDogZGVmaW5lZENvbG9yU2NoZW1lcywgZXJyb3I6IGVycm9yfTtcbn1cbiIsImltcG9ydCB7REVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9USEVNRX0gZnJvbSAnLi4vZGVmYXVsdHMnO1xuaW1wb3J0IHR5cGUge1VzZXJTZXR0aW5ncywgVGhlbWUsIFRoZW1lUHJlc2V0LCBDdXN0b21TaXRlQ29uZmlnLCBUaW1lU2V0dGluZ3MsIExvY2F0aW9uU2V0dGluZ3MsIEF1dG9tYXRpb259IGZyb20gJy4uL2RlZmluaXRpb25zJztcblxuaW1wb3J0IHtBdXRvbWF0aW9uTW9kZX0gZnJvbSAnLi9hdXRvbWF0aW9uJztcblxuZnVuY3Rpb24gaXNCb29sZWFuKHg6IGFueSk6IHggaXMgYm9vbGVhbiB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnYm9vbGVhbic7XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QoeDogYW55KTogeCBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9IG51bGwgJiYgIUFycmF5LmlzQXJyYXkoeCk7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkoeDogYW55KSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoeCk7XG59XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHg6IGFueSk6IHggaXMgc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnO1xufVxuXG5mdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHg6IGFueSk6IHggaXMgc3RyaW5nIHtcbiAgICByZXR1cm4geCAmJiBpc1N0cmluZyh4KTtcbn1cblxuZnVuY3Rpb24gaXNOb25FbXB0eUFycmF5T2ZOb25FbXB0eVN0cmluZ3MoeDogYW55KTogeCBpcyBhbnlbXSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoeCkgJiYgeC5sZW5ndGggPiAwICYmIHguZXZlcnkoKHMpID0+IGlzTm9uRW1wdHlTdHJpbmcocykpO1xufVxuXG5mdW5jdGlvbiBpc1JlZ0V4cE1hdGNoKHJlZ2V4cDogUmVnRXhwKSB7XG4gICAgcmV0dXJuICh4OiBhbnkpOiB4IGlzIHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiBpc1N0cmluZyh4KSAmJiB4Lm1hdGNoKHJlZ2V4cCkgIT0gbnVsbDtcbiAgICB9O1xufVxuXG5jb25zdCBpc1RpbWUgPSBpc1JlZ0V4cE1hdGNoKC9eKCgwP1swLTldKXwoMVswLTldKXwoMlswLTNdKSk6KFswLTVdWzAtOV0pJC8pO1xuZnVuY3Rpb24gaXNOdW1iZXIoeDogYW55KTogeCBpcyBudW1iZXIge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHgpO1xufVxuXG5mdW5jdGlvbiBpc051bWJlckJldHdlZW4obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgcmV0dXJuICh4OiBhbnkpOiB4IGlzIG51bWJlciA9PiB7XG4gICAgICAgIHJldHVybiBpc051bWJlcih4KSAmJiB4ID49IG1pbiAmJiB4IDw9IG1heDtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBpc09uZU9mKC4uLnZhbHVlczogYW55W10pIHtcbiAgICByZXR1cm4gKHg6IGFueSkgPT4gdmFsdWVzLmluY2x1ZGVzKHgpO1xufVxuXG5mdW5jdGlvbiBoYXNSZXF1aXJlZFByb3BlcnRpZXM8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+PihvYmo6IFQsIGtleXM6IEFycmF5PGtleW9mIFQ+KSB7XG4gICAgcmV0dXJuIGtleXMuZXZlcnkoKGtleSkgPT4gb2JqLmhhc093blByb3BlcnR5KGtleSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWYWxpZGF0b3IoKSB7XG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVQcm9wZXJ0eTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+KG9iajogVCwga2V5OiBrZXlvZiBULCB2YWxpZGF0b3I6ICh4OiBhbnkpID0+IGJvb2xlYW4sIGZhbGxiYWNrOiBUKSB7XG4gICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGtleSkgfHwgdmFsaWRhdG9yKG9ialtrZXldKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVycm9ycy5wdXNoKGBVbmV4cGVjdGVkIHZhbHVlIGZvciBcIiR7a2V5IGFzIHN0cmluZ31cIjogJHtKU09OLnN0cmluZ2lmeShvYmpba2V5XSl9YCk7XG4gICAgICAgIG9ialtrZXldID0gZmFsbGJhY2tba2V5XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5PFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgVj4ob2JqOiBULCBrZXk6IGtleW9mIFQsIHZhbGlkYXRvcjogKHg6IFYpID0+IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdyb25nVmFsdWVzID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBhcnI6IGFueVtdID0gb2JqW2tleV0gYXMgYW55O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0b3IoYXJyW2ldKSkge1xuICAgICAgICAgICAgICAgIHdyb25nVmFsdWVzLmFkZChhcnJbaV0pO1xuICAgICAgICAgICAgICAgIGFyci5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh3cm9uZ1ZhbHVlcy5zaXplID4gMCkge1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goYEFycmF5IFwiJHtrZXkgYXMgc3RyaW5nfVwiIGhhcyB3cm9uZyB2YWx1ZXM6ICR7QXJyYXkuZnJvbSh3cm9uZ1ZhbHVlcykubWFwKCh2KSA9PiBKU09OLnN0cmluZ2lmeSh2KSkuam9pbignOyAnKX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7dmFsaWRhdGVQcm9wZXJ0eSwgdmFsaWRhdGVBcnJheSwgZXJyb3JzfTtcbn1cblxuaW50ZXJmYWNlIFNldHRpbmdWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBzZXR0aW5nczogUGFydGlhbDxVc2VyU2V0dGluZ3M+O1xuICAgIGVycm9yczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBQYXJ0aWFsPFVzZXJTZXR0aW5ncz4pOiBTZXR0aW5nVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHNldHRpbmdzKSkge1xuICAgICAgICByZXR1cm4ge2Vycm9yczogWydTZXR0aW5ncyBhcmUgbm90IGEgcGxhaW4gb2JqZWN0J10sIHNldHRpbmdzOiBERUZBVUxUX1NFVFRJTkdTfTtcbiAgICB9XG5cbiAgICBjb25zdCB7dmFsaWRhdGVQcm9wZXJ0eSwgdmFsaWRhdGVBcnJheSwgZXJyb3JzfSA9IGNyZWF0ZVZhbGlkYXRvcigpO1xuICAgIGNvbnN0IGlzVmFsaWRQcmVzZXRUaGVtZSA9ICh0aGVtZTogVGhlbWUpID0+IHtcbiAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KHRoZW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHtlcnJvcnM6IHRoZW1lRXJyb3JzfSA9IHZhbGlkYXRlVGhlbWUodGhlbWUpO1xuICAgICAgICByZXR1cm4gdGhlbWVFcnJvcnMubGVuZ3RoID09PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0ZVByb3BlcnR5KHNldHRpbmdzLCAnc2NoZW1lVmVyc2lvbicsIGlzTnVtYmVyLCBERUZBVUxUX1NFVFRJTkdTKTtcblxuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdlbmFibGVkJywgaXNCb29sZWFuLCBERUZBVUxUX1NFVFRJTkdTKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHNldHRpbmdzLCAnZmV0Y2hOZXdzJywgaXNCb29sZWFuLCBERUZBVUxUX1NFVFRJTkdTKTtcblxuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICd0aGVtZScsIGlzUGxhaW5PYmplY3QsIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIGNvbnN0IHtlcnJvcnM6IHRoZW1lRXJyb3JzfSA9IHZhbGlkYXRlVGhlbWUoc2V0dGluZ3MudGhlbWUpO1xuICAgIGVycm9ycy5wdXNoKC4uLnRoZW1lRXJyb3JzKTtcblxuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdwcmVzZXRzJywgaXNBcnJheSwgREVGQVVMVF9TRVRUSU5HUyk7XG4gICAgdmFsaWRhdGVBcnJheShzZXR0aW5ncywgJ3ByZXNldHMnLCAocHJlc2V0OiBUaGVtZVByZXNldCkgPT4ge1xuICAgICAgICBjb25zdCBwcmVzZXRWYWxpZGF0b3IgPSBjcmVhdGVWYWxpZGF0b3IoKTtcbiAgICAgICAgaWYgKCEoaXNQbGFpbk9iamVjdChwcmVzZXQpICYmIGhhc1JlcXVpcmVkUHJvcGVydGllcyhwcmVzZXQsIFsnaWQnLCAnbmFtZScsICd1cmxzJywgJ3RoZW1lJ10pKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHByZXNldFZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KHByZXNldCwgJ2lkJywgaXNOb25FbXB0eVN0cmluZywgcHJlc2V0KTtcbiAgICAgICAgcHJlc2V0VmFsaWRhdG9yLnZhbGlkYXRlUHJvcGVydHkocHJlc2V0LCAnbmFtZScsIGlzTm9uRW1wdHlTdHJpbmcsIHByZXNldCk7XG4gICAgICAgIHByZXNldFZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KHByZXNldCwgJ3VybHMnLCBpc05vbkVtcHR5QXJyYXlPZk5vbkVtcHR5U3RyaW5ncywgcHJlc2V0KTtcbiAgICAgICAgcHJlc2V0VmFsaWRhdG9yLnZhbGlkYXRlUHJvcGVydHkocHJlc2V0LCAndGhlbWUnLCBpc1ZhbGlkUHJlc2V0VGhlbWUsIHByZXNldCk7XG4gICAgICAgIHJldHVybiBwcmVzZXRWYWxpZGF0b3IuZXJyb3JzLmxlbmd0aCA9PT0gMDtcbiAgICB9KTtcblxuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdjdXN0b21UaGVtZXMnLCBpc0FycmF5LCBERUZBVUxUX1NFVFRJTkdTKTtcbiAgICB2YWxpZGF0ZUFycmF5KHNldHRpbmdzLCAnY3VzdG9tVGhlbWVzJywgKGN1c3RvbTogQ3VzdG9tU2l0ZUNvbmZpZykgPT4ge1xuICAgICAgICBpZiAoIShpc1BsYWluT2JqZWN0KGN1c3RvbSkgJiYgaGFzUmVxdWlyZWRQcm9wZXJ0aWVzKGN1c3RvbSwgWyd1cmwnLCAndGhlbWUnXSkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJlc2V0VmFsaWRhdG9yID0gY3JlYXRlVmFsaWRhdG9yKCk7XG4gICAgICAgIHByZXNldFZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KGN1c3RvbSwgJ3VybCcsIGlzTm9uRW1wdHlBcnJheU9mTm9uRW1wdHlTdHJpbmdzLCBjdXN0b20pO1xuICAgICAgICBwcmVzZXRWYWxpZGF0b3IudmFsaWRhdGVQcm9wZXJ0eShjdXN0b20sICd0aGVtZScsIGlzVmFsaWRQcmVzZXRUaGVtZSwgY3VzdG9tKTtcbiAgICAgICAgcmV0dXJuIHByZXNldFZhbGlkYXRvci5lcnJvcnMubGVuZ3RoID09PSAwO1xuICAgIH0pO1xuXG4gICAgdmFsaWRhdGVQcm9wZXJ0eShzZXR0aW5ncywgJ2VuYWJsZWRGb3InLCBpc0FycmF5LCBERUZBVUxUX1NFVFRJTkdTKTtcbiAgICB2YWxpZGF0ZUFycmF5KHNldHRpbmdzLCAnZW5hYmxlZEZvcicsIGlzTm9uRW1wdHlTdHJpbmcpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdkaXNhYmxlZEZvcicsIGlzQXJyYXksIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlQXJyYXkoc2V0dGluZ3MsICdkaXNhYmxlZEZvcicsIGlzTm9uRW1wdHlTdHJpbmcpO1xuXG4gICAgdmFsaWRhdGVQcm9wZXJ0eShzZXR0aW5ncywgJ2VuYWJsZWRCeURlZmF1bHQnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdjaGFuZ2VCcm93c2VyVGhlbWUnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdzeW5jU2V0dGluZ3MnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdzeW5jU2l0ZXNGaXhlcycsIGlzQm9vbGVhbiwgREVGQVVMVF9TRVRUSU5HUyk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eShzZXR0aW5ncywgJ2F1dG9tYXRpb24nLCAoYXV0b21hdGlvbjogQXV0b21hdGlvbikgPT4ge1xuICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoYXV0b21hdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF1dG9tYXRpb25WYWxpZGF0b3IgPSBjcmVhdGVWYWxpZGF0b3IoKTtcbiAgICAgICAgYXV0b21hdGlvblZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KGF1dG9tYXRpb24sICdlbmFibGVkJywgaXNCb29sZWFuLCBhdXRvbWF0aW9uKTtcbiAgICAgICAgYXV0b21hdGlvblZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KGF1dG9tYXRpb24sICdtb2RlJywgaXNPbmVPZihBdXRvbWF0aW9uTW9kZS5TWVNURU0sIEF1dG9tYXRpb25Nb2RlLlRJTUUsIEF1dG9tYXRpb25Nb2RlLkxPQ0FUSU9OLCBBdXRvbWF0aW9uTW9kZS5OT05FKSwgYXV0b21hdGlvbik7XG4gICAgICAgIGF1dG9tYXRpb25WYWxpZGF0b3IudmFsaWRhdGVQcm9wZXJ0eShhdXRvbWF0aW9uLCAnYmVoYXZpb3InLCBpc09uZU9mKCdPbk9mZicsICdTY2hlbWUnKSwgYXV0b21hdGlvbik7XG4gICAgICAgIHJldHVybiBhdXRvbWF0aW9uVmFsaWRhdG9yLmVycm9ycy5sZW5ndGggPT09IDA7XG4gICAgfSwgREVGQVVMVF9TRVRUSU5HUyk7XG5cbiAgICB2YWxpZGF0ZVByb3BlcnR5KHNldHRpbmdzLCBBdXRvbWF0aW9uTW9kZS5USU1FLCAodGltZTogVGltZVNldHRpbmdzKSA9PiB7XG4gICAgICAgIGlmICghaXNQbGFpbk9iamVjdCh0aW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpbWVWYWxpZGF0b3IgPSBjcmVhdGVWYWxpZGF0b3IoKTtcbiAgICAgICAgdGltZVZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KHRpbWUsICdhY3RpdmF0aW9uJywgaXNUaW1lLCB0aW1lKTtcbiAgICAgICAgdGltZVZhbGlkYXRvci52YWxpZGF0ZVByb3BlcnR5KHRpbWUsICdkZWFjdGl2YXRpb24nLCBpc1RpbWUsIHRpbWUpO1xuICAgICAgICByZXR1cm4gdGltZVZhbGlkYXRvci5lcnJvcnMubGVuZ3RoID09PSAwO1xuICAgIH0sIERFRkFVTFRfU0VUVElOR1MpO1xuXG4gICAgdmFsaWRhdGVQcm9wZXJ0eShzZXR0aW5ncywgQXV0b21hdGlvbk1vZGUuTE9DQVRJT04sIChsb2NhdGlvbjogTG9jYXRpb25TZXR0aW5ncykgPT4ge1xuICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QobG9jYXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9jVmFsaWRhdG9yID0gY3JlYXRlVmFsaWRhdG9yKCk7XG4gICAgICAgIGNvbnN0IGlzVmFsaWRMb2MgPSAoeDogYW55KSA9PiB4ID09PSBudWxsIHx8IGlzTnVtYmVyKHgpO1xuICAgICAgICBsb2NWYWxpZGF0b3IudmFsaWRhdGVQcm9wZXJ0eShsb2NhdGlvbiwgJ2xhdGl0dWRlJywgaXNWYWxpZExvYywgbG9jYXRpb24pO1xuICAgICAgICBsb2NWYWxpZGF0b3IudmFsaWRhdGVQcm9wZXJ0eShsb2NhdGlvbiwgJ2xvbmdpdHVkZScsIGlzVmFsaWRMb2MsIGxvY2F0aW9uKTtcbiAgICAgICAgcmV0dXJuIGxvY1ZhbGlkYXRvci5lcnJvcnMubGVuZ3RoID09PSAwO1xuICAgIH0sIERFRkFVTFRfU0VUVElOR1MpO1xuXG4gICAgdmFsaWRhdGVQcm9wZXJ0eShzZXR0aW5ncywgJ3ByZXZpZXdOZXdEZXNpZ24nLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdwcmV2aWV3TmV3ZXN0RGVzaWduJywgaXNCb29sZWFuLCBERUZBVUxUX1NFVFRJTkdTKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHNldHRpbmdzLCAnZW5hYmxlRm9yUERGJywgaXNCb29sZWFuLCBERUZBVUxUX1NFVFRJTkdTKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHNldHRpbmdzLCAnZW5hYmxlRm9yUHJvdGVjdGVkUGFnZXMnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdlbmFibGVDb250ZXh0TWVudXMnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkoc2V0dGluZ3MsICdkZXRlY3REYXJrVGhlbWUnLCBpc0Jvb2xlYW4sIERFRkFVTFRfU0VUVElOR1MpO1xuXG4gICAgcmV0dXJuIHtlcnJvcnMsIHNldHRpbmdzfTtcbn1cblxuaW50ZXJmYWNlIFRoZW1lVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgdGhlbWU6IFBhcnRpYWw8VGhlbWU+O1xuICAgIGVycm9yczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRoZW1lKHRoZW1lOiBQYXJ0aWFsPFRoZW1lPiB8IG51bGwgfCB1bmRlZmluZWQpOiBUaGVtZVZhbGlkYXRpb25SZXN1bHQge1xuICAgIGlmICghaXNQbGFpbk9iamVjdCh0aGVtZSkpIHtcbiAgICAgICAgcmV0dXJuIHtlcnJvcnM6IFsnVGhlbWUgaXMgbm90IGEgcGxhaW4gb2JqZWN0J10sIHRoZW1lOiBERUZBVUxUX1RIRU1FfTtcbiAgICB9XG5cbiAgICBjb25zdCB7dmFsaWRhdGVQcm9wZXJ0eSwgZXJyb3JzfSA9IGNyZWF0ZVZhbGlkYXRvcigpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICdtb2RlJywgaXNPbmVPZigwLCAxKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ2JyaWdodG5lc3MnLCBpc051bWJlckJldHdlZW4oMCwgMjAwKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ2NvbnRyYXN0JywgaXNOdW1iZXJCZXR3ZWVuKDAsIDIwMCksIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICdncmF5c2NhbGUnLCBpc051bWJlckJldHdlZW4oMCwgMTAwKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ3NlcGlhJywgaXNOdW1iZXJCZXR3ZWVuKDAsIDEwMCksIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICd1c2VGb250JywgaXNCb29sZWFuLCBERUZBVUxUX1RIRU1FKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHRoZW1lLCAnZm9udEZhbWlseScsIGlzTm9uRW1wdHlTdHJpbmcsIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICd0ZXh0U3Ryb2tlJywgaXNOdW1iZXJCZXR3ZWVuKDAsIDEpLCBERUZBVUxUX1RIRU1FKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHRoZW1lLCAnZW5naW5lJywgaXNPbmVPZignZHluYW1pY1RoZW1lJywgJ3N0YXRpY1RoZW1lJywgJ2Nzc0ZpbHRlcicsICdzdmdGaWx0ZXInKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ3N0eWxlc2hlZXQnLCBpc1N0cmluZywgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ2RhcmtTY2hlbWVCYWNrZ3JvdW5kQ29sb3InLCBpc1JlZ0V4cE1hdGNoKC9eI1swLTlhLWZdezZ9JC9pKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ2RhcmtTY2hlbWVUZXh0Q29sb3InLCBpc1JlZ0V4cE1hdGNoKC9eI1swLTlhLWZdezZ9JC9pKSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ2xpZ2h0U2NoZW1lQmFja2dyb3VuZENvbG9yJywgaXNSZWdFeHBNYXRjaCgvXiNbMC05YS1mXXs2fSQvaSksIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICdsaWdodFNjaGVtZVRleHRDb2xvcicsIGlzUmVnRXhwTWF0Y2goL14jWzAtOWEtZl17Nn0kL2kpLCBERUZBVUxUX1RIRU1FKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHRoZW1lLCAnc2Nyb2xsYmFyQ29sb3InLCAoeDogYW55KSA9PiB4ID09PSAnJyB8fCBpc1JlZ0V4cE1hdGNoKC9eKGF1dG8pfCgjWzAtOWEtZl17Nn0pJC9pKSh4KSwgREVGQVVMVF9USEVNRSk7XG4gICAgdmFsaWRhdGVQcm9wZXJ0eSh0aGVtZSwgJ3NlbGVjdGlvbkNvbG9yJywgaXNSZWdFeHBNYXRjaCgvXihhdXRvKXwoI1swLTlhLWZdezZ9KSQvaSksIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICdzdHlsZVN5c3RlbUNvbnRyb2xzJywgaXNCb29sZWFuLCBERUZBVUxUX1RIRU1FKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHRoZW1lLCAnbGlnaHRDb2xvclNjaGVtZScsIGlzTm9uRW1wdHlTdHJpbmcsIERFRkFVTFRfVEhFTUUpO1xuICAgIHZhbGlkYXRlUHJvcGVydHkodGhlbWUsICdkYXJrQ29sb3JTY2hlbWUnLCBpc05vbkVtcHR5U3RyaW5nLCBERUZBVUxUX1RIRU1FKTtcbiAgICB2YWxpZGF0ZVByb3BlcnR5KHRoZW1lLCAnaW1tZWRpYXRlTW9kaWZ5JywgaXNCb29sZWFuLCBERUZBVUxUX1RIRU1FKTtcblxuICAgIHJldHVybiB7ZXJyb3JzLCB0aGVtZX07XG59XG4iLCJkZWNsYXJlIGNvbnN0IF9fREVCVUdfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19MT0dfXzogJ2luZm8nIHwgJ3dhcm4nIHwgJ2Fzc2VydCc7XG5cbmxldCBzb2NrZXQ6IFdlYlNvY2tldCB8IG51bGwgPSBudWxsO1xubGV0IG1lc3NhZ2VRdWV1ZTogc3RyaW5nW10gPSBbXTtcbmZ1bmN0aW9uIGNyZWF0ZVNvY2tldCgpOiB2b2lkIHtcbiAgICBpZiAoc29ja2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV3U29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3M6Ly9sb2NhbGhvc3Q6JHs5MDAwfWApO1xuICAgIHNvY2tldCA9IG5ld1NvY2tldDtcbiAgICBuZXdTb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsICgpID0+IHtcbiAgICAgICAgbWVzc2FnZVF1ZXVlLmZvckVhY2goKG1lc3NhZ2UpID0+IG5ld1NvY2tldC5zZW5kKG1lc3NhZ2UpKTtcbiAgICAgICAgbWVzc2FnZVF1ZXVlID0gW107XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZW5kTG9nKGxldmVsOiAnaW5mbycgfCAnd2FybicgfCAnYXNzZXJ0JywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoIV9fREVCVUdfXyB8fCAhX19MT0dfXykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7bGV2ZWwsIGxvZzogYXJnc30pO1xuICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LnJlYWR5U3RhdGUgPT09IHNvY2tldC5PUEVOKSB7XG4gICAgICAgIHNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWF0ZVNvY2tldCgpO1xuICAgICAgICBtZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge3NlbmRMb2d9IGZyb20gJy4vc2VuZExvZyc7XG5cbmRlY2xhcmUgY29uc3QgX19ERUJVR19fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0luZm8oLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoX19ERUJVR19fKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyguLi5hcmdzKTtcbiAgICAgICAgc2VuZExvZygnaW5mbycsIGFyZ3MpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1dhcm4oLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoX19ERUJVR19fKSB7XG4gICAgICAgIGNvbnNvbGUud2FybiguLi5hcmdzKTtcbiAgICAgICAgc2VuZExvZygnd2FybicsIGFyZ3MpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0luZm9Db2xsYXBzZWQodGl0bGU6IHN0cmluZywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoX19ERUJVR19fKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQodGl0bGUpO1xuICAgICAgICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICBzZW5kTG9nKCdpbmZvJywgYXJncyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2dBc3NlcnQoLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoKF9fVEVTVF9fIHx8IF9fREVCVUdfXykpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQoLi4uYXJncyk7XG4gICAgICAgIHNlbmRMb2coJ2Fzc2VydCcsIC4uLmFyZ3MpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFTU0VSVChkZXNjcmlwdGlvbjogc3RyaW5nLCBjb25kaXRpb246ICgoKSA9PiBib29sZWFuKSB8IGFueSk6IHZvaWQge1xuICAgIGlmICgoX19URVNUX18gfHwgX19ERUJVR19fKSAmJiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJiAhY29uZGl0aW9uKCkpIHx8ICFjb25kaXRpb24pIHtcbiAgICAgICAgbG9nQXNzZXJ0KGRlc2NyaXB0aW9uKTtcbiAgICAgICAgaWYgKF9fVEVTVF9fKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbiBmYWlsZWQ6ICR7ZGVzY3JpcHRpb259YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge1RoZW1lRW5naW5lfSBmcm9tICcuLi9nZW5lcmF0b3JzL3RoZW1lLWVuZ2luZXMnO1xuaW1wb3J0IHtERUZBVUxUX1NFVFRJTkdTLCBERUZBVUxUX1RIRU1FfSBmcm9tICcuLi9kZWZhdWx0cyc7XG5pbXBvcnQgdHlwZSB7VXNlclNldHRpbmdzfSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi91dGlscy9kZWJvdW5jZSc7XG5pbXBvcnQge1Byb21pc2VCYXJyaWVyfSBmcm9tICcuLi91dGlscy9wcm9taXNlLWJhcnJpZXInO1xuaW1wb3J0IHtpc1VSTE1hdGNoZWR9IGZyb20gJy4uL3V0aWxzL3VybCc7XG5pbXBvcnQge3ZhbGlkYXRlU2V0dGluZ3N9IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRpb24nO1xuXG5pbXBvcnQge3JlYWRTeW5jU3RvcmFnZSwgcmVhZExvY2FsU3RvcmFnZSwgd3JpdGVTeW5jU3RvcmFnZSwgd3JpdGVMb2NhbFN0b3JhZ2UsIHJlbW92ZVN5bmNTdG9yYWdlLCByZW1vdmVMb2NhbFN0b3JhZ2V9IGZyb20gJy4vdXRpbHMvZXh0ZW5zaW9uLWFwaSc7XG5pbXBvcnQge2xvZ1dhcm59IGZyb20gJy4vdXRpbHMvbG9nJztcblxuXG5jb25zdCBTQVZFX1RJTUVPVVQgPSAxMDAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyU3RvcmFnZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbG9hZEJhcnJpZXI6IFByb21pc2VCYXJyaWVyPFVzZXJTZXR0aW5ncywgdm9pZD47XG4gICAgcHJpdmF0ZSBzdGF0aWMgc2F2ZVN0b3JhZ2VCYXJyaWVyOiBQcm9taXNlQmFycmllcjx2b2lkLCB2b2lkPiB8IG51bGw7XG4gICAgc3RhdGljIHNldHRpbmdzOiBSZWFkb25seTxVc2VyU2V0dGluZ3M+O1xuXG4gICAgc3RhdGljIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCFVc2VyU3RvcmFnZS5zZXR0aW5ncykge1xuICAgICAgICAgICAgVXNlclN0b3JhZ2Uuc2V0dGluZ3MgPSBhd2FpdCBVc2VyU3RvcmFnZS5sb2FkU2V0dGluZ3NGcm9tU3RvcmFnZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmlsbERlZmF1bHRzKHNldHRpbmdzOiBVc2VyU2V0dGluZ3MpIHtcbiAgICAgICAgc2V0dGluZ3MudGhlbWUgPSB7Li4uREVGQVVMVF9USEVNRSwgLi4uc2V0dGluZ3MudGhlbWV9O1xuICAgICAgICBzZXR0aW5ncy50aW1lID0gey4uLkRFRkFVTFRfU0VUVElOR1MudGltZSwgLi4uc2V0dGluZ3MudGltZX07XG4gICAgICAgIHNldHRpbmdzLnByZXNldHMuZm9yRWFjaCgocHJlc2V0KSA9PiB7XG4gICAgICAgICAgICBwcmVzZXQudGhlbWUgPSB7Li4uREVGQVVMVF9USEVNRSwgLi4ucHJlc2V0LnRoZW1lfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldHRpbmdzLmN1c3RvbVRoZW1lcy5mb3JFYWNoKChzaXRlKSA9PiB7XG4gICAgICAgICAgICBzaXRlLnRoZW1lID0gey4uLkRFRkFVTFRfVEhFTUUsIC4uLnNpdGUudGhlbWV9O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNldHRpbmdzLmN1c3RvbVRoZW1lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHNldHRpbmdzLmN1c3RvbVRoZW1lcyA9IERFRkFVTFRfU0VUVElOR1MuY3VzdG9tVGhlbWVzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWlncmF0ZUF1dG9tYXRpb25TZXR0aW5ncyBtaWdyYXRlcyBvbGQgYXV0b21hdGlvbiBzZXR0aW5ncyB0byB0aGUgbmV3IGludGVyZmFjZS5cbiAgICAvLyBJdCB3aWxsIG1vdmUgc2V0dGluZ3MuYXV0b21hdGlvbiAmIHNldHRpbmdzLmF1dG9tYXRpb25CZWhhdmlvciBpbnRvLFxuICAgIC8vIHNldHRpbmdzLmF1dG9tYXRpb24gPSB7IGVuYWJsZWQsIG1vZGUsIGJlaGF2aW9yIH0uXG4gICAgLy8gUmVtb3ZlIHRoaXMgb3ZlciB0d28geWVhcnMobWlkLTIwMjQpLlxuICAgIC8vIFRoaXMgd29uJ3QgYWx3YXlzIHdvcmssIGJlY2F1c2UgYnJvd3NlcnMgY2FuIGRlY2lkZSB0byBpbnN0ZWFkIHVzZSB0aGUgZGVmYXVsdCBzZXR0aW5nc1xuICAgIC8vIHdoZW4gdGhleSBub3RpY2UgYSBkaWZmZXJlbnQgdHlwZSBiZWluZyByZXF1ZXN0ZWQgZm9yIGF1dG9tYXRpb24sIGluIHRoYXQgY2FzZSBpdCdzIGEgZGF0YS1sb3NzXG4gICAgLy8gYW5kIG5vdCBzb21ldGhpbmcgd2UgY2FuIGVuY291bnRlciBmb3IsIGV4Y2VwdCBmb3IgZG9pbmcgYWx3YXlzIHR3byBleHRyYSByZXF1ZXN0cyB0byBleHBsaWNpdGx5XG4gICAgLy8gY2hlY2sgZm9yIHRoaXMgY2FzZSB3aGljaCBpcyBpbmVmZmljaWVudCB1c2FnZSBvZiByZXF1ZXN0aW5nIHN0b3JhZ2UuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbWlncmF0ZUF1dG9tYXRpb25TZXR0aW5ncyhzZXR0aW5nczogVXNlclNldHRpbmdzKTogdm9pZCB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuYXV0b21hdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnN0IGF1dG9tYXRpb25Nb2RlID0gc2V0dGluZ3MuYXV0b21hdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGF1dG9tYXRpb25CZWhhdmlvcjogVXNlclNldHRpbmdzWydhdXRvbWF0aW9uJ11bJ2JlaGF2aW9yJ10gPSAoc2V0dGluZ3MgYXMgYW55KS5hdXRvbWF0aW9uQmVoYXZpb3VyO1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmF1dG9tYXRpb24gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXV0b21hdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IGF1dG9tYXRpb25Nb2RlLFxuICAgICAgICAgICAgICAgICAgICBiZWhhdmlvcjogYXV0b21hdGlvbkJlaGF2aW9yLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmF1dG9tYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IGF1dG9tYXRpb25Nb2RlLFxuICAgICAgICAgICAgICAgICAgICBiZWhhdmlvcjogYXV0b21hdGlvbkJlaGF2aW9yLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgKHNldHRpbmdzIGFzIGFueSkuYXV0b21hdGlvbkJlaGF2aW91cjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIG1pZ3JhdGVTaXRlTGlzdHNWMihkZXByZWNhdGVkOiBhbnkpOiBQYXJ0aWFsPFVzZXJTZXR0aW5ncz4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUGFydGlhbDxVc2VyU2V0dGluZ3M+ID0ge307XG4gICAgICAgIHNldHRpbmdzLmVuYWJsZWRCeURlZmF1bHQgPSAhZGVwcmVjYXRlZC5hcHBseVRvTGlzdGVkT25seTtcbiAgICAgICAgaWYgKHNldHRpbmdzLmVuYWJsZWRCeURlZmF1bHQpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLmRpc2FibGVkRm9yID0gZGVwcmVjYXRlZC5zaXRlTGlzdCA/PyBbXTtcbiAgICAgICAgICAgIHNldHRpbmdzLmVuYWJsZWRGb3IgPSBkZXByZWNhdGVkLnNpdGVMaXN0RW5hYmxlZCA/PyBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldHRpbmdzLmRpc2FibGVkRm9yID0gW107XG4gICAgICAgICAgICBzZXR0aW5ncy5lbmFibGVkRm9yID0gZGVwcmVjYXRlZC5zaXRlTGlzdCA/PyBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbWlncmF0ZUJ1aWx0SW5TVkdGaWx0ZXJUb0NTU0ZpbHRlcihzZXR0aW5nczogVXNlclNldHRpbmdzKTogdm9pZCB7XG4gICAgICAgIHNldHRpbmdzPy5jdXN0b21UaGVtZXM/LmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjPy50aGVtZT8uZW5naW5lID09PSBUaGVtZUVuZ2luZS5zdmdGaWx0ZXIgJiZcbiAgICAgICAgICAgICAgICAoYy5idWlsdEluIHx8IGMudXJsPy5pbmNsdWRlcygnZG9jcy5nb29nbGUuY29tJykpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjLnRoZW1lLmVuZ2luZSA9IFRoZW1lRW5naW5lLmNzc0ZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgbG9hZFNldHRpbmdzRnJvbVN0b3JhZ2UoKTogUHJvbWlzZTxVc2VyU2V0dGluZ3M+IHtcbiAgICAgICAgaWYgKFVzZXJTdG9yYWdlLmxvYWRCYXJyaWVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgVXNlclN0b3JhZ2UubG9hZEJhcnJpZXIuZW50cnkoKTtcbiAgICAgICAgfVxuICAgICAgICBVc2VyU3RvcmFnZS5sb2FkQmFycmllciA9IG5ldyBQcm9taXNlQmFycmllcigpO1xuXG4gICAgICAgIGxldCBsb2NhbCA9IGF3YWl0IHJlYWRMb2NhbFN0b3JhZ2UoREVGQVVMVF9TRVRUSU5HUyk7XG5cbiAgICAgICAgaWYgKGxvY2FsLnNjaGVtZVZlcnNpb24gPCAyKSB7XG4gICAgICAgICAgICBjb25zdCBzeW5jID0gYXdhaXQgcmVhZFN5bmNTdG9yYWdlKHtzY2hlbWVWZXJzaW9uOiAwfSk7XG4gICAgICAgICAgICBpZiAoIXN5bmMgfHwgc3luYy5zY2hlbWVWZXJzaW9uIDwgMikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlcHJlY2F0ZWREZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2l0ZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBzaXRlTGlzdEVuYWJsZWQ6IFtdLFxuICAgICAgICAgICAgICAgICAgICBhcHBseVRvTGlzdGVkT25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbERlcHJlY2F0ZWQgPSBhd2FpdCByZWFkTG9jYWxTdG9yYWdlKGRlcHJlY2F0ZWREZWZhdWx0cyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxUcmFuc2Zvcm1lZCA9IFVzZXJTdG9yYWdlLm1pZ3JhdGVTaXRlTGlzdHNWMihsb2NhbERlcHJlY2F0ZWQpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlTG9jYWxTdG9yYWdlKHtzY2hlbWVWZXJzaW9uOiAyLCAuLi5sb2NhbFRyYW5zZm9ybWVkfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcmVtb3ZlTG9jYWxTdG9yYWdlKE9iamVjdC5rZXlzKGRlcHJlY2F0ZWREZWZhdWx0cykpO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3luY0RlcHJlY2F0ZWQgPSBhd2FpdCByZWFkU3luY1N0b3JhZ2UoZGVwcmVjYXRlZERlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jVHJhbnNmb3JtZWQgPSBVc2VyU3RvcmFnZS5taWdyYXRlU2l0ZUxpc3RzVjIoc3luY0RlcHJlY2F0ZWQpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlU3luY1N0b3JhZ2Uoe3NjaGVtZVZlcnNpb246IDIsIC4uLnN5bmNUcmFuc2Zvcm1lZH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlbW92ZVN5bmNTdG9yYWdlKE9iamVjdC5rZXlzKGRlcHJlY2F0ZWREZWZhdWx0cykpO1xuXG4gICAgICAgICAgICAgICAgbG9jYWwgPSBhd2FpdCByZWFkTG9jYWxTdG9yYWdlKERFRkFVTFRfU0VUVElOR1MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2Vycm9yczogbG9jYWxDZmdFcnJvcnN9ID0gdmFsaWRhdGVTZXR0aW5ncyhsb2NhbCk7XG4gICAgICAgIGxvY2FsQ2ZnRXJyb3JzLmZvckVhY2goKGVycikgPT4gbG9nV2FybihlcnIpKTtcbiAgICAgICAgaWYgKGxvY2FsLnN5bmNTZXR0aW5ncyA9PSBudWxsKSB7XG4gICAgICAgICAgICBsb2NhbC5zeW5jU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTLnN5bmNTZXR0aW5ncztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvY2FsLnN5bmNTZXR0aW5ncykge1xuICAgICAgICAgICAgVXNlclN0b3JhZ2UubWlncmF0ZUF1dG9tYXRpb25TZXR0aW5ncyhsb2NhbCk7XG4gICAgICAgICAgICBVc2VyU3RvcmFnZS5taWdyYXRlQnVpbHRJblNWR0ZpbHRlclRvQ1NTRmlsdGVyKGxvY2FsKTtcbiAgICAgICAgICAgIFVzZXJTdG9yYWdlLmZpbGxEZWZhdWx0cyhsb2NhbCk7XG4gICAgICAgICAgICBVc2VyU3RvcmFnZS5sb2FkQmFycmllci5yZXNvbHZlKGxvY2FsKTtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0ICRzeW5jID0gYXdhaXQgcmVhZFN5bmNTdG9yYWdlKERFRkFVTFRfU0VUVElOR1MpO1xuICAgICAgICBpZiAoISRzeW5jKSB7XG4gICAgICAgICAgICBsb2dXYXJuKCdTeW5jIHNldHRpbmdzIGFyZSBtaXNzaW5nJyk7XG4gICAgICAgICAgICBsb2NhbC5zeW5jU2V0dGluZ3MgPSBmYWxzZTtcbiAgICAgICAgICAgIFVzZXJTdG9yYWdlLnNldCh7c3luY1NldHRpbmdzOiBmYWxzZX0pO1xuICAgICAgICAgICAgVXNlclN0b3JhZ2Uuc2F2ZVN5bmNTZXR0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgIFVzZXJTdG9yYWdlLmxvYWRCYXJyaWVyLnJlc29sdmUobG9jYWwpO1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2Vycm9yczogc3luY0NmZ0Vycm9yc30gPSB2YWxpZGF0ZVNldHRpbmdzKCRzeW5jKTtcbiAgICAgICAgc3luY0NmZ0Vycm9ycy5mb3JFYWNoKChlcnIpID0+IGxvZ1dhcm4oZXJyKSk7XG5cbiAgICAgICAgVXNlclN0b3JhZ2UubWlncmF0ZUF1dG9tYXRpb25TZXR0aW5ncygkc3luYyk7XG4gICAgICAgIFVzZXJTdG9yYWdlLm1pZ3JhdGVCdWlsdEluU1ZHRmlsdGVyVG9DU1NGaWx0ZXIoJHN5bmMpO1xuICAgICAgICBVc2VyU3RvcmFnZS5maWxsRGVmYXVsdHMoJHN5bmMpO1xuXG4gICAgICAgIFVzZXJTdG9yYWdlLmxvYWRCYXJyaWVyLnJlc29sdmUoJHN5bmMpO1xuICAgICAgICByZXR1cm4gJHN5bmM7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCFVc2VyU3RvcmFnZS5zZXR0aW5ncykge1xuICAgICAgICAgICAgLy8gVGhpcyBwYXRoIGlzIG5ldmVyIHRha2VuIGJlY2F1c2UgRXh0ZW5zaW9uIGFsd2F5cyBjYWxscyBVc2VyU3RvcmFnZS5sb2FkU2V0dGluZ3MoKVxuICAgICAgICAgICAgLy8gYmVmb3JlIGNhbGxpbmcgVXNlclN0b3JhZ2Uuc2F2ZVNldHRpbmdzKCkuXG4gICAgICAgICAgICBsb2dXYXJuKCdDb3VsZCBub3Qgc2F2ZSBzZXR0aW5ncyBpbnRvIHN0b3JhZ2UgYmVjYXVzZSB0aGUgc2V0dGluZ3MgYXJlIG1pc3NpbmcuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgVXNlclN0b3JhZ2Uuc2F2ZVNldHRpbmdzSW50b1N0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgc2F2ZVN5bmNTZXR0aW5nKHN5bmM6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge3N5bmNTZXR0aW5nczogc3luY307XG4gICAgICAgIGF3YWl0IHdyaXRlTG9jYWxTdG9yYWdlKG9iaik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3cml0ZVN5bmNTdG9yYWdlKG9iaik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nV2FybignU2V0dGluZ3Mgc3luY2hyb25pemF0aW9uIHdhcyBkaXNhYmxlZCBkdWUgdG8gZXJyb3I6JywgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIFVzZXJTdG9yYWdlLnNldCh7c3luY1NldHRpbmdzOiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2F2ZVNldHRpbmdzSW50b1N0b3JhZ2UgPSBkZWJvdW5jZShTQVZFX1RJTUVPVVQsIGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKFVzZXJTdG9yYWdlLnNhdmVTdG9yYWdlQmFycmllcikge1xuICAgICAgICAgICAgYXdhaXQgVXNlclN0b3JhZ2Uuc2F2ZVN0b3JhZ2VCYXJyaWVyLmVudHJ5KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgVXNlclN0b3JhZ2Uuc2F2ZVN0b3JhZ2VCYXJyaWVyID0gbmV3IFByb21pc2VCYXJyaWVyKCk7XG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBVc2VyU3RvcmFnZS5zZXR0aW5ncztcbiAgICAgICAgaWYgKHNldHRpbmdzLnN5bmNTZXR0aW5ncykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZVN5bmNTdG9yYWdlKHNldHRpbmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ1dhcm4oJ1NldHRpbmdzIHN5bmNocm9uaXphdGlvbiB3YXMgZGlzYWJsZWQgZHVlIHRvIGVycm9yOicsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgVXNlclN0b3JhZ2Uuc2V0KHtzeW5jU2V0dGluZ3M6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgVXNlclN0b3JhZ2Uuc2F2ZVN5bmNTZXR0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZUxvY2FsU3RvcmFnZShzZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCB3cml0ZUxvY2FsU3RvcmFnZShzZXR0aW5ncyk7XG4gICAgICAgIH1cblxuICAgICAgICBVc2VyU3RvcmFnZS5zYXZlU3RvcmFnZUJhcnJpZXIucmVzb2x2ZSgpO1xuICAgICAgICBVc2VyU3RvcmFnZS5zYXZlU3RvcmFnZUJhcnJpZXIgPSBudWxsO1xuICAgIH0pO1xuXG4gICAgc3RhdGljIHNldCgkc2V0dGluZ3M6IFBhcnRpYWw8VXNlclNldHRpbmdzPik6IHZvaWQge1xuICAgICAgICBpZiAoIVVzZXJTdG9yYWdlLnNldHRpbmdzKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHBhdGggaXMgbmV2ZXIgdGFrZW4gYmVjYXVzZSBFeHRlbnNpb24gYWx3YXlzIGNhbGxzIFVzZXJTdG9yYWdlLmxvYWRTZXR0aW5ncygpXG4gICAgICAgICAgICAvLyBiZWZvcmUgY2FsbGluZyBVc2VyU3RvcmFnZS5zZXQoKS5cbiAgICAgICAgICAgIGxvZ1dhcm4oJ0NvdWxkIG5vdCBtb2RpZnkgc2V0dGluZ3MgYmVjYXVzZSB0aGUgc2V0dGluZ3MgYXJlIG1pc3NpbmcuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWx0ZXJTaXRlTGlzdCA9IChzaXRlTGlzdDogc3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzaXRlTGlzdCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIChzaXRlTGlzdCBhcyBzdHJpbmdbXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihpbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gc2l0ZUxpc3Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzaXRlTGlzdCA9IGxpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2l0ZUxpc3QuZmlsdGVyKChwYXR0ZXJuKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlzT0sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpc1VSTE1hdGNoZWQoJ2h0dHBzOi8vZ29vZ2xlLmNvbS8nLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICAgICAgaXNVUkxNYXRjaGVkKCdbOjoxXToxMzM3JywgcGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgIGlzT0sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dXYXJuKGBQYXR0ZXJuIFwiJHtwYXR0ZXJufVwiIGV4Y2x1ZGVkYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBpc09LICYmIHBhdHRlcm4gIT09ICcvJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHtlbmFibGVkRm9yLCBkaXNhYmxlZEZvcn0gPSAkc2V0dGluZ3M7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRTZXR0aW5ncyA9IHsuLi5Vc2VyU3RvcmFnZS5zZXR0aW5ncywgLi4uJHNldHRpbmdzfTtcbiAgICAgICAgaWYgKGVuYWJsZWRGb3IpIHtcbiAgICAgICAgICAgIHVwZGF0ZWRTZXR0aW5ncy5lbmFibGVkRm9yID0gZmlsdGVyU2l0ZUxpc3QoZW5hYmxlZEZvcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpc2FibGVkRm9yKSB7XG4gICAgICAgICAgICB1cGRhdGVkU2V0dGluZ3MuZGlzYWJsZWRGb3IgPSBmaWx0ZXJTaXRlTGlzdChkaXNhYmxlZEZvcik7XG4gICAgICAgIH1cblxuICAgICAgICBVc2VyU3RvcmFnZS5zZXR0aW5ncyA9IHVwZGF0ZWRTZXR0aW5ncztcbiAgICB9XG59XG4iLCJpbXBvcnQge2lzRmlyZWZveH0gZnJvbSAnLi9wbGF0Zm9ybSc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldE9LUmVzcG9uc2UodXJsOiBzdHJpbmcsIG1pbWVUeXBlPzogc3RyaW5nLCBvcmlnaW4/OiBzdHJpbmcpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgY29uc3QgY3JlZGVudGlhbHMgPSBvcmlnaW4gJiYgdXJsLnN0YXJ0c1dpdGgoYCR7b3JpZ2lufS9gKSA/IHVuZGVmaW5lZCA6ICdvbWl0JztcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgICB1cmwsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNhY2hlOiAnZm9yY2UtY2FjaGUnLFxuICAgICAgICAgICAgY3JlZGVudGlhbHMsXG4gICAgICAgICAgICByZWZlcnJlcjogb3JpZ2luLFxuICAgICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBGaXJlZm94IGJ1ZywgY29udGVudCB0eXBlIGlzIFwiYXBwbGljYXRpb24veC11bmtub3duLWNvbnRlbnQtdHlwZVwiXG4gICAgaWYgKGlzRmlyZWZveCAmJiBtaW1lVHlwZSA9PT0gJ3RleHQvY3NzJyAmJiB1cmwuc3RhcnRzV2l0aCgnbW96LWV4dGVuc2lvbjovLycpICYmIHVybC5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbiAgICBpZiAobWltZVR5cGUgJiYgIXJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSEuc3RhcnRzV2l0aChtaW1lVHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaW1lIHR5cGUgbWlzbWF0Y2ggd2hlbiBsb2FkaW5nICR7dXJsfWApO1xuICAgIH1cblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbG9hZCAke3VybH0gJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQXNEYXRhVVJMKHVybDogc3RyaW5nLCBtaW1lVHlwZT86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZXRPS1Jlc3BvbnNlKHVybCwgbWltZVR5cGUpO1xuICAgIHJldHVybiBhd2FpdCByZWFkUmVzcG9uc2VBc0RhdGFVUkwocmVzcG9uc2UpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFzQmxvYih1cmw6IHN0cmluZywgbWltZVR5cGU/OiBzdHJpbmcpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdldE9LUmVzcG9uc2UodXJsLCBtaW1lVHlwZSk7XG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRSZXNwb25zZUFzRGF0YVVSTChyZXNwb25zZTogUmVzcG9uc2UpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XG4gICAgY29uc3QgZGF0YVVSTCA9IGF3YWl0IChuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG4gICAgfSkpO1xuICAgIHJldHVybiBkYXRhVVJMO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFzVGV4dCh1cmw6IHN0cmluZywgbWltZVR5cGU/OiBzdHJpbmcsIG9yaWdpbj86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnZXRPS1Jlc3BvbnNlKHVybCwgbWltZVR5cGUsIG9yaWdpbik7XG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cbiIsImltcG9ydCB7bG9hZEFzRGF0YVVSTCwgbG9hZEFzVGV4dH0gZnJvbSAnLi4vLi4vdXRpbHMvbmV0d29yayc7XG5pbXBvcnQge2lzWE1MSHR0cFJlcXVlc3RTdXBwb3J0ZWQsIGlzRmV0Y2hTdXBwb3J0ZWR9IGZyb20gJy4uLy4uL3V0aWxzL3BsYXRmb3JtJztcbmltcG9ydCB7Z2V0U3RyaW5nU2l6ZX0gZnJvbSAnLi4vLi4vdXRpbHMvdGV4dCc7XG5pbXBvcnQge2dldER1cmF0aW9ufSBmcm9tICcuLi8uLi91dGlscy90aW1lJztcblxuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcblxuaW50ZXJmYWNlIFJlcXVlc3RQYXJhbXMge1xuICAgIHVybDogc3RyaW5nO1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG59XG5cbnR5cGUgRmlsZUxvYWRlclJlc3BvbnNlID0ge2RhdGE6IHN0cmluZzsgZXJyb3I/OiBFcnJvcn0gfCB7ZGF0YT86IHN0cmluZzsgZXJyb3I6IEVycm9yfTtcblxuZXhwb3J0IGludGVyZmFjZSBGaWxlTG9hZGVyIHtcbiAgICBnZXQ6IChmZXRjaFJlcXVlc3RQYXJhbWV0ZXJzOiBGZXRjaFJlcXVlc3RQYXJhbWV0ZXJzKSA9PiBQcm9taXNlPEZpbGVMb2FkZXJSZXNwb25zZT47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkVGV4dChwYXJhbXM6IFJlcXVlc3RQYXJhbXMpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChpc1hNTEh0dHBSZXF1ZXN0U3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAvLyBVc2UgWE1MSHR0cFJlcXVlc3QgaWYgaXQgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoJ3RleHQvcGxhaW4nKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgcGFyYW1zLnVybCwgdHJ1ZSk7XG4gICAgICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYCR7cmVxdWVzdC5zdGF0dXN9OiAke3JlcXVlc3Quc3RhdHVzVGV4dH1gKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYCR7cmVxdWVzdC5zdGF0dXN9OiAke3JlcXVlc3Quc3RhdHVzVGV4dH1gKSk7XG4gICAgICAgICAgICBpZiAocGFyYW1zLnRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnRpbWVvdXQgPSBwYXJhbXMudGltZW91dDtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ0ZpbGUgbG9hZGluZyBzdG9wcGVkIGR1ZSB0byB0aW1lb3V0JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNGZXRjaFN1cHBvcnRlZCkge1xuICAgICAgICAgICAgLy8gWE1MSHR0cFJlcXVlc3QgaXMgbm90IGF2YWlsYWJsZSBpbiBTZXJ2aWNlIFdvcmtlciBjb250ZXh0cyBsaWtlXG4gICAgICAgICAgICAvLyBNYW5pZmVzdCBWMyBiYWNrZ3JvdW5kIGNvbnRleHRcbiAgICAgICAgICAgIGxldCBhYm9ydENvbnRyb2xsZXI6IEFib3J0Q29udHJvbGxlcjtcbiAgICAgICAgICAgIGxldCBzaWduYWw6IEFib3J0U2lnbmFsIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgbGV0IHRpbWVkT3V0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAocGFyYW1zLnRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBhYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgc2lnbmFsID0gYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LCBwYXJhbXMudGltZW91dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZldGNoKHBhcmFtcy51cmwsIHtzaWduYWx9KVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiAocmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lZE91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmlsZSBsb2FkaW5nIHN0b3BwZWQgZHVlIHRvIHRpbWVvdXQnKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBOZWl0aGVyIFhNTEh0dHBSZXF1ZXN0IG5vciBGZXRjaCBBUEkgYXJlIGFjY2Vzc2libGUhYCkpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmludGVyZmFjZSBDYWNoZVJlY29yZCB7XG4gICAgZXhwaXJlczogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICB1cmw6IHN0cmluZztcbiAgICB2YWx1ZTogc3RyaW5nO1xufVxuXG5jbGFzcyBMaW1pdGVkQ2FjaGVTdG9yYWdlIHtcbiAgICAvLyBUT0RPOiByZW1vdmUgdHlwZSBjYXN0IGFmdGVyIGRlcGVuZGVuY3kgdXBkYXRlXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgUVVPVEFfQllURVMgPSAoKCFfX1RFU1RfXyAmJiAobmF2aWdhdG9yIGFzIGFueSkuZGV2aWNlTWVtb3J5KSB8fCA0KSAqIDE2ICogMTAyNCAqIDEwMjQ7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVFRMID0gZ2V0RHVyYXRpb24oe21pbnV0ZXM6IDEwfSk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQUxBUk1fTkFNRSA9ICduZXR3b3JrJztcblxuICAgIHByaXZhdGUgYnl0ZXNJblVzZSA9IDA7XG4gICAgcHJpdmF0ZSByZWNvcmRzID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlUmVjb3JkPigpO1xuICAgIHByaXZhdGUgc3RhdGljIGFsYXJtSXNBY3RpdmUgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjaHJvbWUuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoYXN5bmMgKGFsYXJtKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWxhcm0ubmFtZSA9PT0gTGltaXRlZENhY2hlU3RvcmFnZS5BTEFSTV9OQU1FKSB7XG4gICAgICAgICAgICAgICAgLy8gV2Ugc2NoZWR1bGUgb25seSBvbmUtdGltZSBhbGFybXMsIHNvIG9uY2UgaXQgZ29lcyBvZmYsXG4gICAgICAgICAgICAgICAgLy8gdGhlcmUgYXJlIG5vIG1vcmUgYWxhcm1zIHNjaGVkdWxlZC5cbiAgICAgICAgICAgICAgICBMaW1pdGVkQ2FjaGVTdG9yYWdlLmFsYXJtSXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV4cGlyZWRSZWNvcmRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGVuc3VyZUFsYXJtSXNTY2hlZHVsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmFsYXJtSXNBY3RpdmUpIHtcbiAgICAgICAgICAgIGNocm9tZS5hbGFybXMuY3JlYXRlKExpbWl0ZWRDYWNoZVN0b3JhZ2UuQUxBUk1fTkFNRSwge2RlbGF5SW5NaW51dGVzOiAxfSk7XG4gICAgICAgICAgICB0aGlzLmFsYXJtSXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzKHVybDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY29yZHMuaGFzKHVybCk7XG4gICAgfVxuXG4gICAgZ2V0KHVybDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZHMuaGFzKHVybCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMucmVjb3Jkcy5nZXQodXJsKSE7XG4gICAgICAgICAgICByZWNvcmQuZXhwaXJlcyA9IERhdGUubm93KCkgKyBMaW1pdGVkQ2FjaGVTdG9yYWdlLlRUTDtcbiAgICAgICAgICAgIHRoaXMucmVjb3Jkcy5kZWxldGUodXJsKTtcbiAgICAgICAgICAgIHRoaXMucmVjb3Jkcy5zZXQodXJsLCByZWNvcmQpO1xuICAgICAgICAgICAgcmV0dXJuIHJlY29yZC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzZXQodXJsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgTGltaXRlZENhY2hlU3RvcmFnZS5lbnN1cmVBbGFybUlzU2NoZWR1bGVkKCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdldFN0cmluZ1NpemUodmFsdWUpO1xuICAgICAgICBpZiAoc2l6ZSA+IExpbWl0ZWRDYWNoZVN0b3JhZ2UuUVVPVEFfQllURVMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW3VybCwgcmVjb3JkXSBvZiB0aGlzLnJlY29yZHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJ5dGVzSW5Vc2UgKyBzaXplID4gTGltaXRlZENhY2hlU3RvcmFnZS5RVU9UQV9CWVRFUykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVjb3Jkcy5kZWxldGUodXJsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ5dGVzSW5Vc2UgLT0gcmVjb3JkLnNpemU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmVjb3Jkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzSW5Vc2UgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXhwaXJlcyA9IERhdGUubm93KCkgKyBMaW1pdGVkQ2FjaGVTdG9yYWdlLlRUTDtcbiAgICAgICAgdGhpcy5yZWNvcmRzLnNldCh1cmwsIHt1cmwsIHZhbHVlLCBzaXplLCBleHBpcmVzfSk7XG4gICAgICAgIHRoaXMuYnl0ZXNJblVzZSArPSBzaXplO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlRXhwaXJlZFJlY29yZHMoKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGZvciAoY29uc3QgW3VybCwgcmVjb3JkXSBvZiB0aGlzLnJlY29yZHMpIHtcbiAgICAgICAgICAgIGlmIChyZWNvcmQuZXhwaXJlcyA8IG5vdykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVjb3Jkcy5kZWxldGUodXJsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ5dGVzSW5Vc2UgLT0gcmVjb3JkLnNpemU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmVjb3Jkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzSW5Vc2UgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTGltaXRlZENhY2hlU3RvcmFnZS5lbnN1cmVBbGFybUlzU2NoZWR1bGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbWl0ZXIoKSB7XG4gICAgY29uc3QgbG9hZGluZ1VybHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBhd2FpdGluZ1VybHMgPSBuZXcgTWFwPHN0cmluZywgU2V0PChyZXNwb25zZTogRmlsZUxvYWRlclJlc3BvbnNlKSA9PiB2b2lkPj4oKTtcblxuICAgIGZ1bmN0aW9uIGxvYWRpbmcodXJsOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbG9hZGluZ1VybHMuaGFzKHVybCk7XG4gICAgICAgIGxvYWRpbmdVcmxzLmFkZCh1cmwpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHdhaXQodXJsOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEZpbGVMb2FkZXJSZXNwb25zZT4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICghYXdhaXRpbmdVcmxzLmhhcyh1cmwpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXRpbmdVcmxzLnNldCh1cmwsIG5ldyBTZXQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdGluZ1VybHMuZ2V0KHVybCk/LmFkZChyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZnVuY3Rpb24gbG9hZGVkKHVybDogc3RyaW5nLCBkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgbG9hZGluZ1VybHMuZGVsZXRlKHVybCk7XG4gICAgICAgIGlmIChhd2FpdGluZ1VybHMuaGFzKHVybCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge2RhdGF9O1xuICAgICAgICAgICAgYXdhaXRpbmdVcmxzLmdldCh1cmwpIS5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2socmVzcG9uc2UpKTtcbiAgICAgICAgICAgIGF3YWl0aW5nVXJscy5kZWxldGUodXJsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIGZhaWxlZCh1cmw6IHN0cmluZywgZXJyb3I6IEVycm9yKSB7XG4gICAgICAgIGxvYWRpbmdVcmxzLmRlbGV0ZSh1cmwpO1xuICAgICAgICBpZiAoYXdhaXRpbmdVcmxzLmhhcyh1cmwpKSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHtlcnJvcn07XG4gICAgICAgICAgICBhd2FpdGluZ1VybHMuZ2V0KHVybCkhLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhyZXNwb25zZSkpO1xuICAgICAgICAgICAgYXdhaXRpbmdVcmxzLmRlbGV0ZSh1cmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtsb2FkaW5nLCB3YWl0LCBsb2FkZWQsIGZhaWxlZH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmV0Y2hSZXF1ZXN0UGFyYW1ldGVycyB7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgcmVzcG9uc2VUeXBlOiAnZGF0YS11cmwnIHwgJ3RleHQnO1xuICAgIG1pbWVUeXBlPzogc3RyaW5nO1xuICAgIG9yaWdpbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZpbGVMb2FkZXIoKTogRmlsZUxvYWRlciB7XG4gICAgY29uc3QgY2FjaGVzID0ge1xuICAgICAgICAnZGF0YS11cmwnOiBuZXcgTGltaXRlZENhY2hlU3RvcmFnZSgpLFxuICAgICAgICAndGV4dCc6IG5ldyBMaW1pdGVkQ2FjaGVTdG9yYWdlKCksXG4gICAgfTtcblxuICAgIGNvbnN0IGxvYWRlcnMgPSB7XG4gICAgICAgICdkYXRhLXVybCc6IGxvYWRBc0RhdGFVUkwsXG4gICAgICAgICd0ZXh0JzogbG9hZEFzVGV4dCxcbiAgICB9O1xuXG4gICAgY29uc3QgbGltaXRlcnMgPSB7XG4gICAgICAgICdkYXRhLXVybCc6IGNyZWF0ZUxpbWl0ZXIoKSxcbiAgICAgICAgJ3RleHQnOiBjcmVhdGVMaW1pdGVyKCksXG4gICAgfTtcblxuICAgIGFzeW5jIGZ1bmN0aW9uIGdldCh7dXJsLCByZXNwb25zZVR5cGUsIG1pbWVUeXBlLCBvcmlnaW59OiBGZXRjaFJlcXVlc3RQYXJhbWV0ZXJzKTogUHJvbWlzZTxGaWxlTG9hZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3QgY2FjaGUgPSBjYWNoZXNbcmVzcG9uc2VUeXBlXTtcbiAgICAgICAgY29uc3QgbG9hZCA9IGxvYWRlcnNbcmVzcG9uc2VUeXBlXTtcbiAgICAgICAgY29uc3QgbGltaXRlciA9IGxpbWl0ZXJzW3Jlc3BvbnNlVHlwZV07XG4gICAgICAgIGlmIChjYWNoZS5oYXModXJsKSkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNhY2hlLmdldCh1cmwpITtcbiAgICAgICAgICAgIHJldHVybiB7ZGF0YX07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGltaXRlci5sb2FkaW5nKHVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiBsaW1pdGVyLndhaXQodXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgbG9hZCh1cmwsIG1pbWVUeXBlLCBvcmlnaW4pO1xuICAgICAgICAgICAgY2FjaGUuc2V0KHVybCwgZGF0YSk7XG4gICAgICAgICAgICBsaW1pdGVyLmxvYWRlZCh1cmwsIGRhdGEpO1xuICAgICAgICAgICAgcmV0dXJuIHtkYXRhfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxpbWl0ZXIuZmFpbGVkKHVybCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtlcnJvcn07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge2dldH07XG59XG4iLCJpbXBvcnQge0RFRkFVTFRfQ09MT1JTQ0hFTUV9IGZyb20gJy4uL2RlZmF1bHRzJztcbmltcG9ydCB0eXBlIHtJbnZlcnNpb25GaXgsIFN0YXRpY1RoZW1lLCBEeW5hbWljVGhlbWVGaXgsIERldGVjdG9ySGludH0gZnJvbSAnLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtpbmRleFNpdGVMaXN0Q29uZmlnLCBpbmRleFNpdGVzRml4ZXNDb25maWcsIGlzVVJMSW5TaXRlTGlzdH0gZnJvbSAnLi4vZ2VuZXJhdG9ycy91dGlscy9wYXJzZSc7XG5pbXBvcnQgdHlwZSB7U2l0ZUxpc3RJbmRleCwgU2l0ZVByb3BzSW5kZXh9IGZyb20gJy4uL2dlbmVyYXRvcnMvdXRpbHMvcGFyc2UnO1xuaW1wb3J0IHR5cGUge1BhcnNlZENvbG9yU2NoZW1lQ29uZmlnfSBmcm9tICcuLi91dGlscy9jb2xvcnNjaGVtZS1wYXJzZXInO1xuaW1wb3J0IHtwYXJzZUNvbG9yU2NoZW1lQ29uZmlnfSBmcm9tICcuLi91dGlscy9jb2xvcnNjaGVtZS1wYXJzZXInO1xuaW1wb3J0IHtDT05GSUdfVVJMX0JBU0V9IGZyb20gJy4uL3V0aWxzL2xpbmtzJztcbmltcG9ydCB7Z2V0RHVyYXRpb259IGZyb20gJy4uL3V0aWxzL3RpbWUnO1xuXG5pbXBvcnQgVXNlclN0b3JhZ2UgZnJvbSAnLi91c2VyLXN0b3JhZ2UnO1xuaW1wb3J0IHtsb2dXYXJufSBmcm9tICcuL3V0aWxzL2xvZyc7XG5pbXBvcnQge3JlYWRUZXh0fSBmcm9tICcuL3V0aWxzL25ldHdvcmsnO1xuXG5jb25zdCBDT05GSUdfVVJMcyA9IHtcbiAgICBkYXJrU2l0ZXM6IHtcbiAgICAgICAgcmVtb3RlOiBgJHtDT05GSUdfVVJMX0JBU0V9L2Rhcmstc2l0ZXMuY29uZmlnYCxcbiAgICAgICAgbG9jYWw6ICcuLi9jb25maWcvZGFyay1zaXRlcy5jb25maWcnLFxuICAgIH0sXG4gICAgZHluYW1pY1RoZW1lRml4ZXM6IHtcbiAgICAgICAgcmVtb3RlOiBgJHtDT05GSUdfVVJMX0JBU0V9L2R5bmFtaWMtdGhlbWUtZml4ZXMuY29uZmlnYCxcbiAgICAgICAgbG9jYWw6ICcuLi9jb25maWcvZHluYW1pYy10aGVtZS1maXhlcy5jb25maWcnLFxuICAgIH0sXG4gICAgaW52ZXJzaW9uRml4ZXM6IHtcbiAgICAgICAgcmVtb3RlOiBgJHtDT05GSUdfVVJMX0JBU0V9L2ludmVyc2lvbi1maXhlcy5jb25maWdgLFxuICAgICAgICBsb2NhbDogJy4uL2NvbmZpZy9pbnZlcnNpb24tZml4ZXMuY29uZmlnJyxcbiAgICB9LFxuICAgIHN0YXRpY1RoZW1lczoge1xuICAgICAgICByZW1vdGU6IGAke0NPTkZJR19VUkxfQkFTRX0vc3RhdGljLXRoZW1lcy5jb25maWdgLFxuICAgICAgICBsb2NhbDogJy4uL2NvbmZpZy9zdGF0aWMtdGhlbWVzLmNvbmZpZycsXG4gICAgfSxcbiAgICBjb2xvclNjaGVtZXM6IHtcbiAgICAgICAgcmVtb3RlOiBgJHtDT05GSUdfVVJMX0JBU0V9L2NvbG9yLXNjaGVtZXMuZHJjb25mYCxcbiAgICAgICAgbG9jYWw6ICcuLi9jb25maWcvY29sb3Itc2NoZW1lcy5kcmNvbmYnLFxuICAgIH0sXG4gICAgZGV0ZWN0b3JIaW50czoge1xuICAgICAgICByZW1vdGU6IGAke0NPTkZJR19VUkxfQkFTRX0vZGV0ZWN0b3ItaGludHMuY29uZmlnYCxcbiAgICAgICAgbG9jYWw6ICcuLi9jb25maWcvZGV0ZWN0b3ItaGludHMuY29uZmlnJyxcbiAgICB9LFxufTtcblxuY29uc3QgUkVNT1RFX1RJTUVPVVRfTVMgPSBnZXREdXJhdGlvbih7c2Vjb25kczogMTB9KTtcblxuaW50ZXJmYWNlIExvY2FsQ29uZmlnIHtcbiAgICBsb2NhbDogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIENvbmZpZyBleHRlbmRzIExvY2FsQ29uZmlnIHtcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIGxvY2FsOiBib29sZWFuO1xuICAgIGxvY2FsVVJMOiBzdHJpbmc7XG4gICAgcmVtb3RlVVJMPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWdNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBEQVJLX1NJVEVTX0lOREVYOiBTaXRlTGlzdEluZGV4IHwgbnVsbDtcbiAgICBzdGF0aWMgREVURUNUT1JfSElOVFNfSU5ERVg6IFNpdGVQcm9wc0luZGV4PERldGVjdG9ySGludD4gfCBudWxsO1xuICAgIHN0YXRpYyBERVRFQ1RPUl9ISU5UU19SQVc6IHN0cmluZyB8IG51bGw7XG4gICAgc3RhdGljIERZTkFNSUNfVEhFTUVfRklYRVNfSU5ERVg6IFNpdGVQcm9wc0luZGV4PER5bmFtaWNUaGVtZUZpeD4gfCBudWxsO1xuICAgIHN0YXRpYyBEWU5BTUlDX1RIRU1FX0ZJWEVTX1JBVzogc3RyaW5nIHwgbnVsbDtcbiAgICBzdGF0aWMgSU5WRVJTSU9OX0ZJWEVTX0lOREVYOiBTaXRlUHJvcHNJbmRleDxJbnZlcnNpb25GaXg+IHwgbnVsbDtcbiAgICBzdGF0aWMgSU5WRVJTSU9OX0ZJWEVTX1JBVzogc3RyaW5nIHwgbnVsbDtcbiAgICBzdGF0aWMgU1RBVElDX1RIRU1FU19JTkRFWDogU2l0ZVByb3BzSW5kZXg8U3RhdGljVGhlbWU+IHwgbnVsbDtcbiAgICBzdGF0aWMgU1RBVElDX1RIRU1FU19SQVc6IHN0cmluZyB8IG51bGw7XG4gICAgc3RhdGljIENPTE9SX1NDSEVNRVNfUkFXOiBQYXJzZWRDb2xvclNjaGVtZUNvbmZpZyB8IG51bGw7XG5cbiAgICBzdGF0aWMgcmF3ID0ge1xuICAgICAgICBkYXJrU2l0ZXM6IG51bGwgYXMgc3RyaW5nIHwgbnVsbCxcbiAgICAgICAgZGV0ZWN0b3JIaW50czogbnVsbCBhcyBzdHJpbmcgfCBudWxsLFxuICAgICAgICBkeW5hbWljVGhlbWVGaXhlczogbnVsbCBhcyBzdHJpbmcgfCBudWxsLFxuICAgICAgICBpbnZlcnNpb25GaXhlczogbnVsbCBhcyBzdHJpbmcgfCBudWxsLFxuICAgICAgICBzdGF0aWNUaGVtZXM6IG51bGwgYXMgc3RyaW5nIHwgbnVsbCxcbiAgICAgICAgY29sb3JTY2hlbWVzOiBudWxsIGFzIHN0cmluZyB8IG51bGwsXG4gICAgfTtcblxuICAgIHN0YXRpYyBvdmVycmlkZXMgPSB7XG4gICAgICAgIGRhcmtTaXRlczogbnVsbCBhcyBzdHJpbmcgfCBudWxsLFxuICAgICAgICBkZXRlY3RvckhpbnRzOiBudWxsIGFzIHN0cmluZyB8IG51bGwsXG4gICAgICAgIGR5bmFtaWNUaGVtZUZpeGVzOiBudWxsIGFzIHN0cmluZyB8IG51bGwsXG4gICAgICAgIGludmVyc2lvbkZpeGVzOiBudWxsIGFzIHN0cmluZyB8IG51bGwsXG4gICAgICAgIHN0YXRpY1RoZW1lczogbnVsbCBhcyBzdHJpbmcgfCBudWxsLFxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBsb2FkQ29uZmlnKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbG9jYWwsXG4gICAgICAgIGxvY2FsVVJMLFxuICAgICAgICByZW1vdGVVUkwsXG4gICAgfTogQ29uZmlnKSB7XG4gICAgICAgIGxldCAkY29uZmlnOiBzdHJpbmc7XG4gICAgICAgIGNvbnN0IGxvYWRMb2NhbCA9IGFzeW5jICgpID0+IGF3YWl0IHJlYWRUZXh0KHt1cmw6IGxvY2FsVVJMfSk7XG4gICAgICAgIGlmIChsb2NhbCkge1xuICAgICAgICAgICAgJGNvbmZpZyA9IGF3YWl0IGxvYWRMb2NhbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAkY29uZmlnID0gYXdhaXQgcmVhZFRleHQoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGAke3JlbW90ZVVSTH0/bm9jYWNoZT0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogUkVNT1RFX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke25hbWV9IHJlbW90ZSBsb2FkIGVycm9yYCwgZXJyKTtcbiAgICAgICAgICAgICAgICAkY29uZmlnID0gYXdhaXQgbG9hZExvY2FsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRjb25maWc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgbG9hZENvbG9yU2NoZW1lcyh7bG9jYWx9OiBMb2NhbENvbmZpZykge1xuICAgICAgICBjb25zdCAkY29uZmlnID0gYXdhaXQgQ29uZmlnTWFuYWdlci5sb2FkQ29uZmlnKHtcbiAgICAgICAgICAgIG5hbWU6ICdDb2xvciBTY2hlbWVzJyxcbiAgICAgICAgICAgIGxvY2FsLFxuICAgICAgICAgICAgbG9jYWxVUkw6IENPTkZJR19VUkxzLmNvbG9yU2NoZW1lcy5sb2NhbCxcbiAgICAgICAgICAgIHJlbW90ZVVSTDogQ09ORklHX1VSTHMuY29sb3JTY2hlbWVzLnJlbW90ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIucmF3LmNvbG9yU2NoZW1lcyA9ICRjb25maWc7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuaGFuZGxlQ29sb3JTY2hlbWVzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgbG9hZERhcmtTaXRlcyh7bG9jYWx9OiBMb2NhbENvbmZpZykge1xuICAgICAgICBjb25zdCBzaXRlcyA9IGF3YWl0IENvbmZpZ01hbmFnZXIubG9hZENvbmZpZyh7XG4gICAgICAgICAgICBuYW1lOiAnRGFyayBTaXRlcycsXG4gICAgICAgICAgICBsb2NhbCxcbiAgICAgICAgICAgIGxvY2FsVVJMOiBDT05GSUdfVVJMcy5kYXJrU2l0ZXMubG9jYWwsXG4gICAgICAgICAgICByZW1vdGVVUkw6IENPTkZJR19VUkxzLmRhcmtTaXRlcy5yZW1vdGUsXG4gICAgICAgIH0pO1xuICAgICAgICBDb25maWdNYW5hZ2VyLnJhdy5kYXJrU2l0ZXMgPSBzaXRlcztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5oYW5kbGVEYXJrU2l0ZXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBsb2FkRGV0ZWN0b3JIaW50cyh7bG9jYWx9OiBMb2NhbENvbmZpZykge1xuICAgICAgICBjb25zdCAkY29uZmlnID0gYXdhaXQgQ29uZmlnTWFuYWdlci5sb2FkQ29uZmlnKHtcbiAgICAgICAgICAgIG5hbWU6ICdEZXRlY3RvciBIaW50cycsXG4gICAgICAgICAgICBsb2NhbCxcbiAgICAgICAgICAgIGxvY2FsVVJMOiBDT05GSUdfVVJMcy5kZXRlY3RvckhpbnRzLmxvY2FsLFxuICAgICAgICAgICAgcmVtb3RlVVJMOiBDT05GSUdfVVJMcy5kZXRlY3RvckhpbnRzLnJlbW90ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIucmF3LmRldGVjdG9ySGludHMgPSAkY29uZmlnO1xuICAgICAgICBDb25maWdNYW5hZ2VyLmhhbmRsZURldGVjdG9ySGludHMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBsb2FkRHluYW1pY1RoZW1lRml4ZXMoe2xvY2FsfTogTG9jYWxDb25maWcpIHtcbiAgICAgICAgY29uc3QgZml4ZXMgPSBhd2FpdCBDb25maWdNYW5hZ2VyLmxvYWRDb25maWcoe1xuICAgICAgICAgICAgbmFtZTogJ0R5bmFtaWMgVGhlbWUgRml4ZXMnLFxuICAgICAgICAgICAgbG9jYWwsXG4gICAgICAgICAgICBsb2NhbFVSTDogQ09ORklHX1VSTHMuZHluYW1pY1RoZW1lRml4ZXMubG9jYWwsXG4gICAgICAgICAgICByZW1vdGVVUkw6IENPTkZJR19VUkxzLmR5bmFtaWNUaGVtZUZpeGVzLnJlbW90ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIucmF3LmR5bmFtaWNUaGVtZUZpeGVzID0gZml4ZXM7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuaGFuZGxlRHluYW1pY1RoZW1lRml4ZXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBsb2FkSW52ZXJzaW9uRml4ZXMoe2xvY2FsfTogTG9jYWxDb25maWcpIHtcbiAgICAgICAgY29uc3QgZml4ZXMgPSBhd2FpdCBDb25maWdNYW5hZ2VyLmxvYWRDb25maWcoe1xuICAgICAgICAgICAgbmFtZTogJ0ludmVyc2lvbiBGaXhlcycsXG4gICAgICAgICAgICBsb2NhbCxcbiAgICAgICAgICAgIGxvY2FsVVJMOiBDT05GSUdfVVJMcy5pbnZlcnNpb25GaXhlcy5sb2NhbCxcbiAgICAgICAgICAgIHJlbW90ZVVSTDogQ09ORklHX1VSTHMuaW52ZXJzaW9uRml4ZXMucmVtb3RlLFxuICAgICAgICB9KTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5yYXcuaW52ZXJzaW9uRml4ZXMgPSBmaXhlcztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5oYW5kbGVJbnZlcnNpb25GaXhlcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGxvYWRTdGF0aWNUaGVtZXMoe2xvY2FsfTogTG9jYWxDb25maWcpIHtcbiAgICAgICAgY29uc3QgdGhlbWVzID0gYXdhaXQgQ29uZmlnTWFuYWdlci5sb2FkQ29uZmlnKHtcbiAgICAgICAgICAgIG5hbWU6ICdTdGF0aWMgVGhlbWVzJyxcbiAgICAgICAgICAgIGxvY2FsLFxuICAgICAgICAgICAgbG9jYWxVUkw6IENPTkZJR19VUkxzLnN0YXRpY1RoZW1lcy5sb2NhbCxcbiAgICAgICAgICAgIHJlbW90ZVVSTDogQ09ORklHX1VSTHMuc3RhdGljVGhlbWVzLnJlbW90ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIucmF3LnN0YXRpY1RoZW1lcyA9IHRoZW1lcztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5oYW5kbGVTdGF0aWNUaGVtZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZChjb25maWc/OiBMb2NhbENvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgYXdhaXQgVXNlclN0b3JhZ2UubG9hZFNldHRpbmdzKCk7XG4gICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgbG9jYWw6ICFVc2VyU3RvcmFnZS5zZXR0aW5ncy5zeW5jU2l0ZXNGaXhlcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLmxvYWRDb2xvclNjaGVtZXMoY29uZmlnKSxcbiAgICAgICAgICAgIENvbmZpZ01hbmFnZXIubG9hZERhcmtTaXRlcyhjb25maWcpLFxuICAgICAgICAgICAgQ29uZmlnTWFuYWdlci5sb2FkRGV0ZWN0b3JIaW50cyhjb25maWcpLFxuICAgICAgICAgICAgQ29uZmlnTWFuYWdlci5sb2FkRHluYW1pY1RoZW1lRml4ZXMoY29uZmlnKSxcbiAgICAgICAgICAgIENvbmZpZ01hbmFnZXIubG9hZEludmVyc2lvbkZpeGVzKGNvbmZpZyksXG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLmxvYWRTdGF0aWNUaGVtZXMoY29uZmlnKSxcbiAgICAgICAgXSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcignRmF0YWxpdHknLCBlcnIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBoYW5kbGVDb2xvclNjaGVtZXMoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0ICRjb25maWcgPSBDb25maWdNYW5hZ2VyLnJhdy5jb2xvclNjaGVtZXM7XG4gICAgICAgIGNvbnN0IHtyZXN1bHQsIGVycm9yfSA9IHBhcnNlQ29sb3JTY2hlbWVDb25maWcoJGNvbmZpZyB8fCAnJyk7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgbG9nV2FybihgQ29sb3IgU2NoZW1lcyBwYXJzZSBlcnJvciwgZGVmYXVsdGluZyB0byBmYWxsYmFjay4gJHtlcnJvcn0uYCk7XG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLkNPTE9SX1NDSEVNRVNfUkFXID0gREVGQVVMVF9DT0xPUlNDSEVNRTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBDb25maWdNYW5hZ2VyLkNPTE9SX1NDSEVNRVNfUkFXID0gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGhhbmRsZURhcmtTaXRlcygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgJHNpdGVzID0gQ29uZmlnTWFuYWdlci5vdmVycmlkZXMuZGFya1NpdGVzIHx8IENvbmZpZ01hbmFnZXIucmF3LmRhcmtTaXRlcztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5EQVJLX1NJVEVTX0lOREVYID0gaW5kZXhTaXRlTGlzdENvbmZpZygkc2l0ZXMgfHwgJycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGhhbmRsZURldGVjdG9ySGludHMoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0ICRoaW50cyA9IENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLmRldGVjdG9ySGludHMgfHwgQ29uZmlnTWFuYWdlci5yYXcuZGV0ZWN0b3JIaW50cyB8fCAnJztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5ERVRFQ1RPUl9ISU5UU19JTkRFWCA9IGluZGV4U2l0ZXNGaXhlc0NvbmZpZzxEZXRlY3RvckhpbnQ+KCRoaW50cyk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuREVURUNUT1JfSElOVFNfUkFXID0gJGhpbnRzO1xuICAgIH1cblxuICAgIHN0YXRpYyBoYW5kbGVEeW5hbWljVGhlbWVGaXhlcygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgJGZpeGVzID0gQ29uZmlnTWFuYWdlci5vdmVycmlkZXMuZHluYW1pY1RoZW1lRml4ZXMgfHwgQ29uZmlnTWFuYWdlci5yYXcuZHluYW1pY1RoZW1lRml4ZXMgfHwgJyc7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuRFlOQU1JQ19USEVNRV9GSVhFU19JTkRFWCA9IGluZGV4U2l0ZXNGaXhlc0NvbmZpZzxEeW5hbWljVGhlbWVGaXg+KCRmaXhlcyk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuRFlOQU1JQ19USEVNRV9GSVhFU19SQVcgPSAkZml4ZXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGhhbmRsZUludmVyc2lvbkZpeGVzKCk6IHZvaWQge1xuICAgICAgICBjb25zdCAkZml4ZXMgPSBDb25maWdNYW5hZ2VyLm92ZXJyaWRlcy5pbnZlcnNpb25GaXhlcyB8fCBDb25maWdNYW5hZ2VyLnJhdy5pbnZlcnNpb25GaXhlcyB8fCAnJztcbiAgICAgICAgQ29uZmlnTWFuYWdlci5JTlZFUlNJT05fRklYRVNfSU5ERVggPSBpbmRleFNpdGVzRml4ZXNDb25maWc8SW52ZXJzaW9uRml4PigkZml4ZXMpO1xuICAgICAgICBDb25maWdNYW5hZ2VyLklOVkVSU0lPTl9GSVhFU19SQVcgPSAkZml4ZXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGhhbmRsZVN0YXRpY1RoZW1lcygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgJHRoZW1lcyA9IENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLnN0YXRpY1RoZW1lcyB8fCBDb25maWdNYW5hZ2VyLnJhdy5zdGF0aWNUaGVtZXMgfHwgJyc7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuU1RBVElDX1RIRU1FU19JTkRFWCA9IGluZGV4U2l0ZXNGaXhlc0NvbmZpZzxTdGF0aWNUaGVtZT4oJHRoZW1lcyk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuU1RBVElDX1RIRU1FU19SQVcgPSAkdGhlbWVzO1xuICAgIH1cblxuICAgIHN0YXRpYyBpc1VSTEluRGFya0xpc3QodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGlzVVJMSW5TaXRlTGlzdCh1cmwsIENvbmZpZ01hbmFnZXIuREFSS19TSVRFU19JTkRFWCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtwYXJzZUludmVyc2lvbkZpeGVzLCBmb3JtYXRJbnZlcnNpb25GaXhlc30gZnJvbSAnLi4vZ2VuZXJhdG9ycy9jc3MtZmlsdGVyJztcbmltcG9ydCB7cGFyc2VEeW5hbWljVGhlbWVGaXhlcywgZm9ybWF0RHluYW1pY1RoZW1lRml4ZXN9IGZyb20gJy4uL2dlbmVyYXRvcnMvZHluYW1pYy10aGVtZSc7XG5pbXBvcnQge3BhcnNlU3RhdGljVGhlbWVzLCBmb3JtYXRTdGF0aWNUaGVtZXN9IGZyb20gJy4uL2dlbmVyYXRvcnMvc3RhdGljLXRoZW1lJztcbmltcG9ydCB7aXNGaXJlZm94fSBmcm9tICcuLi91dGlscy9wbGF0Zm9ybSc7XG5cbmltcG9ydCBDb25maWdNYW5hZ2VyIGZyb20gJy4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IHtsb2dJbmZvfSBmcm9tICcuL3V0aWxzL2xvZyc7XG5cbi8vIFRPRE8oYmVyc2hhbnNraXkpOiBBZGQgc3VwcG9ydCBmb3IgcmVhZHMvd3JpdGVzIG9mIG11bHRpcGxlIGtleXMgYXQgb25jZSBmb3IgcGVyZm9ybWFuY2UuXG4vLyBUT0RPKGJlcnNoYW5za2l5KTogUG9wdXAgVUkgaGVlZHMgb25seSBoYXNDdXN0b20qRml4ZXMoKSBhbmQgbm90aGluZyBlbHNlLiBDb25zaWRlciBzdG9yaW5nIHRoYXQgZGF0YSBzZXBhcmF0ZWx5LlxuaW50ZXJmYWNlIERldlRvb2xzU3RvcmFnZSB7XG4gICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPjtcbiAgICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgICBoYXMoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHwgYm9vbGVhbjtcbn1cblxuY2xhc3MgUGVyc2lzdGVudFN0b3JhZ2VXcmFwcGVyIGltcGxlbWVudHMgRGV2VG9vbHNTdG9yYWdlIHtcbiAgICAvLyBDYWNoZSBpbmZvcm1hdGlvbiB3aXRoaW4gYmFja2dyb3VuZCBjb250ZXh0IGZvciBmdXR1cmUgdXNlIHdpdGhvdXQgd2FpdGluZy5cbiAgICBwcml2YXRlIGNhY2hlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbH0gPSB7fTtcblxuICAgIGFzeW5jIGdldChrZXk6IHN0cmluZykge1xuICAgICAgICBpZiAoa2V5IGluIHRoaXMuY2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZyB8IG51bGw+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoa2V5LCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgY2FjaGUgcmVjZWl2ZWQgYSBuZXcgdmFsdWUgKGZyb20gY2FsbCB0byBzZXQoKSlcbiAgICAgICAgICAgICAgICAvLyBiZWZvcmUgd2UgcmV0cmlldmVkIHRoZSBvbGQgdmFsdWUgZnJvbSBzdG9yYWdlLFxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbmV3IHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gdGhpcy5jYWNoZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dJbmZvKGBLZXkgJHtrZXl9IHdhcyB3cml0dGVuIHRvIGR1cmluZyByZWFkIG9wZXJhdGlvbi5gKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmNhY2hlW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcXVlcnkgRGV2VG9vbHMgZGF0YScsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlW2tleV0gPSByZXN1bHRba2V5XTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdFtrZXldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jYWNoZVtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4gY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtba2V5XTogdmFsdWV9LCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHdyaXRlIERldlRvb2xzIGRhdGEnLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW1vdmUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jYWNoZVtrZXldID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoa2V5LCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRlbGV0ZSBEZXZUb29scyBkYXRhJywgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaGFzKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGF3YWl0IHRoaXMuZ2V0KGtleSkpO1xuICAgIH1cbn1cblxuY2xhc3MgVGVtcFN0b3JhZ2UgaW1wbGVtZW50cyBEZXZUb29sc1N0b3JhZ2Uge1xuICAgIHByaXZhdGUgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgIGFzeW5jIGdldChrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICB9XG5cbiAgICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJlbW92ZShrZXk6IHN0cmluZykge1xuICAgICAgICB0aGlzLm1hcC5kZWxldGUoa2V5KTtcbiAgICB9XG5cbiAgICBhc3luYyBoYXMoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmhhcyhrZXkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGV2VG9vbHMge1xuICAgIHByaXZhdGUgc3RhdGljIG9uQ2hhbmdlOiAoKSA9PiB2b2lkO1xuICAgIHByaXZhdGUgc3RhdGljIHN0b3JlOiBEZXZUb29sc1N0b3JhZ2U7XG5cbiAgICBzdGF0aWMgaW5pdChvbkNoYW5nZTogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICAvLyBGaXJlZm94IGRvbid0IHNlZW0gdG8gbGlrZSB1c2luZyBzdG9yYWdlLmxvY2FsIHRvIHN0b3JlIGJpZyBkYXRhIG9uIHRoZSBiYWNrZ3JvdW5kLWV4dGVuc2lvbi5cbiAgICAgICAgLy8gRGlzYWJsaW5nIGl0IGZvciBub3cgYW5kIGRlZmF1bHRpbmcgYmFjayB0byBsb2NhbFN0b3JhZ2UuXG4gICAgICAgIGlmICghaXNGaXJlZm94ICYmIHR5cGVvZiBjaHJvbWUuc3RvcmFnZS5sb2NhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgY2hyb21lLnN0b3JhZ2UubG9jYWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIERldlRvb2xzLnN0b3JlID0gbmV3IFBlcnNpc3RlbnRTdG9yYWdlV3JhcHBlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgRGV2VG9vbHMuc3RvcmUgPSBuZXcgVGVtcFN0b3JhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBEZXZUb29scy5sb2FkQ29uZmlnT3ZlcnJpZGVzKCk7XG4gICAgICAgIERldlRvb2xzLm9uQ2hhbmdlID0gb25DaGFuZ2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgS0VZX0RZTkFNSUMgPSAnZGV2X2R5bmFtaWNfdGhlbWVfZml4ZXMnO1xuICAgIHByaXZhdGUgc3RhdGljIEtFWV9GSUxURVIgPSAnZGV2X2ludmVyc2lvbl9maXhlcyc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgS0VZX1NUQVRJQyA9ICdkZXZfc3RhdGljX3RoZW1lcyc7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBsb2FkQ29uZmlnT3ZlcnJpZGVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBbXG4gICAgICAgICAgICBkeW5hbWljVGhlbWVGaXhlcyxcbiAgICAgICAgICAgIGludmVyc2lvbkZpeGVzLFxuICAgICAgICAgICAgc3RhdGljVGhlbWVzLFxuICAgICAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgRGV2VG9vbHMuZ2V0U2F2ZWREeW5hbWljVGhlbWVGaXhlcygpLFxuICAgICAgICAgICAgRGV2VG9vbHMuZ2V0U2F2ZWRJbnZlcnNpb25GaXhlcygpLFxuICAgICAgICAgICAgRGV2VG9vbHMuZ2V0U2F2ZWRTdGF0aWNUaGVtZXMoKSxcbiAgICAgICAgXSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLmR5bmFtaWNUaGVtZUZpeGVzID0gZHluYW1pY1RoZW1lRml4ZXMgfHwgbnVsbDtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5vdmVycmlkZXMuaW52ZXJzaW9uRml4ZXMgPSBpbnZlcnNpb25GaXhlcyB8fCBudWxsO1xuICAgICAgICBDb25maWdNYW5hZ2VyLm92ZXJyaWRlcy5zdGF0aWNUaGVtZXMgPSBzdGF0aWNUaGVtZXMgfHwgbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBnZXRTYXZlZER5bmFtaWNUaGVtZUZpeGVzKCkge1xuICAgICAgICByZXR1cm4gRGV2VG9vbHMuc3RvcmUuZ2V0KERldlRvb2xzLktFWV9EWU5BTUlDKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBzYXZlRHluYW1pY1RoZW1lRml4ZXModGV4dDogc3RyaW5nKSB7XG4gICAgICAgIERldlRvb2xzLnN0b3JlLnNldChEZXZUb29scy5LRVlfRFlOQU1JQywgdGV4dCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldER5bmFtaWNUaGVtZUZpeGVzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgcmF3Rml4ZXMgPSBhd2FpdCBEZXZUb29scy5nZXRTYXZlZER5bmFtaWNUaGVtZUZpeGVzKCk7XG4gICAgICAgIGlmICghcmF3Rml4ZXMpIHtcbiAgICAgICAgICAgIGF3YWl0IENvbmZpZ01hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgcmF3Rml4ZXMgPSBDb25maWdNYW5hZ2VyLkRZTkFNSUNfVEhFTUVfRklYRVNfUkFXIHx8ICcnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpeGVzID0gcGFyc2VEeW5hbWljVGhlbWVGaXhlcyhyYXdGaXhlcyk7XG4gICAgICAgIHJldHVybiBmb3JtYXREeW5hbWljVGhlbWVGaXhlcyhmaXhlcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHJlc2V0RHluYW1pY1RoZW1lRml4ZXMoKTogdm9pZCB7XG4gICAgICAgIERldlRvb2xzLnN0b3JlLnJlbW92ZShEZXZUb29scy5LRVlfRFlOQU1JQyk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLmR5bmFtaWNUaGVtZUZpeGVzID0gbnVsbDtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5oYW5kbGVEeW5hbWljVGhlbWVGaXhlcygpO1xuICAgICAgICBEZXZUb29scy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIC8vIFRPRE8oQW50b24pOiByZW1vdmUgYW55XG4gICAgc3RhdGljIGFwcGx5RHluYW1pY1RoZW1lRml4ZXModGV4dDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdER5bmFtaWNUaGVtZUZpeGVzKHBhcnNlRHluYW1pY1RoZW1lRml4ZXModGV4dCkpO1xuICAgICAgICAgICAgQ29uZmlnTWFuYWdlci5vdmVycmlkZXMuZHluYW1pY1RoZW1lRml4ZXMgPSBmb3JtYXR0ZWQ7XG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLmhhbmRsZUR5bmFtaWNUaGVtZUZpeGVzKCk7XG4gICAgICAgICAgICBEZXZUb29scy5zYXZlRHluYW1pY1RoZW1lRml4ZXMoZm9ybWF0dGVkKTtcbiAgICAgICAgICAgIERldlRvb2xzLm9uQ2hhbmdlKCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0U2F2ZWRJbnZlcnNpb25GaXhlcygpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0KERldlRvb2xzLktFWV9GSUxURVIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHNhdmVJbnZlcnNpb25GaXhlcyh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdG9yZS5zZXQoRGV2VG9vbHMuS0VZX0ZJTFRFUiwgdGV4dCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldEludmVyc2lvbkZpeGVzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgcmF3Rml4ZXMgPSBhd2FpdCBEZXZUb29scy5nZXRTYXZlZEludmVyc2lvbkZpeGVzKCk7XG4gICAgICAgIGlmICghcmF3Rml4ZXMpIHtcbiAgICAgICAgICAgIGF3YWl0IENvbmZpZ01hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgcmF3Rml4ZXMgPSBDb25maWdNYW5hZ2VyLklOVkVSU0lPTl9GSVhFU19SQVcgfHwgJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZml4ZXMgPSBwYXJzZUludmVyc2lvbkZpeGVzKHJhd0ZpeGVzKTtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEludmVyc2lvbkZpeGVzKGZpeGVzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmVzZXRJbnZlcnNpb25GaXhlcygpOiB2b2lkIHtcbiAgICAgICAgRGV2VG9vbHMuc3RvcmUucmVtb3ZlKERldlRvb2xzLktFWV9GSUxURVIpO1xuICAgICAgICBDb25maWdNYW5hZ2VyLm92ZXJyaWRlcy5pbnZlcnNpb25GaXhlcyA9IG51bGw7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuaGFuZGxlSW52ZXJzaW9uRml4ZXMoKTtcbiAgICAgICAgRGV2VG9vbHMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKEFudG9uKTogcmVtb3ZlIGFueVxuICAgIHN0YXRpYyBhcHBseUludmVyc2lvbkZpeGVzKHRleHQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRJbnZlcnNpb25GaXhlcyhwYXJzZUludmVyc2lvbkZpeGVzKHRleHQpKTtcbiAgICAgICAgICAgIENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLmludmVyc2lvbkZpeGVzID0gZm9ybWF0dGVkO1xuICAgICAgICAgICAgQ29uZmlnTWFuYWdlci5oYW5kbGVJbnZlcnNpb25GaXhlcygpO1xuICAgICAgICAgICAgRGV2VG9vbHMuc2F2ZUludmVyc2lvbkZpeGVzKGZvcm1hdHRlZCk7XG4gICAgICAgICAgICBEZXZUb29scy5vbkNoYW5nZSgpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldFNhdmVkU3RhdGljVGhlbWVzKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICByZXR1cm4gRGV2VG9vbHMuc3RvcmUuZ2V0KERldlRvb2xzLktFWV9TVEFUSUMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHNhdmVTdGF0aWNUaGVtZXModGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIERldlRvb2xzLnN0b3JlLnNldChEZXZUb29scy5LRVlfU1RBVElDLCB0ZXh0KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgZ2V0U3RhdGljVGhlbWVzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgcmF3VGhlbWVzID0gYXdhaXQgRGV2VG9vbHMuZ2V0U2F2ZWRTdGF0aWNUaGVtZXMoKTtcbiAgICAgICAgaWYgKCFyYXdUaGVtZXMpIHtcbiAgICAgICAgICAgIGF3YWl0IENvbmZpZ01hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgcmF3VGhlbWVzID0gQ29uZmlnTWFuYWdlci5TVEFUSUNfVEhFTUVTX1JBVyB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0aGVtZXMgPSBwYXJzZVN0YXRpY1RoZW1lcyhyYXdUaGVtZXMpO1xuICAgICAgICByZXR1cm4gZm9ybWF0U3RhdGljVGhlbWVzKHRoZW1lcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHJlc2V0U3RhdGljVGhlbWVzKCk6IHZvaWQge1xuICAgICAgICBEZXZUb29scy5zdG9yZS5yZW1vdmUoRGV2VG9vbHMuS0VZX1NUQVRJQyk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIub3ZlcnJpZGVzLnN0YXRpY1RoZW1lcyA9IG51bGw7XG4gICAgICAgIENvbmZpZ01hbmFnZXIuaGFuZGxlU3RhdGljVGhlbWVzKCk7XG4gICAgICAgIERldlRvb2xzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhBbnRvbik6IHJlbW92ZSBhbnlcbiAgICBzdGF0aWMgYXBwbHlTdGF0aWNUaGVtZXModGV4dDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdFN0YXRpY1RoZW1lcyhwYXJzZVN0YXRpY1RoZW1lcyh0ZXh0KSk7XG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLm92ZXJyaWRlcy5zdGF0aWNUaGVtZXMgPSBmb3JtYXR0ZWQ7XG4gICAgICAgICAgICBDb25maWdNYW5hZ2VyLmhhbmRsZVN0YXRpY1RoZW1lcygpO1xuICAgICAgICAgICAgRGV2VG9vbHMuc2F2ZVN0YXRpY1RoZW1lcyhmb3JtYXR0ZWQpO1xuICAgICAgICAgICAgRGV2VG9vbHMub25DaGFuZ2UoKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge2lzTm9uUGVyc2lzdGVudH0gZnJvbSAnLi4vdXRpbHMvcGxhdGZvcm0nO1xuXG5kZWNsYXJlIGNvbnN0IF9fVEhVTkRFUkJJUkRfXzogYm9vbGVhbjtcblxuaW50ZXJmYWNlIEljb25TdGF0ZSB7XG4gICAgYmFkZ2VUZXh0OiBzdHJpbmc7XG4gICAgYWN0aXZlOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSWNvbk9wdGlvbnMge1xuICAgIGNvbG9yU2NoZW1lPzogJ2RhcmsnIHwgJ2xpZ2h0JztcbiAgICBpc0FjdGl2ZT86IGJvb2xlYW47XG4gICAgdGFiSWQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEljb25NYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJQ09OX1BBVEhTID0ge1xuICAgICAgICBhY3RpdmVEYXJrOiB7XG4gICAgICAgICAgICAxOTogJy4uL2ljb25zL2RyX2FjdGl2ZV8xOS5wbmcnLFxuICAgICAgICAgICAgMzg6ICcuLi9pY29ucy9kcl9hY3RpdmVfMzgucG5nJyxcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZlTGlnaHQ6IHtcbiAgICAgICAgICAgIDE5OiAnLi4vaWNvbnMvZHJfYWN0aXZlX2xpZ2h0XzE5LnBuZycsXG4gICAgICAgICAgICAzODogJy4uL2ljb25zL2RyX2FjdGl2ZV9saWdodF8zOC5wbmcnLFxuICAgICAgICB9LFxuICAgICAgICAvLyBUZW1wb3JhcnkgZGlzYWJsZSB0aGUgZ3JheSBpY29uXG4gICAgICAgIC8qXG4gICAgICAgIGluYWN0aXZlRGFyazoge1xuICAgICAgICAgICAgMTk6ICcuLi9pY29ucy9kcl9pbmFjdGl2ZV9kYXJrXzE5LnBuZycsXG4gICAgICAgICAgICAzODogJy4uL2ljb25zL2RyX2luYWN0aXZlX2RhcmtfMzgucG5nJyxcbiAgICAgICAgfSxcbiAgICAgICAgaW5hY3RpdmVMaWdodDoge1xuICAgICAgICAgICAgMTk6ICcuLi9pY29ucy9kcl9pbmFjdGl2ZV9saWdodF8xOS5wbmcnLFxuICAgICAgICAgICAgMzg6ICcuLi9pY29ucy9kcl9pbmFjdGl2ZV9saWdodF8zOC5wbmcnLFxuICAgICAgICB9LFxuICAgICAgICAqL1xuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBpY29uU3RhdGU6IEljb25TdGF0ZSA9IHtcbiAgICAgICAgYmFkZ2VUZXh0OiAnJyxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBvblN0YXJ0dXAoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIGVtcHR5IGxpc3RlbmVyIGludm9rZXMgZXh0ZW5zaW9uIGJhY2tncm91bmQgaWYgZXh0ZW5zaW9uIGhhcyBub24tZGVmYXVsdFxuICAgICAgICAgKiBpY29uIG9yIGJhZGdlLiBJdCBpcyBlbXB0eSBiZWNhdXNlIGFsbCBpY29uIGN1c3RvbWl6YXRpb25zIHdpbGwgYmUgaW5pdGlhdGVkIGJ5XG4gICAgICAgICAqIEV4dGVuc2lvbiBjbGFzcy5cbiAgICAgICAgICogVE9ETzogZXZlbnR1YWxseSwgYXZvaWQgcnVubmluZyB0aGUgd2hvbGUgRXh0ZW5zaW9uIGNsYXNzIG9uIHN0YXJ0dXAuXG4gICAgICAgICAqL1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJlZ2lzdGVycyBvblN0YXJ0dXAgbGlzdGVuZXIgb25seSBpZiB3ZSBhcmUgaW4gbm9uLXBlcnNpc3RlbnQgd29ybGQgYW5kXG4gICAgICogaWNvbiBpcyBpbiBub24tZGVmYXVsdCBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGhhbmRsZVVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKCFpc05vblBlcnNpc3RlbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoSWNvbk1hbmFnZXIuaWNvblN0YXRlLmJhZGdlVGV4dCAhPT0gJycgfHwgIUljb25NYW5hZ2VyLmljb25TdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uU3RhcnR1cC5hZGRMaXN0ZW5lcihJY29uTWFuYWdlci5vblN0YXJ0dXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUub25TdGFydHVwLnJlbW92ZUxpc3RlbmVyKEljb25NYW5hZ2VyLm9uU3RhcnR1cCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgc2V0SWNvbih7aXNBY3RpdmUgPSB0aGlzLmljb25TdGF0ZS5hY3RpdmUsIGNvbG9yU2NoZW1lID0gJ2RhcmsnLCB0YWJJZH06IEljb25PcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGlmIChfX1RIVU5ERVJCSVJEX18gfHwgIWNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24pIHtcbiAgICAgICAgICAgIC8vIEZpeCBmb3IgRmlyZWZveCBBbmRyb2lkIGFuZCBUaHVuZGVyYmlyZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZW1wb3JhcnkgZGlzYWJsZSBwZXItc2l0ZSBpY29uc1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHlcbiAgICAgICAgaWYgKGNvbG9yU2NoZW1lID09PSAnZGFyaycpIHtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFiSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaWNvblN0YXRlLmFjdGl2ZSA9IGlzQWN0aXZlO1xuXG4gICAgICAgIGxldCBwYXRoID0gdGhpcy5JQ09OX1BBVEhTLmFjdGl2ZURhcms7XG4gICAgICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgICAgICAgLy8gVGVtcG9yYXJ5IGRpc2FibGUgdGhlIGdyYXkgaWNvblxuICAgICAgICAgICAgLy8gcGF0aCA9IGNvbG9yU2NoZW1lID09PSAnZGFyaycgPyBJY29uTWFuYWdlci5JQ09OX1BBVEhTLmFjdGl2ZURhcmsgOiBJY29uTWFuYWdlci5JQ09OX1BBVEhTLmFjdGl2ZUxpZ2h0O1xuICAgICAgICAgICAgcGF0aCA9IEljb25NYW5hZ2VyLklDT05fUEFUSFMuYWN0aXZlRGFyaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRlbXBvcmFyeSBkaXNhYmxlIHRoZSBncmF5IGljb25cbiAgICAgICAgICAgIC8vIHBhdGggPSBjb2xvclNjaGVtZSA9PT0gJ2RhcmsnID8gSWNvbk1hbmFnZXIuSUNPTl9QQVRIUy5pbmFjdGl2ZURhcmsgOiBJY29uTWFuYWdlci5JQ09OX1BBVEhTLmluYWN0aXZlTGlnaHQ7XG4gICAgICAgICAgICBwYXRoID0gSWNvbk1hbmFnZXIuSUNPTl9QQVRIUy5hY3RpdmVMaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlbXBvcmFyeSBkaXNhYmxlIHBlci1zaXRlIGljb25zXG4gICAgICAgIC8qXG4gICAgICAgIGlmICh0YWJJZCkge1xuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7dGFiSWQsIHBhdGh9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe3BhdGh9KTtcbiAgICAgICAgICAgIEljb25NYW5hZ2VyLmhhbmRsZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe3BhdGh9KTtcbiAgICAgICAgSWNvbk1hbmFnZXIuaGFuZGxlVXBkYXRlKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHNob3dCYWRnZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgSWNvbk1hbmFnZXIuaWNvblN0YXRlLmJhZGdlVGV4dCA9IHRleHQ7XG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlQmFja2dyb3VuZENvbG9yKHtjb2xvcjogJyNlOTZjNGMnfSk7XG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7dGV4dH0pO1xuICAgICAgICBJY29uTWFuYWdlci5oYW5kbGVVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGlkZUJhZGdlKCk6IHZvaWQge1xuICAgICAgICBJY29uTWFuYWdlci5pY29uU3RhdGUuYmFkZ2VUZXh0ID0gJyc7XG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7dGV4dDogJyd9KTtcbiAgICAgICAgSWNvbk1hbmFnZXIuaGFuZGxlVXBkYXRlKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHR5cGUge0V4dGVuc2lvbkRhdGEsIFRoZW1lLCBUYWJJbmZvLCBNZXNzYWdlVUl0b0JHLCBVc2VyU2V0dGluZ3MsIERldlRvb2xzRGF0YSwgTWVzc2FnZUNTdG9CRywgTWVzc2FnZUJHdG9VSX0gZnJvbSAnLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHtNZXNzYWdlVHlwZUJHdG9VSSwgTWVzc2FnZVR5cGVVSXRvQkd9IGZyb20gJy4uL3V0aWxzL21lc3NhZ2UnO1xuaW1wb3J0IHtIT01FUEFHRV9VUkx9IGZyb20gJy4uL3V0aWxzL2xpbmtzJztcbmltcG9ydCB7aXNGaXJlZm94fSBmcm9tICcuLi91dGlscy9wbGF0Zm9ybSc7XG5cbmltcG9ydCB7bWFrZUZpcmVmb3hIYXBweX0gZnJvbSAnLi9tYWtlLWZpcmVmb3gtaGFwcHknO1xuaW1wb3J0IHtBU1NFUlR9IGZyb20gJy4vdXRpbHMvbG9nJztcblxuZGVjbGFyZSBjb25zdCBfX1BMVVNfXzogYm9vbGVhbjtcblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbnNpb25BZGFwdGVyIHtcbiAgICBjb2xsZWN0OiAoKSA9PiBQcm9taXNlPEV4dGVuc2lvbkRhdGE+O1xuICAgIGNvbGxlY3REZXZUb29sc0RhdGE6ICgpID0+IFByb21pc2U8RGV2VG9vbHNEYXRhPjtcbiAgICBjaGFuZ2VTZXR0aW5nczogKHNldHRpbmdzOiBQYXJ0aWFsPFVzZXJTZXR0aW5ncz4pID0+IHZvaWQ7XG4gICAgc2V0VGhlbWU6ICh0aGVtZTogUGFydGlhbDxUaGVtZT4pID0+IHZvaWQ7XG4gICAgbWFya05ld3NBc1JlYWQ6IChpZHM6IHN0cmluZ1tdKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIG1hcmtOZXdzQXNEaXNwbGF5ZWQ6IChpZHM6IHN0cmluZ1tdKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIHRvZ2dsZUFjdGl2ZVRhYjogKCkgPT4gdm9pZDtcbiAgICBsb2FkQ29uZmlnOiAob3B0aW9uczoge2xvY2FsOiBib29sZWFufSkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICBhcHBseURldkR5bmFtaWNUaGVtZUZpeGVzOiAoanNvbjogc3RyaW5nKSA9PiBFcnJvcjtcbiAgICByZXNldERldkR5bmFtaWNUaGVtZUZpeGVzOiAoKSA9PiB2b2lkO1xuICAgIGFwcGx5RGV2SW52ZXJzaW9uRml4ZXM6IChqc29uOiBzdHJpbmcpID0+IEVycm9yO1xuICAgIHJlc2V0RGV2SW52ZXJzaW9uRml4ZXM6ICgpID0+IHZvaWQ7XG4gICAgYXBwbHlEZXZTdGF0aWNUaGVtZXM6ICh0ZXh0OiBzdHJpbmcpID0+IEVycm9yO1xuICAgIHJlc2V0RGV2U3RhdGljVGhlbWVzOiAoKSA9PiB2b2lkO1xuICAgIHN0YXJ0QWN0aXZhdGlvbjogKGVtYWlsOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIHJlc2V0QWN0aXZhdGlvbjogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICBoaWRlSGlnaGxpZ2h0czogKGlkczogc3RyaW5nW10pID0+IFByb21pc2U8dm9pZD47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NlbmdlciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgYWRhcHRlcjogRXh0ZW5zaW9uQWRhcHRlcjtcbiAgICBwcml2YXRlIHN0YXRpYyBjaGFuZ2VMaXN0ZW5lckNvdW50OiBudW1iZXI7XG5cbiAgICBzdGF0aWMgaW5pdChhZGFwdGVyOiBFeHRlbnNpb25BZGFwdGVyKTogdm9pZCB7XG4gICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyID0gYWRhcHRlcjtcbiAgICAgICAgTWVzc2VuZ2VyLmNoYW5nZUxpc3RlbmVyQ291bnQgPSAwO1xuXG4gICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihNZXNzZW5nZXIubWVzc2FnZUxpc3RlbmVyKTtcblxuICAgICAgICAvLyBUaGlzIGlzIGEgd29yay1hcm91bmQgZm9yIEZpcmVmb3ggYnVnIHdoaWNoIGRvZXMgbm90IHBlcm1pdCByZXNwb25kaW5nIHRvIG9uTWVzc2FnZSBoYW5kbGVyIGFib3ZlLlxuICAgICAgICBpZiAoaXNGaXJlZm94KSB7XG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoTWVzc2VuZ2VyLmZpcmVmb3hQb3J0TGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbWVzc2FnZUxpc3RlbmVyKG1lc3NhZ2U6IE1lc3NhZ2VVSXRvQkcgfCBNZXNzYWdlQ1N0b0JHLCBzZW5kZXI6IGNocm9tZS5ydW50aW1lLk1lc3NhZ2VTZW5kZXIsIHNlbmRSZXNwb25zZTogKHJlc3BvbnNlOiB7ZGF0YT86IEV4dGVuc2lvbkRhdGEgfCBEZXZUb29sc0RhdGEgfCBUYWJJbmZvOyBlcnJvcj86IHN0cmluZ30gfCAndW5zdXBwb3J0ZWRTZW5kZXInKSA9PiB2b2lkKSB7XG4gICAgICAgIGlmIChpc0ZpcmVmb3ggJiYgbWFrZUZpcmVmb3hIYXBweShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbGxvd2VkU2VuZGVyVVJMID0gW1xuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCcvdWkvcG9wdXAvaW5kZXguaHRtbCcpLFxuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCcvdWkvZGV2dG9vbHMvaW5kZXguaHRtbCcpLFxuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCcvdWkvb3B0aW9ucy9pbmRleC5odG1sJyksXG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5nZXRVUkwoJy91aS9zdHlsZXNoZWV0LWVkaXRvci9pbmRleC5odG1sJyksXG4gICAgICAgIF07XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGFsbG93ZWRTZW5kZXJVUkwuaW5jbHVkZXMoc2VuZGVyLnVybCEpIHx8IChcbiAgICAgICAgICAgICAgICBfX1BMVVNfXyAmJlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UudHlwZSA9PT0gTWVzc2FnZVR5cGVVSXRvQkcuQ0hBTkdFX1NFVFRJTkdTICYmXG4gICAgICAgICAgICAgICAgc2VuZGVyLnVybD8uc3RhcnRzV2l0aChgJHtIT01FUEFHRV9VUkx9L3BsdXMvYWN0aXZhdGUvYClcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBNZXNzZW5nZXIub25VSU1lc3NhZ2UobWVzc2FnZSBhcyBNZXNzYWdlVUl0b0JHLCBzZW5kUmVzcG9uc2UpO1xuICAgICAgICAgICAgcmV0dXJuIChbXG4gICAgICAgICAgICAgICAgTWVzc2FnZVR5cGVVSXRvQkcuR0VUX0RBVEEsXG4gICAgICAgICAgICAgICAgTWVzc2FnZVR5cGVVSXRvQkcuR0VUX0RFVlRPT0xTX0RBVEEsXG4gICAgICAgICAgICBdLmluY2x1ZGVzKG1lc3NhZ2UudHlwZSBhcyBNZXNzYWdlVHlwZVVJdG9CRykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmlyZWZveFBvcnRMaXN0ZW5lcihwb3J0OiBjaHJvbWUucnVudGltZS5Qb3J0KSB7XG4gICAgICAgIEFTU0VSVCgnTWVzc2VuZ2VyLmZpcmVmb3hQb3J0TGlzdGVuZXIoKSBpcyB1c2VkIG9ubHkgb24gRmlyZWZveCcsIGlzRmlyZWZveCk7XG5cbiAgICAgICAgaWYgKCFpc0ZpcmVmb3gpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPEV4dGVuc2lvbkRhdGEgfCBEZXZUb29sc0RhdGEgfCBUYWJJbmZvIHwgbnVsbD47XG4gICAgICAgIHN3aXRjaCAocG9ydC5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkdFVF9EQVRBOlxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBNZXNzZW5nZXIuYWRhcHRlci5jb2xsZWN0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkdFVF9ERVZUT09MU19EQVRBOlxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBNZXNzZW5nZXIuYWRhcHRlci5jb2xsZWN0RGV2VG9vbHNEYXRhKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBUaGVzZSB0eXBlcyByZXF1aXJlIGRhdGEsIHNvIHdlIG5lZWQgdG8gYWRkIGEgbGlzdGVuZXIgdG8gdGhlIHBvcnQuXG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkFQUExZX0RFVl9EWU5BTUlDX1RIRU1FX0ZJWEVTOlxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5BUFBMWV9ERVZfSU5WRVJTSU9OX0ZJWEVTOlxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5BUFBMWV9ERVZfU1RBVElDX1RIRU1FUzpcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZTogTWVzc2FnZVVJdG9CRyB8IE1lc3NhZ2VDU3RvQkcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHtkYXRhfSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3I6IEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwb3J0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkFQUExZX0RFVl9EWU5BTUlDX1RIRU1FX0ZJWEVTOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IE1lc3Nlbmdlci5hZGFwdGVyLmFwcGx5RGV2RHluYW1pY1RoZW1lRml4ZXMoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGVVSXRvQkcuQVBQTFlfREVWX0lOVkVSU0lPTl9GSVhFUzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBNZXNzZW5nZXIuYWRhcHRlci5hcHBseURldkludmVyc2lvbkZpeGVzKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkFQUExZX0RFVl9TVEFUSUNfVEhFTUVTOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IE1lc3Nlbmdlci5hZGFwdGVyLmFwcGx5RGV2U3RhdGljVGhlbWVzKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcG9ydCBuYW1lOiAke3BvcnQubmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS50aGVuKChkYXRhKSA9PiBwb3J0LnBvc3RNZXNzYWdlKHtkYXRhfSkpXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiBwb3J0LnBvc3RNZXNzYWdlKHtlcnJvcn0pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBvblVJTWVzc2FnZSh7dHlwZSwgZGF0YX06IE1lc3NhZ2VVSXRvQkcsIHNlbmRSZXNwb25zZTogKHJlc3BvbnNlOiB7ZGF0YT86IEV4dGVuc2lvbkRhdGEgfCBEZXZUb29sc0RhdGEgfCBUYWJJbmZvOyBlcnJvcj86IHN0cmluZ30pID0+IHZvaWQpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkdFVF9EQVRBOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLmNvbGxlY3QoKS50aGVuKChkYXRhKSA9PiBzZW5kUmVzcG9uc2Uoe2RhdGF9KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkdFVF9ERVZUT09MU19EQVRBOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLmNvbGxlY3REZXZUb29sc0RhdGEoKS50aGVuKChkYXRhKSA9PiBzZW5kUmVzcG9uc2Uoe2RhdGF9KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLlNVQlNDUklCRV9UT19DSEFOR0VTOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5jaGFuZ2VMaXN0ZW5lckNvdW50Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLlVOU1VCU0NSSUJFX0ZST01fQ0hBTkdFUzpcbiAgICAgICAgICAgICAgICBNZXNzZW5nZXIuY2hhbmdlTGlzdGVuZXJDb3VudC0tO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5DSEFOR0VfU0VUVElOR1M6XG4gICAgICAgICAgICAgICAgTWVzc2VuZ2VyLmFkYXB0ZXIuY2hhbmdlU2V0dGluZ3MoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLlNFVF9USEVNRTpcbiAgICAgICAgICAgICAgICBNZXNzZW5nZXIuYWRhcHRlci5zZXRUaGVtZShkYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGVVSXRvQkcuVE9HR0xFX0FDVElWRV9UQUI6XG4gICAgICAgICAgICAgICAgTWVzc2VuZ2VyLmFkYXB0ZXIudG9nZ2xlQWN0aXZlVGFiKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLk1BUktfTkVXU19BU19SRUFEOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLm1hcmtOZXdzQXNSZWFkKGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5NQVJLX05FV1NfQVNfRElTUExBWUVEOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLm1hcmtOZXdzQXNEaXNwbGF5ZWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkxPQURfQ09ORklHOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLmxvYWRDb25maWcoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkFQUExZX0RFVl9EWU5BTUlDX1RIRU1FX0ZJWEVTOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBNZXNzZW5nZXIuYWRhcHRlci5hcHBseURldkR5bmFtaWNUaGVtZUZpeGVzKGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7ZXJyb3I6IChlcnJvciA/IGVycm9yLm1lc3NhZ2UgOiB1bmRlZmluZWQpfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLlJFU0VUX0RFVl9EWU5BTUlDX1RIRU1FX0ZJWEVTOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLnJlc2V0RGV2RHluYW1pY1RoZW1lRml4ZXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGVVSXRvQkcuQVBQTFlfREVWX0lOVkVSU0lPTl9GSVhFUzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gTWVzc2VuZ2VyLmFkYXB0ZXIuYXBwbHlEZXZJbnZlcnNpb25GaXhlcyhkYXRhKTtcbiAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe2Vycm9yOiAoZXJyb3IgPyBlcnJvci5tZXNzYWdlIDogdW5kZWZpbmVkKX0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5SRVNFVF9ERVZfSU5WRVJTSU9OX0ZJWEVTOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLnJlc2V0RGV2SW52ZXJzaW9uRml4ZXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGVVSXRvQkcuQVBQTFlfREVWX1NUQVRJQ19USEVNRVM6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IE1lc3Nlbmdlci5hZGFwdGVyLmFwcGx5RGV2U3RhdGljVGhlbWVzKGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7ZXJyb3I6IGVycm9yID8gZXJyb3IubWVzc2FnZSA6IHVuZGVmaW5lZH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5SRVNFVF9ERVZfU1RBVElDX1RIRU1FUzpcbiAgICAgICAgICAgICAgICBNZXNzZW5nZXIuYWRhcHRlci5yZXNldERldlN0YXRpY1RoZW1lcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZVVJdG9CRy5TVEFSVF9BQ1RJVkFUSU9OOlxuICAgICAgICAgICAgICAgIE1lc3Nlbmdlci5hZGFwdGVyLnN0YXJ0QWN0aXZhdGlvbihkYXRhLmVtYWlsLCBkYXRhLmtleSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLlJFU0VUX0FDVElWQVRJT046XG4gICAgICAgICAgICAgICAgTWVzc2VuZ2VyLmFkYXB0ZXIucmVzZXRBY3RpdmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkhJREVfSElHSExJR0hUUzpcbiAgICAgICAgICAgICAgICBNZXNzZW5nZXIuYWRhcHRlci5oaWRlSGlnaGxpZ2h0cyhkYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVwb3J0Q2hhbmdlcyhkYXRhOiBFeHRlbnNpb25EYXRhKTogdm9pZCB7XG4gICAgICAgIGlmIChNZXNzZW5nZXIuY2hhbmdlTGlzdGVuZXJDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlPE1lc3NhZ2VCR3RvVUk+KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZUJHdG9VSS5DSEFOR0VTLFxuICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB0eXBlIHtOZXdzfSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2dldEJsb2dQb3N0VVJMLCBORVdTX1VSTH0gZnJvbSAnLi4vdXRpbHMvbGlua3MnO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXJ9IGZyb20gJy4uL3V0aWxzL3N0YXRlLW1hbmFnZXInO1xuaW1wb3J0IHtnZXREdXJhdGlvbkluTWludXRlc30gZnJvbSAnLi4vdXRpbHMvdGltZSc7XG5cbmltcG9ydCBJY29uTWFuYWdlciBmcm9tICcuL2ljb24tbWFuYWdlcic7XG5pbXBvcnQge3JlYWRTeW5jU3RvcmFnZSwgcmVhZExvY2FsU3RvcmFnZSwgd3JpdGVTeW5jU3RvcmFnZSwgd3JpdGVMb2NhbFN0b3JhZ2V9IGZyb20gJy4vdXRpbHMvZXh0ZW5zaW9uLWFwaSc7XG5pbXBvcnQge2xvZ1dhcm59IGZyb20gJy4vdXRpbHMvbG9nJztcblxuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcblxuaW50ZXJmYWNlIE5ld3NtYWtlclN0YXRlIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGxhdGVzdDogTmV3c1tdO1xuICAgIGxhdGVzdFRpbWVzdGFtcDogbnVtYmVyIHwgbnVsbDtcbn1cblxubGV0IG5ld3NGb3JUZXN0aW5nOiBOZXdzW10gfCBudWxsID0gW3tcbiAgICBpZDogJ3NvbWUnLFxuICAgIGRhdGU6ICcxMCcsXG4gICAgdXJsOiAnLycsXG4gICAgaGVhZGxpbmU6ICdOZXdzJyxcbn1dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXdzbWFrZXIge1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVQREFURV9JTlRFUlZBTCA9IGdldER1cmF0aW9uSW5NaW51dGVzKHtob3VyczogNH0pO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEFMQVJNX05BTUUgPSAnbmV3c21ha2VyJztcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMT0NBTF9TVE9SQUdFX0tFWSA9ICdOZXdzbWFrZXItc3RhdGUnO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBzdGF0aWMgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXI8TmV3c21ha2VyU3RhdGU+O1xuICAgIHByaXZhdGUgc3RhdGljIGxhdGVzdDogTmV3c1tdO1xuICAgIHByaXZhdGUgc3RhdGljIGxhdGVzdFRpbWVzdGFtcDogbnVtYmVyIHwgbnVsbDtcblxuICAgIHByaXZhdGUgc3RhdGljIGluaXQoKSB7XG4gICAgICAgIGlmIChOZXdzbWFrZXIuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgcGF0aCBpcyBuZXZlciB0YWtlbiBzaW5jZSBFeHRlbnNpb24uY29uc3RydWN0b3IoKSBldmVyIGNyZWF0ZXMgb25lIGluc3RhbmNlLlxuICAgICAgICAgICAgbG9nV2FybignQXR0ZW1wdGluZyB0byByZS1pbml0aWFsaXplIE5ld3NtYWtlci4gRG9pbmcgbm90aGluZy4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBOZXdzbWFrZXIuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgIE5ld3NtYWtlci5zdGF0ZU1hbmFnZXIgPSBuZXcgU3RhdGVNYW5hZ2VyPE5ld3NtYWtlclN0YXRlPihOZXdzbWFrZXIuTE9DQUxfU1RPUkFHRV9LRVksIHRoaXMsIHtsYXRlc3Q6IFtdLCBsYXRlc3RUaW1lc3RhbXA6IG51bGx9LCBsb2dXYXJuKTtcbiAgICAgICAgTmV3c21ha2VyLmxhdGVzdCA9IFtdO1xuICAgICAgICBOZXdzbWFrZXIubGF0ZXN0VGltZXN0YW1wID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBvblVwZGF0ZSgpIHtcbiAgICAgICAgTmV3c21ha2VyLmluaXQoKTtcbiAgICAgICAgY29uc3QgbGF0ZXN0TmV3cyA9IE5ld3NtYWtlci5sYXRlc3QubGVuZ3RoID4gMCAmJiBOZXdzbWFrZXIubGF0ZXN0WzBdO1xuICAgICAgICBpZiAobGF0ZXN0TmV3cyAmJiBsYXRlc3ROZXdzLmJhZGdlICYmICFsYXRlc3ROZXdzLnJlYWQgJiYgIWxhdGVzdE5ld3MuZGlzcGxheWVkKSB7XG4gICAgICAgICAgICBJY29uTWFuYWdlci5zaG93QmFkZ2UobGF0ZXN0TmV3cy5iYWRnZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBJY29uTWFuYWdlci5oaWRlQmFkZ2UoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgZ2V0TGF0ZXN0KCk6IFByb21pc2U8TmV3c1tdPiB7XG4gICAgICAgIE5ld3NtYWtlci5pbml0KCk7XG4gICAgICAgIGF3YWl0IE5ld3NtYWtlci5zdGF0ZU1hbmFnZXIubG9hZFN0YXRlKCk7XG4gICAgICAgIHJldHVybiBOZXdzbWFrZXIubGF0ZXN0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFsYXJtTGlzdGVuZXIgPSAoYWxhcm06IGNocm9tZS5hbGFybXMuQWxhcm0pOiB2b2lkID0+IHtcbiAgICAgICAgTmV3c21ha2VyLmluaXQoKTtcbiAgICAgICAgaWYgKGFsYXJtLm5hbWUgPT09IE5ld3NtYWtlci5BTEFSTV9OQU1FKSB7XG4gICAgICAgICAgICBOZXdzbWFrZXIudXBkYXRlTmV3cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHN0YXRpYyBzdWJzY3JpYmUoKTogdm9pZCB7XG4gICAgICAgIE5ld3NtYWtlci5pbml0KCk7XG4gICAgICAgIGlmICgoTmV3c21ha2VyLmxhdGVzdFRpbWVzdGFtcCA9PT0gbnVsbCkgfHwgKE5ld3NtYWtlci5sYXRlc3RUaW1lc3RhbXAgKyBOZXdzbWFrZXIuVVBEQVRFX0lOVEVSVkFMIDwgRGF0ZS5ub3coKSkpIHtcbiAgICAgICAgICAgIE5ld3NtYWtlci51cGRhdGVOZXdzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2hyb21lLmFsYXJtcy5vbkFsYXJtLmFkZExpc3RlbmVyKE5ld3NtYWtlci5hbGFybUxpc3RlbmVyKTtcbiAgICAgICAgY2hyb21lLmFsYXJtcy5jcmVhdGUoTmV3c21ha2VyLkFMQVJNX05BTUUsIHtwZXJpb2RJbk1pbnV0ZXM6IE5ld3NtYWtlci5VUERBVEVfSU5URVJWQUx9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgdW5TdWJzY3JpYmUoKTogdm9pZCB7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2FsbCBOZXdzbWFrZXIuaW5pdCgpXG4gICAgICAgIGNocm9tZS5hbGFybXMub25BbGFybS5yZW1vdmVMaXN0ZW5lcihOZXdzbWFrZXIuYWxhcm1MaXN0ZW5lcik7XG4gICAgICAgIGNocm9tZS5hbGFybXMuY2xlYXIoTmV3c21ha2VyLkFMQVJNX05BTUUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHVwZGF0ZU5ld3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIE5ld3NtYWtlci5pbml0KCk7XG4gICAgICAgIGNvbnN0IG5ld3MgPSBhd2FpdCBOZXdzbWFrZXIuZ2V0TmV3cygpO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShuZXdzKSkge1xuICAgICAgICAgICAgTmV3c21ha2VyLmxhdGVzdCA9IG5ld3M7XG4gICAgICAgICAgICBOZXdzbWFrZXIubGF0ZXN0VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIE5ld3NtYWtlci5vblVwZGF0ZSgpO1xuICAgICAgICAgICAgYXdhaXQgTmV3c21ha2VyLnN0YXRlTWFuYWdlci5zYXZlU3RhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldFJlYWROZXdzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICAgICAgTmV3c21ha2VyLmluaXQoKTtcbiAgICAgICAgY29uc3QgW1xuICAgICAgICAgICAgc3luYyxcbiAgICAgICAgICAgIGxvY2FsLFxuICAgICAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgcmVhZFN5bmNTdG9yYWdlKHtyZWFkTmV3czogW119KSxcbiAgICAgICAgICAgIHJlYWRMb2NhbFN0b3JhZ2Uoe3JlYWROZXdzOiBbXX0pLFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAgICAgICAuLi5zeW5jID8gc3luYy5yZWFkTmV3cyA6IFtdLFxuICAgICAgICAgICAgLi4ubG9jYWwgPyBsb2NhbC5yZWFkTmV3cyA6IFtdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0RGlzcGxheWVkTmV3cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgICAgIE5ld3NtYWtlci5pbml0KCk7XG4gICAgICAgIGNvbnN0IFtcbiAgICAgICAgICAgIHN5bmMsXG4gICAgICAgICAgICBsb2NhbCxcbiAgICAgICAgXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHJlYWRTeW5jU3RvcmFnZSh7ZGlzcGxheWVkTmV3czogW119KSxcbiAgICAgICAgICAgIHJlYWRMb2NhbFN0b3JhZ2Uoe2Rpc3BsYXllZE5ld3M6IFtdfSksXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KFtcbiAgICAgICAgICAgIC4uLnN5bmMgPyBzeW5jLmRpc3BsYXllZE5ld3MgOiBbXSxcbiAgICAgICAgICAgIC4uLmxvY2FsID8gbG9jYWwuZGlzcGxheWVkTmV3cyA6IFtdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0TmV3cygpOiBQcm9taXNlPE5ld3NbXSB8IG51bGw+IHtcbiAgICAgICAgTmV3c21ha2VyLmluaXQoKTtcbiAgICAgICAgaWYgKF9fVEVTVF9fKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3c0ZvclRlc3Rpbmc7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goTkVXU19VUkwsIHtjYWNoZTogJ25vLWNhY2hlJ30pO1xuICAgICAgICAgICAgY29uc3QgJG5ld3M6IEFycmF5PE9taXQ8TmV3cywgJ3JlYWQnIHwgJ3VybCc+ICYge2RhdGU6IHN0cmluZ30+ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgcmVhZE5ld3MgPSBhd2FpdCBOZXdzbWFrZXIuZ2V0UmVhZE5ld3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXllZE5ld3MgPSBhd2FpdCBOZXdzbWFrZXIuZ2V0RGlzcGxheWVkTmV3cygpO1xuICAgICAgICAgICAgY29uc3QgbmV3czogTmV3c1tdID0gJG5ld3MubWFwKChuKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gZ2V0QmxvZ1Bvc3RVUkwobi5pZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZCA9IE5ld3NtYWtlci53YXNSZWFkKG4uaWQsIHJlYWROZXdzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5ZWQgPSBOZXdzbWFrZXIud2FzRGlzcGxheWVkKG4uaWQsIGRpc3BsYXllZE5ld3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7Li4ubiwgdXJsLCByZWFkLCBkaXNwbGF5ZWR9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUobmV3c1tpXS5kYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIGRhdGUgJHtkYXRlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdzO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIG1hcmtBc1JlYWQoaWRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBOZXdzbWFrZXIuaW5pdCgpO1xuICAgICAgICBjb25zdCByZWFkTmV3cyA9IGF3YWl0IE5ld3NtYWtlci5nZXRSZWFkTmV3cygpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVhZE5ld3Muc2xpY2UoKTtcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVhZE5ld3MuaW5kZXhPZihpZCkgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICBOZXdzbWFrZXIubGF0ZXN0ID0gTmV3c21ha2VyLmxhdGVzdC5tYXAoKG4pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkID0gTmV3c21ha2VyLndhc1JlYWQobi5pZCwgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsuLi5uLCByZWFkfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTmV3c21ha2VyLm9uVXBkYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBvYmogPSB7cmVhZE5ld3M6IHJlc3VsdHN9O1xuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIHdyaXRlTG9jYWxTdG9yYWdlKG9iaiksXG4gICAgICAgICAgICAgICAgd3JpdGVTeW5jU3RvcmFnZShvYmopLFxuICAgICAgICAgICAgICAgIE5ld3NtYWtlci5zdGF0ZU1hbmFnZXIuc2F2ZVN0YXRlKCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBtYXJrQXNEaXNwbGF5ZWQoaWRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBOZXdzbWFrZXIuaW5pdCgpO1xuICAgICAgICBjb25zdCBkaXNwbGF5ZWROZXdzID0gYXdhaXQgTmV3c21ha2VyLmdldERpc3BsYXllZE5ld3MoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGRpc3BsYXllZE5ld3Muc2xpY2UoKTtcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlzcGxheWVkTmV3cy5pbmRleE9mKGlkKSA8IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgIE5ld3NtYWtlci5sYXRlc3QgPSBOZXdzbWFrZXIubGF0ZXN0Lm1hcCgobikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXllZCA9IE5ld3NtYWtlci53YXNEaXNwbGF5ZWQobi5pZCwgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsuLi5uLCBkaXNwbGF5ZWR9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBOZXdzbWFrZXIub25VcGRhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHtkaXNwbGF5ZWROZXdzOiByZXN1bHRzfTtcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB3cml0ZUxvY2FsU3RvcmFnZShvYmopLFxuICAgICAgICAgICAgICAgIHdyaXRlU3luY1N0b3JhZ2Uob2JqKSxcbiAgICAgICAgICAgICAgICBOZXdzbWFrZXIuc3RhdGVNYW5hZ2VyLnNhdmVTdGF0ZSgpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyB3YXNSZWFkKGlkOiBzdHJpbmcsIHJlYWROZXdzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gcmVhZE5ld3MuaW5jbHVkZXMoaWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHdhc0Rpc3BsYXllZChpZDogc3RyaW5nLCBkaXNwbGF5ZWROZXdzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZGlzcGxheWVkTmV3cy5pbmNsdWRlcyhpZCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TmV3c0ZvclRlc3RpbmcobmV3czogTmV3c1tdKTogdm9pZCB7XG4gICAgaWYgKF9fVEVTVF9fKSB7XG4gICAgICAgIG5ld3NGb3JUZXN0aW5nID0gbmV3cztcbiAgICB9XG59XG4iLCJpbXBvcnQge2lzT3BlcmF9IGZyb20gJy4uLy4uL3V0aWxzL3BsYXRmb3JtJztcblxuLy8gT24gVGh1bmRlcmJpcmQsIHNvbWV0aW1lcyBzZW5kZXIudGFiIGlzIHVuZGVmaW5lZCBidXQgYWNjZXNzaW5nIGl0IHdpbGwgdGhyb3cgYSB2ZXJ5IG5pY2UgZXJyb3IuXG4vLyBPbiBWaXZhbGRpLCBzb21ldGltZXMgc2VuZGVyLnRhYiBpcyB1bmRlZmluZWQgYXMgd2VsbCwgYnV0IGVycm9yIGlzIG5vdCB2ZXJ5IGhlbHBmdWwuXG4vLyBPbiBPcGVyYSwgc2VuZGVyLnRhYi5pbmRleCA9PT0gLTEuXG5leHBvcnQgZnVuY3Rpb24gaXNQYW5lbChzZW5kZXI6IGNocm9tZS5ydW50aW1lLk1lc3NhZ2VTZW5kZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mIHNlbmRlciA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHNlbmRlci50YWIgPT09ICd1bmRlZmluZWQnIHx8IChpc09wZXJhICYmIHNlbmRlci50YWIuaW5kZXggPT09IC0xKTtcbn1cbiIsImltcG9ydCB7Y2FuSW5qZWN0U2NyaXB0fSBmcm9tICcuLi9iYWNrZ3JvdW5kL3V0aWxzL2V4dGVuc2lvbi1hcGknO1xuaW1wb3J0IHR5cGUge01lc3NhZ2VCR3RvQ1MsIE1lc3NhZ2VDU3RvQkcsIE1lc3NhZ2VVSXRvQkd9IGZyb20gJy4uL2RlZmluaXRpb25zJztcbmltcG9ydCB7TWVzc2FnZVR5cGVDU3RvQkcsIE1lc3NhZ2VUeXBlQkd0b0NTLCBNZXNzYWdlVHlwZVVJdG9CR30gZnJvbSAnLi4vdXRpbHMvbWVzc2FnZSc7XG5pbXBvcnQge2lzRmlyZWZveH0gZnJvbSAnLi4vdXRpbHMvcGxhdGZvcm0nO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXJ9IGZyb20gJy4uL3V0aWxzL3N0YXRlLW1hbmFnZXInO1xuaW1wb3J0IHtnZXRBY3RpdmVUYWIsIHF1ZXJ5VGFic30gZnJvbSAnLi4vdXRpbHMvdGFicyc7XG5pbXBvcnQge2dldFVSTEhvc3RPclByb3RvY29sfSBmcm9tICcuLi91dGlscy91cmwnO1xuaW1wb3J0IEljb25NYW5hZ2VyIGZyb20gJy4vaWNvbi1tYW5hZ2VyJztcblxuaW1wb3J0IHttYWtlRmlyZWZveEhhcHB5fSBmcm9tICcuL21ha2UtZmlyZWZveC1oYXBweSc7XG5pbXBvcnQge0FTU0VSVCwgbG9nSW5mbywgbG9nV2Fybn0gZnJvbSAnLi91dGlscy9sb2cnO1xuaW1wb3J0IHR5cGUge0ZpbGVMb2FkZXJ9IGZyb20gJy4vdXRpbHMvbmV0d29yayc7XG5pbXBvcnQge2NyZWF0ZUZpbGVMb2FkZXJ9IGZyb20gJy4vdXRpbHMvbmV0d29yayc7XG5pbXBvcnQge2lzUGFuZWx9IGZyb20gJy4vdXRpbHMvdGFiJztcblxuZGVjbGFyZSBjb25zdCBfX0NIUk9NSVVNX01WMl9fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX0NIUk9NSVVNX01WM19fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1RIVU5ERVJCSVJEX186IGJvb2xlYW47XG5cbmludGVyZmFjZSBUYWJNYW5hZ2VyT3B0aW9ucyB7XG4gICAgZ2V0Q29ubmVjdGlvbk1lc3NhZ2U6ICh0YWJVUmw6IHN0cmluZywgdXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIHRvcEZyYW1lSGFzRGFya1RoZW1lPzogYm9vbGVhbikgPT4gUHJvbWlzZTxNZXNzYWdlQkd0b0NTPjtcbiAgICBnZXRUYWJNZXNzYWdlOiAodGFiVVJMOiBzdHJpbmcsIHVybDogc3RyaW5nLCBpc1RvcEZyYW1lOiBib29sZWFuKSA9PiBNZXNzYWdlQkd0b0NTO1xuICAgIG9uQ29sb3JTY2hlbWVDaGFuZ2U6IChpc0Rhcms6IGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBEb2N1bWVudEluZm8ge1xuICAgIHNjcmlwdElkOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRJZDogc3RyaW5nIHwgbnVsbDtcbiAgICBpc1RvcDogdHJ1ZSB8IHVuZGVmaW5lZDtcbiAgICB1cmw6IHN0cmluZyB8IG51bGw7XG4gICAgc3RhdGU6IERvY3VtZW50U3RhdGU7XG4gICAgdGltZXN0YW1wOiBudW1iZXI7XG4gICAgZGFya1RoZW1lRGV0ZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBUYWJNYW5hZ2VyU3RhdGUgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgdGFiczoge1t0YWJJZDogbnVtYmVyXToge1tmcmFtZUlkOiBudW1iZXJdOiBEb2N1bWVudEluZm99fTtcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBUaGVzZSBzdGF0ZXMgY29ycmVzcG9uZCB0byBwb3NzaWJsZSBkb2N1bWVudCBzdGF0ZXMgaW4gUGFnZSBMaWZlY3ljbGUgQVBJOlxuICogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL3VwZGF0ZXMvMjAxOC8wNy9wYWdlLWxpZmVjeWNsZS1hcGkjZGV2ZWxvcGVyLXJlY29tbWVuZGF0aW9ucy1mb3ItZWFjaC1zdGF0ZVxuICogU29tZSBzdGF0ZXMgYXJlIG5vdCBjdXJyZW50bHkgdXNlZCAodGhleSBhcmUgZGVjbGFyZWQgZm9yIGZ1dHVyZS1wcm9vZmluZykuXG4gKi9cbmVudW0gRG9jdW1lbnRTdGF0ZSB7XG4gICAgQUNUSVZFID0gMCxcbiAgICBQQVNTSVZFID0gMSxcbiAgICBISURERU4gPSAyLFxuICAgIEZST1pFTiA9IDMsXG4gICAgVEVSTUlOQVRFRCA9IDQsXG4gICAgRElTQ0FSREVEID0gNVxufVxuXG4vKipcbiAqIE5vdGU6IE9uIENocm9taXVtIGJ1aWxkcywgd2UgdXNlIGRvY3VtZW50SWQgaWYgaXQgaXMgYXZhaWxhYmxlLlxuICogV2UgYXZvaWQgbWVzc2FnaW5nIHVzaW5nIGZyYW1lSWQgZW50aXJlbHkgc2luY2Ugd2hlbiBkb2N1bWVudCBpcyBwcmUtcmVuZGVyZWQsIGl0IGdldHMgYSB0ZW1wb3JhcnkgZnJhbWVJZFxuICogYW5kIGlmIHdlIGF0dGVtcHQgdG8gc2VuZCB0byB7ZnJhbWVJZCwgZG9jdW1lbnRJZH0gd2l0aCBvbGQgZnJhbWVJZCwgdGhlbiB0aGUgbWVzc2FnZSB3aWxsIGJlIGRyb3BwZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYk1hbmFnZXIge1xuICAgIHByaXZhdGUgc3RhdGljIHRhYnM6IFRhYk1hbmFnZXJTdGF0ZVsndGFicyddO1xuICAgIHByaXZhdGUgc3RhdGljIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyPFRhYk1hbmFnZXJTdGF0ZT47XG4gICAgcHJpdmF0ZSBzdGF0aWMgZmlsZUxvYWRlcjogRmlsZUxvYWRlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIG9uQ29sb3JTY2hlbWVDaGFuZ2U6IFRhYk1hbmFnZXJPcHRpb25zWydvbkNvbG9yU2NoZW1lQ2hhbmdlJ107XG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGFiTWVzc2FnZTogVGFiTWFuYWdlck9wdGlvbnNbJ2dldFRhYk1lc3NhZ2UnXTtcbiAgICBwcml2YXRlIHN0YXRpYyB0aW1lc3RhbXA6IFRhYk1hbmFnZXJTdGF0ZVsndGltZXN0YW1wJ107XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgTE9DQUxfU1RPUkFHRV9LRVkgPSAnVGFiTWFuYWdlci1zdGF0ZSc7XG5cbiAgICBzdGF0aWMgaW5pdCh7Z2V0Q29ubmVjdGlvbk1lc3NhZ2UsIG9uQ29sb3JTY2hlbWVDaGFuZ2UsIGdldFRhYk1lc3NhZ2V9OiBUYWJNYW5hZ2VyT3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBUYWJNYW5hZ2VyLnN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXI8VGFiTWFuYWdlclN0YXRlPihUYWJNYW5hZ2VyLkxPQ0FMX1NUT1JBR0VfS0VZLCB0aGlzLCB7dGFiczoge30sIHRpbWVzdGFtcDogMH0sIGxvZ1dhcm4pO1xuICAgICAgICBUYWJNYW5hZ2VyLnRhYnMgPSB7fTtcbiAgICAgICAgVGFiTWFuYWdlci5vbkNvbG9yU2NoZW1lQ2hhbmdlID0gb25Db2xvclNjaGVtZUNoYW5nZTtcbiAgICAgICAgVGFiTWFuYWdlci5nZXRUYWJNZXNzYWdlID0gZ2V0VGFiTWVzc2FnZTtcblxuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2U6IE1lc3NhZ2VDU3RvQkcgfCBNZXNzYWdlVUl0b0JHLCBzZW5kZXIsIHNlbmRSZXNwb25zZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgaWYgKGlzRmlyZWZveCAmJiBtYWtlRmlyZWZveEhhcHB5KG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5ET0NVTUVOVF9DT05ORUNUOiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfX0NIUk9NSVVNX01WM19fICYmIGlzUGFuZWwoc2VuZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZUJHdG9DUy5VTlNVUFBPUlRFRF9TRU5ERVIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBUYWJNYW5hZ2VyLm9uQ29sb3JTY2hlbWVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbHkgPSAodGFiVVJMOiBzdHJpbmcsIHVybDogc3RyaW5nLCBpc1RvcEZyYW1lOiBib29sZWFuLCB0b3BGcmFtZUhhc0RhcmtUaGVtZT86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldENvbm5lY3Rpb25NZXNzYWdlKHRhYlVSTCwgdXJsLCBpc1RvcEZyYW1lLCB0b3BGcmFtZUhhc0RhcmtUaGVtZSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uuc2NyaXB0SWQgPSBtZXNzYWdlLnNjcmlwdElkITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJNYW5hZ2VyLnNlbmREb2N1bWVudE1lc3NhZ2Uoc2VuZGVyLnRhYiEuaWQhLCBzZW5kZXIuZG9jdW1lbnRJZCEsIHJlc3BvbnNlLCBzZW5kZXIuZnJhbWVJZCEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGFuZWwoc2VuZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogVml2YWxkaSBhbmQgT3BlcmEgY2FuIHNob3cgYSBwYWdlIGluIGEgc2lkZSBwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBpdCBpcyBub3QgcG9zc2libGUgdG8gaGFuZGxlIG1lc3NhZ2luZyBjb3JyZWN0bHkgKG5vIHRhYiBJRCwgZnJhbWUgSUQpLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlyZWZveCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZW5kZXIgJiYgc2VuZGVyLnRhYiAmJiB0eXBlb2Ygc2VuZGVyLnRhYi5pZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2U8TWVzc2FnZUJHdG9DUz4oc2VuZGVyLnRhYi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZUJHdG9DUy5VTlNVUFBPUlRFRF9TRU5ERVIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0SWQ6IG1lc3NhZ2Uuc2NyaXB0SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUlkOiBzZW5kZXIgJiYgdHlwZW9mIHNlbmRlci5mcmFtZUlkID09PSAnbnVtYmVyJyA/IHNlbmRlci5mcmFtZUlkIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoJ3Vuc3VwcG9ydGVkU2VuZGVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7ZnJhbWVJZH0gPSBzZW5kZXI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVG9wRnJhbWU6IGJvb2xlYW4gPSAoX19DSFJPTUlVTV9NVjJfXyB8fCBfX0NIUk9NSVVNX01WM19fKSA/IChmcmFtZUlkID09PSAwIHx8IG1lc3NhZ2UuZGF0YS5pc1RvcEZyYW1lKSA6IGZyYW1lSWQgPT09IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHNlbmRlci51cmwhO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJJZCA9IHNlbmRlci50YWIhLmlkITtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NyaXB0SWQgPSBtZXNzYWdlLnNjcmlwdElkITtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21pdW0gMTA2KyBtYXkgcHJlcmVuZGVyIGZyYW1lcyByZXN1bHRpbmcgaW4gdG9wLWxldmVsIGZyYW1lcyB3aXRoIGNocm9tZS5ydW50aW1lLk1lc3NhZ2VTZW5kZXIudGFiLnVybFxuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdG8gY2hyb21lOi8vbmV3dGFiLyBhbmQgcG9zaXRpdmUgY2hyb21lLnJ1bnRpbWUuTWVzc2FnZVNlbmRlci5mcmFtZUlkXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYlVSTCA9ICgoX19DSFJPTUlVTV9NVjJfXyB8fCBfX0NIUk9NSVVNX01WM19fKSAmJiBpc1RvcEZyYW1lKSA/IHVybCA6IHNlbmRlci50YWIhLnVybCE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50SWQ6IHN0cmluZyB8IG51bGwgPSBfX0NIUk9NSVVNX01WM19fID8gc2VuZGVyLmRvY3VtZW50SWQhIDogKHNlbmRlci5kb2N1bWVudElkIHx8IG51bGwpO1xuXG4gICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc3RhdGVNYW5hZ2VyLmxvYWRTdGF0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5hZGRGcmFtZSh0YWJJZCwgZnJhbWVJZCEsIGRvY3VtZW50SWQsIHNjcmlwdElkLCB1cmwsIGlzVG9wRnJhbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9wRnJhbWVIYXNEYXJrVGhlbWUgPSBpc1RvcEZyYW1lID8gZmFsc2UgOiBUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdPy5bMF0/LmRhcmtUaGVtZURldGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHkodGFiVVJMLCB1cmwsIGlzVG9wRnJhbWUsIHRvcEZyYW1lSGFzRGFya1RoZW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc3RhdGVNYW5hZ2VyLnNhdmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5ET0NVTUVOVF9GT1JHRVQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VuZGVyLnRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nV2FybignVW5leHBlY3RlZCBtZXNzYWdlJywgbWVzc2FnZSwgc2VuZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEFTU0VSVCgnSGFzIGEgc2NyaXB0SWQnLCAoKSA9PiBCb29sZWFuKG1lc3NhZ2Uuc2NyaXB0SWQpKTtcbiAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5yZW1vdmVGcmFtZShzZW5kZXIudGFiIS5pZCEsIHNlbmRlci5mcmFtZUlkISk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5ET0NVTUVOVF9GUkVFWkU6IHtcbiAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5zdGF0ZU1hbmFnZXIubG9hZFN0YXRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gVGFiTWFuYWdlci50YWJzW3NlbmRlci50YWIhLmlkIV1bc2VuZGVyLmZyYW1lSWQhXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uc3RhdGUgPSBEb2N1bWVudFN0YXRlLkZST1pFTjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udXJsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc3RhdGVNYW5hZ2VyLnNhdmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5ET0NVTUVOVF9SRVNVTUU6IHtcbiAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5vbkNvbG9yU2NoZW1lTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJJZCA9IHNlbmRlci50YWIhLmlkITtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFiVVJMID0gc2VuZGVyLnRhYiEudXJsITtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJhbWVJZCA9IHNlbmRlci5mcmFtZUlkITtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gc2VuZGVyLnVybCE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50SWQ6IHN0cmluZyB8IG51bGwgPSBfX0NIUk9NSVVNX01WM19fID8gc2VuZGVyLmRvY3VtZW50SWQhIDogKHNlbmRlci5kb2N1bWVudElkISB8fCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNUb3BGcmFtZTogYm9vbGVhbiA9IChfX0NIUk9NSVVNX01WMl9fIHx8IF9fQ0hST01JVU1fTVYzX18pID8gKGZyYW1lSWQgPT09IDAgfHwgbWVzc2FnZS5kYXRhLmlzVG9wRnJhbWUpIDogZnJhbWVJZCA9PT0gMDtcbiAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5zdGF0ZU1hbmFnZXIubG9hZFN0YXRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVGFiTWFuYWdlci50YWJzW3RhYklkXVtmcmFtZUlkXS50aW1lc3RhbXAgPCBUYWJNYW5hZ2VyLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gVGFiTWFuYWdlci5nZXRUYWJNZXNzYWdlKHRhYlVSTCwgdXJsLCBpc1RvcEZyYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5zY3JpcHRJZCA9IG1lc3NhZ2Uuc2NyaXB0SWQhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc2VuZERvY3VtZW50TWVzc2FnZSh0YWJJZCwgZG9jdW1lbnRJZCEsIHJlc3BvbnNlLCBmcmFtZUlkISk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJNYW5hZ2VyLnRhYnNbc2VuZGVyLnRhYiEuaWQhXVtzZW5kZXIuZnJhbWVJZCFdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0SWQ6IG1lc3NhZ2Uuc2NyaXB0SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1RvcDogaXNUb3BGcmFtZSB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IERvY3VtZW50U3RhdGUuQUNUSVZFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhcmtUaGVtZURldGVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IFRhYk1hbmFnZXIudGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc3RhdGVNYW5hZ2VyLnNhdmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5EQVJLX1RIRU1FX0RFVEVDVEVEOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYklkID0gc2VuZGVyLnRhYiEuaWQhO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmFtZXMgPSBUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZyYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBPYmplY3QuZW50cmllcyhmcmFtZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmFtZUlkID0gTnVtYmVyKGVudHJ5WzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gZW50cnlbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZS5kYXJrVGhlbWVEZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7ZG9jdW1lbnRJZCwgc2NyaXB0SWR9ID0gZnJhbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE1lc3NhZ2VUeXBlQkd0b0NTLkNMRUFOX1VQLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc2VuZERvY3VtZW50TWVzc2FnZSh0YWJJZCwgZG9jdW1lbnRJZCwgbWVzc2FnZSwgZnJhbWVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnJhbWVJZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEljb25NYW5hZ2VyLnNldEljb24oe3RhYklkLCBpc0FjdGl2ZTogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlQ1N0b0JHLkZFVENIOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzaW5nIGN1c3RvbSByZXNwb25zZSBkdWUgdG8gQ2hyb21lIGFuZCBGaXJlZm94IGluY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGltZXMgZmV0Y2ggZXJyb3IgYmVoYXZlcyBsaWtlIHN5bmNocm9ub3VzIGFuZCBzZW5kcyBgdW5kZWZpbmVkYFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IG1lc3NhZ2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvIG5vdCBuZWVkIHRvIHVzZSBzY3JpcHRJZCBoZXJlIHNpbmNlIGV2ZXJ5IHJlcXVlc3QgaGFzIGEgdW5pcXVlIGlkIGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VuZFJlc3BvbnNlID0gKHJlc3BvbnNlOiBQYXJ0aWFsPE1lc3NhZ2VCR3RvQ1M+KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJNYW5hZ2VyLnNlbmREb2N1bWVudE1lc3NhZ2Uoc2VuZGVyLnRhYiEuaWQhLCBzZW5kZXIuZG9jdW1lbnRJZCEsIHt0eXBlOiBNZXNzYWdlVHlwZUJHdG9DUy5GRVRDSF9SRVNQT05TRSwgaWQsIC4uLnJlc3BvbnNlfSwgc2VuZGVyLmZyYW1lSWQhKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX19USFVOREVSQklSRF9fKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiB0aHVuZGVyYmlyZCBzb21lIENTUyBpcyBsb2FkZWQgb24gYSBjaHJvbWU6Ly8gVVJMLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGh1bmRlcmJpcmQgcmVzdHJpY3RlZCBBZGQtb25zIHRvIGxvYWQgdGhvc2UgVVJMJ3MuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKG1lc3NhZ2UuZGF0YS51cmwgYXMgc3RyaW5nKS5zdGFydHNXaXRoKCdjaHJvbWU6Ly8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7ZGF0YTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7dXJsLCByZXNwb25zZVR5cGUsIG1pbWVUeXBlLCBvcmlnaW59ID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIVRhYk1hbmFnZXIuZmlsZUxvYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5maWxlTG9hZGVyID0gY3JlYXRlRmlsZUxvYWRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuZmlsZUxvYWRlci5nZXQoe3VybCwgcmVzcG9uc2VUeXBlLCBtaW1lVHlwZSwgb3JpZ2lufSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IHJlc3BvbnNlLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7ZXJyb3I6IGVycj8ubWVzc2FnZSA/PyBlcnJ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtkYXRhOiByZXNwb25zZS5kYXRhfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlVUl0b0JHLkNPTE9SX1NDSEVNRV9DSEFOR0U6XG4gICAgICAgICAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZUNTdG9CRy5DT0xPUl9TQ0hFTUVfQ0hBTkdFOlxuICAgICAgICAgICAgICAgICAgICBUYWJNYW5hZ2VyLm9uQ29sb3JTY2hlbWVNZXNzYWdlKG1lc3NhZ2UgYXMgTWVzc2FnZUNTdG9CRywgc2VuZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaHJvbWUudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIoYXN5bmMgKHRhYklkKSA9PiBUYWJNYW5hZ2VyLnJlbW92ZUZyYW1lKHRhYklkLCAwKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2VuZERvY3VtZW50TWVzc2FnZSh0YWJJZDogbnVtYmVyLCBkb2N1bWVudElkOiBzdHJpbmcsIG1lc3NhZ2U6IE1lc3NhZ2VCR3RvQ1MsIGZyYW1lSWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoZnJhbWVJZCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgdGhlbWVNZXNzYWdlVHlwZXM6IE1lc3NhZ2VUeXBlQkd0b0NTW10gPSBbXG4gICAgICAgICAgICAgICAgTWVzc2FnZVR5cGVCR3RvQ1MuQUREX0NTU19GSUxURVIsXG4gICAgICAgICAgICAgICAgTWVzc2FnZVR5cGVCR3RvQ1MuQUREX0RZTkFNSUNfVEhFTUUsXG4gICAgICAgICAgICAgICAgTWVzc2FnZVR5cGVCR3RvQ1MuQUREX1NUQVRJQ19USEVNRSxcbiAgICAgICAgICAgICAgICBNZXNzYWdlVHlwZUJHdG9DUy5BRERfU1ZHX0ZJTFRFUixcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAodGhlbWVNZXNzYWdlVHlwZXMuaW5jbHVkZXMobWVzc2FnZS50eXBlKSkge1xuICAgICAgICAgICAgICAgIEljb25NYW5hZ2VyLnNldEljb24oe3RhYklkLCBpc0FjdGl2ZTogdHJ1ZSwgY29sb3JTY2hlbWU6IG1lc3NhZ2UuZGF0YT8udGhlbWU/Lm1vZGUgPyAnZGFyaycgOiAnbGlnaHQnfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gTWVzc2FnZVR5cGVCR3RvQ1MuQ0xFQU5fVVApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IFRhYk1hbmFnZXIudGFic1t0YWJJZF0/LlswXT8udXJsPy5zdGFydHNXaXRoKCdodHRwczovL2RhcmtyZWFkZXIub3JnLycpO1xuICAgICAgICAgICAgICAgIEljb25NYW5hZ2VyLnNldEljb24oe3RhYklkLCBpc0FjdGl2ZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9fQ0hST01JVU1fTVYzX18pIHtcbiAgICAgICAgICAgIC8vIE9uIE1WMywgQ2hyb21pdW0gaGFzIGEgYnVnIHdoaWNoIHByZXZlbnRzIHNlbmRpbmcgbWVzc2FnZXMgdG8gcHJlLXJlbmRlcmVkIGZyYW1lcyB3aXRob3V0IHNwZWNpZnlpbmcgZnJhbWVJZFxuICAgICAgICAgICAgLy8gRnVydGhlcm1vcmUsIGlmIHdlIHNlbmQgYSBtZXNzYWdlIGFkZHJlc3NlZCB0byBhIHRlbXBvcmFyeSBmcmFtZUlkIGFmdGVyIHRoZSBkb2N1bWVudCBleGl0cyBwcmVyZW5kZXIgc3RhdGUsXG4gICAgICAgICAgICAvLyB0aGUgbWVzc2FnZSB3aWxsIGFsc28gZmFpbCB0byBiZSBkZWxpdmVyZWQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVG8gd29yayBhcm91bmQgdGhpczpcbiAgICAgICAgICAgIC8vICAxLiBBdHRlbXB0IHRvIHNlbmQgdGhlIG1lc3NhZ2UgYnkgZG9jdW1lbnRJZC4gSWYgdGhpcyBmYWlscywgdGhpcyBtZWFucyB0aGUgZG9jdW1lbnQgaXMgaW4gcHJlcmVuZGVyIHN0YXRlLlxuICAgICAgICAgICAgLy8gIDIuIEF0dGVtcHQgdG8gc2VuZCB0aGUgbWVzc2FnZSBieSBkb2N1bWVudElkIGFuZCB0ZW1wb3JhcnkgZnJhbWVJZC4gSWYgdGhpcyBmYWlscywgdGhpcyBtZWFucyB0aGUgZG9jdW1lbnRcbiAgICAgICAgICAgIC8vICAgICBlaXRoZXIgYWxyZWFkeSBleGl0ZWQgcHJlLXJlbmRlcmVkIHN0YXRlIG9yIHdhcyBkaXNjYXJkZWQuXG4gICAgICAgICAgICAvLyAgMy4gQXR0ZW1wdCB0byBzZW5kIHRoZSBtZXNzYWdlIGJ5IGRvY3VtZW50SWQgKG9taXR0aW5nIHRoZSBwZXJtYW5lbnQgZnJhbWVJZCB3aGljaCBpcyAwKS5JZiB0aGlzIGZhaWxzLCB0aGlzXG4gICAgICAgICAgICAvLyAgICAgbWVhbnMgdGhlIGRvY3VtZW50IHdhcyBhbHJlYWR5IGRpc2NhcmRlZC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBNb3JlIGluZm86IGh0dHBzOi8vY3JidWcuY29tLzE0NTU4MTdcblxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2U8TWVzc2FnZUJHdG9DUz4odGFiSWQsIG1lc3NhZ2UsIHtkb2N1bWVudElkfSkuY2F0Y2goKCkgPT5cbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZTxNZXNzYWdlQkd0b0NTPih0YWJJZCwgbWVzc2FnZSwge2ZyYW1lSWQsIGRvY3VtZW50SWR9KS5jYXRjaCgoKSA9PlxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZTxNZXNzYWdlQkd0b0NTPih0YWJJZCwgbWVzc2FnZSwge2RvY3VtZW50SWR9KS5jYXRjaCgoKSA9PiB7IC8qIG5vb3AgKi8gfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfX0NIUk9NSVVNX01WMl9fKSB7XG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZTxNZXNzYWdlQkd0b0NTPih0YWJJZCwgbWVzc2FnZSwgZG9jdW1lbnRJZCA/IHtkb2N1bWVudElkfSA6IHtmcmFtZUlkfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2U8TWVzc2FnZUJHdG9DUz4odGFiSWQsIG1lc3NhZ2UsIHtmcmFtZUlkfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgb25Db2xvclNjaGVtZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZUNTdG9CRywgc2VuZGVyOiBjaHJvbWUucnVudGltZS5NZXNzYWdlU2VuZGVyKSB7XG4gICAgICAgIEFTU0VSVCgnVGFiTWFuYWdlci5vbkNvbG9yU2NoZW1lTWVzc2FnZSBpcyBzZXQnLCAoKSA9PiBCb29sZWFuKFRhYk1hbmFnZXIub25Db2xvclNjaGVtZUNoYW5nZSkpO1xuXG4gICAgICAgIC8vIFdlIGhvbm9yIG9ubHkgbWVzc2FnZXMgd2hpY2ggY29tZSBmcm9tIHRhYidzIHRvcCBmcmFtZVxuICAgICAgICAvLyBiZWNhdXNlIHN1Yi1mcmFtZXMgY29sb3Igc2NoZW1lIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHN0eWxlIHdpdGggcHJlZmVycy1jb2xvci1zY2hlbWVcbiAgICAgICAgLy8gVE9ETyhNVjMpOiBpbnN0ZWFkIG9mIGRyb3BwaW5nIHRoZXNlIG1lc3NhZ2VzLCBjb25zaWRlciBtYWtpbmcgYSBxdWVyeSB0byBhbiBhdXRob3JpdGF0aXZlIHNvdXJjZVxuICAgICAgICAvLyBsaWtlIG9mZnNjcmVlbiBkb2N1bWVudFxuICAgICAgICBpZiAoc2VuZGVyICYmIHNlbmRlci5mcmFtZUlkID09PSAwKSB7XG4gICAgICAgICAgICBUYWJNYW5hZ2VyLm9uQ29sb3JTY2hlbWVDaGFuZ2UobWVzc2FnZS5kYXRhLmlzRGFyayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhZGRGcmFtZSh0YWJJZDogbnVtYmVyLCBmcmFtZUlkOiBudW1iZXIsIGRvY3VtZW50SWQ6IHN0cmluZyB8IG51bGwsIHNjcmlwdElkOiBzdHJpbmcsIHVybDogc3RyaW5nLCBpc1RvcDogYm9vbGVhbikge1xuICAgICAgICBsZXQgZnJhbWVzOiB7W2ZyYW1lSWQ6IG51bWJlcl06IERvY3VtZW50SW5mb307XG4gICAgICAgIGlmIChUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdKSB7XG4gICAgICAgICAgICBmcmFtZXMgPSBUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJhbWVzID0ge307XG4gICAgICAgICAgICBUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdID0gZnJhbWVzO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lc1tmcmFtZUlkXSA9IHtcbiAgICAgICAgICAgIGRvY3VtZW50SWQsXG4gICAgICAgICAgICBzY3JpcHRJZCxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIGlzVG9wOiBpc1RvcCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdGF0ZTogRG9jdW1lbnRTdGF0ZS5BQ1RJVkUsXG4gICAgICAgICAgICBkYXJrVGhlbWVEZXRlY3RlZDogZmFsc2UsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IFRhYk1hbmFnZXIudGltZXN0YW1wLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHJlbW92ZUZyYW1lKHRhYklkOiBudW1iZXIsIGZyYW1lSWQ6IG51bWJlcikge1xuICAgICAgICBhd2FpdCBUYWJNYW5hZ2VyLnN0YXRlTWFuYWdlci5sb2FkU3RhdGUoKTtcblxuICAgICAgICBpZiAoZnJhbWVJZCA9PT0gMCkge1xuICAgICAgICAgICAgZGVsZXRlIFRhYk1hbmFnZXIudGFic1t0YWJJZF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoVGFiTWFuYWdlci50YWJzW3RhYklkXSAmJiBUYWJNYW5hZ2VyLnRhYnNbdGFiSWRdW2ZyYW1lSWRdKSB7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHVzZSBkZWxldGUgaGVyZSBiZWNhdXNlIE9iamVjdC5lbnRyaWVzKClcbiAgICAgICAgICAgIC8vIGluIHNlbmRNZXNzYWdlKCkgd291bGQgZW51bWVyYXRlIHVuZGVmaW5lZCBhcyB3ZWxsLlxuICAgICAgICAgICAgZGVsZXRlIFRhYk1hbmFnZXIudGFic1t0YWJJZF1bZnJhbWVJZF07XG4gICAgICAgIH1cblxuICAgICAgICBUYWJNYW5hZ2VyLnN0YXRlTWFuYWdlci5zYXZlU3RhdGUoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgY2xlYW5TdGF0ZSgpIHtcbiAgICAgICAgYXdhaXQgVGFiTWFuYWdlci5zdGF0ZU1hbmFnZXIubG9hZFN0YXRlKCk7XG5cbiAgICAgICAgY29uc3QgYWN0dWFsVGFicyA9IGF3YWl0IHF1ZXJ5VGFicyh7fSk7XG4gICAgICAgIGNvbnN0IHRhYklkcyA9IE9iamVjdC5rZXlzKFRhYk1hbmFnZXIudGFicykubWFwKChpZCkgPT4gTnVtYmVyKGlkKSk7XG4gICAgICAgIGNvbnN0IHN0YWxlVGFicyA9IG5ldyBTZXQodGFiSWRzKTtcbiAgICAgICAgYWN0dWFsVGFicy5mb3JFYWNoKChhY3R1YWxUYWIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhYklkID0gYWN0dWFsVGFiLmlkO1xuICAgICAgICAgICAgaWYgKHRhYklkKSB7XG4gICAgICAgICAgICAgICAgc3RhbGVUYWJzLmRlbGV0ZSh0YWJJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzdGFsZVRhYnMuZm9yRWFjaCgoc3RhbGVUYWJJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKFRhYk1hbmFnZXIudGFic1tzdGFsZVRhYklkXSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBUYWJNYW5hZ2VyLnRhYnNbc3RhbGVUYWJJZF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFRhYk1hbmFnZXIuc3RhdGVNYW5hZ2VyLnNhdmVTdGF0ZSgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBnZXRUYWJVUkwodGFiOiBjaHJvbWUudGFicy5UYWIgfCBudWxsKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKF9fQ0hST01JVU1fTVYzX18pIHtcbiAgICAgICAgICAgIGlmICghdGFiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhYm91dDpibGFuayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgY2hyb21lLnRhYnMuZ2V0KHRhYi5pZCEpKS51cmwgfHwgJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGF3YWl0IGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFiLmlkISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUlkczogWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmxkOiAnTUFJTicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RJbW1lZGlhdGVseTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgICAgICAgICB9KSlbMF0ucmVzdWx0IHx8ICdhYm91dDpibGFuayc7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gU3RyaW5nKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJNZXNzYWdlLmluY2x1ZGVzKCdjaHJvbWU6Ly8nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyTWVzc2FnZS5pbmNsdWRlcygnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJNZXNzYWdlLmluY2x1ZGVzKCdnYWxsZXJ5JylcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2Nocm9tZTovL3Byb3RlY3RlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhYm91dDpibGFuayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEl0IGNhbiBoYXBwZW4gaW4gY2FzZXMgd2hlcmVieSB0aGUgdGFiLnVybCBpcyBlbXB0eS5cbiAgICAgICAgLy8gTHVja2lseSB0aGlzIG9ubHkgYW5kIHdpbGwgb25seSBoYXBwZW4gb24gYGFib3V0OmJsYW5rYC1saWtlIHBhZ2VzLlxuICAgICAgICAvLyBEdWUgdG8gdGhpcyB3ZSBjYW4gc2FmZWx5IHVzZSBgYWJvdXQ6YmxhbmtgIGFzIGZhbGxiYWNrIHZhbHVlLlxuICAgICAgICAvLyBJbiBzb21lIGV4dHJhb3JkaW5hcnkgY2lyY3Vtc3RhbmNlcyB0YWIgbWF5IGJlIHVuZGVmaW5lZC5cbiAgICAgICAgcmV0dXJuIHRhYiAmJiB0YWIudXJsIHx8ICdhYm91dDpibGFuayc7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHVwZGF0ZUNvbnRlbnRTY3JpcHQob3B0aW9uczoge3J1bk9uUHJvdGVjdGVkUGFnZXM6IGJvb2xlYW59KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIChhd2FpdCBxdWVyeVRhYnMoe2Rpc2NhcmRlZDogZmFsc2V9KSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHRhYikgPT4gX19DSFJPTUlVTV9NVjNfXyB8fCBvcHRpb25zLnJ1bk9uUHJvdGVjdGVkUGFnZXMgfHwgY2FuSW5qZWN0U2NyaXB0KHRhYi51cmwpKVxuICAgICAgICAgICAgLmZpbHRlcigodGFiKSA9PiAhVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdKVxuICAgICAgICAgICAgLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChfX0NIUk9NSVVNX01WM19fKSB7XG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFiLmlkISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxGcmFtZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFsnL2luamVjdC9pbmRleC5qcyddLFxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiBsb2dJbmZvKCdDb3VsZCBub3QgdXBkYXRlIGNvbnRlbnQgc2NyaXB0IGluIHRhYicsIHRhYiwgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCh0YWIuaWQhLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5BdDogJ2RvY3VtZW50X3N0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6ICcvaW5qZWN0L2luZGV4LmpzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbEZyYW1lczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoQWJvdXRCbGFuazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHJlZ2lzdGVyTWFpbERpc3BsYXlTY3JpcHQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IChjaHJvbWUgYXMgYW55KS5tZXNzYWdlRGlzcGxheVNjcmlwdHMucmVnaXN0ZXIoe1xuICAgICAgICAgICAganM6IFtcbiAgICAgICAgICAgICAgICB7ZmlsZTogJy9pbmplY3QvZmFsbGJhY2suanMnfSxcbiAgICAgICAgICAgICAgICB7ZmlsZTogJy9pbmplY3QvaW5kZXguanMnfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNlbmRNZXNzYWdlIHdpbGwgc2VuZCBhIHRhYiBtZXNzYWdlcyB0byBhbGwgYWN0aXZlIHRhYnMgYW5kIHRoZWlyIGZyYW1lcy5cbiAgICAvLyBJZiBvbmx5VXBkYXRlQWN0aXZlVGFiIGlzIHNwZWNpZmllZCwgaXQgd2lsbCBvbmx5IHNlbmQgYSBuZXcgbWVzc2FnZSB0byBhbnlcbiAgICAvLyB0YWIgdGhhdCBtYXRjaGVzIHRoZSBhY3RpdmUgdGFiJ3MgaG9zdG5hbWUuIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgd2hlbiBhIHVzZXJcbiAgICAvLyBoYXMgbXVsdGlwbGUgdGFicyBvZiB0aGUgc2FtZSB3ZWJzaXRlLCBldmVyeSB0YWIgd2lsbCByZWNlaXZlIHRoZSBuZXcgbWVzc2FnZVxuICAgIC8vIGFuZCBub3QganVzdCB0aGF0IHRhYiBhcyBEYXJrIFJlYWRlciBjdXJyZW50bHkgZG9lc24ndCBoYXZlIHBlci10YWIgb3BlcmF0aW9ucyxcbiAgICAvLyB0aGlzIHNob3VsZCBiZSB0aGUgZXhwZWN0ZWQgYmVoYXZpb3IuXG4gICAgc3RhdGljIGFzeW5jIHNlbmRNZXNzYWdlKG9ubHlVcGRhdGVBY3RpdmVUYWIgPSBmYWxzZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBUYWJNYW5hZ2VyLnRpbWVzdGFtcCsrO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZVRhYkhvc3RuYW1lID0gb25seVVwZGF0ZUFjdGl2ZVRhYiA/IGdldFVSTEhvc3RPclByb3RvY29sKGF3YWl0IFRhYk1hbmFnZXIuZ2V0QWN0aXZlVGFiVVJMKCkpIDogbnVsbDtcblxuICAgICAgICAoYXdhaXQgcXVlcnlUYWJzKHtkaXNjYXJkZWQ6IGZhbHNlfSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0YWIpID0+IEJvb2xlYW4oVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcmFtZXMgPSBUYWJNYW5hZ2VyLnRhYnNbdGFiLmlkIV07XG4gICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZnJhbWVzKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChbLCB7c3RhdGV9XSkgPT4gc3RhdGUgPT09IERvY3VtZW50U3RhdGUuQUNUSVZFIHx8IHN0YXRlID09PSBEb2N1bWVudFN0YXRlLlBBU1NJVkUpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKGFzeW5jIChbaWQsIHt1cmwsIGRvY3VtZW50SWQsIHNjcmlwdElkLCBpc1RvcH1dKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmFtZUlkID0gTnVtYmVyKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYlVSTCA9IGF3YWl0IFRhYk1hbmFnZXIuZ2V0VGFiVVJMKHRhYik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGhvc3RuYW1lIGFyZSBlcXVhbCB3aGVuIHdlIG9ubHkgd2FudCB0byB1cGRhdGUgYWN0aXZlIHRhYi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbmx5VXBkYXRlQWN0aXZlVGFiICYmIGdldFVSTEhvc3RPclByb3RvY29sKHRhYlVSTCkgIT09IGFjdGl2ZVRhYkhvc3RuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gVGFiTWFuYWdlci5nZXRUYWJNZXNzYWdlKHRhYlVSTCwgdXJsISwgaXNUb3AgfHwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zY3JpcHRJZCA9IHNjcmlwdElkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFiLmFjdGl2ZSAmJiBpc1RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYk1hbmFnZXIuc2VuZERvY3VtZW50TWVzc2FnZSh0YWIhLmlkISwgZG9jdW1lbnRJZCEsIG1lc3NhZ2UsIGZyYW1lSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci5zZW5kRG9jdW1lbnRNZXNzYWdlKHRhYiEuaWQhLCBkb2N1bWVudElkISwgbWVzc2FnZSwgZnJhbWVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdW2ZyYW1lSWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdW2ZyYW1lSWRdLnRpbWVzdGFtcCA9IFRhYk1hbmFnZXIudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjYW5BY2Nlc3NUYWIodGFiOiBjaHJvbWUudGFicy5UYWIgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0YWIgJiYgQm9vbGVhbihUYWJNYW5hZ2VyLnRhYnNbdGFiLmlkIV0pIHx8IGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRUYWJEb2N1bWVudElkKHRhYjogY2hyb21lLnRhYnMuVGFiIHwgbnVsbCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGFiICYmIFRhYk1hbmFnZXIudGFic1t0YWIuaWQhXSAmJiBUYWJNYW5hZ2VyLnRhYnNbdGFiLmlkIV1bMF0gJiYgVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdWzBdLmRvY3VtZW50SWQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGlzVGFiRGFya1RoZW1lRGV0ZWN0ZWQodGFiOiBjaHJvbWUudGFicy5UYWIgfCBudWxsKTogYm9vbGVhbiB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGFiICYmIFRhYk1hbmFnZXIudGFic1t0YWIuaWQhXSAmJiBUYWJNYW5hZ2VyLnRhYnNbdGFiLmlkIV1bMF0gJiYgVGFiTWFuYWdlci50YWJzW3RhYi5pZCFdWzBdLmRhcmtUaGVtZURldGVjdGVkIHx8IG51bGw7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldEFjdGl2ZVRhYlVSTCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gVGFiTWFuYWdlci5nZXRUYWJVUkwoYXdhaXQgZ2V0QWN0aXZlVGFiKCkpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7cmVhZExvY2FsU3RvcmFnZSwgd3JpdGVMb2NhbFN0b3JhZ2V9IGZyb20gJy4vdXRpbHMvZXh0ZW5zaW9uLWFwaSc7XG5cbmNvbnN0IHByb3Bvc2VkSGlnaGxpZ2h0czogc3RyaW5nW10gPSBbXG4gICAgJ2Fubml2ZXJzYXJ5Jyxcbl07XG5cbmNvbnN0IEtFWV9VSV9ISURERU5fSElHSExJR0hUUyA9ICd1aS1oaWRkZW4taGlnaGxpZ2h0cyc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEhpZGRlbkhpZ2hsaWdodHMoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IHJlYWRMb2NhbFN0b3JhZ2Uoe1tLRVlfVUlfSElEREVOX0hJR0hMSUdIVFNdOiBbXSBhcyBzdHJpbmdbXX0pO1xuICAgIHJldHVybiBvcHRpb25zW0tFWV9VSV9ISURERU5fSElHSExJR0hUU107XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEhpZ2hsaWdodHNUb1Nob3coKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGhpZGRlbkhpZ2hsaWdodHMgPSBhd2FpdCBnZXRIaWRkZW5IaWdobGlnaHRzKCk7XG4gICAgcmV0dXJuIHByb3Bvc2VkSGlnaGxpZ2h0cy5maWx0ZXIoKGgpID0+ICFoaWRkZW5IaWdobGlnaHRzLmluY2x1ZGVzKGgpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGlkZUhpZ2hsaWdodHMoa2V5czogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBoaWRkZW5IaWdobGlnaHRzID0gYXdhaXQgZ2V0SGlkZGVuSGlnaGxpZ2h0cygpO1xuICAgIGNvbnN0IHVwZGF0ZSA9IEFycmF5LmZyb20obmV3IFNldChbLi4uaGlkZGVuSGlnaGxpZ2h0cywgLi4ua2V5c10pKTtcbiAgICBhd2FpdCB3cml0ZUxvY2FsU3RvcmFnZSh7W0tFWV9VSV9ISURERU5fSElHSExJR0hUU106IHVwZGF0ZX0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXN0b3JlSGlnaGxpZ2h0cyhrZXlzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGhpZGRlbkhpZ2hsaWdodHMgPSBhd2FpdCBnZXRIaWRkZW5IaWdobGlnaHRzKCk7XG4gICAgY29uc3QgdXBkYXRlID0gQXJyYXkuZnJvbShuZXcgU2V0KFsuLi5oaWRkZW5IaWdobGlnaHRzLmZpbHRlcigoaCkgPT4gIWtleXMuaW5jbHVkZXMoaCkpXSkpO1xuICAgIGF3YWl0IHdyaXRlTG9jYWxTdG9yYWdlKHtbS0VZX1VJX0hJRERFTl9ISUdITElHSFRTXTogdXBkYXRlfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBnZXRIaWdobGlnaHRzVG9TaG93LFxuICAgIGhpZGVIaWdobGlnaHRzLFxuICAgIHJlc3RvcmVIaWdobGlnaHRzLFxufTtcbiIsIi8vIGV2YWxNYXRoIGlzIGEgZnVuY3Rpb24gdGhhdCdzIGFibGUgdG8gZXZhbHVhdGVzIGEgbWF0aGVtYXRpY2FsIGV4cHJlc3Npb24gYW5kIHJldHVybiBpdCdzIG91dHB1dC5cbi8vXG4vLyBJbnRlcm5hbGx5IGl0IHVzZXMgdGhlIFNodW50aW5nIFlhcmQgYWxnb3JpdGhtLiBGaXJzdCBpdCBwcm9kdWNlcyBhIHJldmVyc2UgcG9saXNoIG5vdGF0aW9uKFJQTikgc3RhY2suXG4vLyBFeGFtcGxlOiAxICsgMiAqIDMgLT4gWzEsIDIsIDMsICosICtdIHdoaWNoIHdpdGggcGFyZW50aGVzZXMgbWVhbnMgMSAoMiAzICopICtcbi8vXG4vLyBUaGVuIGl0IGV2YWx1YXRlcyB0aGUgUlBOIHN0YWNrIGFuZCByZXR1cm5zIHRoZSBvdXRwdXQuXG5leHBvcnQgZnVuY3Rpb24gZXZhbE1hdGgoZXhwcmVzc2lvbjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAvLyBTdGFjayB3aGVyZSBvcGVyYXRvcnMgJiBudW1iZXJzIGFyZSBzdG9yZWQgaW4gUlBOLlxuICAgIGNvbnN0IHJwblN0YWNrOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRoZSB3b3JraW5nIHN0YWNrIHdoZXJlIG5ldyB0b2tlbnMgYXJlIHB1c2hlZC5cbiAgICBjb25zdCB3b3JraW5nU3RhY2s6IHN0cmluZ1tdID0gW107XG5cbiAgICBsZXQgbGFzdFRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBleHByZXNzaW9uLlxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBleHByZXNzaW9uLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZXhwcmVzc2lvbltpXTtcblxuICAgICAgICAvLyBTa2lwIGlmIHRoZSB0b2tlbiBpcyBlbXB0eSBvciBhIHdoaXRlc3BhY2UuXG4gICAgICAgIGlmICghdG9rZW4gfHwgdG9rZW4gPT09ICcgJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJcyB0aGUgdG9rZW4gYSBvcGVyYXRvcj9cbiAgICAgICAgaWYgKG9wZXJhdG9ycy5oYXModG9rZW4pKSB7XG4gICAgICAgICAgICBjb25zdCBvcCA9IG9wZXJhdG9ycy5nZXQodG9rZW4pO1xuXG4gICAgICAgICAgICAvLyBHbyB0cm91Z2ggdGhlIHdvcmtpbmdzdGFjayBhbmQgZGV0ZXJtaW5lIGl0J3MgcGxhY2UgaW4gdGhlIHdvcmtpbmdTdGFja1xuICAgICAgICAgICAgd2hpbGUgKHdvcmtpbmdTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50T3AgPSBvcGVyYXRvcnMuZ2V0KHdvcmtpbmdTdGFja1swXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50T3ApIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSXMgdGhlIGN1cnJlbnQgb3BlcmF0aW9uIGVxdWFsIG9yIGxlc3MgdGhhbiB0aGUgY3VycmVudCBvcGVyYXRpb24/XG4gICAgICAgICAgICAgICAgLy8gVGhlbiBtb3ZlIHRoYXQgb3BlcmF0aW9uIHRvIHRoZSBycG5TdGFjay5cbiAgICAgICAgICAgICAgICBpZiAob3AhLmxlc3NPckVxdWFsVGhhbihjdXJyZW50T3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHJwblN0YWNrLnB1c2god29ya2luZ1N0YWNrLnNoaWZ0KCkhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBZGQgdGhlIG9wZXJhdGlvbiB0byB0aGUgd29ya2luZ1N0YWNrLlxuICAgICAgICAgICAgd29ya2luZ1N0YWNrLnVuc2hpZnQodG9rZW4pO1xuICAgICAgICAvLyBPdGhlcndpc2Ugd2FzIHRoZSBsYXN0IHRva2VuIGEgb3BlcmF0b3I/XG4gICAgICAgIH0gZWxzZSBpZiAoIWxhc3RUb2tlbiB8fCBvcGVyYXRvcnMuaGFzKGxhc3RUb2tlbikpIHtcbiAgICAgICAgICAgIHJwblN0YWNrLnB1c2godG9rZW4pO1xuICAgICAgICAvLyBPdGhlcndpc2UganVzdCBhcHBlbmQgdGhlIHJlc3VsdCB0byB0aGUgbGFzdCB0b2tlbihlLmcuIG11bHRpcGxlIGRpZ2l0cyBudW1iZXJzKS5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJwblN0YWNrW3JwblN0YWNrLmxlbmd0aCAtIDFdICs9IHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCB0aGUgbGFzdCB0b2tlbi5cbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW47XG4gICAgfVxuXG4gICAgLy8gUHVzaCB0aGUgd29ya2luZyBzdGFjayBvbiB0b3Agb2YgdGhlIHJwblN0YWNrLlxuICAgIHJwblN0YWNrLnB1c2goLi4ud29ya2luZ1N0YWNrKTtcblxuICAgIC8vIE5vdyBldmFsdWF0ZSB0aGUgcnBuU3RhY2suXG4gICAgY29uc3Qgc3RhY2s6IG51bWJlcltdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHJwblN0YWNrLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wID0gb3BlcmF0b3JzLmdldChycG5TdGFja1tpXSk7XG4gICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBhcmd1bWVudHMgb2YgZm9yIHRoZSBvcGVyYXRpb24oZmlyc3QgdHdvIGluIHRoZSBzdGFjaykuXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc3RhY2suc3BsaWNlKDAsIDIpO1xuICAgICAgICAgICAgLy8gRXhjdXRlIGl0LCBiZWNhdXNlIG9mIHJldmVyc2Ugbm90YXRpb24gd2UgZmlyc3QgcGFzcyBzZWNvbmQgaXRlbSB0aGVuIHRoZSBmaXJzdCBpdGVtLlxuICAgICAgICAgICAgc3RhY2sucHVzaChvcC5leGVjKGFyZ3NbMV0sIGFyZ3NbMF0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbnVtYmVyIHRvIHRoZSBzdGFjay5cbiAgICAgICAgICAgIHN0YWNrLnVuc2hpZnQocGFyc2VGbG9hdChycG5TdGFja1tpXSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YWNrWzBdO1xufVxuXG4vLyBPcGVyYXRvciBjbGFzcyAgZGVmaW5lcyBhIG9wZXJhdG9yIHRoYXQgY2FuIGJlIHBhcnNlZCAmIGV2YWx1YXRlZCBieSBldmFsTWF0aC5cbmNsYXNzIE9wZXJhdG9yIHtcbiAgICBwcml2YXRlIHByZWNlbmRjZTogbnVtYmVyO1xuICAgIHByaXZhdGUgZXhlY01ldGhvZDogKGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcikgPT4gbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocHJlY2VkZW5jZTogbnVtYmVyLCBtZXRob2Q6IChsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIpID0+IG51bWJlcikge1xuICAgICAgICB0aGlzLnByZWNlbmRjZSA9IHByZWNlZGVuY2U7XG4gICAgICAgIHRoaXMuZXhlY01ldGhvZCA9IG1ldGhvZDtcbiAgICB9XG5cbiAgICBleGVjKGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWNNZXRob2QobGVmdCwgcmlnaHQpO1xuICAgIH1cblxuICAgIGxlc3NPckVxdWFsVGhhbihvcDogT3BlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJlY2VuZGNlIDw9IG9wLnByZWNlbmRjZTtcbiAgICB9XG59XG5cbmNvbnN0IG9wZXJhdG9yczogUmVhZG9ubHk8TWFwPHN0cmluZywgT3BlcmF0b3I+PiA9IG5ldyBNYXAoW1xuICAgIFsnKycsIG5ldyBPcGVyYXRvcigxLCAobGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyKTogbnVtYmVyID0+IGxlZnQgKyByaWdodCldLFxuICAgIFsnLScsIG5ldyBPcGVyYXRvcigxLCAobGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyKTogbnVtYmVyID0+IGxlZnQgLSByaWdodCldLFxuICAgIFsnKicsIG5ldyBPcGVyYXRvcigyLCAobGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyKTogbnVtYmVyID0+IGxlZnQgKiByaWdodCldLFxuICAgIFsnLycsIG5ldyBPcGVyYXRvcigyLCAobGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyKTogbnVtYmVyID0+IGxlZnQgLyByaWdodCldLFxuXSk7XG4iLCJpbXBvcnQge2V2YWxNYXRofSBmcm9tICcuL21hdGgtZXZhbCc7XG5pbXBvcnQge2lzU3lzdGVtRGFya01vZGVFbmFibGVkfSBmcm9tICcuL21lZGlhLXF1ZXJ5JztcbmltcG9ydCB7Z2V0UGFyZW50aGVzZXNSYW5nZX0gZnJvbSAnLi90ZXh0JztcblxuZXhwb3J0IGludGVyZmFjZSBSR0JBIHtcbiAgICByOiBudW1iZXI7XG4gICAgZzogbnVtYmVyO1xuICAgIGI6IG51bWJlcjtcbiAgICBhPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhTTEEge1xuICAgIGg6IG51bWJlcjtcbiAgICBzOiBudW1iZXI7XG4gICAgbDogbnVtYmVyO1xuICAgIGE/OiBudW1iZXI7XG59XG5cbmNvbnN0IGhzbGFQYXJzZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEhTTEE+KCk7XG5jb25zdCByZ2JhUGFyc2VDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBSR0JBPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb2xvcldpdGhDYWNoZSgkY29sb3I6IHN0cmluZyk6IFJHQkEgfCBudWxsIHtcbiAgICAkY29sb3IgPSAkY29sb3IudHJpbSgpO1xuICAgIGlmIChyZ2JhUGFyc2VDYWNoZS5oYXMoJGNvbG9yKSkge1xuICAgICAgICByZXR1cm4gcmdiYVBhcnNlQ2FjaGUuZ2V0KCRjb2xvcikhO1xuICAgIH1cbiAgICAvLyBXZSBjYW5ub3QgX3JlYWxseV8gcGFyc2UgYW55IGNvbG9yIHdoaWNoIGhhcyB0aGUgY2FsYygpIGV4cHJlc3Npb24sXG4gICAgLy8gc28gd2UgdHJ5IG91ciBiZXN0IHRvIHJlbW92ZSB0aG9zZSBhbmQgdGhlbiBwYXJzZSB0aGUgdmFsdWUuXG4gICAgaWYgKCRjb2xvci5pbmNsdWRlcygnY2FsYygnKSkge1xuICAgICAgICAkY29sb3IgPSBsb3dlckNhbGNFeHByZXNzaW9uKCRjb2xvcik7XG4gICAgfVxuICAgIGNvbnN0IGNvbG9yID0gcGFyc2UoJGNvbG9yKTtcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgcmdiYVBhcnNlQ2FjaGUuc2V0KCRjb2xvciwgY29sb3IpO1xuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUb0hTTFdpdGhDYWNoZShjb2xvcjogc3RyaW5nKTogSFNMQSB8IG51bGwge1xuICAgIGlmIChoc2xhUGFyc2VDYWNoZS5oYXMoY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBoc2xhUGFyc2VDYWNoZS5nZXQoY29sb3IpITtcbiAgICB9XG4gICAgY29uc3QgcmdiID0gcGFyc2VDb2xvcldpdGhDYWNoZShjb2xvcik7XG4gICAgaWYgKCFyZ2IpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGhzbCA9IHJnYlRvSFNMKHJnYik7XG4gICAgaHNsYVBhcnNlQ2FjaGUuc2V0KGNvbG9yLCBoc2wpO1xuICAgIHJldHVybiBoc2w7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbG9yQ2FjaGUoKTogdm9pZCB7XG4gICAgaHNsYVBhcnNlQ2FjaGUuY2xlYXIoKTtcbiAgICByZ2JhUGFyc2VDYWNoZS5jbGVhcigpO1xufVxuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IU0xfYW5kX0hTVlxuZXhwb3J0IGZ1bmN0aW9uIGhzbFRvUkdCKHtoLCBzLCBsLCBhID0gMX06IEhTTEEpOiBSR0JBIHtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgICBjb25zdCBbciwgYiwgZ10gPSBbbCwgbCwgbF0ubWFwKCh4KSA9PiBNYXRoLnJvdW5kKHggKiAyNTUpKTtcbiAgICAgICAgcmV0dXJuIHtyLCBnLCBiLCBhfTtcbiAgICB9XG5cbiAgICBjb25zdCBjID0gKDEgLSBNYXRoLmFicygyICogbCAtIDEpKSAqIHM7XG4gICAgY29uc3QgeCA9IGMgKiAoMSAtIE1hdGguYWJzKChoIC8gNjApICUgMiAtIDEpKTtcbiAgICBjb25zdCBtID0gbCAtIGMgLyAyO1xuICAgIGNvbnN0IFtyLCBnLCBiXSA9IChcbiAgICAgICAgaCA8IDYwID8gW2MsIHgsIDBdIDpcbiAgICAgICAgICAgIGggPCAxMjAgPyBbeCwgYywgMF0gOlxuICAgICAgICAgICAgICAgIGggPCAxODAgPyBbMCwgYywgeF0gOlxuICAgICAgICAgICAgICAgICAgICBoIDwgMjQwID8gWzAsIHgsIGNdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGggPCAzMDAgPyBbeCwgMCwgY10gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtjLCAwLCB4XVxuICAgICkubWFwKChuKSA9PiBNYXRoLnJvdW5kKChuICsgbSkgKiAyNTUpKTtcblxuICAgIHJldHVybiB7ciwgZywgYiwgYX07XG59XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hTTF9hbmRfSFNWXG5leHBvcnQgZnVuY3Rpb24gcmdiVG9IU0woe3I6IHIyNTUsIGc6IGcyNTUsIGI6IGIyNTUsIGEgPSAxfTogUkdCQSk6IEhTTEEge1xuICAgIGNvbnN0IHIgPSByMjU1IC8gMjU1O1xuICAgIGNvbnN0IGcgPSBnMjU1IC8gMjU1O1xuICAgIGNvbnN0IGIgPSBiMjU1IC8gMjU1O1xuXG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgY29uc3QgbWluID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgY29uc3QgYyA9IG1heCAtIG1pbjtcblxuICAgIGNvbnN0IGwgPSAobWF4ICsgbWluKSAvIDI7XG5cbiAgICBpZiAoYyA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge2g6IDAsIHM6IDAsIGwsIGF9O1xuICAgIH1cblxuICAgIGxldCBoID0gKFxuICAgICAgICBtYXggPT09IHIgPyAoKChnIC0gYikgLyBjKSAlIDYpIDpcbiAgICAgICAgICAgIG1heCA9PT0gZyA/ICgoYiAtIHIpIC8gYyArIDIpIDpcbiAgICAgICAgICAgICAgICAoKHIgLSBnKSAvIGMgKyA0KVxuICAgICkgKiA2MDtcbiAgICBpZiAoaCA8IDApIHtcbiAgICAgICAgaCArPSAzNjA7XG4gICAgfVxuXG4gICAgY29uc3QgcyA9IGMgLyAoMSAtIE1hdGguYWJzKDIgKiBsIC0gMSkpO1xuXG4gICAgcmV0dXJuIHtoLCBzLCBsLCBhfTtcbn1cblxuZnVuY3Rpb24gdG9GaXhlZChuOiBudW1iZXIsIGRpZ2l0cyA9IDApOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpeGVkID0gbi50b0ZpeGVkKGRpZ2l0cyk7XG4gICAgaWYgKGRpZ2l0cyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZml4ZWQ7XG4gICAgfVxuICAgIGNvbnN0IGRvdCA9IGZpeGVkLmluZGV4T2YoJy4nKTtcbiAgICBpZiAoZG90ID49IDApIHtcbiAgICAgICAgY29uc3QgemVyb3NNYXRjaCA9IGZpeGVkLm1hdGNoKC8wKyQvKTtcbiAgICAgICAgaWYgKHplcm9zTWF0Y2gpIHtcbiAgICAgICAgICAgIGlmICh6ZXJvc01hdGNoLmluZGV4ID09PSBkb3QgKyAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkLnN1YnN0cmluZygwLCBkb3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpeGVkLnN1YnN0cmluZygwLCB6ZXJvc01hdGNoLmluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZml4ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JUb1N0cmluZyhyZ2I6IFJHQkEpOiBzdHJpbmcge1xuICAgIGNvbnN0IHtyLCBnLCBiLCBhfSA9IHJnYjtcbiAgICBpZiAoYSAhPSBudWxsICYmIGEgPCAxKSB7XG4gICAgICAgIHJldHVybiBgcmdiYSgke3RvRml4ZWQocil9LCAke3RvRml4ZWQoZyl9LCAke3RvRml4ZWQoYil9LCAke3RvRml4ZWQoYSwgMil9KWA7XG4gICAgfVxuICAgIHJldHVybiBgcmdiKCR7dG9GaXhlZChyKX0sICR7dG9GaXhlZChnKX0sICR7dG9GaXhlZChiKX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYlRvSGV4U3RyaW5nKHtyLCBnLCBiLCBhfTogUkdCQSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAjJHsoYSAhPSBudWxsICYmIGEgPCAxID8gW3IsIGcsIGIsIE1hdGgucm91bmQoYSAqIDI1NSldIDogW3IsIGcsIGJdKS5tYXAoKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIGAke3ggPCAxNiA/ICcwJyA6ICcnfSR7eC50b1N0cmluZygxNil9YDtcbiAgICB9KS5qb2luKCcnKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsVG9TdHJpbmcoaHNsOiBIU0xBKTogc3RyaW5nIHtcbiAgICBjb25zdCB7aCwgcywgbCwgYX0gPSBoc2w7XG4gICAgaWYgKGEgIT0gbnVsbCAmJiBhIDwgMSkge1xuICAgICAgICByZXR1cm4gYGhzbGEoJHt0b0ZpeGVkKGgpfSwgJHt0b0ZpeGVkKHMgKiAxMDApfSUsICR7dG9GaXhlZChsICogMTAwKX0lLCAke3RvRml4ZWQoYSwgMil9KWA7XG4gICAgfVxuICAgIHJldHVybiBgaHNsKCR7dG9GaXhlZChoKX0sICR7dG9GaXhlZChzICogMTAwKX0lLCAke3RvRml4ZWQobCAqIDEwMCl9JSlgO1xufVxuXG5jb25zdCByZ2JNYXRjaCA9IC9ecmdiYT9cXChbXlxcKFxcKV0rXFwpJC87XG5jb25zdCBoc2xNYXRjaCA9IC9eaHNsYT9cXChbXlxcKFxcKV0rXFwpJC87XG5jb25zdCBoZXhNYXRjaCA9IC9eI1swLTlhLWZdKyQvaTtcblxuY29uc3Qgc3VwcG9ydGVkQ29sb3JGdW5jcyA9IFtcbiAgICAnY29sb3InLFxuICAgICdjb2xvci1taXgnLFxuICAgICdod2InLFxuICAgICdsYWInLFxuICAgICdsY2gnLFxuICAgICdva2xhYicsXG4gICAgJ29rbGNoJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSgkY29sb3I6IHN0cmluZyk6IFJHQkEgfCBudWxsIHtcbiAgICBjb25zdCBjID0gJGNvbG9yLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChjLmluY2x1ZGVzKCcoZnJvbSAnKSkge1xuICAgICAgICBpZiAoYy5pbmRleE9mKCcoZnJvbScpICE9PSBjLmxhc3RJbmRleE9mKCcoZnJvbScpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tUGFyc2VDb2xvcihjKTtcbiAgICB9XG5cbiAgICBpZiAoYy5tYXRjaChyZ2JNYXRjaCkpIHtcbiAgICAgICAgaWYgKGMuc3RhcnRzV2l0aCgncmdiKCMnKSB8fCBjLnN0YXJ0c1dpdGgoJ3JnYmEoIycpKSB7XG4gICAgICAgICAgICBpZiAoYy5sYXN0SW5kZXhPZigncmdiJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9tUGFyc2VDb2xvcihjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VSR0IoYyk7XG4gICAgfVxuXG4gICAgaWYgKGMubWF0Y2goaHNsTWF0Y2gpKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUhTTChjKTtcbiAgICB9XG5cbiAgICBpZiAoYy5tYXRjaChoZXhNYXRjaCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSGV4KGMpO1xuICAgIH1cblxuICAgIGlmIChrbm93bkNvbG9ycy5oYXMoYykpIHtcbiAgICAgICAgcmV0dXJuIGdldENvbG9yQnlOYW1lKGMpO1xuICAgIH1cblxuICAgIGlmIChzeXN0ZW1Db2xvcnMuaGFzKGMpKSB7XG4gICAgICAgIHJldHVybiBnZXRTeXN0ZW1Db2xvcihjKTtcbiAgICB9XG5cbiAgICBpZiAoYyA9PT0gJ3RyYW5zcGFyZW50Jykge1xuICAgICAgICByZXR1cm4ge3I6IDAsIGc6IDAsIGI6IDAsIGE6IDB9O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICAgYy5lbmRzV2l0aCgnKScpICYmXG4gICAgICAgIHN1cHBvcnRlZENvbG9yRnVuY3Muc29tZShcbiAgICAgICAgICAgIChmbikgPT4gYy5zdGFydHNXaXRoKGZuKSAmJiBjW2ZuLmxlbmd0aF0gPT09ICcoJyAmJiBjLmxhc3RJbmRleE9mKGZuKSA9PT0gMFxuICAgICAgICApXG4gICAgKSB7XG4gICAgICAgIHJldHVybiBkb21QYXJzZUNvbG9yKGMpO1xuICAgIH1cblxuICAgIGlmIChjLnN0YXJ0c1dpdGgoJ2xpZ2h0LWRhcmsoJykgJiYgYy5lbmRzV2l0aCgnKScpKSB7XG4gICAgICAgIC8vIGxpZ2h0LWRhcmsoW2NvbG9yKCldLCBbY29sb3IoKV0pXG4gICAgICAgIGNvbnN0IG1hdGNoID0gYy5tYXRjaCgvXmxpZ2h0LWRhcmtcXChcXHMqKFthLXpdKyhcXCguKlxcKSk/KSxcXHMqKFthLXpdKyhcXCguKlxcKSk/KVxccypcXCkkLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1lQ29sb3IgPSBpc1N5c3RlbURhcmtNb2RlRW5hYmxlZCgpID8gbWF0Y2hbM10gOiBtYXRjaFsxXTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZShzY2hlbWVDb2xvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0TnVtYmVycygkY29sb3I6IHN0cmluZykge1xuICAgIGNvbnN0IG51bWJlcnM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHByZXZQb3MgPSAwO1xuICAgIGxldCBpc01pbmluZyA9IGZhbHNlO1xuICAgIC8vIEdldCB0aGUgZmlyc3QgYChgLlxuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSAkY29sb3IuaW5kZXhPZignKCcpO1xuICAgICRjb2xvciA9ICRjb2xvci5zdWJzdHJpbmcoc3RhcnRJbmRleCArIDEsICRjb2xvci5sZW5ndGggLSAxKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8ICRjb2xvci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjID0gJGNvbG9yW2ldO1xuICAgICAgICAvLyBDaGVjayBpZiBgY2AgaXMgYSBkaWdpdC5cbiAgICAgICAgaWYgKGMgPj0gJzAnICYmIGMgPD0gJzknIHx8IGMgPT09ICcuJyB8fCBjID09PSAnKycgfHwgYyA9PT0gJy0nKSB7XG4gICAgICAgICAgICAvLyBFbmFibGUgdGhlIG1pbmluZyBmbGFnLlxuICAgICAgICAgICAgaXNNaW5pbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTWluaW5nICYmIChjID09PSAnICcgfHwgYyA9PT0gJywnIHx8IGMgPT09ICcvJykpIHtcbiAgICAgICAgICAgIC8vIGlzTWluaW5nIGlzIHRydWUgYW5kIHdlIGdvdCBhIHRlcm1pbmF0aW5nXG4gICAgICAgICAgICAvLyBjaGFyYWN0ZXIuIFNvIHdlIGNhbiBwdXNoIHRoZSBjdXJyZW50IG51bWJlclxuICAgICAgICAgICAgLy8gaW50byB0aGUgYXJyYXkuXG4gICAgICAgICAgICBudW1iZXJzLnB1c2goJGNvbG9yLnN1YnN0cmluZyhwcmV2UG9zLCBpKSk7XG4gICAgICAgICAgICAvLyBEaXNhYmxlIHRoZSBtaW5pbmcgZmxhZy5cbiAgICAgICAgICAgIGlzTWluaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBFbnN1cmUgdGhlIHByZXZQb3MgaXMgY29ycmVjdC5cbiAgICAgICAgICAgIHByZXZQb3MgPSBpICsgMTtcbiAgICAgICAgfSBlbHNlIGlmICghaXNNaW5pbmcpIHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgcHJldlBvcyBpcyBjb3JyZWN0LlxuICAgICAgICAgICAgcHJldlBvcyA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxhc3QgbnVtYmVyLlxuICAgIGlmIChpc01pbmluZykge1xuICAgICAgICBudW1iZXJzLnB1c2goJGNvbG9yLnN1YnN0cmluZyhwcmV2UG9zLCAkY29sb3IubGVuZ3RoKSk7XG4gICAgfVxuICAgIHJldHVybiBudW1iZXJzO1xufVxuXG5mdW5jdGlvbiBnZXROdW1iZXJzRnJvbVN0cmluZyhzdHI6IHN0cmluZywgcmFuZ2U6IG51bWJlcltdLCB1bml0czoge1t1bml0OiBzdHJpbmddOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgcmF3ID0gZ2V0TnVtYmVycyhzdHIpO1xuICAgIGNvbnN0IHVuaXRzTGlzdCA9IE9iamVjdC5lbnRyaWVzKHVuaXRzKTtcbiAgICBjb25zdCBudW1iZXJzID0gcmF3Lm1hcCgocikgPT4gci50cmltKCkpLm1hcCgociwgaSkgPT4ge1xuICAgICAgICBsZXQgbjogbnVtYmVyO1xuICAgICAgICBjb25zdCB1bml0ID0gdW5pdHNMaXN0LmZpbmQoKFt1XSkgPT4gci5lbmRzV2l0aCh1KSk7XG4gICAgICAgIGlmICh1bml0KSB7XG4gICAgICAgICAgICBuID0gcGFyc2VGbG9hdChyLnN1YnN0cmluZygwLCByLmxlbmd0aCAtIHVuaXRbMF0ubGVuZ3RoKSkgLyB1bml0WzFdICogcmFuZ2VbaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuID0gcGFyc2VGbG9hdChyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmFuZ2VbaV0gPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9KTtcbiAgICByZXR1cm4gbnVtYmVycztcbn1cblxuY29uc3QgcmdiUmFuZ2UgPSBbMjU1LCAyNTUsIDI1NSwgMV07XG5jb25zdCByZ2JVbml0cyA9IHsnJSc6IDEwMH07XG5cbmZ1bmN0aW9uIHBhcnNlUkdCKCRyZ2I6IHN0cmluZyk6IFJHQkEgfCBudWxsIHtcbiAgICBjb25zdCBbciwgZywgYiwgYSA9IDFdID0gZ2V0TnVtYmVyc0Zyb21TdHJpbmcoJHJnYiwgcmdiUmFuZ2UsIHJnYlVuaXRzKTtcbiAgICBpZiAociA9PSBudWxsIHx8IGcgPT0gbnVsbCB8fCBiID09IG51bGwgfHwgYSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge3IsIGcsIGIsIGF9O1xufVxuXG5jb25zdCBoc2xSYW5nZSA9IFszNjAsIDEsIDEsIDFdO1xuY29uc3QgaHNsVW5pdHMgPSB7JyUnOiAxMDAsICdkZWcnOiAzNjAsICdyYWQnOiAyICogTWF0aC5QSSwgJ3R1cm4nOiAxfTtcblxuZnVuY3Rpb24gcGFyc2VIU0woJGhzbDogc3RyaW5nKTogUkdCQSB8IG51bGwge1xuICAgIGNvbnN0IFtoLCBzLCBsLCBhID0gMV0gPSBnZXROdW1iZXJzRnJvbVN0cmluZygkaHNsLCBoc2xSYW5nZSwgaHNsVW5pdHMpO1xuICAgIGlmIChoID09IG51bGwgfHwgcyA9PSBudWxsIHx8IGwgPT0gbnVsbCB8fCBhID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBoc2xUb1JHQih7aCwgcywgbCwgYX0pO1xufVxuXG5mdW5jdGlvbiBwYXJzZUhleCgkaGV4OiBzdHJpbmcpOiBSR0JBIHwgbnVsbCB7XG4gICAgY29uc3QgaCA9ICRoZXguc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAoaC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6IHtcbiAgICAgICAgICAgIGNvbnN0IFtyLCBnLCBiXSA9IFswLCAxLCAyXS5tYXAoKGkpID0+IHBhcnNlSW50KGAke2hbaV19JHtoW2ldfWAsIDE2KSk7XG4gICAgICAgICAgICBjb25zdCBhID0gaC5sZW5ndGggPT09IDMgPyAxIDogKHBhcnNlSW50KGAke2hbM119JHtoWzNdfWAsIDE2KSAvIDI1NSk7XG4gICAgICAgICAgICByZXR1cm4ge3IsIGcsIGIsIGF9O1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA4OiB7XG4gICAgICAgICAgICBjb25zdCBbciwgZywgYl0gPSBbMCwgMiwgNF0ubWFwKChpKSA9PiBwYXJzZUludChoLnN1YnN0cmluZyhpLCBpICsgMiksIDE2KSk7XG4gICAgICAgICAgICBjb25zdCBhID0gaC5sZW5ndGggPT09IDYgPyAxIDogKHBhcnNlSW50KGguc3Vic3RyaW5nKDYsIDgpLCAxNikgLyAyNTUpO1xuICAgICAgICAgICAgcmV0dXJuIHtyLCBnLCBiLCBhfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0Q29sb3JCeU5hbWUoJGNvbG9yOiBzdHJpbmcpOiBSR0JBIHtcbiAgICBjb25zdCBuID0ga25vd25Db2xvcnMuZ2V0KCRjb2xvcikhO1xuICAgIHJldHVybiB7XG4gICAgICAgIHI6IChuID4+IDE2KSAmIDI1NSxcbiAgICAgICAgZzogKG4gPj4gOCkgJiAyNTUsXG4gICAgICAgIGI6IChuID4+IDApICYgMjU1LFxuICAgICAgICBhOiAxLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldFN5c3RlbUNvbG9yKCRjb2xvcjogc3RyaW5nKTogUkdCQSB7XG4gICAgY29uc3QgbiA9IHN5c3RlbUNvbG9ycy5nZXQoJGNvbG9yKSE7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogKG4gPj4gMTYpICYgMjU1LFxuICAgICAgICBnOiAobiA+PiA4KSAmIDI1NSxcbiAgICAgICAgYjogKG4gPj4gMCkgJiAyNTUsXG4gICAgICAgIGE6IDEsXG4gICAgfTtcbn1cblxuLy8gbG93ZXJDYWxjRXhwcmVzc2lvbiBpcyBhIGhlbHBlciBmdW5jdGlvbiB0aGF0IHRyaWVzIHRvIHJlbW92ZSBgY2FsYyguLi4pYFxuLy8gZXhwcmVzc2lvbnMgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nLiBJdCBjYW4gb25seSBsb3dlciBleHByZXNzaW9ucyB0byBhIGNlcnRhaW5cbi8vIGRlZ3JlZSBzbyB3ZSBjYW4ga2VlcCB0aGlzIGZ1bmN0aW9uIGVhc3kgYW5kIHNpbXBsZSB0byB1bmRlcnN0YW5kLlxuZXhwb3J0IGZ1bmN0aW9uIGxvd2VyQ2FsY0V4cHJlc3Npb24oY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gc2VhcmNoSW5kZXggd2lsbCBiZSB1c2VkIGFzIHNlYXJjaEluZGV4IGFuZCBhcyBhIFwiY3Vyc29yXCIgd2l0aGluXG4gICAgLy8gdGhlIGNhbGMoLi4uKSBleHByZXNzaW9uLlxuICAgIGxldCBzZWFyY2hJbmRleCA9IDA7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBjb250ZW50IGJldHdlZW4gdHdvIGluZGljZXMuXG4gICAgY29uc3QgcmVwbGFjZUJldHdlZW5JbmRpY2VzID0gKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCByZXBsYWNlbWVudDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbG9yID0gY29sb3Iuc3Vic3RyaW5nKDAsIHN0YXJ0KSArIHJlcGxhY2VtZW50ICsgY29sb3Iuc3Vic3RyaW5nKGVuZCk7XG4gICAgfTtcblxuICAgIC8vIFJ1biB0aGlzIGNvZGUgdW50aWwgaXQgZG9lc24ndCBmaW5kIGFueSBgY2FsYyguLi4pYC5cbiAgICB3aGlsZSAoKHNlYXJjaEluZGV4ID0gY29sb3IuaW5kZXhPZignY2FsYygnKSkgIT09IC0xKSB7XG4gICAgICAgIC8vIEdldCB0aGUgcGFyZW50aGVzZXMgcmFuZ2VzIG9mIGBjYWxjKC4uLilgLlxuICAgICAgICBjb25zdCByYW5nZSA9IGdldFBhcmVudGhlc2VzUmFuZ2UoY29sb3IsIHNlYXJjaEluZGV4KTtcbiAgICAgICAgaWYgKCFyYW5nZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGhlIGNvbnRlbnQgYmV0d2VlbiB0aGUgcGFyZW50aGVzZXMuXG4gICAgICAgIGxldCBzbGljZSA9IGNvbG9yLnNsaWNlKHJhbmdlLnN0YXJ0ICsgMSwgcmFuZ2UuZW5kIC0gMSk7XG4gICAgICAgIC8vIERvZXMgdGhlIGNvbnRlbnQgaW5jbHVkZSBhIHBlcmNlbnRhZ2U/XG4gICAgICAgIGNvbnN0IGluY2x1ZGVzUGVyY2VudGFnZSA9IHNsaWNlLmluY2x1ZGVzKCclJyk7XG4gICAgICAgIC8vIFJlbW92ZSBhbGwgcGVyY2VudGFnZXMuXG4gICAgICAgIHNsaWNlID0gc2xpY2Uuc3BsaXQoJyUnKS5qb2luKCcnKTtcblxuICAgICAgICAvLyBQYXNzIHRoZSBjb250ZW50IHRvIHRoZSBldmFsTWF0aCBsaWJyYXJ5IGFuZCByb3VuZCBpdHMgb3V0cHV0LlxuICAgICAgICBjb25zdCBvdXRwdXQgPSBNYXRoLnJvdW5kKGV2YWxNYXRoKHNsaWNlKSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBgY2FsYyguLi4pYCB3aXRoIHRoZSByZXN1bHQuXG4gICAgICAgIHJlcGxhY2VCZXR3ZWVuSW5kaWNlcyhyYW5nZS5zdGFydCAtIDQsIHJhbmdlLmVuZCwgb3V0cHV0ICsgKGluY2x1ZGVzUGVyY2VudGFnZSA/ICclJyA6ICcnKSk7XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuY29uc3Qga25vd25Db2xvcnM6IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHtcbiAgICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICAgIGFudGlxdWV3aGl0ZTogMHhmYWViZDcsXG4gICAgYXF1YTogMHgwMGZmZmYsXG4gICAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gICAgYXp1cmU6IDB4ZjBmZmZmLFxuICAgIGJlaWdlOiAweGY1ZjVkYyxcbiAgICBiaXNxdWU6IDB4ZmZlNGM0LFxuICAgIGJsYWNrOiAweDAwMDAwMCxcbiAgICBibGFuY2hlZGFsbW9uZDogMHhmZmViY2QsXG4gICAgYmx1ZTogMHgwMDAwZmYsXG4gICAgYmx1ZXZpb2xldDogMHg4YTJiZTIsXG4gICAgYnJvd246IDB4YTUyYTJhLFxuICAgIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gICAgY2FkZXRibHVlOiAweDVmOWVhMCxcbiAgICBjaGFydHJldXNlOiAweDdmZmYwMCxcbiAgICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICAgIGNvcmFsOiAweGZmN2Y1MCxcbiAgICBjb3JuZmxvd2VyYmx1ZTogMHg2NDk1ZWQsXG4gICAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICAgIGNyaW1zb246IDB4ZGMxNDNjLFxuICAgIGN5YW46IDB4MDBmZmZmLFxuICAgIGRhcmtibHVlOiAweDAwMDA4YixcbiAgICBkYXJrY3lhbjogMHgwMDhiOGIsXG4gICAgZGFya2dvbGRlbnJvZDogMHhiODg2MGIsXG4gICAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICAgIGRhcmtncmV5OiAweGE5YTlhOSxcbiAgICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICAgIGRhcmtraGFraTogMHhiZGI3NmIsXG4gICAgZGFya21hZ2VudGE6IDB4OGIwMDhiLFxuICAgIGRhcmtvbGl2ZWdyZWVuOiAweDU1NmIyZixcbiAgICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgICBkYXJrb3JjaGlkOiAweDk5MzJjYyxcbiAgICBkYXJrcmVkOiAweDhiMDAwMCxcbiAgICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgICBkYXJrc2VhZ3JlZW46IDB4OGZiYzhmLFxuICAgIGRhcmtzbGF0ZWJsdWU6IDB4NDgzZDhiLFxuICAgIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICAgIGRhcmtzbGF0ZWdyZXk6IDB4MmY0ZjRmLFxuICAgIGRhcmt0dXJxdW9pc2U6IDB4MDBjZWQxLFxuICAgIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICAgIGRlZXBwaW5rOiAweGZmMTQ5MyxcbiAgICBkZWVwc2t5Ymx1ZTogMHgwMGJmZmYsXG4gICAgZGltZ3JheTogMHg2OTY5NjksXG4gICAgZGltZ3JleTogMHg2OTY5NjksXG4gICAgZG9kZ2VyYmx1ZTogMHgxZTkwZmYsXG4gICAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgICBmbG9yYWx3aGl0ZTogMHhmZmZhZjAsXG4gICAgZm9yZXN0Z3JlZW46IDB4MjI4YjIyLFxuICAgIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICAgIGdhaW5zYm9ybzogMHhkY2RjZGMsXG4gICAgZ2hvc3R3aGl0ZTogMHhmOGY4ZmYsXG4gICAgZ29sZDogMHhmZmQ3MDAsXG4gICAgZ29sZGVucm9kOiAweGRhYTUyMCxcbiAgICBncmF5OiAweDgwODA4MCxcbiAgICBncmV5OiAweDgwODA4MCxcbiAgICBncmVlbjogMHgwMDgwMDAsXG4gICAgZ3JlZW55ZWxsb3c6IDB4YWRmZjJmLFxuICAgIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgICBob3RwaW5rOiAweGZmNjliNCxcbiAgICBpbmRpYW5yZWQ6IDB4Y2Q1YzVjLFxuICAgIGluZGlnbzogMHg0YjAwODIsXG4gICAgaXZvcnk6IDB4ZmZmZmYwLFxuICAgIGtoYWtpOiAweGYwZTY4YyxcbiAgICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gICAgbGF2ZW5kZXJibHVzaDogMHhmZmYwZjUsXG4gICAgbGF3bmdyZWVuOiAweDdjZmMwMCxcbiAgICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICAgIGxpZ2h0Ymx1ZTogMHhhZGQ4ZTYsXG4gICAgbGlnaHRjb3JhbDogMHhmMDgwODAsXG4gICAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogMHhmYWZhZDIsXG4gICAgbGlnaHRncmF5OiAweGQzZDNkMyxcbiAgICBsaWdodGdyZXk6IDB4ZDNkM2QzLFxuICAgIGxpZ2h0Z3JlZW46IDB4OTBlZTkwLFxuICAgIGxpZ2h0cGluazogMHhmZmI2YzEsXG4gICAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICAgIGxpZ2h0c2VhZ3JlZW46IDB4MjBiMmFhLFxuICAgIGxpZ2h0c2t5Ymx1ZTogMHg4N2NlZmEsXG4gICAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICAgIGxpZ2h0c2xhdGVncmV5OiAweDc3ODg5OSxcbiAgICBsaWdodHN0ZWVsYmx1ZTogMHhiMGM0ZGUsXG4gICAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICAgIGxpbWU6IDB4MDBmZjAwLFxuICAgIGxpbWVncmVlbjogMHgzMmNkMzIsXG4gICAgbGluZW46IDB4ZmFmMGU2LFxuICAgIG1hZ2VudGE6IDB4ZmYwMGZmLFxuICAgIG1hcm9vbjogMHg4MDAwMDAsXG4gICAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gICAgbWVkaXVtYmx1ZTogMHgwMDAwY2QsXG4gICAgbWVkaXVtb3JjaGlkOiAweGJhNTVkMyxcbiAgICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICAgIG1lZGl1bXNlYWdyZWVuOiAweDNjYjM3MSxcbiAgICBtZWRpdW1zbGF0ZWJsdWU6IDB4N2I2OGVlLFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgICBtZWRpdW10dXJxdW9pc2U6IDB4NDhkMWNjLFxuICAgIG1lZGl1bXZpb2xldHJlZDogMHhjNzE1ODUsXG4gICAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgICBtaW50Y3JlYW06IDB4ZjVmZmZhLFxuICAgIG1pc3R5cm9zZTogMHhmZmU0ZTEsXG4gICAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICAgIG5hdmFqb3doaXRlOiAweGZmZGVhZCxcbiAgICBuYXZ5OiAweDAwMDA4MCxcbiAgICBvbGRsYWNlOiAweGZkZjVlNixcbiAgICBvbGl2ZTogMHg4MDgwMDAsXG4gICAgb2xpdmVkcmFiOiAweDZiOGUyMyxcbiAgICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICAgIG9yYW5nZXJlZDogMHhmZjQ1MDAsXG4gICAgb3JjaGlkOiAweGRhNzBkNixcbiAgICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgICBwYWxlZ3JlZW46IDB4OThmYjk4LFxuICAgIHBhbGV0dXJxdW9pc2U6IDB4YWZlZWVlLFxuICAgIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICAgIHBhcGF5YXdoaXA6IDB4ZmZlZmQ1LFxuICAgIHBlYWNocHVmZjogMHhmZmRhYjksXG4gICAgcGVydTogMHhjZDg1M2YsXG4gICAgcGluazogMHhmZmMwY2IsXG4gICAgcGx1bTogMHhkZGEwZGQsXG4gICAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gICAgcHVycGxlOiAweDgwMDA4MCxcbiAgICByZWJlY2NhcHVycGxlOiAweDY2MzM5OSxcbiAgICByZWQ6IDB4ZmYwMDAwLFxuICAgIHJvc3licm93bjogMHhiYzhmOGYsXG4gICAgcm95YWxibHVlOiAweDQxNjllMSxcbiAgICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gICAgc2FsbW9uOiAweGZhODA3MixcbiAgICBzYW5keWJyb3duOiAweGY0YTQ2MCxcbiAgICBzZWFncmVlbjogMHgyZThiNTcsXG4gICAgc2Vhc2hlbGw6IDB4ZmZmNWVlLFxuICAgIHNpZW5uYTogMHhhMDUyMmQsXG4gICAgc2lsdmVyOiAweGMwYzBjMCxcbiAgICBza3libHVlOiAweDg3Y2VlYixcbiAgICBzbGF0ZWJsdWU6IDB4NmE1YWNkLFxuICAgIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gICAgc2xhdGVncmV5OiAweDcwODA5MCxcbiAgICBzbm93OiAweGZmZmFmYSxcbiAgICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gICAgc3RlZWxibHVlOiAweDQ2ODJiNCxcbiAgICB0YW46IDB4ZDJiNDhjLFxuICAgIHRlYWw6IDB4MDA4MDgwLFxuICAgIHRoaXN0bGU6IDB4ZDhiZmQ4LFxuICAgIHRvbWF0bzogMHhmZjYzNDcsXG4gICAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgICB2aW9sZXQ6IDB4ZWU4MmVlLFxuICAgIHdoZWF0OiAweGY1ZGViMyxcbiAgICB3aGl0ZTogMHhmZmZmZmYsXG4gICAgd2hpdGVzbW9rZTogMHhmNWY1ZjUsXG4gICAgeWVsbG93OiAweGZmZmYwMCxcbiAgICB5ZWxsb3dncmVlbjogMHg5YWNkMzIsXG59KSk7XG5cbmNvbnN0IHN5c3RlbUNvbG9yczogTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMoe1xuICAgIEFjdGl2ZUJvcmRlcjogMHgzYjk5ZmMsXG4gICAgQWN0aXZlQ2FwdGlvbjogMHgwMDAwMDAsXG4gICAgQXBwV29ya3NwYWNlOiAweGFhYWFhYSxcbiAgICBCYWNrZ3JvdW5kOiAweDYzNjNjZSxcbiAgICBCdXR0b25GYWNlOiAweGZmZmZmZixcbiAgICBCdXR0b25IaWdobGlnaHQ6IDB4ZTllOWU5LFxuICAgIEJ1dHRvblNoYWRvdzogMHg5ZmEwOWYsXG4gICAgQnV0dG9uVGV4dDogMHgwMDAwMDAsXG4gICAgQ2FwdGlvblRleHQ6IDB4MDAwMDAwLFxuICAgIEdyYXlUZXh0OiAweDdmN2Y3ZixcbiAgICBIaWdobGlnaHQ6IDB4YjJkN2ZmLFxuICAgIEhpZ2hsaWdodFRleHQ6IDB4MDAwMDAwLFxuICAgIEluYWN0aXZlQm9yZGVyOiAweGZmZmZmZixcbiAgICBJbmFjdGl2ZUNhcHRpb246IDB4ZmZmZmZmLFxuICAgIEluYWN0aXZlQ2FwdGlvblRleHQ6IDB4MDAwMDAwLFxuICAgIEluZm9CYWNrZ3JvdW5kOiAweGZiZmNjNSxcbiAgICBJbmZvVGV4dDogMHgwMDAwMDAsXG4gICAgTWVudTogMHhmNmY2ZjYsXG4gICAgTWVudVRleHQ6IDB4ZmZmZmZmLFxuICAgIFNjcm9sbGJhcjogMHhhYWFhYWEsXG4gICAgVGhyZWVERGFya1NoYWRvdzogMHgwMDAwMDAsXG4gICAgVGhyZWVERmFjZTogMHhjMGMwYzAsXG4gICAgVGhyZWVESGlnaGxpZ2h0OiAweGZmZmZmZixcbiAgICBUaHJlZURMaWdodFNoYWRvdzogMHhmZmZmZmYsXG4gICAgVGhyZWVEU2hhZG93OiAweDAwMDAwMCxcbiAgICBXaW5kb3c6IDB4ZWNlY2VjLFxuICAgIFdpbmRvd0ZyYW1lOiAweGFhYWFhYSxcbiAgICBXaW5kb3dUZXh0OiAweDAwMDAwMCxcbiAgICAnLXdlYmtpdC1mb2N1cy1yaW5nLWNvbG9yJzogMHhlNTk3MDAsXG59KS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW2tleS50b0xvd2VyQ2FzZSgpLCB2YWx1ZV0gYXMgW3N0cmluZywgbnVtYmVyXSkpO1xuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9SZWxhdGl2ZV9sdW1pbmFuY2VcbmV4cG9ydCBmdW5jdGlvbiBnZXRTUkdCTGlnaHRuZXNzKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoMC4yMTI2ICogciArIDAuNzE1MiAqIGcgKyAwLjA3MjIgKiBiKSAvIDI1NTtcbn1cblxubGV0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG5sZXQgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG5mdW5jdGlvbiBkb21QYXJzZUNvbG9yKCRjb2xvcjogc3RyaW5nKSB7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMud2lkdGggPSAxO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gMTtcbiAgICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcsIHt3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWV9KSE7XG4gICAgfVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJGNvbG9yO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgMSwgMSk7XG4gICAgY29uc3QgZCA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpLmRhdGE7XG4gICAgY29uc3QgY29sb3IgPSBgcmdiYSgke2RbMF19LCAke2RbMV19LCAke2RbMl19LCAkeyhkWzNdIC8gMjU1KS50b0ZpeGVkKDIpfSlgO1xuICAgIHJldHVybiBwYXJzZVJHQihjb2xvcik7XG59XG4iLCJpbXBvcnQge3BhcnNlQ29sb3JXaXRoQ2FjaGUsIHJnYlRvSGV4U3RyaW5nLCB0eXBlIFJHQkF9IGZyb20gJy4uLy4uL3V0aWxzL2NvbG9yJztcblxuaW50ZXJmYWNlIFJlZ2lzdGVyZWRDb2xvciB7XG4gICAgcGFyc2VkOiBSR0JBO1xuICAgIGJhY2tncm91bmQ/OiB7XG4gICAgICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgICAgIHZhcmlhYmxlOiBzdHJpbmc7XG4gICAgfTtcbiAgICB0ZXh0Pzoge1xuICAgICAgICB2YWx1ZTogc3RyaW5nO1xuICAgICAgICB2YXJpYWJsZTogc3RyaW5nO1xuICAgIH07XG4gICAgYm9yZGVyPzoge1xuICAgICAgICB2YWx1ZTogc3RyaW5nO1xuICAgICAgICB2YXJpYWJsZTogc3RyaW5nO1xuICAgIH07XG59XG5cbnR5cGUgQ29sb3JUeXBlID0gJ2JhY2tncm91bmQnIHwgJ2JvcmRlcicgfCAndGV4dCc7XG5cbmludGVyZmFjZSBDb2xvclBhbGV0dGUge1xuICAgIGJhY2tncm91bmQ6IFJHQkFbXTtcbiAgICBib3JkZXI6IFJHQkFbXTtcbiAgICB0ZXh0OiBSR0JBW107XG59XG5cbmxldCB2YXJpYWJsZXNTaGVldDogQ1NTU3R5bGVTaGVldCB8IG51bGw7XG5cbmNvbnN0IHJlZ2lzdGVyZWRDb2xvcnMgPSBuZXcgTWFwPHN0cmluZywgUmVnaXN0ZXJlZENvbG9yPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJWYXJpYWJsZXNTaGVldChzaGVldDogQ1NTU3R5bGVTaGVldCk6IHZvaWQge1xuICAgIHZhcmlhYmxlc1NoZWV0ID0gc2hlZXQ7XG4gICAgY29uc3QgdHlwZXM6IENvbG9yVHlwZVtdID0gWydiYWNrZ3JvdW5kJywgJ3RleHQnLCAnYm9yZGVyJ107XG4gICAgcmVnaXN0ZXJlZENvbG9ycy5mb3JFYWNoKChyZWdpc3RlcmVkKSA9PiB7XG4gICAgICAgIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgICAgIGlmIChyZWdpc3RlcmVkW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qge3ZhcmlhYmxlLCB2YWx1ZX0gPSByZWdpc3RlcmVkW3R5cGVdO1xuICAgICAgICAgICAgICAgICh2YXJpYWJsZXNTaGVldD8uY3NzUnVsZXNbMF0gYXMgQ1NTU3R5bGVSdWxlKS5zdHlsZS5zZXRQcm9wZXJ0eSh2YXJpYWJsZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGVhc2VWYXJpYWJsZXNTaGVldCgpOiB2b2lkIHtcbiAgICB2YXJpYWJsZXNTaGVldCA9IG51bGw7XG4gICAgY2xlYXJDb2xvclBhbGV0dGUoKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVnaXN0ZXJlZFZhcmlhYmxlVmFsdWUodHlwZTogQ29sb3JUeXBlLCByZWdpc3RlcmVkOiBSZWdpc3RlcmVkQ29sb3IpIHtcbiAgICByZXR1cm4gYHZhcigke3JlZ2lzdGVyZWRbdHlwZV0hLnZhcmlhYmxlfSwgJHtyZWdpc3RlcmVkW3R5cGVdIS52YWx1ZX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZ2lzdGVyZWRDb2xvcih0eXBlOiBDb2xvclR5cGUsIHBhcnNlZDogUkdCQSk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGhleCA9IHJnYlRvSGV4U3RyaW5nKHBhcnNlZCk7XG4gICAgY29uc3QgcmVnaXN0ZXJlZCA9IHJlZ2lzdGVyZWRDb2xvcnMuZ2V0KGhleCk7XG4gICAgaWYgKHJlZ2lzdGVyZWQ/Llt0eXBlXSkge1xuICAgICAgICByZXR1cm4gZ2V0UmVnaXN0ZXJlZFZhcmlhYmxlVmFsdWUodHlwZSwgcmVnaXN0ZXJlZCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJDb2xvcih0eXBlOiBDb2xvclR5cGUsIHBhcnNlZDogUkdCQSwgdmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgaGV4ID0gcmdiVG9IZXhTdHJpbmcocGFyc2VkKTtcblxuICAgIGxldCByZWdpc3RlcmVkOiBSZWdpc3RlcmVkQ29sb3I7XG4gICAgaWYgKHJlZ2lzdGVyZWRDb2xvcnMuaGFzKGhleCkpIHtcbiAgICAgICAgcmVnaXN0ZXJlZCA9IHJlZ2lzdGVyZWRDb2xvcnMuZ2V0KGhleCkhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQ29sb3JXaXRoQ2FjaGUoaGV4KSE7XG4gICAgICAgIHJlZ2lzdGVyZWQgPSB7cGFyc2VkfTtcbiAgICAgICAgcmVnaXN0ZXJlZENvbG9ycy5zZXQoaGV4LCByZWdpc3RlcmVkKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YXJpYWJsZSA9IGAtLWRhcmtyZWFkZXItJHt0eXBlfS0ke2hleC5yZXBsYWNlKCcjJywgJycpfWA7XG4gICAgcmVnaXN0ZXJlZFt0eXBlXSA9IHt2YXJpYWJsZSwgdmFsdWV9O1xuICAgIGlmICgodmFyaWFibGVzU2hlZXQ/LmNzc1J1bGVzWzBdIGFzIENTU1N0eWxlUnVsZSk/LnN0eWxlKSB7XG4gICAgICAgICh2YXJpYWJsZXNTaGVldD8uY3NzUnVsZXNbMF0gYXMgQ1NTU3R5bGVSdWxlKS5zdHlsZS5zZXRQcm9wZXJ0eSh2YXJpYWJsZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRSZWdpc3RlcmVkVmFyaWFibGVWYWx1ZSh0eXBlLCByZWdpc3RlcmVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yUGFsZXR0ZSgpOiBDb2xvclBhbGV0dGUge1xuICAgIGNvbnN0IGJhY2tncm91bmQ6IFJHQkFbXSA9IFtdO1xuICAgIGNvbnN0IGJvcmRlcjogUkdCQVtdID0gW107XG4gICAgY29uc3QgdGV4dDogUkdCQVtdID0gW107XG5cbiAgICByZWdpc3RlcmVkQ29sb3JzLmZvckVhY2goKHJlZ2lzdGVyZWQpID0+IHtcbiAgICAgICAgaWYgKHJlZ2lzdGVyZWQuYmFja2dyb3VuZCkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC5wdXNoKHJlZ2lzdGVyZWQucGFyc2VkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVnaXN0ZXJlZC5ib3JkZXIpIHtcbiAgICAgICAgICAgIGJvcmRlci5wdXNoKHJlZ2lzdGVyZWQucGFyc2VkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVnaXN0ZXJlZC50ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0LnB1c2gocmVnaXN0ZXJlZC5wYXJzZWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge2JhY2tncm91bmQsIGJvcmRlciwgdGV4dH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbG9yUGFsZXR0ZSgpOiB2b2lkIHtcbiAgICByZWdpc3RlcmVkQ29sb3JzLmNsZWFyKCk7XG59XG4iLCJpbXBvcnQge2V4dGVuZFRoZW1lQ2FjaGVLZXlzLCBnZXRCYWNrZ3JvdW5kUG9sZXMsIGdldFRleHRQb2xlcywgbW9kaWZ5QmdDb2xvckV4dGVuZGVkLCBtb2RpZnlGZ0NvbG9yRXh0ZW5kZWQsIG1vZGlmeUxpZ2h0U2NoZW1lQ29sb3JFeHRlbmRlZH0gZnJvbSAnQHBsdXMvdXRpbHMvdGhlbWUnO1xuaW1wb3J0IHR5cGUge1RoZW1lfSBmcm9tICcuLi8uLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2FwcGx5Q29sb3JNYXRyaXgsIGNyZWF0ZUZpbHRlck1hdHJpeH0gZnJvbSAnLi4vLi4vZ2VuZXJhdG9ycy91dGlscy9tYXRyaXgnO1xuaW1wb3J0IHtnZXRSZWdpc3RlcmVkQ29sb3IsIHJlZ2lzdGVyQ29sb3J9IGZyb20gJy4uLy4uL2luamVjdC9keW5hbWljLXRoZW1lL3BhbGV0dGUnO1xuaW1wb3J0IHR5cGUge1JHQkEsIEhTTEF9IGZyb20gJy4uLy4uL3V0aWxzL2NvbG9yJztcbmltcG9ydCB7cGFyc2VUb0hTTFdpdGhDYWNoZSwgcmdiVG9IU0wsIGhzbFRvUkdCLCByZ2JUb1N0cmluZywgcmdiVG9IZXhTdHJpbmd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbG9yJztcbmltcG9ydCB7c2NhbGV9IGZyb20gJy4uLy4uL3V0aWxzL21hdGgnO1xuXG5pbnRlcmZhY2UgQ29sb3JGdW5jdGlvbiB7XG4gICAgKGhzbDogSFNMQSk6IEhTTEE7XG59XG5cbmRlY2xhcmUgY29uc3QgX19QTFVTX186IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGdldEJnUG9sZSh0aGVtZTogVGhlbWUpIHtcbiAgICBjb25zdCBpc0RhcmtTY2hlbWUgPSB0aGVtZS5tb2RlID09PSAxO1xuICAgIGNvbnN0IHByb3A6IGtleW9mIFRoZW1lID0gaXNEYXJrU2NoZW1lID8gJ2RhcmtTY2hlbWVCYWNrZ3JvdW5kQ29sb3InIDogJ2xpZ2h0U2NoZW1lQmFja2dyb3VuZENvbG9yJztcbiAgICByZXR1cm4gdGhlbWVbcHJvcF07XG59XG5cbmZ1bmN0aW9uIGdldEZnUG9sZSh0aGVtZTogVGhlbWUpIHtcbiAgICBjb25zdCBpc0RhcmtTY2hlbWUgPSB0aGVtZS5tb2RlID09PSAxO1xuICAgIGNvbnN0IHByb3A6IGtleW9mIFRoZW1lID0gaXNEYXJrU2NoZW1lID8gJ2RhcmtTY2hlbWVUZXh0Q29sb3InIDogJ2xpZ2h0U2NoZW1lVGV4dENvbG9yJztcbiAgICByZXR1cm4gdGhlbWVbcHJvcF07XG59XG5cbmNvbnN0IGNvbG9yTW9kaWZpY2F0aW9uQ2FjaGUgPSBuZXcgTWFwPENvbG9yRnVuY3Rpb24sIE1hcDxzdHJpbmcsIHN0cmluZz4+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbG9yTW9kaWZpY2F0aW9uQ2FjaGUoKTogdm9pZCB7XG4gICAgY29sb3JNb2RpZmljYXRpb25DYWNoZS5jbGVhcigpO1xufVxuXG5jb25zdCByZ2JDYWNoZUtleXM6IEFycmF5PGtleW9mIFJHQkE+ID0gWydyJywgJ2cnLCAnYicsICdhJ107XG5cbmV4cG9ydCBjb25zdCB0aGVtZUNhY2hlS2V5czogQXJyYXk8a2V5b2YgVGhlbWU+ID0gW1xuICAgICdtb2RlJyxcbiAgICAnYnJpZ2h0bmVzcycsXG4gICAgJ2NvbnRyYXN0JyxcbiAgICAnZ3JheXNjYWxlJyxcbiAgICAnc2VwaWEnLFxuICAgICdkYXJrU2NoZW1lQmFja2dyb3VuZENvbG9yJyxcbiAgICAnZGFya1NjaGVtZVRleHRDb2xvcicsXG4gICAgJ2xpZ2h0U2NoZW1lQmFja2dyb3VuZENvbG9yJyxcbiAgICAnbGlnaHRTY2hlbWVUZXh0Q29sb3InLFxuXTtcbmV4dGVuZFRoZW1lQ2FjaGVLZXlzKHRoZW1lQ2FjaGVLZXlzKTtcblxuZnVuY3Rpb24gZ2V0Q2FjaGVJZChyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSk6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdElkID0gJyc7XG4gICAgcmdiQ2FjaGVLZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICByZXN1bHRJZCArPSBgJHtyZ2Jba2V5XX07YDtcbiAgICB9KTtcbiAgICB0aGVtZUNhY2hlS2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmVzdWx0SWQgKz0gYCR7dGhlbWVba2V5XX07YDtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0SWQ7XG59XG5cbmZ1bmN0aW9uIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYjogUkdCQSwgdGhlbWU6IFRoZW1lLCBtb2RpZnlIU0w6IChoc2w6IEhTTEEsIHBvbGU/OiBIU0xBIHwgbnVsbCwgYW5vdGhlclBvbGU/OiBIU0xBIHwgbnVsbCkgPT4gSFNMQSwgcG9sZUNvbG9yPzogc3RyaW5nLCBhbm90aGVyUG9sZUNvbG9yPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgZm5DYWNoZTogTWFwPHN0cmluZywgc3RyaW5nPjtcbiAgICBpZiAoY29sb3JNb2RpZmljYXRpb25DYWNoZS5oYXMobW9kaWZ5SFNMKSkge1xuICAgICAgICBmbkNhY2hlID0gY29sb3JNb2RpZmljYXRpb25DYWNoZS5nZXQobW9kaWZ5SFNMKSE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm5DYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29sb3JNb2RpZmljYXRpb25DYWNoZS5zZXQobW9kaWZ5SFNMLCBmbkNhY2hlKTtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBnZXRDYWNoZUlkKHJnYiwgdGhlbWUpO1xuICAgIGlmIChmbkNhY2hlLmhhcyhpZCkpIHtcbiAgICAgICAgcmV0dXJuIGZuQ2FjaGUuZ2V0KGlkKSE7XG4gICAgfVxuXG4gICAgY29uc3QgaHNsID0gcmdiVG9IU0wocmdiKTtcbiAgICBjb25zdCBwb2xlID0gcG9sZUNvbG9yID09IG51bGwgPyBudWxsIDogcGFyc2VUb0hTTFdpdGhDYWNoZShwb2xlQ29sb3IpO1xuICAgIGNvbnN0IGFub3RoZXJQb2xlID0gYW5vdGhlclBvbGVDb2xvciA9PSBudWxsID8gbnVsbCA6IHBhcnNlVG9IU0xXaXRoQ2FjaGUoYW5vdGhlclBvbGVDb2xvcik7XG4gICAgY29uc3QgbW9kaWZpZWQgPSBtb2RpZnlIU0woaHNsLCBwb2xlLCBhbm90aGVyUG9sZSk7XG4gICAgY29uc3Qge3IsIGcsIGIsIGF9ID0gaHNsVG9SR0IobW9kaWZpZWQpO1xuICAgIGNvbnN0IG1hdHJpeCA9IGNyZWF0ZUZpbHRlck1hdHJpeCh7Li4udGhlbWUsIG1vZGU6IDB9KTtcbiAgICBjb25zdCBbcmYsIGdmLCBiZl0gPSBhcHBseUNvbG9yTWF0cml4KFtyLCBnLCBiXSwgbWF0cml4KTtcblxuICAgIGNvbnN0IGNvbG9yID0gKGEgPT09IDEgP1xuICAgICAgICByZ2JUb0hleFN0cmluZyh7cjogcmYsIGc6IGdmLCBiOiBiZn0pIDpcbiAgICAgICAgcmdiVG9TdHJpbmcoe3I6IHJmLCBnOiBnZiwgYjogYmYsIGF9KSk7XG5cbiAgICBmbkNhY2hlLnNldChpZCwgY29sb3IpO1xuICAgIHJldHVybiBjb2xvcjtcbn1cblxuZnVuY3Rpb24gbm9vcEhTTChoc2w6IEhTTEEpOiBIU0xBIHtcbiAgICByZXR1cm4gaHNsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kaWZ5Q29sb3IocmdiOiBSR0JBLCB0aGVtZTogVGhlbWUpOiBzdHJpbmcge1xuICAgIHJldHVybiBtb2RpZnlDb2xvcldpdGhDYWNoZShyZ2IsIHRoZW1lLCBub29wSFNMKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZ5QW5kUmVnaXN0ZXJDb2xvcihcbiAgICB0eXBlOiAnYmFja2dyb3VuZCcgfCAndGV4dCcgfCAnYm9yZGVyJyxcbiAgICByZ2I6IFJHQkEsXG4gICAgdGhlbWU6IFRoZW1lLFxuICAgIG1vZGlmaWVyOiAocmdiOiBSR0JBLCB0aGVtZTogVGhlbWUpID0+IHN0cmluZyxcbikge1xuICAgIGNvbnN0IHJlZ2lzdGVyZWQgPSBnZXRSZWdpc3RlcmVkQ29sb3IodHlwZSwgcmdiKTtcbiAgICBpZiAocmVnaXN0ZXJlZCkge1xuICAgICAgICByZXR1cm4gcmVnaXN0ZXJlZDtcbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSBtb2RpZmllcihyZ2IsIHRoZW1lKTtcbiAgICByZXR1cm4gcmVnaXN0ZXJDb2xvcih0eXBlLCByZ2IsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZ5TGlnaHRTY2hlbWVDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcG9sZUJnID0gZ2V0QmdQb2xlKHRoZW1lKTtcbiAgICBjb25zdCBwb2xlRmcgPSBnZXRGZ1BvbGUodGhlbWUpO1xuICAgIHJldHVybiBtb2RpZnlDb2xvcldpdGhDYWNoZShyZ2IsIHRoZW1lLCBtb2RpZnlMaWdodE1vZGVIU0wsIHBvbGVGZywgcG9sZUJnKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZ5TGlnaHRNb2RlSFNMKHtoLCBzLCBsLCBhfTogSFNMQSwgcG9sZUZnOiBIU0xBLCBwb2xlQmc6IEhTTEEpOiBIU0xBIHtcbiAgICBjb25zdCBpc0RhcmsgPSBsIDwgMC41O1xuICAgIGxldCBpc05ldXRyYWw6IGJvb2xlYW47XG4gICAgaWYgKGlzRGFyaykge1xuICAgICAgICBpc05ldXRyYWwgPSBsIDwgMC4yIHx8IHMgPCAwLjEyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGlzQmx1ZSA9IGggPiAyMDAgJiYgaCA8IDI4MDtcbiAgICAgICAgaXNOZXV0cmFsID0gcyA8IDAuMjQgfHwgKGwgPiAwLjggJiYgaXNCbHVlKTtcbiAgICB9XG5cbiAgICBsZXQgaHggPSBoO1xuICAgIGxldCBzeCA9IHM7XG4gICAgaWYgKGlzTmV1dHJhbCkge1xuICAgICAgICBpZiAoaXNEYXJrKSB7XG4gICAgICAgICAgICBoeCA9IHBvbGVGZy5oO1xuICAgICAgICAgICAgc3ggPSBwb2xlRmcucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGh4ID0gcG9sZUJnLmg7XG4gICAgICAgICAgICBzeCA9IHBvbGVCZy5zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbHggPSBzY2FsZShsLCAwLCAxLCBwb2xlRmcubCwgcG9sZUJnLmwpO1xuXG4gICAgcmV0dXJuIHtoOiBoeCwgczogc3gsIGw6IGx4LCBhfTtcbn1cblxuY29uc3QgTUFYX0JHX0xJR0hUTkVTUyA9IDAuNDtcblxuZnVuY3Rpb24gbW9kaWZ5QmdIU0woe2gsIHMsIGwsIGF9OiBIU0xBLCBwb2xlOiBIU0xBKTogSFNMQSB7XG4gICAgY29uc3QgaXNEYXJrID0gbCA8IDAuNTtcbiAgICBjb25zdCBpc0JsdWUgPSBoID4gMjAwICYmIGggPCAyODA7XG4gICAgY29uc3QgaXNOZXV0cmFsID0gcyA8IDAuMTIgfHwgKGwgPiAwLjggJiYgaXNCbHVlKTtcbiAgICBpZiAoaXNEYXJrKSB7XG4gICAgICAgIGNvbnN0IGx4ID0gc2NhbGUobCwgMCwgMC41LCAwLCBNQVhfQkdfTElHSFRORVNTKTtcbiAgICAgICAgaWYgKGlzTmV1dHJhbCkge1xuICAgICAgICAgICAgY29uc3QgaHggPSBwb2xlLmg7XG4gICAgICAgICAgICBjb25zdCBzeCA9IHBvbGUucztcbiAgICAgICAgICAgIHJldHVybiB7aDogaHgsIHM6IHN4LCBsOiBseCwgYX07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtoLCBzLCBsOiBseCwgYX07XG4gICAgfVxuXG4gICAgbGV0IGx4ID0gc2NhbGUobCwgMC41LCAxLCBNQVhfQkdfTElHSFRORVNTLCBwb2xlLmwpO1xuXG4gICAgaWYgKGlzTmV1dHJhbCkge1xuICAgICAgICBjb25zdCBoeCA9IHBvbGUuaDtcbiAgICAgICAgY29uc3Qgc3ggPSBwb2xlLnM7XG4gICAgICAgIHJldHVybiB7aDogaHgsIHM6IHN4LCBsOiBseCwgYX07XG4gICAgfVxuXG4gICAgbGV0IGh4ID0gaDtcbiAgICBjb25zdCBpc1llbGxvdyA9IGggPiA2MCAmJiBoIDwgMTgwO1xuICAgIGlmIChpc1llbGxvdykge1xuICAgICAgICBjb25zdCBpc0Nsb3NlclRvR3JlZW4gPSBoID4gMTIwO1xuICAgICAgICBpZiAoaXNDbG9zZXJUb0dyZWVuKSB7XG4gICAgICAgICAgICBoeCA9IHNjYWxlKGgsIDEyMCwgMTgwLCAxMzUsIDE4MCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoeCA9IHNjYWxlKGgsIDYwLCAxMjAsIDYwLCAxMDUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTG93ZXIgdGhlIGxpZ2h0bmVzcywgaWYgdGhlIHJlc3VsdGluZ1xuICAgIC8vIGh1ZSBpcyBpbiBsb3dlciB5ZWxsb3cgc3BlY3RydW0uXG4gICAgaWYgKGh4ID4gNDAgJiYgaHggPCA4MCkge1xuICAgICAgICBseCAqPSAwLjc1O1xuICAgIH1cblxuICAgIHJldHVybiB7aDogaHgsIHMsIGw6IGx4LCBhfTtcbn1cblxuZnVuY3Rpb24gX21vZGlmeUJhY2tncm91bmRDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSkge1xuICAgIGlmICh0aGVtZS5tb2RlID09PSAwKSB7XG4gICAgICAgIGlmIChfX1BMVVNfXykge1xuICAgICAgICAgICAgY29uc3QgcG9sZXMgPSBnZXRCYWNrZ3JvdW5kUG9sZXModGhlbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUxpZ2h0U2NoZW1lQ29sb3JFeHRlbmRlZCwgcG9sZXNbMF0sIHBvbGVzWzFdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kaWZ5TGlnaHRTY2hlbWVDb2xvcihyZ2IsIHRoZW1lKTtcbiAgICB9XG4gICAgaWYgKF9fUExVU19fKSB7XG4gICAgICAgIGNvbnN0IHBvbGVzID0gZ2V0QmFja2dyb3VuZFBvbGVzKHRoZW1lKTtcbiAgICAgICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUJnQ29sb3JFeHRlbmRlZCwgcG9sZXNbMF0sIHBvbGVzWzFdKTtcbiAgICB9XG4gICAgY29uc3QgcG9sZSA9IGdldEJnUG9sZSh0aGVtZSk7XG4gICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUJnSFNMLCBwb2xlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGlmeUJhY2tncm91bmRDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSwgc2hvdWxkUmVnaXN0ZXJDb2xvclZhcmlhYmxlID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgaWYgKCFzaG91bGRSZWdpc3RlckNvbG9yVmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIF9tb2RpZnlCYWNrZ3JvdW5kQ29sb3IocmdiLCB0aGVtZSk7XG4gICAgfVxuICAgIHJldHVybiBtb2RpZnlBbmRSZWdpc3RlckNvbG9yKCdiYWNrZ3JvdW5kJywgcmdiLCB0aGVtZSwgX21vZGlmeUJhY2tncm91bmRDb2xvcik7XG59XG5cbmNvbnN0IE1JTl9GR19MSUdIVE5FU1MgPSAwLjU1O1xuXG5mdW5jdGlvbiBtb2RpZnlCbHVlRmdIdWUoaHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBzY2FsZShodWUsIDIwNSwgMjQ1LCAyMDUsIDIyMCk7XG59XG5cbmZ1bmN0aW9uIG1vZGlmeUZnSFNMKHtoLCBzLCBsLCBhfTogSFNMQSwgcG9sZTogSFNMQSk6IEhTTEEge1xuICAgIGNvbnN0IGlzTGlnaHQgPSBsID4gMC41O1xuICAgIGNvbnN0IGlzTmV1dHJhbCA9IGwgPCAwLjIgfHwgcyA8IDAuMjQ7XG4gICAgY29uc3QgaXNCbHVlID0gIWlzTmV1dHJhbCAmJiBoID4gMjA1ICYmIGggPCAyNDU7XG4gICAgaWYgKGlzTGlnaHQpIHtcbiAgICAgICAgY29uc3QgbHggPSBzY2FsZShsLCAwLjUsIDEsIE1JTl9GR19MSUdIVE5FU1MsIHBvbGUubCk7XG4gICAgICAgIGlmIChpc05ldXRyYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IGh4ID0gcG9sZS5oO1xuICAgICAgICAgICAgY29uc3Qgc3ggPSBwb2xlLnM7XG4gICAgICAgICAgICByZXR1cm4ge2g6IGh4LCBzOiBzeCwgbDogbHgsIGF9O1xuICAgICAgICB9XG4gICAgICAgIGxldCBoeCA9IGg7XG4gICAgICAgIGlmIChpc0JsdWUpIHtcbiAgICAgICAgICAgIGh4ID0gbW9kaWZ5Qmx1ZUZnSHVlKGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7aDogaHgsIHMsIGw6IGx4LCBhfTtcbiAgICB9XG5cbiAgICBpZiAoaXNOZXV0cmFsKSB7XG4gICAgICAgIGNvbnN0IGh4ID0gcG9sZS5oO1xuICAgICAgICBjb25zdCBzeCA9IHBvbGUucztcbiAgICAgICAgY29uc3QgbHggPSBzY2FsZShsLCAwLCAwLjUsIHBvbGUubCwgTUlOX0ZHX0xJR0hUTkVTUyk7XG4gICAgICAgIHJldHVybiB7aDogaHgsIHM6IHN4LCBsOiBseCwgYX07XG4gICAgfVxuXG4gICAgbGV0IGh4ID0gaDtcbiAgICBsZXQgbHg6IG51bWJlcjtcbiAgICBpZiAoaXNCbHVlKSB7XG4gICAgICAgIGh4ID0gbW9kaWZ5Qmx1ZUZnSHVlKGgpO1xuICAgICAgICBseCA9IHNjYWxlKGwsIDAsIDAuNSwgcG9sZS5sLCBNYXRoLm1pbigxLCBNSU5fRkdfTElHSFRORVNTICsgMC4wNSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGx4ID0gc2NhbGUobCwgMCwgMC41LCBwb2xlLmwsIE1JTl9GR19MSUdIVE5FU1MpO1xuICAgIH1cblxuICAgIHJldHVybiB7aDogaHgsIHMsIGw6IGx4LCBhfTtcbn1cblxuZnVuY3Rpb24gX21vZGlmeUZvcmVncm91bmRDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSkge1xuICAgIGlmICh0aGVtZS5tb2RlID09PSAwKSB7XG4gICAgICAgIGlmIChfX1BMVVNfXykge1xuICAgICAgICAgICAgY29uc3QgcG9sZXMgPSBnZXRUZXh0UG9sZXModGhlbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUxpZ2h0U2NoZW1lQ29sb3JFeHRlbmRlZCwgcG9sZXNbMF0sIHBvbGVzWzFdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kaWZ5TGlnaHRTY2hlbWVDb2xvcihyZ2IsIHRoZW1lKTtcbiAgICB9XG4gICAgaWYgKF9fUExVU19fKSB7XG4gICAgICAgIGNvbnN0IHBvbGVzID0gZ2V0VGV4dFBvbGVzKHRoZW1lKTtcbiAgICAgICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUZnQ29sb3JFeHRlbmRlZCwgcG9sZXNbMF0sIHBvbGVzWzFdKTtcbiAgICB9XG4gICAgY29uc3QgcG9sZSA9IGdldEZnUG9sZSh0aGVtZSk7XG4gICAgcmV0dXJuIG1vZGlmeUNvbG9yV2l0aENhY2hlKHJnYiwgdGhlbWUsIG1vZGlmeUZnSFNMLCBwb2xlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGlmeUZvcmVncm91bmRDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSwgc2hvdWxkUmVnaXN0ZXJDb2xvclZhcmlhYmxlID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgaWYgKCFzaG91bGRSZWdpc3RlckNvbG9yVmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIF9tb2RpZnlGb3JlZ3JvdW5kQ29sb3IocmdiLCB0aGVtZSk7XG4gICAgfVxuICAgIHJldHVybiBtb2RpZnlBbmRSZWdpc3RlckNvbG9yKCd0ZXh0JywgcmdiLCB0aGVtZSwgX21vZGlmeUZvcmVncm91bmRDb2xvcik7XG59XG5cbmZ1bmN0aW9uIG1vZGlmeUJvcmRlckhTTCh7aCwgcywgbCwgYX06IEhTTEEsIHBvbGVGZzogSFNMQSwgcG9sZUJnOiBIU0xBKTogSFNMQSB7XG4gICAgY29uc3QgaXNEYXJrID0gbCA8IDAuNTtcbiAgICBjb25zdCBpc05ldXRyYWwgPSBsIDwgMC4yIHx8IHMgPCAwLjI0O1xuXG4gICAgbGV0IGh4ID0gaDtcbiAgICBsZXQgc3ggPSBzO1xuXG4gICAgaWYgKGlzTmV1dHJhbCkge1xuICAgICAgICBpZiAoaXNEYXJrKSB7XG4gICAgICAgICAgICBoeCA9IHBvbGVGZy5oO1xuICAgICAgICAgICAgc3ggPSBwb2xlRmcucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGh4ID0gcG9sZUJnLmg7XG4gICAgICAgICAgICBzeCA9IHBvbGVCZy5zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbHggPSBzY2FsZShsLCAwLCAxLCAwLjUsIDAuMik7XG5cbiAgICByZXR1cm4ge2g6IGh4LCBzOiBzeCwgbDogbHgsIGF9O1xufVxuXG5mdW5jdGlvbiBfbW9kaWZ5Qm9yZGVyQ29sb3IocmdiOiBSR0JBLCB0aGVtZTogVGhlbWUpIHtcbiAgICBpZiAodGhlbWUubW9kZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbW9kaWZ5TGlnaHRTY2hlbWVDb2xvcihyZ2IsIHRoZW1lKTtcbiAgICB9XG4gICAgY29uc3QgcG9sZUZnID0gZ2V0RmdQb2xlKHRoZW1lKTtcbiAgICBjb25zdCBwb2xlQmcgPSBnZXRCZ1BvbGUodGhlbWUpO1xuICAgIHJldHVybiBtb2RpZnlDb2xvcldpdGhDYWNoZShyZ2IsIHRoZW1lLCBtb2RpZnlCb3JkZXJIU0wsIHBvbGVGZywgcG9sZUJnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGlmeUJvcmRlckNvbG9yKHJnYjogUkdCQSwgdGhlbWU6IFRoZW1lLCBzaG91bGRSZWdpc3RlckNvbG9yVmFyaWFibGUgPSB0cnVlKTogc3RyaW5nIHtcbiAgICBpZiAoIXNob3VsZFJlZ2lzdGVyQ29sb3JWYXJpYWJsZSkge1xuICAgICAgICByZXR1cm4gX21vZGlmeUJvcmRlckNvbG9yKHJnYiwgdGhlbWUpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kaWZ5QW5kUmVnaXN0ZXJDb2xvcignYm9yZGVyJywgcmdiLCB0aGVtZSwgX21vZGlmeUJvcmRlckNvbG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGlmeVNoYWRvd0NvbG9yKHJnYjogUkdCQSwgdGhlbWU6IFRoZW1lKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbW9kaWZ5QmFja2dyb3VuZENvbG9yKHJnYiwgdGhlbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kaWZ5R3JhZGllbnRDb2xvcihyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG1vZGlmeUJhY2tncm91bmRDb2xvcihyZ2IsIHRoZW1lKTtcbn1cbiIsImltcG9ydCB0eXBlIHtUaGVtZX0gZnJvbSAnLi4vZGVmaW5pdGlvbnMnO1xuaW1wb3J0IHttb2RpZnlCYWNrZ3JvdW5kQ29sb3IsIG1vZGlmeUZvcmVncm91bmRDb2xvciwgbW9kaWZ5Qm9yZGVyQ29sb3J9IGZyb20gJy4uL2luamVjdC9keW5hbWljLXRoZW1lL21vZGlmeS1jb2xvcnMnO1xuaW1wb3J0IHR5cGUge1JHQkF9IGZyb20gJy4uL3V0aWxzL2NvbG9yJztcbmltcG9ydCB7cGFyc2VDb2xvcldpdGhDYWNoZX0gZnJvbSAnLi4vdXRpbHMvY29sb3InO1xuXG4vLyBUT0RPOiByZW1vdmUgdHlwZSBhZnRlciBkZXBlbmRlbmN5IHVwZGF0ZVxuZGVjbGFyZSBjb25zdCBicm93c2VyOiB7XG4gICAgdGhlbWU6IHtcbiAgICAgICAgdXBkYXRlOiAoKHRoZW1lOiBhbnkpID0+IFByb21pc2U8dm9pZD4pO1xuICAgICAgICByZXNldDogKCgpID0+IFByb21pc2U8dm9pZD4pO1xuICAgIH07XG59O1xuXG5jb25zdCB0aGVtZUNvbG9yVHlwZXM6IHsgW2tleTogc3RyaW5nXTogJ2JnJyB8ICd0ZXh0JyB8ICdib3JkZXInIH0gPSB7XG4gICAgYWNjZW50Y29sb3I6ICdiZycsXG4gICAgYnV0dG9uX2JhY2tncm91bmRfYWN0aXZlOiAndGV4dCcsXG4gICAgYnV0dG9uX2JhY2tncm91bmRfaG92ZXI6ICd0ZXh0JyxcbiAgICBmcmFtZTogJ2JnJyxcbiAgICBpY29uczogJ3RleHQnLFxuICAgIGljb25zX2F0dGVudGlvbjogJ3RleHQnLFxuICAgIG50cF9iYWNrZ3JvdW5kOiAnYmcnLFxuICAgIG50cF90ZXh0OiAndGV4dCcsXG4gICAgcG9wdXA6ICdiZycsXG4gICAgcG9wdXBfYm9yZGVyOiAnYmcnLFxuICAgIHBvcHVwX2hpZ2hsaWdodDogJ2JnJyxcbiAgICBwb3B1cF9oaWdobGlnaHRfdGV4dDogJ3RleHQnLFxuICAgIHBvcHVwX3RleHQ6ICd0ZXh0JyxcbiAgICBzaWRlYmFyOiAnYmcnLFxuICAgIHNpZGViYXJfYm9yZGVyOiAnYm9yZGVyJyxcbiAgICBzaWRlYmFyX3RleHQ6ICd0ZXh0JyxcbiAgICB0YWJfYmFja2dyb3VuZF90ZXh0OiAndGV4dCcsXG4gICAgdGFiX2xpbmU6ICdiZycsXG4gICAgdGFiX2xvYWRpbmc6ICdiZycsXG4gICAgdGFiX3NlbGVjdGVkOiAnYmcnLFxuICAgIHRleHRjb2xvcjogJ3RleHQnLFxuICAgIHRvb2xiYXI6ICdiZycsXG4gICAgdG9vbGJhcl9ib3R0b21fc2VwYXJhdG9yOiAnYm9yZGVyJyxcbiAgICB0b29sYmFyX2ZpZWxkOiAnYmcnLFxuICAgIHRvb2xiYXJfZmllbGRfYm9yZGVyOiAnYm9yZGVyJyxcbiAgICB0b29sYmFyX2ZpZWxkX2JvcmRlcl9mb2N1czogJ2JvcmRlcicsXG4gICAgdG9vbGJhcl9maWVsZF9mb2N1czogJ2JnJyxcbiAgICB0b29sYmFyX2ZpZWxkX3NlcGFyYXRvcjogJ2JvcmRlcicsXG4gICAgdG9vbGJhcl9maWVsZF90ZXh0OiAndGV4dCcsXG4gICAgdG9vbGJhcl9maWVsZF90ZXh0X2ZvY3VzOiAndGV4dCcsXG4gICAgdG9vbGJhcl90ZXh0OiAndGV4dCcsXG4gICAgdG9vbGJhcl90b3Bfc2VwYXJhdG9yOiAnYm9yZGVyJyxcbiAgICB0b29sYmFyX3ZlcnRpY2FsX3NlcGFyYXRvcjogJ2JvcmRlcicsXG59O1xuXG5jb25zdCAkY29sb3JzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICAgIC8vICdhY2NlbnRjb2xvcicgaXMgdGhlIGRlcHJlY2F0ZWQgcHJlZGVjZXNzb3Igb2YgJ2ZyYW1lJy5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvQWRkLW9ucy9XZWJFeHRlbnNpb25zL21hbmlmZXN0Lmpzb24vdGhlbWUjY29sb3JzXG4gICAgYWNjZW50Y29sb3I6ICcjMTExMTExJyxcbiAgICBmcmFtZTogJyMxMTExMTEnLFxuICAgIG50cF9iYWNrZ3JvdW5kOiAnd2hpdGUnLFxuICAgIG50cF90ZXh0OiAnYmxhY2snLFxuICAgIHBvcHVwOiAnI2NjY2NjYycsXG4gICAgcG9wdXBfdGV4dDogJ2JsYWNrJyxcbiAgICBzaWRlYmFyOiAnI2NjY2NjYycsXG4gICAgc2lkZWJhcl9ib3JkZXI6ICcjMzMzJyxcbiAgICBzaWRlYmFyX3RleHQ6ICdibGFjaycsXG4gICAgdGFiX2JhY2tncm91bmRfdGV4dDogJ3doaXRlJyxcbiAgICB0YWJfbG9hZGluZzogJyMyM2FlZmYnLFxuICAgIC8vICd0ZXh0Y29sb3InIGlzIHRoZSBwcmVkZWNlc3NvciBvZiAndGFiX2JhY2tncm91bmRfdGV4dCcuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9tYW5pZmVzdC5qc29uL3RoZW1lI2NvbG9yc1xuICAgIHRleHRjb2xvcjogJ3doaXRlJyxcbiAgICB0b29sYmFyOiAnIzcwNzA3MCcsXG4gICAgdG9vbGJhcl9maWVsZDogJ2xpZ2h0Z3JheScsXG4gICAgdG9vbGJhcl9maWVsZF90ZXh0OiAnYmxhY2snLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFdpbmRvd1RoZW1lKHRoZW1lOiBUaGVtZSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbG9ycyA9IE9iamVjdC5lbnRyaWVzKCRjb2xvcnMpLnJlZHVjZSgob2JqOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgdHlwZTogJ2JnJyB8ICd0ZXh0JyB8ICdib3JkZXInID0gdGhlbWVDb2xvclR5cGVzW2tleV07XG4gICAgICAgIGNvbnN0IG1vZGlmeTogKChyZ2I6IFJHQkEsIHRoZW1lOiBUaGVtZSwgc2hvdWxkUmVnaXN0ZXI6IGJvb2xlYW4pID0+IHN0cmluZykgPSB7XG4gICAgICAgICAgICAnYmcnOiBtb2RpZnlCYWNrZ3JvdW5kQ29sb3IsXG4gICAgICAgICAgICAndGV4dCc6IG1vZGlmeUZvcmVncm91bmRDb2xvcixcbiAgICAgICAgICAgICdib3JkZXInOiBtb2RpZnlCb3JkZXJDb2xvcixcbiAgICAgICAgfVt0eXBlXTtcbiAgICAgICAgY29uc3QgcmdiID0gcGFyc2VDb2xvcldpdGhDYWNoZSh2YWx1ZSkhO1xuICAgICAgICBjb25zdCBtb2RpZmllZCA9IG1vZGlmeShyZ2IsIHRoZW1lLCBmYWxzZSk7XG4gICAgICAgIG9ialtrZXldID0gbW9kaWZpZWQ7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSwge30pO1xuICAgIGlmICh0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgJiYgYnJvd3Nlci50aGVtZSAmJiBicm93c2VyLnRoZW1lLnVwZGF0ZSkge1xuICAgICAgICBicm93c2VyLnRoZW1lLnVwZGF0ZSh7Y29sb3JzfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRXaW5kb3dUaGVtZSgpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnICYmIGJyb3dzZXIudGhlbWUgJiYgYnJvd3Nlci50aGVtZS5yZXNldCkge1xuICAgICAgICAvLyBCVUc6IHJlc2V0cyBicm93c2VyIHRoZW1lIHRvIGVudGlyZVxuICAgICAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDE1MjY3XG4gICAgICAgIGJyb3dzZXIudGhlbWUucmVzZXQoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7RXh0ZW5zaW9uRGF0YSwgVGhlbWUsIFNob3J0Y3V0cywgVXNlclNldHRpbmdzLCBUYWJJbmZvLCBUYWJEYXRhLCBDb21tYW5kLCBEZXZUb29sc0RhdGF9IGZyb20gJy4uL2RlZmluaXRpb25zJztcbmltcG9ydCBjcmVhdGVDU1NGaWx0ZXJTdHlsZXNoZWV0IGZyb20gJy4uL2dlbmVyYXRvcnMvY3NzLWZpbHRlcic7XG5pbXBvcnQge2dldERldGVjdG9ySGludHNGb3J9IGZyb20gJy4uL2dlbmVyYXRvcnMvZGV0ZWN0b3ItaGludHMnO1xuaW1wb3J0IHtnZXREeW5hbWljVGhlbWVGaXhlc0Zvcn0gZnJvbSAnLi4vZ2VuZXJhdG9ycy9keW5hbWljLXRoZW1lJztcbmltcG9ydCBjcmVhdGVTdGF0aWNTdHlsZXNoZWV0IGZyb20gJy4uL2dlbmVyYXRvcnMvc3RhdGljLXRoZW1lJztcbmltcG9ydCB7Y3JlYXRlU1ZHRmlsdGVyU3R5bGVzaGVldCwgZ2V0U1ZHRmlsdGVyTWF0cml4VmFsdWUsIGdldFNWR1JldmVyc2VGaWx0ZXJNYXRyaXhWYWx1ZX0gZnJvbSAnLi4vZ2VuZXJhdG9ycy9zdmctZmlsdGVyJztcbmltcG9ydCB7VGhlbWVFbmdpbmV9IGZyb20gJy4uL2dlbmVyYXRvcnMvdGhlbWUtZW5naW5lcyc7XG5pbXBvcnQge0F1dG9tYXRpb25Nb2RlfSBmcm9tICcuLi91dGlscy9hdXRvbWF0aW9uJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uL3V0aWxzL2RlYm91bmNlJztcbmltcG9ydCB7aXNTeXN0ZW1EYXJrTW9kZUVuYWJsZWQsIHJ1bkNvbG9yU2NoZW1lQ2hhbmdlRGV0ZWN0b3J9IGZyb20gJy4uL3V0aWxzL21lZGlhLXF1ZXJ5JztcbmltcG9ydCB7TWVzc2FnZVR5cGVCR3RvQ1N9IGZyb20gJy4uL3V0aWxzL21lc3NhZ2UnO1xuaW1wb3J0IHtpc0ZpcmVmb3h9IGZyb20gJy4uL3V0aWxzL3BsYXRmb3JtJztcbmltcG9ydCB7UHJvbWlzZUJhcnJpZXJ9IGZyb20gJy4uL3V0aWxzL3Byb21pc2UtYmFycmllcic7XG5pbXBvcnQge1N0YXRlTWFuYWdlcn0gZnJvbSAnLi4vdXRpbHMvc3RhdGUtbWFuYWdlcic7XG5pbXBvcnQge2dldEFjdGl2ZVRhYn0gZnJvbSAnLi4vdXRpbHMvdGFicyc7XG5pbXBvcnQge2lzSW5UaW1lSW50ZXJ2YWxMb2NhbCwgbmV4dFRpbWVJbnRlcnZhbCwgaXNOaWdodEF0TG9jYXRpb24sIG5leHRUaW1lQ2hhbmdlQXRMb2NhdGlvbiwgZ2V0RHVyYXRpb259IGZyb20gJy4uL3V0aWxzL3RpbWUnO1xuaW1wb3J0IHtpc1VSTEluTGlzdCwgZ2V0VVJMSG9zdE9yUHJvdG9jb2wsIGlzVVJMRW5hYmxlZCwgaXNQREZ9IGZyb20gJy4uL3V0aWxzL3VybCc7XG5cbmltcG9ydCBDb25maWdNYW5hZ2VyIGZyb20gJy4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IERldlRvb2xzIGZyb20gJy4vZGV2dG9vbHMnO1xuaW1wb3J0IEljb25NYW5hZ2VyIGZyb20gJy4vaWNvbi1tYW5hZ2VyJztcbmltcG9ydCB0eXBlIHtFeHRlbnNpb25BZGFwdGVyfSBmcm9tICcuL21lc3Nlbmdlcic7XG5pbXBvcnQgTWVzc2VuZ2VyIGZyb20gJy4vbWVzc2VuZ2VyJztcbmltcG9ydCBOZXdzbWFrZXIgZnJvbSAnLi9uZXdzbWFrZXInO1xuaW1wb3J0IFRhYk1hbmFnZXIgZnJvbSAnLi90YWItbWFuYWdlcic7XG5pbXBvcnQgVUlIaWdobGlnaHRzIGZyb20gJy4vdWktaGlnaGxpZ2h0cyc7XG5pbXBvcnQgVXNlclN0b3JhZ2UgZnJvbSAnLi91c2VyLXN0b3JhZ2UnO1xuaW1wb3J0IHtnZXRDb21tYW5kcywgY2FuSW5qZWN0U2NyaXB0LCB3cml0ZUxvY2FsU3RvcmFnZSwgcmVtb3ZlTG9jYWxTdG9yYWdlfSBmcm9tICcuL3V0aWxzL2V4dGVuc2lvbi1hcGknO1xuaW1wb3J0IHtsb2dJbmZvLCBsb2dXYXJufSBmcm9tICcuL3V0aWxzL2xvZyc7XG5pbXBvcnQge3NldFdpbmRvd1RoZW1lLCByZXNldFdpbmRvd1RoZW1lfSBmcm9tICcuL3dpbmRvdy10aGVtZSc7XG5cblxudHlwZSBBdXRvbWF0aW9uU3RhdGUgPSAndHVybi1vbicgfCAndHVybi1vZmYnIHwgJ3NjaGVtZS1kYXJrJyB8ICdzY2hlbWUtbGlnaHQnIHwgJyc7XG5cbmludGVyZmFjZSBFeHRlbnNpb25TdGF0ZSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICBhdXRvU3RhdGU6IEF1dG9tYXRpb25TdGF0ZTtcbiAgICB3YXNFbmFibGVkT25MYXN0Q2hlY2s6IGJvb2xlYW4gfCBudWxsO1xuICAgIHJlZ2lzdGVyZWRDb250ZXh0TWVudXM6IGJvb2xlYW4gfCBudWxsO1xufVxuXG5pbnRlcmZhY2UgU3lzdGVtQ29sb3JTdGF0ZSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICB3YXNMYXN0Q29sb3JTY2hlbWVEYXJrOiBib29sZWFuIHwgbnVsbDtcbn1cblxuZGVjbGFyZSBjb25zdCBfX0NIUk9NSVVNX01WMl9fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX0NIUk9NSVVNX01WM19fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1BMVVNfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19USFVOREVSQklSRF9fOiBib29sZWFuO1xuXG5leHBvcnQgY2xhc3MgRXh0ZW5zaW9uIHtcbiAgICBwcml2YXRlIHN0YXRpYyBhdXRvU3RhdGU6IEF1dG9tYXRpb25TdGF0ZSA9ICcnO1xuICAgIHByaXZhdGUgc3RhdGljIHdhc0VuYWJsZWRPbkxhc3RDaGVjazogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIHJlZ2lzdGVyZWRDb250ZXh0TWVudXM6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcbiAgICAvKipcbiAgICAgKiBUaGlzIHZhbHVlIGlzIHVzZWQgZm9yIHR3byBwdXJwb3NlczpcbiAgICAgKiAgLSB0byBieXBhc3MgRmlyZWZveCBidWdcbiAgICAgKiAgLSB0byBmaWx0ZXIgb3V0IGV4Y2Vzc2l2ZSBFeHRlbnNpb24ub25Db2xvclNjaGVtZUNoYW5nZSgpIGludm9jYXRpb25zXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgd2FzTGFzdENvbG9yU2NoZW1lRGFyazogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIHN0YXJ0QmFycmllcjogUHJvbWlzZUJhcnJpZXI8dm9pZCwgdm9pZD4gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN0YXRpYyBzdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjxFeHRlbnNpb25TdGF0ZT4gfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEFMQVJNX05BTUUgPSAnYXV0by10aW1lLWFsYXJtJztcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMT0NBTF9TVE9SQUdFX0tFWSA9ICdFeHRlbnNpb24tc3RhdGUnO1xuXG4gICAgLy8gU3RvcmUgc3lzdGVtIGNvbG9yIHRoZW1lXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU1lTVEVNX0NPTE9SX0xPQ0FMX1NUT1JBR0VfS0VZID0gJ3N5c3RlbS1jb2xvci1zdGF0ZSc7XG4gICAgcHJpdmF0ZSBzdGF0aWMgc3lzdGVtQ29sb3JTdGF0ZU1hbmFnZXI6IFN0YXRlTWFuYWdlcjxTeXN0ZW1Db2xvclN0YXRlPjtcblxuICAgIC8vIFJlY29yZCB3aGV0aGVyIEV4dGVuc2lvbi5pbml0KCkgYWxyZWFkeSByYW4gc2luY2UgdGhlIGxhc3QgR0Igc3RhcnRcbiAgICBwcml2YXRlIHN0YXRpYyBpbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgc3RhdGljIGlzRmlyc3RMb2FkID0gZmFsc2U7XG5cbiAgICAvLyBUaGlzIHN5bmMgaW5pdGlhbGl6ZXIgbmVlZHMgdG8gcnVuIG9uIGV2ZXJ5IEJHIHJlc3RhcnQgYmVmb3JlIGFueXRoaW5nIGVsc2UgY2FuIGhhcHBlblxuICAgIHByaXZhdGUgc3RhdGljIGluaXQoKSB7XG4gICAgICAgIGlmIChFeHRlbnNpb24uaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBFeHRlbnNpb24uaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgIERldlRvb2xzLmluaXQoRXh0ZW5zaW9uLm9uU2V0dGluZ3NDaGFuZ2VkKTtcbiAgICAgICAgTWVzc2VuZ2VyLmluaXQoRXh0ZW5zaW9uLmdldE1lc3NlbmdlckFkYXB0ZXIoKSk7XG4gICAgICAgIFRhYk1hbmFnZXIuaW5pdCh7XG4gICAgICAgICAgICBnZXRDb25uZWN0aW9uTWVzc2FnZTogRXh0ZW5zaW9uLmdldENvbm5lY3Rpb25NZXNzYWdlLFxuICAgICAgICAgICAgZ2V0VGFiTWVzc2FnZTogRXh0ZW5zaW9uLmdldFRhYk1lc3NhZ2UsXG4gICAgICAgICAgICBvbkNvbG9yU2NoZW1lQ2hhbmdlOiBFeHRlbnNpb24ub25Db2xvclNjaGVtZUNoYW5nZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgRXh0ZW5zaW9uLnN0YXJ0QmFycmllciA9IG5ldyBQcm9taXNlQmFycmllcigpO1xuICAgICAgICBFeHRlbnNpb24uc3RhdGVNYW5hZ2VyID0gbmV3IFN0YXRlTWFuYWdlcjxFeHRlbnNpb25TdGF0ZT4oRXh0ZW5zaW9uLkxPQ0FMX1NUT1JBR0VfS0VZLCBFeHRlbnNpb24sIHtcbiAgICAgICAgICAgIGF1dG9TdGF0ZTogJycsXG4gICAgICAgICAgICB3YXNFbmFibGVkT25MYXN0Q2hlY2s6IG51bGwsXG4gICAgICAgICAgICByZWdpc3RlcmVkQ29udGV4dE1lbnVzOiBudWxsLFxuICAgICAgICB9LCBsb2dXYXJuKTtcblxuICAgICAgICBjaHJvbWUuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoRXh0ZW5zaW9uLmFsYXJtTGlzdGVuZXIpO1xuXG4gICAgICAgIGlmIChjaHJvbWUuY29tbWFuZHMpIHtcbiAgICAgICAgICAgIC8vIEZpcmVmb3ggQW5kcm9pZCBkb2VzIG5vdCBzdXBwb3J0IGNocm9tZS5jb21tYW5kc1xuICAgICAgICAgICAgaWYgKGlzRmlyZWZveCkge1xuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggbWF5IG5vdCByZWdpc3RlciBvbkNvbW1hbmQgbGlzdGVuZXIgb24gZXh0ZW5zaW9uIHN0YXJ0dXAgc28gd2UgbmVlZCB0byB1c2Ugc2V0VGltZW91dFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2hyb21lLmNvbW1hbmRzLm9uQ29tbWFuZC5hZGRMaXN0ZW5lcihhc3luYyAoY29tbWFuZCkgPT4gRXh0ZW5zaW9uLm9uQ29tbWFuZChjb21tYW5kIGFzIENvbW1hbmQsIG51bGwsIG51bGwsIG51bGwpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNocm9tZS5jb21tYW5kcy5vbkNvbW1hbmQuYWRkTGlzdGVuZXIoYXN5bmMgKGNvbW1hbmQsIHRhYikgPT4gRXh0ZW5zaW9uLm9uQ29tbWFuZChjb21tYW5kIGFzIENvbW1hbmQsIHRhYiAmJiB0YWIuaWQhIHx8IG51bGwsIDAsIG51bGwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaHJvbWUucGVybWlzc2lvbnMub25SZW1vdmVkKSB7XG4gICAgICAgICAgICBjaHJvbWUucGVybWlzc2lvbnMub25SZW1vdmVkLmFkZExpc3RlbmVyKChwZXJtaXNzaW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEFzIGZhciBhcyB3ZSBrbm93LCB0aGlzIGNvZGUgaXMgbmV2ZXIgYWN0dWFsbHkgcnVuIGJlY2F1c2UgdGhlcmVcbiAgICAgICAgICAgICAgICAvLyBpcyBubyBicm93c2VyIFVJIGZvciByZW1vdmluZyAnY29udGV4dE1lbnVzJyBwZXJtaXNzaW9uLlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgY29kZSBleGlzdHMgZm9yIGZ1dHVyZS1wcm9vZmluZyBpbiBjYXNlIGJyb3dzZXJzIGV2ZXIgYWRkIHN1Y2ggVUkuXG4gICAgICAgICAgICAgICAgaWYgKCFwZXJtaXNzaW9ucz8ucGVybWlzc2lvbnM/LmluY2x1ZGVzKCdjb250ZXh0TWVudXMnKSkge1xuICAgICAgICAgICAgICAgICAgICBFeHRlbnNpb24ucmVnaXN0ZXJlZENvbnRleHRNZW51cyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgTVYzc3luY1N5c3RlbUNvbG9yU3RhdGVNYW5hZ2VyKGlzRGFyazogYm9vbGVhbiB8IG51bGwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCFfX0NIUk9NSVVNX01WM19fKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFFeHRlbnNpb24uc3lzdGVtQ29sb3JTdGF0ZU1hbmFnZXIpIHtcbiAgICAgICAgICAgIEV4dGVuc2lvbi5zeXN0ZW1Db2xvclN0YXRlTWFuYWdlciA9IG5ldyBTdGF0ZU1hbmFnZXI8U3lzdGVtQ29sb3JTdGF0ZT4oRXh0ZW5zaW9uLlNZU1RFTV9DT0xPUl9MT0NBTF9TVE9SQUdFX0tFWSwgRXh0ZW5zaW9uLCB7XG4gICAgICAgICAgICAgICAgd2FzTGFzdENvbG9yU2NoZW1lRGFyazogaXNEYXJrLFxuICAgICAgICAgICAgfSwgbG9nV2Fybik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGFyayA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0byByZXN0b3JlIGRhdGEgZnJvbSBzdG9yYWdlXG4gICAgICAgICAgICByZXR1cm4gRXh0ZW5zaW9uLnN5c3RlbUNvbG9yU3RhdGVNYW5hZ2VyLmxvYWRTdGF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKEV4dGVuc2lvbi53YXNMYXN0Q29sb3JTY2hlbWVEYXJrICE9PSBpc0RhcmspIHtcbiAgICAgICAgICAgIEV4dGVuc2lvbi53YXNMYXN0Q29sb3JTY2hlbWVEYXJrID0gaXNEYXJrO1xuICAgICAgICAgICAgcmV0dXJuIEV4dGVuc2lvbi5zeXN0ZW1Db2xvclN0YXRlTWFuYWdlci5zYXZlU3RhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFsYXJtTGlzdGVuZXIgPSAoYWxhcm06IGNocm9tZS5hbGFybXMuQWxhcm0pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGFsYXJtLm5hbWUgPT09IEV4dGVuc2lvbi5BTEFSTV9OQU1FKSB7XG4gICAgICAgICAgICBFeHRlbnNpb24ubG9hZERhdGEoKS50aGVuKCgpID0+IEV4dGVuc2lvbi5oYW5kbGVBdXRvbWF0aW9uQ2hlY2soKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaXNFeHRlbnNpb25Td2l0Y2hlZE9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgRXh0ZW5zaW9uLmF1dG9TdGF0ZSA9PT0gJ3R1cm4tb24nIHx8XG4gICAgICAgICAgICBFeHRlbnNpb24uYXV0b1N0YXRlID09PSAnc2NoZW1lLWRhcmsnIHx8XG4gICAgICAgICAgICBFeHRlbnNpb24uYXV0b1N0YXRlID09PSAnc2NoZW1lLWxpZ2h0JyB8fFxuICAgICAgICAgICAgKEV4dGVuc2lvbi5hdXRvU3RhdGUgPT09ICcnICYmIFVzZXJTdG9yYWdlLnNldHRpbmdzLmVuYWJsZWQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgdXBkYXRlQXV0b1N0YXRlKCkge1xuICAgICAgICBjb25zdCB7bW9kZSwgYmVoYXZpb3IsIGVuYWJsZWR9ID0gVXNlclN0b3JhZ2Uuc2V0dGluZ3MuYXV0b21hdGlvbjtcblxuICAgICAgICBsZXQgaXNBdXRvRGFyazogYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBuZXh0Q2hlY2s6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICAgICAgY2FzZSBBdXRvbWF0aW9uTW9kZS5USU1FOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qge3RpbWV9ID0gVXNlclN0b3JhZ2Uuc2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgaXNBdXRvRGFyayA9IGlzSW5UaW1lSW50ZXJ2YWxMb2NhbCh0aW1lLmFjdGl2YXRpb24sIHRpbWUuZGVhY3RpdmF0aW9uKTtcbiAgICAgICAgICAgICAgICBuZXh0Q2hlY2sgPSBuZXh0VGltZUludGVydmFsKHRpbWUuYWN0aXZhdGlvbiwgdGltZS5kZWFjdGl2YXRpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBBdXRvbWF0aW9uTW9kZS5TWVNURU06XG4gICAgICAgICAgICAgICAgaWYgKF9fQ0hST01JVU1fTVYzX18pIHtcbiAgICAgICAgICAgICAgICAgICAgaXNBdXRvRGFyayA9IEV4dGVuc2lvbi53YXNMYXN0Q29sb3JTY2hlbWVEYXJrO1xuICAgICAgICAgICAgICAgICAgICBpZiAoRXh0ZW5zaW9uLndhc0xhc3RDb2xvclNjaGVtZURhcmsgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1dhcm4oJ1N5c3RlbSBjb2xvciBzY2hlbWUgaXMgdW5rbm93bi4gRGVmYXVsdGluZyB0byBEYXJrLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNBdXRvRGFyayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzQXV0b0RhcmsgPSBFeHRlbnNpb24ud2FzTGFzdENvbG9yU2NoZW1lRGFyayA9PT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICA/IGlzU3lzdGVtRGFya01vZGVFbmFibGVkKClcbiAgICAgICAgICAgICAgICAgICAgOiBFeHRlbnNpb24ud2FzTGFzdENvbG9yU2NoZW1lRGFyaztcbiAgICAgICAgICAgICAgICBpZiAoaXNGaXJlZm94KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bkNvbG9yU2NoZW1lQ2hhbmdlRGV0ZWN0b3IoRXh0ZW5zaW9uLm9uQ29sb3JTY2hlbWVDaGFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQXV0b21hdGlvbk1vZGUuTE9DQVRJT046IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7bGF0aXR1ZGUsIGxvbmdpdHVkZX0gPSBVc2VyU3RvcmFnZS5zZXR0aW5ncy5sb2NhdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAobGF0aXR1ZGUgIT0gbnVsbCAmJiBsb25naXR1ZGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpc0F1dG9EYXJrID0gaXNOaWdodEF0TG9jYXRpb24obGF0aXR1ZGUsIGxvbmdpdHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDaGVjayA9IG5leHRUaW1lQ2hhbmdlQXRMb2NhdGlvbihsYXRpdHVkZSwgbG9uZ2l0dWRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEF1dG9tYXRpb25Nb2RlLk5PTkU6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3RhdGU6IEF1dG9tYXRpb25TdGF0ZSA9ICcnO1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgaWYgKGJlaGF2aW9yID09PSAnT25PZmYnKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBpc0F1dG9EYXJrID8gJ3R1cm4tb24nIDogJ3R1cm4tb2ZmJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmVoYXZpb3IgPT09ICdTY2hlbWUnKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBpc0F1dG9EYXJrID8gJ3NjaGVtZS1kYXJrJyA6ICdzY2hlbWUtbGlnaHQnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEV4dGVuc2lvbi5hdXRvU3RhdGUgPSBzdGF0ZTtcblxuICAgICAgICBpZiAobmV4dENoZWNrKSB7XG4gICAgICAgICAgICBpZiAobmV4dENoZWNrIDwgRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgICAgIGxvZ1dhcm4oYEFsYXJtIGlzIHNldCBpbiB0aGUgcGFzdDogJHtuZXh0Q2hlY2t9LiBUaGUgdGltZSBpczogJHtuZXcgRGF0ZSgpfS4gSVNPOiAkeyhuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpfWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuYWxhcm1zLmNyZWF0ZShFeHRlbnNpb24uQUxBUk1fTkFNRSwge3doZW46IG5leHRDaGVja30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgd2FrZUludGVydmFsOiBudW1iZXIgPSAtMTtcblxuICAgIHByaXZhdGUgc3RhdGljIHJ1bldha2VEZXRlY3RvcigpIHtcbiAgICAgICAgY29uc3QgV0FLRV9DSEVDS19JTlRFUlZBTCA9IGdldER1cmF0aW9uKHttaW51dGVzOiAxfSk7XG4gICAgICAgIGNvbnN0IFdBS0VfQ0hFQ0tfSU5URVJWQUxfRVJST1IgPSBnZXREdXJhdGlvbih7c2Vjb25kczogMTB9KTtcbiAgICAgICAgaWYgKHRoaXMud2FrZUludGVydmFsID49IDApIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy53YWtlSW50ZXJ2YWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxhc3RSdW4gPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLndha2VJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBpZiAobm93IC0gbGFzdFJ1biA+IFdBS0VfQ0hFQ0tfSU5URVJWQUwgKyBXQUtFX0NIRUNLX0lOVEVSVkFMX0VSUk9SKSB7XG4gICAgICAgICAgICAgICAgRXh0ZW5zaW9uLmhhbmRsZUF1dG9tYXRpb25DaGVjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFJ1biA9IG5vdztcbiAgICAgICAgfSwgV0FLRV9DSEVDS19JTlRFUlZBTCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBFeHRlbnNpb24uaW5pdCgpO1xuICAgICAgICBhd2FpdCBUYWJNYW5hZ2VyLmNsZWFuU3RhdGUoKTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgQ29uZmlnTWFuYWdlci5sb2FkKHtsb2NhbDogdHJ1ZX0pLFxuICAgICAgICAgICAgRXh0ZW5zaW9uLk1WM3N5bmNTeXN0ZW1Db2xvclN0YXRlTWFuYWdlcihudWxsKSxcbiAgICAgICAgICAgIFVzZXJTdG9yYWdlLmxvYWRTZXR0aW5ncygpLFxuICAgICAgICBdKTtcblxuICAgICAgICBpZiAoVXNlclN0b3JhZ2Uuc2V0dGluZ3MuZW5hYmxlQ29udGV4dE1lbnVzICYmICFFeHRlbnNpb24ucmVnaXN0ZXJlZENvbnRleHRNZW51cykge1xuICAgICAgICAgICAgY2hyb21lLnBlcm1pc3Npb25zLmNvbnRhaW5zKHtwZXJtaXNzaW9uczogWydjb250ZXh0TWVudXMnXX0sIChwZXJtaXR0ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGVybWl0dGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIEV4dGVuc2lvbi5yZWdpc3RlckNvbnRleHRNZW51cygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1dhcm4oJ1VzZXIgaGFzIGVuYWJsZWQgY29udGV4dCBtZW51cywgYnV0IGRpZCBub3QgcHJvdmlkZSBwZXJtaXNzaW9uLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChVc2VyU3RvcmFnZS5zZXR0aW5ncy5zeW5jU2l0ZXNGaXhlcykge1xuICAgICAgICAgICAgYXdhaXQgQ29uZmlnTWFuYWdlci5sb2FkKHtsb2NhbDogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgICAgICBFeHRlbnNpb24udXBkYXRlQXV0b1N0YXRlKCk7XG4gICAgICAgIEV4dGVuc2lvbi5ydW5XYWtlRGV0ZWN0b3IoKTtcbiAgICAgICAgRXh0ZW5zaW9uLm9uQXBwVG9nZ2xlKCk7XG4gICAgICAgIGxvZ0luZm8oJ2xvYWRlZCcsIFVzZXJTdG9yYWdlLnNldHRpbmdzKTtcblxuICAgICAgICBpZiAoX19USFVOREVSQklSRF9fKSB7XG4gICAgICAgICAgICBUYWJNYW5hZ2VyLnJlZ2lzdGVyTWFpbERpc3BsYXlTY3JpcHQoKTtcbiAgICAgICAgfSBlbHNlIGlmICghX19DSFJPTUlVTV9NVjNfXyB8fCBFeHRlbnNpb24uaXNGaXJzdExvYWQpIHtcbiAgICAgICAgICAgIFRhYk1hbmFnZXIudXBkYXRlQ29udGVudFNjcmlwdCh7cnVuT25Qcm90ZWN0ZWRQYWdlczogVXNlclN0b3JhZ2Uuc2V0dGluZ3MuZW5hYmxlRm9yUHJvdGVjdGVkUGFnZXN9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIFVzZXJTdG9yYWdlLnNldHRpbmdzLmZldGNoTmV3cyAmJiBOZXdzbWFrZXIuc3Vic2NyaWJlKCk7XG4gICAgICAgIEV4dGVuc2lvbi5zdGFydEJhcnJpZXIhLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRNZXNzZW5nZXJBZGFwdGVyKCk6IEV4dGVuc2lvbkFkYXB0ZXIge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29sbGVjdDogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBFeHRlbnNpb24uY29sbGVjdERhdGEoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb2xsZWN0RGV2VG9vbHNEYXRhOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IEV4dGVuc2lvbi5jb2xsZWN0RGV2VG9vbHNEYXRhKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhbmdlU2V0dGluZ3M6IEV4dGVuc2lvbi5jaGFuZ2VTZXR0aW5ncyxcbiAgICAgICAgICAgIHNldFRoZW1lOiBFeHRlbnNpb24uc2V0VGhlbWUsXG4gICAgICAgICAgICB0b2dnbGVBY3RpdmVUYWI6IEV4dGVuc2lvbi50b2dnbGVBY3RpdmVUYWIsXG4gICAgICAgICAgICBtYXJrTmV3c0FzUmVhZDogTmV3c21ha2VyLm1hcmtBc1JlYWQsXG4gICAgICAgICAgICBtYXJrTmV3c0FzRGlzcGxheWVkOiBOZXdzbWFrZXIubWFya0FzRGlzcGxheWVkLFxuICAgICAgICAgICAgbG9hZENvbmZpZzogQ29uZmlnTWFuYWdlci5sb2FkLFxuICAgICAgICAgICAgYXBwbHlEZXZEeW5hbWljVGhlbWVGaXhlczogRGV2VG9vbHMuYXBwbHlEeW5hbWljVGhlbWVGaXhlcyxcbiAgICAgICAgICAgIHJlc2V0RGV2RHluYW1pY1RoZW1lRml4ZXM6IERldlRvb2xzLnJlc2V0RHluYW1pY1RoZW1lRml4ZXMsXG4gICAgICAgICAgICBhcHBseURldkludmVyc2lvbkZpeGVzOiBEZXZUb29scy5hcHBseUludmVyc2lvbkZpeGVzLFxuICAgICAgICAgICAgcmVzZXREZXZJbnZlcnNpb25GaXhlczogRGV2VG9vbHMucmVzZXRJbnZlcnNpb25GaXhlcyxcbiAgICAgICAgICAgIGFwcGx5RGV2U3RhdGljVGhlbWVzOiBEZXZUb29scy5hcHBseVN0YXRpY1RoZW1lcyxcbiAgICAgICAgICAgIHJlc2V0RGV2U3RhdGljVGhlbWVzOiBEZXZUb29scy5yZXNldFN0YXRpY1RoZW1lcyxcbiAgICAgICAgICAgIHN0YXJ0QWN0aXZhdGlvbjogRXh0ZW5zaW9uLnN0YXJ0QWN0aXZhdGlvbixcbiAgICAgICAgICAgIHJlc2V0QWN0aXZhdGlvbjogRXh0ZW5zaW9uLnJlc2V0QWN0aXZhdGlvbixcbiAgICAgICAgICAgIGhpZGVIaWdobGlnaHRzOiBVSUhpZ2hsaWdodHMuaGlkZUhpZ2hsaWdodHMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgb25Db21tYW5kSW50ZXJuYWwgPSBhc3luYyAoY29tbWFuZDogQ29tbWFuZCwgdGFiSWQ6IG51bWJlciB8IG51bGwsIGZyYW1lSWQ6IG51bWJlciB8IG51bGwsIGZyYW1lVVJMOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICAgIGlmIChFeHRlbnNpb24uc3RhcnRCYXJyaWVyIS5pc1BlbmRpbmcoKSkge1xuICAgICAgICAgICAgYXdhaXQgRXh0ZW5zaW9uLnN0YXJ0QmFycmllciEuZW50cnkoKTtcbiAgICAgICAgfVxuICAgICAgICBFeHRlbnNpb24uc3RhdGVNYW5hZ2VyIS5sb2FkU3RhdGUoKTtcbiAgICAgICAgc3dpdGNoIChjb21tYW5kKSB7XG4gICAgICAgICAgICBjYXNlICd0b2dnbGUnOlxuICAgICAgICAgICAgICAgIGxvZ0luZm8oJ1RvZ2dsZSBjb21tYW5kIGVudGVyZWQnKTtcbiAgICAgICAgICAgICAgICBFeHRlbnNpb24uY2hhbmdlU2V0dGluZ3Moe1xuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiAhRXh0ZW5zaW9uLmlzRXh0ZW5zaW9uU3dpdGNoZWRPbigpLFxuICAgICAgICAgICAgICAgICAgICBhdXRvbWF0aW9uOiB7Li4uVXNlclN0b3JhZ2Uuc2V0dGluZ3MuYXV0b21hdGlvbiwgLi4ue2VuYWJsZWQ6IGZhbHNlfX0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhZGRTaXRlJzoge1xuICAgICAgICAgICAgICAgIGxvZ0luZm8oJ0FkZCBTaXRlIGNvbW1hbmQgZW50ZXJlZCcpO1xuICAgICAgICAgICAgICAgIGFzeW5jIGZ1bmN0aW9uIHNjcmlwdFBERih0YWJJZDogbnVtYmVyLCBmcmFtZUlkOiBudW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgY2FuIG5vdCBkZXRlY3QgUERGIGlmIHdlIGRvIG5vdCBrbm93IHdoZXJlIHdlIGFyZSBsb29raW5nIGZvciBpdFxuICAgICAgICAgICAgICAgICAgICBpZiAoIShOdW1iZXIuaXNJbnRlZ2VyKHRhYklkKSAmJiBOdW1iZXIuaXNJbnRlZ2VyKGZyYW1lSWQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVjdFBERigpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5ib2R5LmNoaWxkRWxlbWVudENvdW50ICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge25vZGVOYW1lLCB0eXBlfSA9IGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSBhcyBIVE1MRW1iZWRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVOYW1lID09PSAnRU1CRUQnICYmIHR5cGUgPT09ICdhcHBsaWNhdGlvbi9wZGYnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF9fQ0hST01JVU1fTVYzX18pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHt0YWJJZCwgZnJhbWVJZHM6IFtmcmFtZUlkXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzogZGV0ZWN0UERGLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpWzBdLnJlc3VsdCB8fCBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfX0NIUk9NSVVNX01WMl9fKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiSWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGAoJHtkZXRlY3RQREYudG9TdHJpbmcoKX0pKClgLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKHJlc3VsdHMpID0+IHJlc29sdmUocmVzdWx0cz8uWzBdKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwZGYgPSBhc3luYyAoKSA9PiBpc1BERihmcmFtZVVSTCB8fCBhd2FpdCBUYWJNYW5hZ2VyLmdldEFjdGl2ZVRhYlVSTCgpKTtcbiAgICAgICAgICAgICAgICBpZiAoKChfX0NIUk9NSVVNX01WMl9fIHx8IF9fQ0hST01JVU1fTVYzX18pICYmIGF3YWl0IHNjcmlwdFBERih0YWJJZCEsIGZyYW1lSWQhKSkgfHwgYXdhaXQgcGRmKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgRXh0ZW5zaW9uLmNoYW5nZVNldHRpbmdzKHtlbmFibGVGb3JQREY6ICFVc2VyU3RvcmFnZS5zZXR0aW5ncy5lbmFibGVGb3JQREZ9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBFeHRlbnNpb24udG9nZ2xlQWN0aXZlVGFiKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnc3dpdGNoRW5naW5lJzoge1xuICAgICAgICAgICAgICAgIGxvZ0luZm8oJ1N3aXRjaCBFbmdpbmUgY29tbWFuZCBlbnRlcmVkJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5naW5lcyA9IE9iamVjdC52YWx1ZXMoVGhlbWVFbmdpbmUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZW5naW5lcy5pbmRleE9mKFVzZXJTdG9yYWdlLnNldHRpbmdzLnRoZW1lLmVuZ2luZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IGVuZ2luZXNbKGluZGV4ICsgMSkgJSBlbmdpbmVzLmxlbmd0aF07XG4gICAgICAgICAgICAgICAgRXh0ZW5zaW9uLnNldFRoZW1lKHtlbmdpbmU6IG5leHR9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyA3NSBpcyBzbWFsbCBlbm91Z2ggdG8gbm90IG5vdGljZSBpdCwgYW5kIHN0aWxsIGNhdGNoZXMgd2hlbiBzb21lb25lXG4gICAgLy8gaXMgaG9sZGluZyBkb3duIGEgY2VydGFpbiBzaG9ydGN1dC5cbiAgICBwcml2YXRlIHN0YXRpYyBvbkNvbW1hbmQgPSBkZWJvdW5jZSg3NSwgRXh0ZW5zaW9uLm9uQ29tbWFuZEludGVybmFsKTtcblxuICAgIHByaXZhdGUgc3RhdGljIHJlZ2lzdGVyQ29udGV4dE1lbnVzKCkge1xuICAgICAgICBjaHJvbWUuY29udGV4dE1lbnVzLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihhc3luYyAoe21lbnVJdGVtSWQsIGZyYW1lSWQsIGZyYW1lVXJsLCBwYWdlVXJsfSwgdGFiKSA9PlxuICAgICAgICAgICAgRXh0ZW5zaW9uLm9uQ29tbWFuZChtZW51SXRlbUlkIGFzIENvbW1hbmQsIHRhYiAmJiB0YWIuaWQgfHwgbnVsbCwgZnJhbWVJZCB8fCBudWxsLCBmcmFtZVVybCB8fCBwYWdlVXJsIHx8IG51bGwpKTtcbiAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5yZW1vdmVBbGwoKCkgPT4ge1xuICAgICAgICAgICAgRXh0ZW5zaW9uLnJlZ2lzdGVyZWRDb250ZXh0TWVudXMgPSBmYWxzZTtcbiAgICAgICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICBpZDogJ0RhcmtSZWFkZXItdG9wJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RhcmsgUmVhZGVyJyxcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWxlZCB0byBjcmVhdGUgdGhlIGNvbnRleHQgbWVudVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG1zZ1RvZ2dsZSA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoJ3RvZ2dsZV9leHRlbnNpb24nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2dBZGRTaXRlID0gY2hyb21lLmkxOG4uZ2V0TWVzc2FnZSgndG9nZ2xlX2N1cnJlbnRfc2l0ZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZ1N3aXRjaEVuZ2luZSA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoJ3RoZW1lX2dlbmVyYXRpb25fbW9kZScpO1xuICAgICAgICAgICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICd0b2dnbGUnLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZDogJ0RhcmtSZWFkZXItdG9wJyxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG1zZ1RvZ2dsZSB8fCAnVG9nZ2xlIGV2ZXJ5d2hlcmUnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdhZGRTaXRlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50SWQ6ICdEYXJrUmVhZGVyLXRvcCcsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBtc2dBZGRTaXRlIHx8ICdUb2dnbGUgZm9yIGN1cnJlbnQgc2l0ZScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3N3aXRjaEVuZ2luZScsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudElkOiAnRGFya1JlYWRlci10b3AnLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbXNnU3dpdGNoRW5naW5lIHx8ICdTd2l0Y2ggZW5naW5lJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBFeHRlbnNpb24ucmVnaXN0ZXJlZENvbnRleHRNZW51cyA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0U2hvcnRjdXRzKCkge1xuICAgICAgICBjb25zdCBjb21tYW5kcyA9IGF3YWl0IGdldENvbW1hbmRzKCk7XG4gICAgICAgIHJldHVybiBjb21tYW5kcy5yZWR1Y2UoKG1hcCwgY21kKSA9PiBPYmplY3QuYXNzaWduKG1hcCwge1tjbWQubmFtZSFdOiBjbWQuc2hvcnRjdXR9KSwge30gYXMgU2hvcnRjdXRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgY29sbGVjdERhdGEoKTogUHJvbWlzZTxFeHRlbnNpb25EYXRhPiB7XG4gICAgICAgIGF3YWl0IEV4dGVuc2lvbi5sb2FkRGF0YSgpO1xuICAgICAgICBjb25zdCBbXG4gICAgICAgICAgICBuZXdzLFxuICAgICAgICAgICAgc2hvcnRjdXRzLFxuICAgICAgICAgICAgYWN0aXZlVGFiLFxuICAgICAgICAgICAgaXNBbGxvd2VkRmlsZVNjaGVtZUFjY2VzcyxcbiAgICAgICAgICAgIHVpSGlnaGxpZ2h0cyxcbiAgICAgICAgXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIE5ld3NtYWtlci5nZXRMYXRlc3QoKSxcbiAgICAgICAgICAgIEV4dGVuc2lvbi5nZXRTaG9ydGN1dHMoKSxcbiAgICAgICAgICAgIEV4dGVuc2lvbi5nZXRBY3RpdmVUYWJJbmZvKCksXG4gICAgICAgICAgICBuZXcgUHJvbWlzZTxib29sZWFuPigocikgPT4gY2hyb21lLmV4dGVuc2lvbi5pc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzKHIpKSxcbiAgICAgICAgICAgIFVJSGlnaGxpZ2h0cy5nZXRIaWdobGlnaHRzVG9TaG93KCksXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNFbmFibGVkOiBFeHRlbnNpb24uaXNFeHRlbnNpb25Td2l0Y2hlZE9uKCksXG4gICAgICAgICAgICBpc1JlYWR5OiB0cnVlLFxuICAgICAgICAgICAgaXNBbGxvd2VkRmlsZVNjaGVtZUFjY2VzcyxcbiAgICAgICAgICAgIHNldHRpbmdzOiBVc2VyU3RvcmFnZS5zZXR0aW5ncyxcbiAgICAgICAgICAgIG5ld3MsXG4gICAgICAgICAgICBzaG9ydGN1dHMsXG4gICAgICAgICAgICBjb2xvclNjaGVtZTogQ29uZmlnTWFuYWdlci5DT0xPUl9TQ0hFTUVTX1JBVyEsXG4gICAgICAgICAgICBmb3JjZWRTY2hlbWU6IEV4dGVuc2lvbi5hdXRvU3RhdGUgPT09ICdzY2hlbWUtZGFyaycgPyAnZGFyaycgOiBFeHRlbnNpb24uYXV0b1N0YXRlID09PSAnc2NoZW1lLWxpZ2h0JyA/ICdsaWdodCcgOiBudWxsLFxuICAgICAgICAgICAgYWN0aXZlVGFiLFxuICAgICAgICAgICAgdWlIaWdobGlnaHRzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBjb2xsZWN0RGV2VG9vbHNEYXRhKCk6IFByb21pc2U8RGV2VG9vbHNEYXRhPiB7XG4gICAgICAgIGNvbnN0IFtcbiAgICAgICAgICAgIGR5bmFtaWNGaXhlc1RleHQsXG4gICAgICAgICAgICBmaWx0ZXJGaXhlc1RleHQsXG4gICAgICAgICAgICBzdGF0aWNUaGVtZXNUZXh0LFxuICAgICAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgRGV2VG9vbHMuZ2V0RHluYW1pY1RoZW1lRml4ZXNUZXh0KCksXG4gICAgICAgICAgICBEZXZUb29scy5nZXRJbnZlcnNpb25GaXhlc1RleHQoKSxcbiAgICAgICAgICAgIERldlRvb2xzLmdldFN0YXRpY1RoZW1lc1RleHQoKSxcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkeW5hbWljRml4ZXNUZXh0LFxuICAgICAgICAgICAgZmlsdGVyRml4ZXNUZXh0LFxuICAgICAgICAgICAgc3RhdGljVGhlbWVzVGV4dCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBnZXRBY3RpdmVUYWJJbmZvKCk6IFByb21pc2U8VGFiSW5mbz4ge1xuICAgICAgICBhd2FpdCBFeHRlbnNpb24ubG9hZERhdGEoKTtcbiAgICAgICAgY29uc3QgdGFiID0gYXdhaXQgZ2V0QWN0aXZlVGFiKCk7XG4gICAgICAgIGNvbnN0IHVybCA9IGF3YWl0IFRhYk1hbmFnZXIuZ2V0VGFiVVJMKHRhYik7XG4gICAgICAgIGNvbnN0IHtpc0luRGFya0xpc3QsIGlzUHJvdGVjdGVkfSA9IEV4dGVuc2lvbi5nZXRUYWJJbmZvKHVybCk7XG4gICAgICAgIGNvbnN0IGlzSW5qZWN0ZWQgPSBUYWJNYW5hZ2VyLmNhbkFjY2Vzc1RhYih0YWIpO1xuICAgICAgICBjb25zdCBkb2N1bWVudElkID0gVGFiTWFuYWdlci5nZXRUYWJEb2N1bWVudElkKHRhYik7XG4gICAgICAgIGxldCBpc0RhcmtUaGVtZURldGVjdGVkID0gbnVsbDtcbiAgICAgICAgaWYgKFVzZXJTdG9yYWdlLnNldHRpbmdzLmRldGVjdERhcmtUaGVtZSkge1xuICAgICAgICAgICAgaXNEYXJrVGhlbWVEZXRlY3RlZCA9IFRhYk1hbmFnZXIuaXNUYWJEYXJrVGhlbWVEZXRlY3RlZCh0YWIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlkID0gdGFiICYmIHRhYi5pZCB8fCBudWxsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBkb2N1bWVudElkLFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgaXNJbkRhcmtMaXN0LFxuICAgICAgICAgICAgaXNQcm90ZWN0ZWQsXG4gICAgICAgICAgICBpc0luamVjdGVkLFxuICAgICAgICAgICAgaXNEYXJrVGhlbWVEZXRlY3RlZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBnZXRDb25uZWN0aW9uTWVzc2FnZSh0YWJVUkw6IHN0cmluZywgdXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIHRvcEZyYW1lSGFzRGFya1RoZW1lPzogYm9vbGVhbikge1xuICAgICAgICBhd2FpdCBFeHRlbnNpb24ubG9hZERhdGEoKTtcbiAgICAgICAgcmV0dXJuIEV4dGVuc2lvbi5nZXRUYWJNZXNzYWdlKHRhYlVSTCwgdXJsLCBpc1RvcEZyYW1lLCB0b3BGcmFtZUhhc0RhcmtUaGVtZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgbG9hZERhdGEoKSB7XG4gICAgICAgIEV4dGVuc2lvbi5pbml0KCk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIEV4dGVuc2lvbi5zdGF0ZU1hbmFnZXIhLmxvYWRTdGF0ZSgpLFxuICAgICAgICAgICAgVXNlclN0b3JhZ2UubG9hZFNldHRpbmdzKCksXG4gICAgICAgIF0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIG9uQ29sb3JTY2hlbWVDaGFuZ2UgPSBhc3luYyAoaXNEYXJrOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmIChFeHRlbnNpb24ud2FzTGFzdENvbG9yU2NoZW1lRGFyayA9PT0gaXNEYXJrKSB7XG4gICAgICAgICAgICAvLyBJZiBjb2xvciBzY2hlbWUgd2FzIGFscmVhZHkgY29ycmVjdCwgd2UgZG8gbm90IG5lZWQgdG8gZG8gYW55dGhpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBFeHRlbnNpb24ud2FzTGFzdENvbG9yU2NoZW1lRGFyayA9IGlzRGFyaztcbiAgICAgICAgRXh0ZW5zaW9uLk1WM3N5bmNTeXN0ZW1Db2xvclN0YXRlTWFuYWdlcihpc0RhcmspO1xuICAgICAgICBhd2FpdCBFeHRlbnNpb24ubG9hZERhdGEoKTtcbiAgICAgICAgaWYgKFVzZXJTdG9yYWdlLnNldHRpbmdzLmF1dG9tYXRpb24ubW9kZSAhPT0gQXV0b21hdGlvbk1vZGUuU1lTVEVNKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgRXh0ZW5zaW9uLmhhbmRsZUF1dG9tYXRpb25DaGVjaygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBoYW5kbGVBdXRvbWF0aW9uQ2hlY2sgPSAoKSA9PiB7XG4gICAgICAgIEV4dGVuc2lvbi51cGRhdGVBdXRvU3RhdGUoKTtcblxuICAgICAgICBjb25zdCBpc1N3aXRjaGVkT24gPSBFeHRlbnNpb24uaXNFeHRlbnNpb25Td2l0Y2hlZE9uKCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIEV4dGVuc2lvbi53YXNFbmFibGVkT25MYXN0Q2hlY2sgPT09IG51bGwgfHxcbiAgICAgICAgICAgIEV4dGVuc2lvbi53YXNFbmFibGVkT25MYXN0Q2hlY2sgIT09IGlzU3dpdGNoZWRPbiB8fFxuICAgICAgICAgICAgRXh0ZW5zaW9uLmF1dG9TdGF0ZSA9PT0gJ3NjaGVtZS1kYXJrJyB8fFxuICAgICAgICAgICAgRXh0ZW5zaW9uLmF1dG9TdGF0ZSA9PT0gJ3NjaGVtZS1saWdodCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBFeHRlbnNpb24ud2FzRW5hYmxlZE9uTGFzdENoZWNrID0gaXNTd2l0Y2hlZE9uO1xuICAgICAgICAgICAgRXh0ZW5zaW9uLm9uQXBwVG9nZ2xlKCk7XG4gICAgICAgICAgICBUYWJNYW5hZ2VyLnNlbmRNZXNzYWdlKCk7XG4gICAgICAgICAgICBFeHRlbnNpb24ucmVwb3J0Q2hhbmdlcygpO1xuICAgICAgICAgICAgRXh0ZW5zaW9uLnN0YXRlTWFuYWdlciEuc2F2ZVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc3RhdGljIGFzeW5jIGNoYW5nZVNldHRpbmdzKCRzZXR0aW5nczogUGFydGlhbDxVc2VyU2V0dGluZ3M+LCBvbmx5VXBkYXRlQWN0aXZlVGFiID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcHJldiA9IHsuLi5Vc2VyU3RvcmFnZS5zZXR0aW5nc307XG5cbiAgICAgICAgVXNlclN0b3JhZ2Uuc2V0KCRzZXR0aW5ncyk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHByZXYuZW5hYmxlZCAhPT0gVXNlclN0b3JhZ2Uuc2V0dGluZ3MuZW5hYmxlZCkgfHxcbiAgICAgICAgICAgIChwcmV2LmF1dG9tYXRpb24uZW5hYmxlZCAhPT0gVXNlclN0b3JhZ2Uuc2V0dGluZ3MuYXV0b21hdGlvbi5lbmFibGVkKSB8fFxuICAgICAgICAgICAgKHByZXYuYXV0b21hdGlvbi5tb2RlICE9PSBVc2VyU3RvcmFnZS5zZXR0aW5ncy5hdXRvbWF0aW9uLm1vZGUpIHx8XG4gICAgICAgICAgICAocHJldi5hdXRvbWF0aW9uLmJlaGF2aW9yICE9PSBVc2VyU3RvcmFnZS5zZXR0aW5ncy5hdXRvbWF0aW9uLmJlaGF2aW9yKSB8fFxuICAgICAgICAgICAgKHByZXYudGltZS5hY3RpdmF0aW9uICE9PSBVc2VyU3RvcmFnZS5zZXR0aW5ncy50aW1lLmFjdGl2YXRpb24pIHx8XG4gICAgICAgICAgICAocHJldi50aW1lLmRlYWN0aXZhdGlvbiAhPT0gVXNlclN0b3JhZ2Uuc2V0dGluZ3MudGltZS5kZWFjdGl2YXRpb24pIHx8XG4gICAgICAgICAgICAocHJldi5sb2NhdGlvbi5sYXRpdHVkZSAhPT0gVXNlclN0b3JhZ2Uuc2V0dGluZ3MubG9jYXRpb24ubGF0aXR1ZGUpIHx8XG4gICAgICAgICAgICAocHJldi5sb2NhdGlvbi5sb25naXR1ZGUgIT09IFVzZXJTdG9yYWdlLnNldHRpbmdzLmxvY2F0aW9uLmxvbmdpdHVkZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBFeHRlbnNpb24udXBkYXRlQXV0b1N0YXRlKCk7XG4gICAgICAgICAgICBFeHRlbnNpb24ub25BcHBUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldi5zeW5jU2V0dGluZ3MgIT09IFVzZXJTdG9yYWdlLnNldHRpbmdzLnN5bmNTZXR0aW5ncykge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IFVzZXJTdG9yYWdlLnNhdmVTeW5jU2V0dGluZyhVc2VyU3RvcmFnZS5zZXR0aW5ncy5zeW5jU2V0dGluZ3MpO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoRXh0ZW5zaW9uLmlzRXh0ZW5zaW9uU3dpdGNoZWRPbigpICYmICRzZXR0aW5ncy5jaGFuZ2VCcm93c2VyVGhlbWUgIT0gbnVsbCAmJiBwcmV2LmNoYW5nZUJyb3dzZXJUaGVtZSAhPT0gJHNldHRpbmdzLmNoYW5nZUJyb3dzZXJUaGVtZSkge1xuICAgICAgICAgICAgaWYgKCRzZXR0aW5ncy5jaGFuZ2VCcm93c2VyVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBzZXRXaW5kb3dUaGVtZShVc2VyU3RvcmFnZS5zZXR0aW5ncy50aGVtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc2V0V2luZG93VGhlbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldi5mZXRjaE5ld3MgIT09IFVzZXJTdG9yYWdlLnNldHRpbmdzLmZldGNoTmV3cykge1xuICAgICAgICAgICAgVXNlclN0b3JhZ2Uuc2V0dGluZ3MuZmV0Y2hOZXdzID8gTmV3c21ha2VyLnN1YnNjcmliZSgpIDogTmV3c21ha2VyLnVuU3Vic2NyaWJlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldi5lbmFibGVDb250ZXh0TWVudXMgIT09IFVzZXJTdG9yYWdlLnNldHRpbmdzLmVuYWJsZUNvbnRleHRNZW51cykge1xuICAgICAgICAgICAgaWYgKFVzZXJTdG9yYWdlLnNldHRpbmdzLmVuYWJsZUNvbnRleHRNZW51cykge1xuICAgICAgICAgICAgICAgIEV4dGVuc2lvbi5yZWdpc3RlckNvbnRleHRNZW51cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuY29udGV4dE1lbnVzLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBFeHRlbnNpb24ub25TZXR0aW5nc0NoYW5nZWQob25seVVwZGF0ZUFjdGl2ZVRhYik7XG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBzZXRUaGVtZSgkdGhlbWU6IFBhcnRpYWw8VGhlbWU+KSB7XG4gICAgICAgIFVzZXJTdG9yYWdlLnNldCh7dGhlbWU6IHsuLi5Vc2VyU3RvcmFnZS5zZXR0aW5ncy50aGVtZSwgLi4uJHRoZW1lfX0pO1xuXG4gICAgICAgIGlmIChFeHRlbnNpb24uaXNFeHRlbnNpb25Td2l0Y2hlZE9uKCkgJiYgVXNlclN0b3JhZ2Uuc2V0dGluZ3MuY2hhbmdlQnJvd3NlclRoZW1lKSB7XG4gICAgICAgICAgICBzZXRXaW5kb3dUaGVtZShVc2VyU3RvcmFnZS5zZXR0aW5ncy50aGVtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBFeHRlbnNpb24ub25TZXR0aW5nc0NoYW5nZWQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyByZXBvcnRDaGFuZ2VzKCkge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgRXh0ZW5zaW9uLmNvbGxlY3REYXRhKCk7XG4gICAgICAgIE1lc3Nlbmdlci5yZXBvcnRDaGFuZ2VzKGluZm8pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHRvZ2dsZUFjdGl2ZVRhYigpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBVc2VyU3RvcmFnZS5zZXR0aW5ncztcbiAgICAgICAgY29uc3QgdGFiID0gYXdhaXQgRXh0ZW5zaW9uLmdldEFjdGl2ZVRhYkluZm8oKTtcbiAgICAgICAgaWYgKCF0YWIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7dXJsfSA9IHRhYjtcbiAgICAgICAgY29uc3QgaXNJbkRhcmtMaXN0ID0gQ29uZmlnTWFuYWdlci5pc1VSTEluRGFya0xpc3QodXJsKTtcbiAgICAgICAgY29uc3QgaG9zdCA9IGdldFVSTEhvc3RPclByb3RvY29sKHVybCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0VG9nZ2xlZExpc3Qoc291cmNlTGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBzb3VyY2VMaXN0LnNsaWNlKCk7XG5cbiAgICAgICAgICAgIGxldCBpbmRleCA9IGxpc3QuaW5kZXhPZihob3N0KTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDAgJiYgaG9zdC5zdGFydHNXaXRoKCd3d3cuJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub1d3d0hvc3QgPSBob3N0LnN1YnN0cmluZyg0KTtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGxpc3QuaW5kZXhPZihub1d3d0hvc3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKGhvc3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhcmtUaGVtZURldGVjdGVkID0gc2V0dGluZ3MuZW5hYmxlZEJ5RGVmYXVsdCAmJiBzZXR0aW5ncy5kZXRlY3REYXJrVGhlbWUgJiYgdGFiLmlzRGFya1RoZW1lRGV0ZWN0ZWQ7XG4gICAgICAgIGlmICghc2V0dGluZ3MuZW5hYmxlZEJ5RGVmYXVsdCB8fCBpc0luRGFya0xpc3QgfHwgZGFya1RoZW1lRGV0ZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvZ2dsZWRMaXN0ID0gZ2V0VG9nZ2xlZExpc3Qoc2V0dGluZ3MuZW5hYmxlZEZvcik7XG4gICAgICAgICAgICBFeHRlbnNpb24uY2hhbmdlU2V0dGluZ3Moe2VuYWJsZWRGb3I6IHRvZ2dsZWRMaXN0fSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNldHRpbmdzLmVuYWJsZWRCeURlZmF1bHQgJiYgc2V0dGluZ3MuZW5hYmxlZEZvci5pbmNsdWRlcyhob3N0KSkge1xuICAgICAgICAgICAgY29uc3QgZW5hYmxlZEZvciA9IGdldFRvZ2dsZWRMaXN0KHNldHRpbmdzLmVuYWJsZWRGb3IpO1xuICAgICAgICAgICAgY29uc3QgZGlzYWJsZWRGb3IgPSBnZXRUb2dnbGVkTGlzdChzZXR0aW5ncy5kaXNhYmxlZEZvcik7XG4gICAgICAgICAgICBFeHRlbnNpb24uY2hhbmdlU2V0dGluZ3Moe2VuYWJsZWRGb3IsIGRpc2FibGVkRm9yfSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2dnbGVkTGlzdCA9IGdldFRvZ2dsZWRMaXN0KHNldHRpbmdzLmRpc2FibGVkRm9yKTtcbiAgICAgICAgRXh0ZW5zaW9uLmNoYW5nZVNldHRpbmdzKHtkaXNhYmxlZEZvcjogdG9nZ2xlZExpc3R9LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vXG4gICAgLy8gICAgICAgSGFuZGxlIGNvbmZpZyBjaGFuZ2VzXG4gICAgLy9cblxuICAgIHByaXZhdGUgc3RhdGljIG9uQXBwVG9nZ2xlKCkge1xuICAgICAgICBpZiAoRXh0ZW5zaW9uLmlzRXh0ZW5zaW9uU3dpdGNoZWRPbigpKSB7XG4gICAgICAgICAgICBJY29uTWFuYWdlci5zZXRJY29uKHtpc0FjdGl2ZTogdHJ1ZSwgY29sb3JTY2hlbWU6IFVzZXJTdG9yYWdlLnNldHRpbmdzLnRoZW1lLm1vZGUgPyAnZGFyaycgOiAnbGlnaHQnfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBJY29uTWFuYWdlci5zZXRJY29uKHtpc0FjdGl2ZTogZmFsc2UsIGNvbG9yU2NoZW1lOiBVc2VyU3RvcmFnZS5zZXR0aW5ncy50aGVtZS5tb2RlID8gJ2RhcmsnIDogJ2xpZ2h0J30pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFVzZXJTdG9yYWdlLnNldHRpbmdzLmNoYW5nZUJyb3dzZXJUaGVtZSkge1xuICAgICAgICAgICAgaWYgKEV4dGVuc2lvbi5pc0V4dGVuc2lvblN3aXRjaGVkT24oKSAmJiBFeHRlbnNpb24uYXV0b1N0YXRlICE9PSAnc2NoZW1lLWxpZ2h0Jykge1xuICAgICAgICAgICAgICAgIHNldFdpbmRvd1RoZW1lKFVzZXJTdG9yYWdlLnNldHRpbmdzLnRoZW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzZXRXaW5kb3dUaGVtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgb25TZXR0aW5nc0NoYW5nZWQob25seVVwZGF0ZUFjdGl2ZVRhYiA9IGZhbHNlKSB7XG4gICAgICAgIGF3YWl0IEV4dGVuc2lvbi5sb2FkRGF0YSgpO1xuICAgICAgICBFeHRlbnNpb24ud2FzRW5hYmxlZE9uTGFzdENoZWNrID0gRXh0ZW5zaW9uLmlzRXh0ZW5zaW9uU3dpdGNoZWRPbigpO1xuICAgICAgICBUYWJNYW5hZ2VyLnNlbmRNZXNzYWdlKG9ubHlVcGRhdGVBY3RpdmVUYWIpO1xuICAgICAgICBFeHRlbnNpb24uc2F2ZVVzZXJTZXR0aW5ncygpO1xuICAgICAgICBFeHRlbnNpb24ucmVwb3J0Q2hhbmdlcygpO1xuICAgICAgICBJY29uTWFuYWdlci5zZXRJY29uKHtjb2xvclNjaGVtZTogVXNlclN0b3JhZ2Uuc2V0dGluZ3MudGhlbWUubW9kZSA/ICdkYXJrJyA6ICdsaWdodCd9KTtcbiAgICAgICAgRXh0ZW5zaW9uLnN0YXRlTWFuYWdlciEuc2F2ZVN0YXRlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgc3RhcnRBY3RpdmF0aW9uKGVtYWlsOiBzdHJpbmcsIGtleTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGRlbGF5ID0gMjAwMCArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDIwMDApO1xuICAgICAgICBjb25zdCBjaGVja0VtYWlsID0gKGVtYWlsOiBzdHJpbmcpID0+IGVtYWlsICYmIGVtYWlsLnRyaW0oKS5pbmNsdWRlcygnQCcpO1xuICAgICAgICBjb25zdCBjaGVja0tleSA9IChrZXk6IHN0cmluZykgPT4ga2V5LnJlcGxhY2VBbGwoJy0nLCAnJykubGVuZ3RoID09PSAyNSAmJiBrZXkudG9Mb2NhbGVMb3dlckNhc2UoKS5zdGFydHNXaXRoKCdkcicpICYmIGtleS5yZXBsYWNlQWxsKCctJywgJycpLm1hdGNoKC9eWzAtOWEtel17MjV9JC9pKTtcbiAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB3cml0ZUxvY2FsU3RvcmFnZSh7YWN0aXZhdGlvbkVtYWlsOiBlbWFpbCwgYWN0aXZhdGlvbktleToga2V5fSk7XG4gICAgICAgICAgICBpZiAoY2hlY2tFbWFpbChlbWFpbCkgJiYgY2hlY2tLZXkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFVJSGlnaGxpZ2h0cy5oaWRlSGlnaGxpZ2h0cyhbJ2Fubml2ZXJzYXJ5J10pO1xuICAgICAgICAgICAgICAgIGlmIChfX1BMVVNfXykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFeHRlbnNpb24uY2hhbmdlU2V0dGluZ3Moe3ByZXZpZXdOZXdlc3REZXNpZ246IHRydWV9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBFeHRlbnNpb24ucmVwb3J0Q2hhbmdlcygpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgcmVzZXRBY3RpdmF0aW9uKCkge1xuICAgICAgICBhd2FpdCByZW1vdmVMb2NhbFN0b3JhZ2UoWydhY3RpdmF0aW9uRW1haWwnLCAnYWN0aXZhdGlvbktleSddKTtcbiAgICAgICAgYXdhaXQgVUlIaWdobGlnaHRzLnJlc3RvcmVIaWdobGlnaHRzKFsnYW5uaXZlcnNhcnknXSk7XG4gICAgICAgIGlmIChfX1BMVVNfXykge1xuICAgICAgICAgICAgYXdhaXQgRXh0ZW5zaW9uLmNoYW5nZVNldHRpbmdzKHtwcmV2aWV3TmV3ZXN0RGVzaWduOiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgICAgIEV4dGVuc2lvbi5yZXBvcnRDaGFuZ2VzKCk7XG4gICAgfVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy9cbiAgICAvLyBBZGQvcmVtb3ZlIGNzcyB0byB0YWJcbiAgICAvL1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGFiSW5mbyh0YWJVUkw6IHN0cmluZyk6IFBpY2s8VGFiSW5mbywgJ2lzSW5EYXJrTGlzdCcgfCAnaXNQcm90ZWN0ZWQnPiB7XG4gICAgICAgIGNvbnN0IGlzSW5EYXJrTGlzdCA9IENvbmZpZ01hbmFnZXIuaXNVUkxJbkRhcmtMaXN0KHRhYlVSTCk7XG4gICAgICAgIGNvbnN0IGlzUHJvdGVjdGVkID0gIWNhbkluamVjdFNjcmlwdCh0YWJVUkwpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNJbkRhcmtMaXN0LFxuICAgICAgICAgICAgaXNQcm90ZWN0ZWQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGFiTWVzc2FnZSA9ICh0YWJVUkw6IHN0cmluZywgdXJsOiBzdHJpbmcsIGlzVG9wRnJhbWU6IGJvb2xlYW4sIHRvcEZyYW1lSGFzRGFya1RoZW1lPzogYm9vbGVhbik6IFRhYkRhdGEgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IFVzZXJTdG9yYWdlLnNldHRpbmdzO1xuICAgICAgICBjb25zdCB0YWJJbmZvID0gRXh0ZW5zaW9uLmdldFRhYkluZm8odGFiVVJMKTtcbiAgICAgICAgaWYgKEV4dGVuc2lvbi5pc0V4dGVuc2lvblN3aXRjaGVkT24oKSAmJiBpc1VSTEVuYWJsZWQodGFiVVJMLCBzZXR0aW5ncywgdGFiSW5mbykgJiYgIXRvcEZyYW1lSGFzRGFya1RoZW1lKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b20gPSBzZXR0aW5ncy5jdXN0b21UaGVtZXMuZmluZCgoe3VybDogdXJsTGlzdH0pID0+IGlzVVJMSW5MaXN0KHRhYlVSTCwgdXJsTGlzdCkpO1xuICAgICAgICAgICAgY29uc3QgcHJlc2V0ID0gY3VzdG9tID8gbnVsbCA6IHNldHRpbmdzLnByZXNldHMuZmluZCgoe3VybHN9KSA9PiBpc1VSTEluTGlzdCh0YWJVUkwsIHVybHMpKTtcbiAgICAgICAgICAgIGxldCB0aGVtZSA9IGN1c3RvbSA/IGN1c3RvbS50aGVtZSA6IHByZXNldCA/IHByZXNldC50aGVtZSA6IHNldHRpbmdzLnRoZW1lO1xuICAgICAgICAgICAgaWYgKEV4dGVuc2lvbi5hdXRvU3RhdGUgPT09ICdzY2hlbWUtZGFyaycgfHwgRXh0ZW5zaW9uLmF1dG9TdGF0ZSA9PT0gJ3NjaGVtZS1saWdodCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlID0gRXh0ZW5zaW9uLmF1dG9TdGF0ZSA9PT0gJ3NjaGVtZS1kYXJrJyA/IDEgOiAwO1xuICAgICAgICAgICAgICAgIHRoZW1lID0gey4uLnRoZW1lLCBtb2RlfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRldGVjdG9ySGludHMgPSBzZXR0aW5ncy5kZXRlY3REYXJrVGhlbWUgPyBnZXREZXRlY3RvckhpbnRzRm9yKHVybCwgQ29uZmlnTWFuYWdlci5ERVRFQ1RPUl9ISU5UU19SQVchLCBDb25maWdNYW5hZ2VyLkRFVEVDVE9SX0hJTlRTX0lOREVYISkgOiBudWxsO1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0RGFya1RoZW1lID0gKFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmRldGVjdERhcmtUaGVtZSAmJlxuICAgICAgICAgICAgICAgIChpc1RvcEZyYW1lIHx8IGRldGVjdG9ySGludHM/LnNvbWUoKGgpID0+IGguaWZyYW1lKSkgJiZcbiAgICAgICAgICAgICAgICAhaXNVUkxJbkxpc3QodGFiVVJMLCBzZXR0aW5ncy5lbmFibGVkRm9yKSAmJlxuICAgICAgICAgICAgICAgICFpc1BERih0YWJVUkwpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsb2dJbmZvKGBDcmVhdGluZyBDU1MgZm9yIHVybDogJHt1cmx9YCk7XG4gICAgICAgICAgICBsb2dJbmZvKGBDdXN0b20gdGhlbWUgJHtjdXN0b20gPyAnd2FzIGZvdW5kJyA6ICd3YXMgbm90IGZvdW5kJ30sIFByZXNldCB0aGVtZSAke3ByZXNldCA/ICd3YXMgZm91bmQnIDogJ3dhcyBub3QgZm91bmQnfVxuICAgICAgICAgICAgVGhlIHRoZW1lKCR7Y3VzdG9tID8gJ2N1c3RvbScgOiBwcmVzZXQgPyAncHJlc2V0JyA6ICdnbG9iYWwnfSBzZXR0aW5ncykgdXNlZCBpczogJHtKU09OLnN0cmluZ2lmeSh0aGVtZSl9YCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoZW1lLmVuZ2luZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgVGhlbWVFbmdpbmUuY3NzRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZUJHdG9DUy5BRERfQ1NTX0ZJTFRFUixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3M6IGNyZWF0ZUNTU0ZpbHRlclN0eWxlc2hlZXQodGhlbWUsIHVybCwgaXNUb3BGcmFtZSwgQ29uZmlnTWFuYWdlci5JTlZFUlNJT05fRklYRVNfUkFXISwgQ29uZmlnTWFuYWdlci5JTlZFUlNJT05fRklYRVNfSU5ERVghKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3REYXJrVGhlbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0ZWN0b3JIaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgVGhlbWVFbmdpbmUuc3ZnRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0ZpcmVmb3gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTWVzc2FnZVR5cGVCR3RvQ1MuQUREX0NTU19GSUxURVIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3M6IGNyZWF0ZVNWR0ZpbHRlclN0eWxlc2hlZXQodGhlbWUsIHVybCwgaXNUb3BGcmFtZSwgQ29uZmlnTWFuYWdlci5JTlZFUlNJT05fRklYRVNfUkFXISwgQ29uZmlnTWFuYWdlci5JTlZFUlNJT05fRklYRVNfSU5ERVghKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0ZWN0RGFya1RoZW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RvckhpbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTWVzc2FnZVR5cGVCR3RvQ1MuQUREX1NWR19GSUxURVIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzOiBjcmVhdGVTVkdGaWx0ZXJTdHlsZXNoZWV0KHRoZW1lLCB1cmwsIGlzVG9wRnJhbWUsIENvbmZpZ01hbmFnZXIuSU5WRVJTSU9OX0ZJWEVTX1JBVyEsIENvbmZpZ01hbmFnZXIuSU5WRVJTSU9OX0ZJWEVTX0lOREVYISksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnTWF0cml4OiBnZXRTVkdGaWx0ZXJNYXRyaXhWYWx1ZSh0aGVtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnUmV2ZXJzZU1hdHJpeDogZ2V0U1ZHUmV2ZXJzZUZpbHRlck1hdHJpeFZhbHVlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0ZWN0RGFya1RoZW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGVjdG9ySGludHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIFRoZW1lRW5naW5lLnN0YXRpY1RoZW1lOiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBNZXNzYWdlVHlwZUJHdG9DUy5BRERfU1RBVElDX1RIRU1FLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzczogdGhlbWUuc3R5bGVzaGVldCAmJiB0aGVtZS5zdHlsZXNoZWV0LnRyaW0oKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lLnN0eWxlc2hlZXQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVTdGF0aWNTdHlsZXNoZWV0KHRoZW1lLCB1cmwsIGlzVG9wRnJhbWUsIENvbmZpZ01hbmFnZXIuU1RBVElDX1RIRU1FU19SQVchLCBDb25maWdNYW5hZ2VyLlNUQVRJQ19USEVNRVNfSU5ERVghKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3REYXJrVGhlbWU6IHNldHRpbmdzLmRldGVjdERhcmtUaGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RvckhpbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSBUaGVtZUVuZ2luZS5keW5hbWljVGhlbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZml4ZXMgPSBnZXREeW5hbWljVGhlbWVGaXhlc0Zvcih1cmwsIGlzVG9wRnJhbWUsIENvbmZpZ01hbmFnZXIuRFlOQU1JQ19USEVNRV9GSVhFU19SQVchLCBDb25maWdNYW5hZ2VyLkRZTkFNSUNfVEhFTUVfRklYRVNfSU5ERVghLCBVc2VyU3RvcmFnZS5zZXR0aW5ncy5lbmFibGVGb3JQREYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTWVzc2FnZVR5cGVCR3RvQ1MuQUREX0RZTkFNSUNfVEhFTUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZml4ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNJRnJhbWU6ICFpc1RvcEZyYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGVjdERhcmtUaGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RvckhpbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGVuZ2luZSAke3RoZW1lLmVuZ2luZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ0luZm8oYFNpdGUgaXMgbm90IGludmVydGVkOiAke3RhYlVSTH1gKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6IE1lc3NhZ2VUeXBlQkd0b0NTLkNMRUFOX1VQLFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgICAgICAgICBVc2VyIHNldHRpbmdzXG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBzYXZlVXNlclNldHRpbmdzKCkge1xuICAgICAgICBhd2FpdCBVc2VyU3RvcmFnZS5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgbG9nSW5mbygnc2F2ZWQnLCBVc2VyU3RvcmFnZS5zZXR0aW5ncyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtjYW5JbmplY3RTY3JpcHQsIGtlZXBMaXN0ZW5pbmdUb0V2ZW50c30gZnJvbSAnLi4vYmFja2dyb3VuZC91dGlscy9leHRlbnNpb24tYXBpJztcbmltcG9ydCB0eXBlIHtDb2xvclNjaGVtZSwgRGVidWdNZXNzYWdlQkd0b0NTLCBEZWJ1Z01lc3NhZ2VCR3RvVUksIERlYnVnTWVzc2FnZUNTdG9CRywgRXh0ZW5zaW9uRGF0YSwgTmV3cywgVXNlclNldHRpbmdzfSBmcm9tICcuLi9kZWZpbml0aW9ucyc7XG5pbXBvcnQge2dldEhlbHBVUkwsIFVOSU5TVEFMTF9VUkx9IGZyb20gJy4uL3V0aWxzL2xpbmtzJztcbmltcG9ydCB7ZW11bGF0ZUNvbG9yU2NoZW1lLCBpc1N5c3RlbURhcmtNb2RlRW5hYmxlZH0gZnJvbSAnLi4vdXRpbHMvbWVkaWEtcXVlcnknO1xuaW1wb3J0IHtEZWJ1Z01lc3NhZ2VUeXBlQkd0b0NTLCBEZWJ1Z01lc3NhZ2VUeXBlQkd0b1VJLCBEZWJ1Z01lc3NhZ2VUeXBlQ1N0b0JHfSBmcm9tICcuLi91dGlscy9tZXNzYWdlJztcbmltcG9ydCB7aXNGaXJlZm94fSBmcm9tICcuLi91dGlscy9wbGF0Zm9ybSc7XG5cbmltcG9ydCB7RXh0ZW5zaW9ufSBmcm9tICcuL2V4dGVuc2lvbic7XG5pbXBvcnQge21ha2VDaHJvbWl1bUhhcHB5fSBmcm9tICcuL21ha2UtY2hyb21pdW0taGFwcHknO1xuaW1wb3J0IHtzZXROZXdzRm9yVGVzdGluZ30gZnJvbSAnLi9uZXdzbWFrZXInO1xuaW1wb3J0IHtBU1NFUlR9IGZyb20gJy4vdXRpbHMvbG9nJztcbmltcG9ydCB7c2VuZExvZ30gZnJvbSAnLi91dGlscy9zZW5kTG9nJztcblxuXG50eXBlIFRlc3RNZXNzYWdlID0ge1xuICAgIHR5cGU6ICdnZXRNYW5pZmVzdCc7XG4gICAgaWQ6IG51bWJlcjtcbn0gfCB7XG4gICAgdHlwZTogJ2NoYW5nZVNldHRpbmdzJztcbiAgICBkYXRhOiBQYXJ0aWFsPFVzZXJTZXR0aW5ncz47XG4gICAgaWQ6IG51bWJlcjtcbn0gfCB7XG4gICAgdHlwZTogJ2NvbGxlY3REYXRhJztcbiAgICBpZDogbnVtYmVyO1xufSB8IHtcbiAgICB0eXBlOiAnZ2V0Q2hyb21lU3RvcmFnZSc7XG4gICAgZGF0YToge1xuICAgICAgICByZWdpb246ICdsb2NhbCcgfCAnc3luYyc7XG4gICAgICAgIGtleXM6IHN0cmluZyB8IHN0cmluZ1tdO1xuICAgIH07XG4gICAgaWQ6IG51bWJlcjtcbn0gfCB7XG4gICAgdHlwZTogJ2NoYW5nZUNocm9tZVN0b3JhZ2UnO1xuICAgIGRhdGE6IHtcbiAgICAgICAgcmVnaW9uOiAnbG9jYWwnIHwgJ3N5bmMnO1xuICAgICAgICBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICB9O1xuICAgIGlkOiBudW1iZXI7XG59IHwge1xuICAgIHR5cGU6ICdmaXJlZm94LWNyZWF0ZVRhYic7XG4gICAgZGF0YTogc3RyaW5nO1xuICAgIGlkOiBudW1iZXI7XG59IHwge1xuICAgIHR5cGU6ICdmaXJlZm94LWdldENvbG9yU2NoZW1lJztcbiAgICBpZDogbnVtYmVyO1xufSB8IHtcbiAgICB0eXBlOiAnZmlyZWZveC1lbXVsYXRlQ29sb3JTY2hlbWUnO1xuICAgIGRhdGE6IENvbG9yU2NoZW1lO1xuICAgIGlkOiBudW1iZXI7XG59IHwge1xuICAgIHR5cGU6ICdzZXROZXdzJztcbiAgICBkYXRhOiBOZXdzW107XG4gICAgaWQ6IG51bWJlcjtcbn07XG5cbi8vIFN0YXJ0IGV4dGVuc2lvblxuY29uc3QgZXh0ZW5zaW9uID0gRXh0ZW5zaW9uLnN0YXJ0KCk7XG5cbmNvbnN0IHdlbGNvbWUgPSBgICAvJycnJ1xcXFxcbiAoMCk9PSgwKVxuL19ffHx8fF9fXFxcXFxuV2VsY29tZSB0byBEYXJrIFJlYWRlciFgO1xuY29uc29sZS5sb2cod2VsY29tZSk7XG5cbmRlY2xhcmUgY29uc3QgX19ERUJVR19fOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBfX1dBVENIX186IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IF9fTE9HX186IHN0cmluZyB8IGZhbHNlO1xuZGVjbGFyZSBjb25zdCBfX1BPUlRfXzogbnVtYmVyO1xuZGVjbGFyZSBjb25zdCBfX1RFU1RfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19DSFJPTUlVTV9NVjNfXzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgX19GSVJFRk9YX01WMl9fOiBib29sZWFuO1xuXG5pZiAoX19DSFJPTUlVTV9NVjNfXykge1xuICAgIGNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKGFzeW5jICgpID0+IHtcbiAgICAgICAgRXh0ZW5zaW9uLmlzRmlyc3RMb2FkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBrZWVwTGlzdGVuaW5nVG9FdmVudHMoKTtcbn1cblxuaWYgKF9fV0FUQ0hfXykge1xuICAgIGNvbnN0IFBPUlQgPSBfX1BPUlRfXztcbiAgICBjb25zdCBBTEFSTV9OQU1FID0gJ3NvY2tldC1jbG9zZSc7XG4gICAgY29uc3QgUElOR19JTlRFUlZBTF9JTl9NSU5VVEVTID0gMSAvIDYwO1xuXG4gICAgY29uc3Qgc29ja2V0QWxhcm1MaXN0ZW5lciA9IChhbGFybTogY2hyb21lLmFsYXJtcy5BbGFybSkgPT4ge1xuICAgICAgICBpZiAoYWxhcm0ubmFtZSA9PT0gQUxBUk1fTkFNRSkge1xuICAgICAgICAgICAgbGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgbGlzdGVuID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGB3czovL2xvY2FsaG9zdDoke1BPUlR9YCk7XG4gICAgICAgIGNvbnN0IHNlbmQgPSAobWVzc2FnZToge3R5cGU6IHN0cmluZ30pID0+IHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgc29ja2V0Lm9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuYWxhcm1zLm9uQWxhcm0ucmVtb3ZlTGlzdGVuZXIoc29ja2V0QWxhcm1MaXN0ZW5lcik7XG5cbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlLnN0YXJ0c1dpdGgoJ3JlbG9hZDonKSkge1xuICAgICAgICAgICAgICAgIHNlbmQoe3R5cGU6ICdyZWxvYWRpbmcnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbG9hZDpjc3MnOlxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZTxEZWJ1Z01lc3NhZ2VCR3RvVUk+KHt0eXBlOiBEZWJ1Z01lc3NhZ2VUeXBlQkd0b1VJLkNTU19VUERBVEV9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVsb2FkOnVpJzpcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2U8RGVidWdNZXNzYWdlQkd0b1VJPih7dHlwZTogRGVidWdNZXNzYWdlVHlwZUJHdG9VSS5VUERBVEV9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVsb2FkOmZ1bGwnOlxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgKHRhYnMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2U6IERlYnVnTWVzc2FnZUJHdG9DUyA9IHt0eXBlOiBEZWJ1Z01lc3NhZ2VUeXBlQkd0b0NTLlJFTE9BRH07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTb21lIGNvbnRleHRzIGFyZSBub3QgY29uc2lkZXJlZCB0byBiZSB0YWJzIGFuZCBjYW4gbm90IHJlY2VpdmUgcmVndWxhciBtZXNzYWdlc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2U8RGVidWdNZXNzYWdlQkd0b0NTPihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFiIG9mIHRhYnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FuSW5qZWN0U2NyaXB0KHRhYi51cmwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfX0NIUk9NSVVNX01WM19fKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZTxEZWJ1Z01lc3NhZ2VCR3RvQ1M+KHRhYi5pZCEsIG1lc3NhZ2UpLmNhdGNoKCgpID0+IHsgLyogbm9vcCAqLyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlPERlYnVnTWVzc2FnZUJHdG9DUz4odGFiLmlkISwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoc29ja2V0QWxhcm1MaXN0ZW5lcik7XG4gICAgICAgICAgICBjaHJvbWUuYWxhcm1zLmNyZWF0ZShBTEFSTV9OQU1FLCB7ZGVsYXlJbk1pbnV0ZXM6IFBJTkdfSU5URVJWQUxfSU5fTUlOVVRFU30pO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsaXN0ZW4oKTtcbn0gZWxzZSBpZiAoIV9fREVCVUdfXyAmJiAhX19URVNUX18pIHtcbiAgICBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoe3JlYXNvbn0pID0+IHtcbiAgICAgICAgaWYgKHJlYXNvbiA9PT0gJ2luc3RhbGwnKSB7XG4gICAgICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe3VybDogZ2V0SGVscFVSTCgpfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNocm9tZS5ydW50aW1lLnNldFVuaW5zdGFsbFVSTChVTklOU1RBTExfVVJMKTtcbn1cblxuaWYgKF9fVEVTVF9fKSB7XG4gICAgLy8gT3BlbiBwb3B1cCBhbmQgRGV2VG9vbHMgcGFnZXNcbiAgICBjaHJvbWUudGFicy5jcmVhdGUoe3VybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCcvdWkvcG9wdXAvaW5kZXguaHRtbCcpLCBhY3RpdmU6IGZhbHNlfSk7XG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHt1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgnL3VpL2RldnRvb2xzL2luZGV4Lmh0bWwnKSwgYWN0aXZlOiBmYWxzZX0pO1xuXG4gICAgbGV0IHRlc3RUYWJJZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKF9fRklSRUZPWF9NVjJfXykge1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe3VybDogJ2Fib3V0OmJsYW5rJywgYWN0aXZlOiB0cnVlfSwgKHtpZH0pID0+IHRlc3RUYWJJZCA9IGlkISk7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3M6Ly9sb2NhbGhvc3Q6ODg5NGApO1xuICAgIHNvY2tldC5vbm9wZW4gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFdhaXQgZm9yIGV4dGVuc2lvbiB0byBzdGFydFxuICAgICAgICBhd2FpdCBleHRlbnNpb247XG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFja2dyb3VuZCcsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uT3JpZ2luOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJycpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkOiBudWxsLFxuICAgICAgICB9KSk7XG4gICAgfTtcbiAgICBzb2NrZXQub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2U6IFRlc3RNZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgICAgICAgY29uc3Qge2lkLCB0eXBlfSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBjb25zdCByZXNwb25kID0gKGRhdGE/OiBFeHRlbnNpb25EYXRhIHwgc3RyaW5nIHwgYm9vbGVhbiB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHwgbnVsbCkgPT4gc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoYW5nZVNldHRpbmdzJzpcbiAgICAgICAgICAgICAgICAgICAgRXh0ZW5zaW9uLmNoYW5nZVNldHRpbmdzKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29sbGVjdERhdGEnOlxuICAgICAgICAgICAgICAgICAgICBFeHRlbnNpb24uY29sbGVjdERhdGEoKS50aGVuKHJlc3BvbmQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdnZXRNYW5pZmVzdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbmQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdjaGFuZ2VDaHJvbWVTdG9yYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdpb24gPSBtZXNzYWdlLmRhdGEucmVnaW9uO1xuICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZVtyZWdpb25dLnNldChtZXNzYWdlLmRhdGEuZGF0YSwgKCkgPT4gcmVzcG9uZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2dldENocm9tZVN0b3JhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBtZXNzYWdlLmRhdGEua2V5cztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVnaW9uID0gbWVzc2FnZS5kYXRhLnJlZ2lvbjtcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2VbcmVnaW9uXS5nZXQoa2V5cyBhcyBhbnksIHJlc3BvbmQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnc2V0TmV3cyc6XG4gICAgICAgICAgICAgICAgICAgIHNldE5ld3NGb3JUZXN0aW5nKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyhhbnRvbik6IHJlbW92ZSB0aGlzIG9uY2UgRmlyZWZveCBzdXBwb3J0cyB0YWIuZXZhbCgpIHZpYSBXZWJEcml2ZXIgQmlEaVxuICAgICAgICAgICAgICAgIGNhc2UgJ2ZpcmVmb3gtY3JlYXRlVGFiJzpcbiAgICAgICAgICAgICAgICAgICAgQVNTRVJUKCdGaXJlZm94LXNwZWNpZmljIGZ1bmN0aW9uJywgaXNGaXJlZm94KTtcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMudXBkYXRlKHRlc3RUYWJJZCEsIHt1cmw6IG1lc3NhZ2UuZGF0YSwgYWN0aXZlOiB0cnVlfSwgKCkgPT4gcmVzcG9uZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZmlyZWZveC1nZXRDb2xvclNjaGVtZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgQVNTRVJUKCdGaXJlZm94LXNwZWNpZmljIGZ1bmN0aW9uJywgaXNGaXJlZm94KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uZChpc1N5c3RlbURhcmtNb2RlRW5hYmxlZCgpID8gJ2RhcmsnIDogJ2xpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmaXJlZm94LWVtdWxhdGVDb2xvclNjaGVtZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgQVNTRVJUKCdGaXJlZm94LXNwZWNpZmljIGZ1bmN0aW9uJywgaXNGaXJlZm94KTtcbiAgICAgICAgICAgICAgICAgICAgZW11bGF0ZUNvbG9yU2NoZW1lKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHtlcnJvcjogU3RyaW5nKGVyciksIG9yaWdpbmFsOiBlLmRhdGF9KSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY2hyb21lLmRvd25sb2Fkcy5vbkNyZWF0ZWQuYWRkTGlzdGVuZXIoKHtpZCwgbWltZSwgdXJsLCBkYW5nZXIsIHBhdXNlZH0pID0+IHtcbiAgICAgICAgLy8gQ2FuY2VsIGRvd25sb2FkXG4gICAgICAgIGNocm9tZS5kb3dubG9hZHMuY2FuY2VsKGlkKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qge3Byb3RvY29sLCBvcmlnaW59ID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICAgICAgY29uc3QgcmVhbE9yaWdpbiA9IChuZXcgVVJMKGNocm9tZS5ydW50aW1lLmdldFVSTCgnJykpKS5vcmlnaW47XG4gICAgICAgICAgICBjb25zdCBvayA9IHBhdXNlZCA9PT0gZmFsc2UgJiYgZGFuZ2VyID09PSAnc2FmZScgJiYgcHJvdG9jb2wgPT09ICdibG9iOicgJiYgb3JpZ2luID09PSByZWFsT3JpZ2luO1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Rvd25sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgb2ssXG4gICAgICAgICAgICAgICAgICAgIG1pbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gRG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmlmIChfX0RFQlVHX18gJiYgX19MT0dfXykge1xuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZTogRGVidWdNZXNzYWdlQ1N0b0JHKSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IERlYnVnTWVzc2FnZVR5cGVDU3RvQkcuTE9HKSB7XG4gICAgICAgICAgICBzZW5kTG9nKG1lc3NhZ2UuZGF0YS5sZXZlbCwgbWVzc2FnZS5kYXRhLmxvZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxubWFrZUNocm9taXVtSGFwcHkoKTtcblxuZnVuY3Rpb24gd3JpdGVJbnN0YWxsYXRpb25WZXJzaW9uKFxuICAgIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlLlN5bmNTdG9yYWdlQXJlYSB8IGNocm9tZS5zdG9yYWdlLkxvY2FsU3RvcmFnZUFyZWEsXG4gICAgZGV0YWlsczogY2hyb21lLnJ1bnRpbWUuSW5zdGFsbGVkRGV0YWlscyxcbikge1xuICAgIHN0b3JhZ2UuZ2V0KHtpbnN0YWxsYXRpb246IHt2ZXJzaW9uOiAnJ319LCAoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZGF0YT8uaW5zdGFsbGF0aW9uPy52ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RvcmFnZS5zZXQoe2luc3RhbGxhdGlvbjoge1xuICAgICAgICAgICAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIHJlYXNvbjogZGV0YWlscy5yZWFzb24sXG4gICAgICAgICAgICB2ZXJzaW9uOiBkZXRhaWxzLnByZXZpb3VzVmVyc2lvbiA/PyBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24sXG4gICAgICAgIH19KTtcbiAgICB9KTtcbn1cblxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKGRldGFpbHMpID0+IHtcbiAgICB3cml0ZUluc3RhbGxhdGlvblZlcnNpb24oY2hyb21lLnN0b3JhZ2UubG9jYWwsIGRldGFpbHMpO1xuICAgIHdyaXRlSW5zdGFsbGF0aW9uVmVyc2lvbihjaHJvbWUuc3RvcmFnZS5zeW5jLCBkZXRhaWxzKTtcbn0pO1xuIl0sIm5hbWVzIjpbImNyZWF0ZUNTU0ZpbHRlclN0eWxlc2hlZXQiXSwibWFwcGluZ3MiOiI7OztJQXVCQSxNQUFNLGtCQUFrQixHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVc7SUFDM0QsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDNUcsSUFBQSxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQSxFQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUEsQ0FBQSxFQUFJLEtBQUssQ0FBQyxPQUFPLENBQUEsQ0FBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVztVQUN4SSxnQkFBZ0I7SUFFdEIsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLE9BQU8sU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUTtJQUNsSCxJQUFBLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLFNBQVMs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QUFDLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUNqSixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUEsRUFBRyxDQUFDLENBQUEsU0FBQSxFQUFZLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUMvSixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDNUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDbEYsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUEsRUFBRyxDQUFDLENBQUEsTUFBQSxDQUFRLENBQUM7UUFDMUksYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFBLEVBQUcsQ0FBQyxDQUFBLFNBQUEsRUFBWSxDQUFDLENBQUEsTUFBQSxDQUFRLENBQUM7SUFDeEosSUFBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsY0FBQSxFQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUVsSCxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUMzRSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUNqRixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUN0SSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUEsRUFBRyxDQUFDLENBQUEsU0FBQSxFQUFZLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUNwSixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDcEUsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBLE9BQUEsRUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDO1FBQzFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxPQUFBLEVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUNoSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFBLEVBQUcsQ0FBQyxDQUFBLFNBQUEsRUFBWSxDQUFDLENBQUEsTUFBQSxDQUFRLENBQUM7SUFDOUksSUFBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsY0FBQSxFQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUV0RyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUMvRSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUNyRixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUM3SSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUEsRUFBRyxDQUFDLENBQUEsU0FBQSxFQUFZLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUMzSixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDeEUsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBLE9BQUEsRUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDO1FBQzlFLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxPQUFBLEVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUN0SSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFBLEVBQUcsQ0FBQyxDQUFBLFNBQUEsRUFBWSxDQUFDLENBQUEsTUFBQSxDQUFRLENBQUM7SUFDcEosSUFBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsY0FBQSxFQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUU1RyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUM3RSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUNuRixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUN6SSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUEsRUFBRyxDQUFDLENBQUEsU0FBQSxFQUFZLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUN2SixhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUM7UUFDdEUsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBLE9BQUEsRUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDO1FBQzVFLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQSxPQUFBLEVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQSxFQUFHLENBQUMsQ0FBQSxNQUFBLENBQVEsQ0FBQztRQUNwSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsT0FBQSxFQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFBLEVBQUcsQ0FBQyxDQUFBLFNBQUEsRUFBWSxDQUFDLENBQUEsTUFBQSxDQUFRLENBQUM7SUFDbEosSUFBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsY0FBQSxFQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQztRQUV6RyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUEsa0JBQUEsRUFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFF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LENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztJQUNqQztJQUVBLFNBQVMsUUFBUSxDQUFDLElBQVksRUFBQTtRQUMxQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUMzQixJQUFBLFFBQVEsQ0FBQyxDQUFDLE1BQU07SUFDWixRQUFBLEtBQUssQ0FBQztZQUNOLEtBQUssQ0FBQyxFQUFFO0lBQ0osWUFBQSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxFQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEUsWUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUEsRUFBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsRUFBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDckUsT0FBTyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQztZQUN2QjtJQUNBLFFBQUEsS0FBSyxDQUFDO1lBQ04sS0FBSyxDQUFDLEVBQUU7SUFDSixZQUFBLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRSxZQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUN0RSxPQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO1lBQ3ZCOztJQUVKLElBQUEsT0FBTyxJQUFJO0lBQ2Y7SUFFQSxTQUFTLGNBQWMsQ0FBQyxNQUFjLEVBQUE7UUFDbEMsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUU7UUFDbEMsT0FBTztJQUNILFFBQUEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHO0lBQ2xCLFFBQUEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2pCLFFBQUEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2pCLFFBQUEsQ0FBQyxFQUFFLENBQUM7U0FDUDtJQUNMO0lBRUEsU0FBUyxjQUFjLENBQUMsTUFBYyxFQUFBO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFFO1FBQ25DLE9BQU87SUFDSCxRQUFBLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRztJQUNsQixRQUFBLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRztJQUNqQixRQUFBLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRztJQUNqQixRQUFBLENBQUMsRUFBRSxDQUFDO1NBQ1A7SUFDTDtJQUVBO0lBQ0E7SUFDQTtJQUNNLFNBQVUsbUJBQW1CLENBQUMsS0FBYSxFQUFBOzs7UUFHN0MsSUFBSSxXQUFXLEdBQUcsQ0FBQzs7UUFHbkIsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLEtBQWEsRUFBRSxHQUFXLEVBQUUsV0FBbUIsS0FBSTtJQUM5RSxRQUFBLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDMUUsSUFBQSxDQUFDOztJQUdELElBQUEsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRTs7WUFFbEQsTUFBTSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNSO1lBQ0o7O0lBR0EsUUFBQSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztZQUV2RCxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDOztJQUU5QyxRQUFBLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7O1lBR2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztZQUcxQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sSUFBSSxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDL0Y7SUFDQSxJQUFBLE9BQU8sS0FBSztJQUNoQjtJQUVBLE1BQU0sV0FBVyxHQUF3QixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQzVELElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxZQUFZLEVBQUUsUUFBUTtJQUN0QixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLEtBQUssRUFBRSxRQUFRO0lBQ2YsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsY0FBYyxFQUFFLFFBQVE7SUFDeEIsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsY0FBYyxFQUFFLFFBQVE7SUFDeEIsSUFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUEsUUFBUSxFQUFFLFFBQVE7SUFDbEIsSUFBQSxhQUFhLEVBQUUsUUFBUTtJQUN2QixJQUFBLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUEsUUFBUSxFQUFFLFFBQVE7SUFDbEIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsV0FBVyxFQUFFLFFBQVE7SUFDckIsSUFBQSxjQUFjLEVBQUUsUUFBUTtJQUN4QixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsWUFBWSxFQUFFLFFBQVE7SUFDdEIsSUFBQSxhQUFhLEVBQUUsUUFBUTtJQUN2QixJQUFBLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCLElBQUEsYUFBYSxFQUFFLFFBQVE7SUFDdkIsSUFBQSxhQUFhLEVBQUUsUUFBUTtJQUN2QixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsUUFBUSxFQUFFLFFBQVE7SUFDbEIsSUFBQSxXQUFXLEVBQUUsUUFBUTtJQUNyQixJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsT0FBTyxFQUFFLFFBQVE7SUFDakIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsV0FBVyxFQUFFLFFBQVE7SUFDckIsSUFBQSxXQUFXLEVBQUUsUUFBUTtJQUNyQixJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsS0FBSyxFQUFFLFFBQVE7SUFDZixJQUFBLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLElBQUEsUUFBUSxFQUFFLFFBQVE7SUFDbEIsSUFBQSxPQUFPLEVBQUUsUUFBUTtJQUNqQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsS0FBSyxFQUFFLFFBQVE7SUFDZixJQUFBLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUEsYUFBYSxFQUFFLFFBQVE7SUFDdkIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLFlBQVksRUFBRSxRQUFRO0lBQ3RCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsb0JBQW9CLEVBQUUsUUFBUTtJQUM5QixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsV0FBVyxFQUFFLFFBQVE7SUFDckIsSUFBQSxhQUFhLEVBQUUsUUFBUTtJQUN2QixJQUFBLFlBQVksRUFBRSxRQUFRO0lBQ3RCLElBQUEsY0FBYyxFQUFFLFFBQVE7SUFDeEIsSUFBQSxjQUFjLEVBQUUsUUFBUTtJQUN4QixJQUFBLGNBQWMsRUFBRSxRQUFRO0lBQ3hCLElBQUEsV0FBVyxFQUFFLFFBQVE7SUFDckIsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxLQUFLLEVBQUUsUUFBUTtJQUNmLElBQUEsT0FBTyxFQUFFLFFBQVE7SUFDakIsSUFBQSxNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFBLGdCQUFnQixFQUFFLFFBQVE7SUFDMUIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLFlBQVksRUFBRSxRQUFRO0lBQ3RCLElBQUEsWUFBWSxFQUFFLFFBQVE7SUFDdEIsSUFBQSxjQUFjLEVBQUUsUUFBUTtJQUN4QixJQUFBLGVBQWUsRUFBRSxRQUFRO0lBQ3pCLElBQUEsaUJBQWlCLEVBQUUsUUFBUTtJQUMzQixJQUFBLGVBQWUsRUFBRSxRQUFRO0lBQ3pCLElBQUEsZUFBZSxFQUFFLFFBQVE7SUFDekIsSUFBQSxZQUFZLEVBQUUsUUFBUTtJQUN0QixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFBLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsS0FBSyxFQUFFLFFBQVE7SUFDZixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLElBQUEsYUFBYSxFQUFFLFFBQVE7SUFDdkIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCLElBQUEsYUFBYSxFQUFFLFFBQVE7SUFDdkIsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxJQUFJLEVBQUUsUUFBUTtJQUNkLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFBLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCLElBQUEsR0FBRyxFQUFFLFFBQVE7SUFDYixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxXQUFXLEVBQUUsUUFBUTtJQUNyQixJQUFBLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFBLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUEsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBQSxNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxHQUFHLEVBQUUsUUFBUTtJQUNiLElBQUEsSUFBSSxFQUFFLFFBQVE7SUFDZCxJQUFBLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLElBQUEsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBQSxTQUFTLEVBQUUsUUFBUTtJQUNuQixJQUFBLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLElBQUEsS0FBSyxFQUFFLFFBQVE7SUFDZixJQUFBLEtBQUssRUFBRSxRQUFRO0lBQ2YsSUFBQSxVQUFVLEVBQUUsUUFBUTtJQUNwQixJQUFBLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLElBQUEsV0FBVyxFQUFFLFFBQVE7SUFDeEIsQ0FBQSxDQUFDLENBQUM7SUFFSCxNQUFNLFlBQVksR0FBd0IsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUM3RCxJQUFBLFlBQVksRUFBRSxRQUFRO0lBQ3RCLElBQUEsYUFBYSxFQUFFLFFBQVE7SUFDdkIsSUFBQSxZQUFZLEVBQUUsUUFBUTtJQUN0QixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxlQUFlLEVBQUUsUUFBUTtJQUN6QixJQUFBLFlBQVksRUFBRSxRQUFRO0lBQ3RCLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSxXQUFXLEVBQUUsUUFBUTtJQUNyQixJQUFBLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLElBQUEsU0FBUyxFQUFFLFFBQVE7SUFDbkIsSUFBQSxhQUFhLEVBQUUsUUFBUTtJQUN2QixJQUFBLGNBQWMsRUFBRSxRQUFRO0lBQ3hCLElBQUEsZUFBZSxFQUFFLFFBQVE7SUFDekIsSUFBQSxtQkFBbUIsRUFBRSxRQUFRO0lBQzdCLElBQUEsY0FBYyxFQUFFLFFBQVE7SUFDeEIsSUFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBQSxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFBLFNBQVMsRUFBRSxRQUFRO0lBQ25CLElBQUEsZ0JBQWdCLEVBQUUsUUFBUTtJQUMxQixJQUFBLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLElBQUEsZUFBZSxFQUFFLFFBQVE7SUFDekIsSUFBQSxpQkFBaUIsRUFBRSxRQUFRO0lBQzNCLElBQUEsWUFBWSxFQUFFLFFBQVE7SUFDdEIsSUFBQSxNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFBLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLElBQUEsVUFBVSxFQUFFLFFBQVE7SUFDcEIsSUFBQSwwQkFBMEIsRUFBRSxRQUFRO0tBQ3ZDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLENBQXFCLENBQUMsQ0FBQztJQU96RSxJQUFJLE1BQXlCO0lBQzdCLElBQUksT0FBaUM7SUFFckMsU0FBUyxhQUFhLENBQUMsTUFBYyxFQUFBO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEVBQUU7SUFDVixRQUFBLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztJQUN6QyxRQUFBLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQztJQUNoQixRQUFBLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztJQUNqQixRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFDLGtCQUFrQixFQUFFLElBQUksRUFBQyxDQUFFO1FBQ2xFO0lBQ0EsSUFBQSxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU07UUFDMUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUIsSUFBQSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7SUFDL0MsSUFBQSxNQUFNLEtBQUssR0FBRyxDQUFBLEtBQUEsRUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsRUFBQSxFQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxFQUFBLEVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEVBQUEsRUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHO0lBQzNFLElBQUEsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQzFCOztJQ3JpQkEsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBMkI7SUFvQjNELFNBQVMsMEJBQTBCLENBQUMsSUFBZSxFQUFFLFVBQTJCLEVBQUE7SUFDNUUsSUFBQSxPQUFPLENBQUEsSUFBQSxFQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQyxRQUFRLENBQUEsRUFBQSxFQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQyxLQUFLLEdBQUc7SUFDM0U7SUFFTSxTQUFVLGtCQUFrQixDQUFDLElBQWUsRUFBRSxNQUFZLEVBQUE7SUFDNUQsSUFBQSxNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDNUMsSUFBQSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRTtJQUNwQixRQUFBLE9BQU8sMEJBQTBCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztRQUN2RDtJQUNBLElBQUEsT0FBTyxJQUFJO0lBQ2Y7YUFFZ0IsYUFBYSxDQUFDLElBQWUsRUFBRSxNQUFZLEVBQUUsS0FBYSxFQUFBO0lBQ3RFLElBQUEsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztJQUVsQyxJQUFBLElBQUksVUFBMkI7SUFDL0IsSUFBQSxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUMzQixRQUFBLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFO1FBQzNDO2FBQU87SUFDSCxRQUFBLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBRTtJQUN4QyxRQUFBLFVBQVUsR0FBRyxFQUFDLE1BQU0sRUFBQztJQUNyQixRQUFBLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDO1FBQ3pDO0lBRUEsSUFBQSxNQUFNLFFBQVEsR0FBRyxDQUFBLGFBQUEsRUFBZ0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQy9ELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUM7SUFLcEMsSUFBQSxPQUFPLDBCQUEwQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7SUFDdkQ7O0lDbEVBLFNBQVMsU0FBUyxDQUFDLEtBQVksRUFBQTtJQUMzQixJQUFBLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBZ0IsWUFBWSxHQUFHLDJCQUEyQixHQUFHLDRCQUE0QjtJQUNuRyxJQUFBLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztJQUN0QjtJQUVBLFNBQVMsU0FBUyxDQUFDLEtBQVksRUFBQTtJQUMzQixJQUFBLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBZ0IsWUFBWSxHQUFHLHFCQUFxQixHQUFHLHNCQUFzQjtJQUN2RixJQUFBLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztJQUN0QjtJQUVBLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQXNDO0lBTTVFLE1BQU0sWUFBWSxHQUFzQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUVyRCxNQUFNLGNBQWMsR0FBdUI7UUFDOUMsTUFBTTtRQUNOLFlBQVk7UUFDWixVQUFVO1FBQ1YsV0FBVztRQUNYLE9BQU87UUFDUCwyQkFBMkI7UUFDM0IscUJBQXFCO1FBQ3JCLDRCQUE0QjtRQUM1QixzQkFBc0I7S0FDekI7SUFHRCxTQUFTLFVBQVUsQ0FBQyxHQUFTLEVBQUUsS0FBWSxFQUFBO1FBQ3ZDLElBQUksUUFBUSxHQUFHLEVBQUU7SUFDakIsSUFBQSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFJO0lBQ3pCLFFBQUEsUUFBUSxJQUFJLENBQUEsRUFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUc7SUFDOUIsSUFBQSxDQUFDLENBQUM7SUFDRixJQUFBLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUk7SUFDM0IsUUFBQSxRQUFRLElBQUksQ0FBQSxFQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRztJQUNoQyxJQUFBLENBQUMsQ0FBQztJQUNGLElBQUEsT0FBTyxRQUFRO0lBQ25CO0lBRUEsU0FBUyxvQkFBb0IsQ0FBQyxHQUFTLEVBQUUsS0FBWSxFQUFFLFNBQTZFLEVBQUUsU0FBa0IsRUFBRSxnQkFBeUIsRUFBQTtJQUMvSyxJQUFBLElBQUksT0FBNEI7SUFDaEMsSUFBQSxJQUFJLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUN2QyxRQUFBLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFO1FBQ3BEO2FBQU87SUFDSCxRQUFBLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRTtJQUNuQixRQUFBLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1FBQ2xEO1FBQ0EsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7SUFDakMsSUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDakIsUUFBQSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFFO1FBQzNCO0lBRUEsSUFBQSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO0lBQ3pCLElBQUEsTUFBTSxJQUFJLEdBQUcsU0FBUyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDO0lBQ3RFLElBQUEsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzRixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUM7SUFDbEQsSUFBQSxNQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUN2QyxJQUFBLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLEVBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7SUFFeEQsSUFBQSxNQUFNLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNsQixRQUFBLGNBQWMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDckMsUUFBQSxXQUFXLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBRTFDLElBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDO0lBQ3RCLElBQUEsT0FBTyxLQUFLO0lBQ2hCO0lBVUEsU0FBUyxzQkFBc0IsQ0FDM0IsSUFBc0MsRUFDdEMsR0FBUyxFQUNULEtBQVksRUFDWixRQUE2QyxFQUFBO1FBRTdDLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7UUFDaEQsSUFBSSxVQUFVLEVBQUU7SUFDWixRQUFBLE9BQU8sVUFBVTtRQUNyQjtRQUNBLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO1FBQ2xDLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO0lBQzFDO0lBRUEsU0FBUyxzQkFBc0IsQ0FBQyxHQUFTLEVBQUUsS0FBWSxFQUFBO0lBQ25ELElBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztJQUMvQixJQUFBLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDL0IsSUFBQSxPQUFPLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztJQUMvRTtJQUVBLFNBQVMsa0JBQWtCLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQU8sRUFBRSxNQUFZLEVBQUUsTUFBWSxFQUFBO0lBQ3RFLElBQUEsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUc7SUFDdEIsSUFBQSxJQUFJLFNBQWtCO1FBQ3RCLElBQUksTUFBTSxFQUFFO1lBQ1IsU0FBUyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUk7UUFDbkM7YUFBTztZQUNILE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUc7SUFDakMsUUFBQSxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQztRQUMvQztRQUVBLElBQUksRUFBRSxHQUFHLENBQUM7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDO1FBQ1YsSUFBSSxTQUFTLEVBQUU7WUFDWCxJQUFJLE1BQU0sRUFBRTtJQUNSLFlBQUEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ2IsWUFBQSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDakI7aUJBQU87SUFDSCxZQUFBLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNiLFlBQUEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ2pCO1FBQ0o7SUFFQSxJQUFBLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFN0MsSUFBQSxPQUFPLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDO0lBQ25DO0lBRUEsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHO0lBRTVCLFNBQVMsV0FBVyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFPLEVBQUUsSUFBVSxFQUFBO0lBQy9DLElBQUEsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUc7UUFDdEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRztJQUNqQyxJQUFBLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUM7UUFDakQsSUFBSSxNQUFNLEVBQUU7SUFDUixRQUFBLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7WUFDaEQsSUFBSSxTQUFTLEVBQUU7SUFDWCxZQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pCLFlBQUEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakIsWUFBQSxPQUFPLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDO1lBQ25DO1lBQ0EsT0FBTyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUM7UUFDM0I7SUFFQSxJQUFBLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRW5ELElBQUksU0FBUyxFQUFFO0lBQ1gsUUFBQSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqQixRQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pCLFFBQUEsT0FBTyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztRQUNuQztRQUVBLElBQUksRUFBRSxHQUFHLENBQUM7UUFDVixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHO1FBQ2xDLElBQUksUUFBUSxFQUFFO0lBQ1YsUUFBQSxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsR0FBRztZQUMvQixJQUFJLGVBQWUsRUFBRTtJQUNqQixZQUFBLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNyQztpQkFBTztJQUNILFlBQUEsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO1lBQ25DO1FBQ0o7OztRQUlBLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3BCLEVBQUUsSUFBSSxJQUFJO1FBQ2Q7SUFFQSxJQUFBLE9BQU8sRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztJQUMvQjtJQUVBLFNBQVMsc0JBQXNCLENBQUMsR0FBUyxFQUFFLEtBQVksRUFBQTtJQUNuRCxJQUFBLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7SUFLbEIsUUFBQSxPQUFPLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7UUFDN0M7SUFLQSxJQUFBLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDN0IsT0FBTyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUM7SUFDOUQ7SUFFTSxTQUFVLHFCQUFxQixDQUFDLEdBQVMsRUFBRSxLQUFZLEVBQUUsMkJBQTJCLEdBQUcsSUFBSSxFQUFBO1FBQzdGLElBQUksQ0FBQywyQkFBMkIsRUFBRTtJQUM5QixRQUFBLE9BQU8sc0JBQXNCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztRQUM3QztRQUNBLE9BQU8sc0JBQXNCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUM7SUFDbkY7SUFFQSxNQUFNLGdCQUFnQixHQUFHLElBQUk7SUFFN0IsU0FBUyxlQUFlLENBQUMsR0FBVyxFQUFBO0lBQ2hDLElBQUEsT0FBTyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUN6QztJQUVBLFNBQVMsV0FBVyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFPLEVBQUUsSUFBVSxFQUFBO0lBQy9DLElBQUEsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUc7UUFDdkIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSTtJQUNyQyxJQUFBLE1BQU0sTUFBTSxHQUFHLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUc7UUFDL0MsSUFBSSxPQUFPLEVBQUU7SUFDVCxRQUFBLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksU0FBUyxFQUFFO0lBQ1gsWUFBQSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqQixZQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pCLFlBQUEsT0FBTyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztZQUNuQztZQUNBLElBQUksRUFBRSxHQUFHLENBQUM7WUFDVixJQUFJLE1BQU0sRUFBRTtJQUNSLFlBQUEsRUFBRSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDM0I7SUFDQSxRQUFBLE9BQU8sRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztRQUMvQjtRQUVBLElBQUksU0FBUyxFQUFFO0lBQ1gsUUFBQSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqQixRQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pCLFFBQUEsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7SUFDckQsUUFBQSxPQUFPLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDO1FBQ25DO1FBRUEsSUFBSSxFQUFFLEdBQUcsQ0FBQztJQUNWLElBQUEsSUFBSSxFQUFVO1FBQ2QsSUFBSSxNQUFNLEVBQUU7SUFDUixRQUFBLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2RTthQUFPO0lBQ0gsUUFBQSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7UUFDbkQ7SUFFQSxJQUFBLE9BQU8sRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztJQUMvQjtJQUVBLFNBQVMsc0JBQXNCLENBQUMsR0FBUyxFQUFFLEtBQVksRUFBQTtJQUNuRCxJQUFBLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7SUFLbEIsUUFBQSxPQUFPLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7UUFDN0M7SUFLQSxJQUFBLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDN0IsT0FBTyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUM7SUFDOUQ7SUFFTSxTQUFVLHFCQUFxQixDQUFDLEdBQVMsRUFBRSxLQUFZLEVBQUUsMkJBQTJCLEdBQUcsSUFBSSxFQUFBO1FBQzdGLElBQUksQ0FBQywyQkFBMkIsRUFBRTtJQUM5QixRQUFBLE9BQU8sc0JBQXNCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztRQUM3QztRQUNBLE9BQU8sc0JBQXNCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUM7SUFDN0U7SUFFQSxTQUFTLGVBQWUsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTyxFQUFFLE1BQVksRUFBRSxNQUFZLEVBQUE7SUFDbkUsSUFBQSxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRztRQUN0QixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJO1FBRXJDLElBQUksRUFBRSxHQUFHLENBQUM7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDO1FBRVYsSUFBSSxTQUFTLEVBQUU7WUFDWCxJQUFJLE1BQU0sRUFBRTtJQUNSLFlBQUEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ2IsWUFBQSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDakI7aUJBQU87SUFDSCxZQUFBLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNiLFlBQUEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ2pCO1FBQ0o7SUFFQSxJQUFBLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBRW5DLElBQUEsT0FBTyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQztJQUNuQztJQUVBLFNBQVMsa0JBQWtCLENBQUMsR0FBUyxFQUFFLEtBQVksRUFBQTtJQUMvQyxJQUFBLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7SUFDbEIsUUFBQSxPQUFPLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7UUFDN0M7SUFDQSxJQUFBLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDL0IsSUFBQSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQy9CLElBQUEsT0FBTyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0lBQzVFO0lBRU0sU0FBVSxpQkFBaUIsQ0FBQyxHQUFTLEVBQUUsS0FBWSxFQUFFLDJCQUEyQixHQUFHLElBQUksRUFBQTtRQUN6RixJQUFJLENBQUMsMkJBQTJCLEVBQUU7SUFDOUIsUUFBQSxPQUFPLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7UUFDekM7UUFDQSxPQUFPLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixDQUFDO0lBQzNFOztJQzFTQSxNQUFNLGVBQWUsR0FBZ0Q7SUFDakUsSUFBQSxXQUFXLEVBQUUsSUFBSTtJQUNqQixJQUFBLHdCQUF3QixFQUFFLE1BQU07SUFDaEMsSUFBQSx1QkFBdUIsRUFBRSxNQUFNO0lBQy9CLElBQUEsS0FBSyxFQUFFLElBQUk7SUFDWCxJQUFBLEtBQUssRUFBRSxNQUFNO0lBQ2IsSUFBQSxlQUFlLEVBQUUsTUFBTTtJQUN2QixJQUFBLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLElBQUEsUUFBUSxFQUFFLE1BQU07SUFDaEIsSUFBQSxLQUFLLEVBQUUsSUFBSTtJQUNYLElBQUEsWUFBWSxFQUFFLElBQUk7SUFDbEIsSUFBQSxlQUFlLEVBQUUsSUFBSTtJQUNyQixJQUFBLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsSUFBQSxVQUFVLEVBQUUsTUFBTTtJQUNsQixJQUFBLE9BQU8sRUFBRSxJQUFJO0lBQ2IsSUFBQSxjQUFjLEVBQUUsUUFBUTtJQUN4QixJQUFBLFlBQVksRUFBRSxNQUFNO0lBQ3BCLElBQUEsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQixJQUFBLFFBQVEsRUFBRSxJQUFJO0lBQ2QsSUFBQSxXQUFXLEVBQUUsSUFBSTtJQUNqQixJQUFBLFlBQVksRUFBRSxJQUFJO0lBQ2xCLElBQUEsU0FBUyxFQUFFLE1BQU07SUFDakIsSUFBQSxPQUFPLEVBQUUsSUFBSTtJQUNiLElBQUEsd0JBQXdCLEVBQUUsUUFBUTtJQUNsQyxJQUFBLGFBQWEsRUFBRSxJQUFJO0lBQ25CLElBQUEsb0JBQW9CLEVBQUUsUUFBUTtJQUM5QixJQUFBLDBCQUEwQixFQUFFLFFBQVE7SUFDcEMsSUFBQSxtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLElBQUEsdUJBQXVCLEVBQUUsUUFBUTtJQUNqQyxJQUFBLGtCQUFrQixFQUFFLE1BQU07SUFDMUIsSUFBQSx3QkFBd0IsRUFBRSxNQUFNO0lBQ2hDLElBQUEsWUFBWSxFQUFFLE1BQU07SUFDcEIsSUFBQSxxQkFBcUIsRUFBRSxRQUFRO0lBQy9CLElBQUEsMEJBQTBCLEVBQUUsUUFBUTtLQUN2QztJQUVELE1BQU0sT0FBTyxHQUE4Qjs7O0lBR3ZDLElBQUEsV0FBVyxFQUFFLFNBQVM7SUFDdEIsSUFBQSxLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFBLGNBQWMsRUFBRSxPQUFPO0lBQ3ZCLElBQUEsUUFBUSxFQUFFLE9BQU87SUFDakIsSUFBQSxLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFBLFVBQVUsRUFBRSxPQUFPO0lBQ25CLElBQUEsT0FBTyxFQUFFLFNBQVM7SUFDbEIsSUFBQSxjQUFjLEVBQUUsTUFBTTtJQUN0QixJQUFBLFlBQVksRUFBRSxPQUFPO0lBQ3JCLElBQUEsbUJBQW1CLEVBQUUsT0FBTztJQUM1QixJQUFBLFdBQVcsRUFBRSxTQUFTOzs7SUFHdEIsSUFBQSxTQUFTLEVBQUUsT0FBTztJQUNsQixJQUFBLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLElBQUEsYUFBYSxFQUFFLFdBQVc7SUFDMUIsSUFBQSxrQkFBa0IsRUFBRSxPQUFPO0tBQzlCO0lBRUssU0FBVSxjQUFjLENBQUMsS0FBWSxFQUFBO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBOEIsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSTtJQUMzRixRQUFBLE1BQU0sSUFBSSxHQUE2QixlQUFlLENBQUMsR0FBRyxDQUFDO0lBQzNELFFBQUEsTUFBTSxNQUFNLEdBQW1FO0lBQzNFLFlBQUEsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQixZQUFBLE1BQU0sRUFBRSxxQkFBcUI7SUFDN0IsWUFBQSxRQUFRLEVBQUUsaUJBQWlCO2FBQzlCLENBQUMsSUFBSSxDQUFDO0lBQ1AsUUFBQSxNQUFNLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUU7WUFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0lBQzFDLFFBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVE7SUFDbkIsUUFBQSxPQUFPLEdBQUc7UUFDZCxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ04sSUFBQSxJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3pFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUM7UUFDbEM7SUFDSjthQUVnQixnQkFBZ0IsR0FBQTtJQUM1QixJQUFBLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7OztJQUd4RSxRQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1FBQ3pCO0lBQ0o7O1VDOUNhLFNBQVMsQ0FBQTtJQUNWLElBQUEsT0FBTyxTQUFTLEdBQW9CLEVBQUU7SUFDdEMsSUFBQSxPQUFPLHFCQUFxQixHQUFtQixJQUFJO0lBQ25ELElBQUEsT0FBTyxzQkFBc0IsR0FBbUIsSUFBSTtJQUM1RDs7OztJQUlHO0lBQ0ssSUFBQSxPQUFPLHNCQUFzQixHQUFtQixJQUFJO0lBQ3BELElBQUEsT0FBTyxZQUFZLEdBQXNDLElBQUk7SUFDN0QsSUFBQSxPQUFPLFlBQVksR0FBd0MsSUFBSTtJQUUvRCxJQUFBLE9BQWdCLFVBQVUsR0FBRyxpQkFBaUI7SUFDOUMsSUFBQSxPQUFnQixpQkFBaUIsR0FBRyxpQkFBaUI7O0lBR3JELElBQUEsT0FBZ0IsOEJBQThCLEdBQUcsb0JBQW9CO1FBQ3JFLE9BQU8sdUJBQXVCOztJQUc5QixJQUFBLE9BQU8sV0FBVyxHQUFHLEtBQUs7SUFFbEMsSUFBQSxPQUFPLFdBQVcsR0FBRyxLQUFLOztJQUdsQixJQUFBLE9BQU8sSUFBSSxHQUFBO0lBQ2YsUUFBQSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3ZCO1lBQ0o7SUFDQSxRQUFBLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSTtJQUU1QixRQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO1lBQzFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDL0MsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFDWixvQkFBb0IsRUFBRSxTQUFTLENBQUMsb0JBQW9CO2dCQUNwRCxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWE7Z0JBQ3RDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxtQkFBbUI7SUFDckQsU0FBQSxDQUFDO0lBRUYsUUFBQSxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksY0FBYyxFQUFFO1lBQzdDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQWlCLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUU7SUFDOUYsWUFBQSxTQUFTLEVBQUUsRUFBRTtJQUNiLFlBQUEscUJBQXFCLEVBQUUsSUFBSTtJQUMzQixZQUFBLHNCQUFzQixFQUFFLElBQUk7YUFDL0IsRUFBRSxPQUFPLENBQUM7WUFFWCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztJQUUxRCxRQUFBLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTs7Z0JBS1Y7SUFDSCxnQkFBQSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxPQUFPLEVBQUUsR0FBRyxLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBa0IsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzSTtZQUNKO0lBRUEsUUFBQSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO2dCQUM5QixNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEtBQUk7Ozs7b0JBSXJELElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtJQUNyRCxvQkFBQSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsS0FBSztvQkFDNUM7SUFDSixZQUFBLENBQUMsQ0FBQztZQUNOO1FBQ0o7SUFFUSxJQUFBLGFBQWEsOEJBQThCLENBQUMsTUFBc0IsRUFBQTtJQUl0RSxRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3BDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLFlBQVksQ0FBbUIsU0FBUyxDQUFDLDhCQUE4QixFQUFFLFNBQVMsRUFBRTtJQUN4SCxnQkFBQSxzQkFBc0IsRUFBRSxNQUFNO2lCQUNqQyxFQUFFLE9BQU8sQ0FBQztZQUNmO0lBQ0EsUUFBQSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7O0lBRWpCLFlBQUEsT0FBTyxTQUFTLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFO1lBQ3hEO0lBQU8sYUFBQSxJQUFJLFNBQVMsQ0FBQyxzQkFBc0IsS0FBSyxNQUFNLEVBQUU7SUFDcEQsWUFBQSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsTUFBTTtJQUN6QyxZQUFBLE9BQU8sU0FBUyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRTtZQUN4RDtRQUNKO0lBRVEsSUFBQSxPQUFPLGFBQWEsR0FBRyxDQUFDLEtBQTBCLEtBQVU7WUFDaEUsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxVQUFVLEVBQUU7SUFDckMsWUFBQSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDdEU7SUFDSixJQUFBLENBQUM7SUFFTyxJQUFBLE9BQU8scUJBQXFCLEdBQUE7SUFDaEMsUUFBQSxRQUNJLFNBQVMsQ0FBQyxTQUFTLEtBQUssU0FBUztnQkFDakMsU0FBUyxDQUFDLFNBQVMsS0FBSyxhQUFhO2dCQUNyQyxTQUFTLENBQUMsU0FBUyxLQUFLLGNBQWM7SUFDdEMsYUFBQyxTQUFTLENBQUMsU0FBUyxLQUFLLEVBQUUsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUVwRTtJQUVRLElBQUEsT0FBTyxlQUFlLEdBQUE7SUFDMUIsUUFBQSxNQUFNLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVU7SUFFakUsUUFBQSxJQUFJLFVBQXNDO0lBQzFDLFFBQUEsSUFBSSxTQUFvQztZQUN4QyxRQUFRLElBQUk7SUFDUixZQUFBLEtBQUssY0FBYyxDQUFDLElBQUksRUFBRTtJQUN0QixnQkFBQSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVE7b0JBQ25DLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ3RFLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ2hFO2dCQUNKO2dCQUNBLEtBQUssY0FBYyxDQUFDLE1BQU07b0JBQ0E7SUFDbEIsb0JBQUEsVUFBVSxHQUFHLFNBQVMsQ0FBQyxzQkFBc0I7SUFDN0Msb0JBQUEsSUFBSSxTQUFTLENBQUMsc0JBQXNCLEtBQUssSUFBSSxFQUFFOzRCQUMzQyxPQUFPLENBQUMscURBQXFELENBQUM7NEJBQzlELFVBQVUsR0FBRyxJQUFJO3dCQUNyQjt3QkFDQTtvQkFDSjtJQVFKLFlBQUEsS0FBSyxjQUFjLENBQUMsUUFBUSxFQUFFO29CQUMxQixNQUFNLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBQyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUTtvQkFDM0QsSUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7SUFDdkMsb0JBQUEsVUFBVSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7SUFDbkQsb0JBQUEsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7b0JBQzdEO29CQUNBO2dCQUNKO2dCQUNBLEtBQUssY0FBYyxDQUFDLElBQUk7b0JBQ3BCOztZQUdSLElBQUksS0FBSyxHQUFvQixFQUFFO1lBQy9CLElBQUksT0FBTyxFQUFFO0lBQ1QsWUFBQSxJQUFJLFFBQVEsS0FBSyxPQUFPLEVBQUU7b0JBQ3RCLEtBQUssR0FBRyxVQUFVLEdBQUcsU0FBUyxHQUFHLFVBQVU7Z0JBQy9DO0lBQU8saUJBQUEsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO29CQUM5QixLQUFLLEdBQUcsVUFBVSxHQUFHLGFBQWEsR0FBRyxjQUFjO2dCQUN2RDtZQUNKO0lBQ0EsUUFBQSxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUs7WUFFM0IsSUFBSSxTQUFTLEVBQUU7SUFDWCxZQUFBLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUN4QixnQkFBQSxPQUFPLENBQUMsQ0FBQSwwQkFBQSxFQUE2QixTQUFTLGtCQUFrQixJQUFJLElBQUksRUFBRSxDQUFBLE9BQUEsRUFBVSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUEsQ0FBRSxDQUFDO2dCQUNySDtxQkFBTztJQUNILGdCQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLENBQUM7Z0JBQ2pFO1lBQ0o7UUFDSjtJQUVRLElBQUEsT0FBTyxZQUFZLEdBQVcsRUFBRTtJQUVoQyxJQUFBLE9BQU8sZUFBZSxHQUFBO1lBQzFCLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQ3JELE1BQU0seUJBQXlCLEdBQUcsV0FBVyxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzVELFFBQUEsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsRUFBRTtJQUN4QixZQUFBLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3BDO0lBRUEsUUFBQSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFO0lBQ3hCLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsTUFBSztJQUNqQyxZQUFBLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RCLElBQUksR0FBRyxHQUFHLE9BQU8sR0FBRyxtQkFBbUIsR0FBRyx5QkFBeUIsRUFBRTtvQkFDakUsU0FBUyxDQUFDLHFCQUFxQixFQUFFO2dCQUNyQztnQkFDQSxPQUFPLEdBQUcsR0FBRztZQUNqQixDQUFDLEVBQUUsbUJBQW1CLENBQUM7UUFDM0I7UUFFQSxhQUFhLEtBQUssR0FBQTtZQUNkLFNBQVMsQ0FBQyxJQUFJLEVBQUU7SUFDaEIsUUFBQSxNQUFNLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDN0IsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNkLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDakMsWUFBQSxTQUFTLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDO2dCQUM5QyxXQUFXLENBQUMsWUFBWSxFQUFFO0lBQzdCLFNBQUEsQ0FBQztZQUVGLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRTtJQUM5RSxZQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsV0FBVyxFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUMsRUFBRSxDQUFDLFNBQVMsS0FBSTtvQkFDdkUsSUFBSSxTQUFTLEVBQUU7d0JBQ1gsU0FBUyxDQUFDLG9CQUFvQixFQUFFO29CQUNwQzt5QkFBTzt3QkFDSCxPQUFPLENBQUMsaUVBQWlFLENBQUM7b0JBQzlFO0lBQ0osWUFBQSxDQUFDLENBQUM7WUFDTjtJQUNBLFFBQUEsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtnQkFDckMsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO1lBQzVDO1lBQ0EsU0FBUyxDQUFDLGVBQWUsRUFBRTtZQUMzQixTQUFTLENBQUMsZUFBZSxFQUFFO1lBQzNCLFNBQVMsQ0FBQyxXQUFXLEVBQUU7SUFDdkIsUUFBQSxPQUFPLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFJaEMsSUFBeUIsU0FBUyxDQUFDLFdBQVcsRUFBRTtJQUNuRCxZQUFBLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUMsQ0FBQztZQUN2RztZQUVBLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7SUFDdkQsUUFBQSxTQUFTLENBQUMsWUFBYSxDQUFDLE9BQU8sRUFBRTtRQUNyQztJQUVRLElBQUEsT0FBTyxtQkFBbUIsR0FBQTtZQUM5QixPQUFPO2dCQUNILE9BQU8sRUFBRSxZQUFXO0lBQ2hCLGdCQUFBLE9BQU8sTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFO2dCQUN4QyxDQUFDO2dCQUNELG1CQUFtQixFQUFFLFlBQVc7SUFDNUIsZ0JBQUEsT0FBTyxNQUFNLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEQsQ0FBQztnQkFDRCxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWM7Z0JBQ3hDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtnQkFDNUIsZUFBZSxFQUFFLFNBQVMsQ0FBQyxlQUFlO2dCQUMxQyxjQUFjLEVBQUUsU0FBUyxDQUFDLFVBQVU7Z0JBQ3BDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxlQUFlO2dCQUM5QyxVQUFVLEVBQUUsYUFBYSxDQUFDLElBQUk7Z0JBQzlCLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxzQkFBc0I7Z0JBQzFELHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxzQkFBc0I7Z0JBQzFELHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxtQkFBbUI7Z0JBQ3BELHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxtQkFBbUI7Z0JBQ3BELG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7Z0JBQ2hELG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7Z0JBQ2hELGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtnQkFDMUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxlQUFlO2dCQUMxQyxjQUFjLEVBQUUsWUFBWSxDQUFDLGNBQWM7YUFDOUM7UUFDTDtJQUVRLElBQUEsT0FBTyxpQkFBaUIsR0FBRyxPQUFPLE9BQWdCLEVBQUUsS0FBb0IsRUFBRSxPQUFzQixFQUFFLFFBQXVCLEtBQUk7SUFDakksUUFBQSxJQUFJLFNBQVMsQ0FBQyxZQUFhLENBQUMsU0FBUyxFQUFFLEVBQUU7SUFDckMsWUFBQSxNQUFNLFNBQVMsQ0FBQyxZQUFhLENBQUMsS0FBSyxFQUFFO1lBQ3pDO0lBQ0EsUUFBQSxTQUFTLENBQUMsWUFBYSxDQUFDLFNBQVMsRUFBRTtZQUNuQyxRQUFRLE9BQU87SUFDWCxZQUFBLEtBQUssUUFBUTtvQkFDVCxPQUFPLENBQUMsd0JBQXdCLENBQUM7b0JBQ2pDLFNBQVMsQ0FBQyxjQUFjLENBQUM7SUFDckIsb0JBQUEsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFO0lBQzNDLG9CQUFBLFVBQVUsRUFBRSxFQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsRUFBQztJQUN4RSxpQkFBQSxDQUFDO29CQUNGO2dCQUNKLEtBQUssU0FBUyxFQUFFO29CQUNaLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQztJQUNuQyxnQkFBQSxlQUFlLFNBQVMsQ0FBQyxLQUFhLEVBQUUsT0FBZSxFQUFBOztJQUVuRCxvQkFBQSxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7SUFDekQsd0JBQUEsT0FBTyxLQUFLO3dCQUNoQjtJQUNBLG9CQUFBLFNBQVMsU0FBUyxHQUFBOzRCQUNkLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLEVBQUU7SUFDdkMsNEJBQUEsT0FBTyxLQUFLOzRCQUNoQjtJQUNBLHdCQUFBLE1BQU0sRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFxQjtJQUN4RSx3QkFBQSxPQUFPLFFBQVEsS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLGlCQUFpQjt3QkFDN0Q7d0JBRXNCO0lBQ2xCLHdCQUFBLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO2dDQUN6QyxNQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUM7SUFDcEMsNEJBQUEsSUFBSSxFQUFFLFNBQVM7NkJBQ2xCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSzt3QkFDMUI7b0JBT0o7SUFFQSxnQkFBQSxNQUFNLEdBQUcsR0FBRyxZQUFZLEtBQUssQ0FBQyxRQUFRLElBQUksTUFBTSxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQzdFLElBQUksQ0FBMkMsTUFBTSxTQUFTLENBQUMsS0FBTSxFQUFFLE9BQVEsQ0FBQyxLQUFLLE1BQU0sR0FBRyxFQUFFLEVBQUU7SUFDOUYsb0JBQUEsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFDLENBQUM7b0JBQ2hGO3lCQUFPO3dCQUNILFNBQVMsQ0FBQyxlQUFlLEVBQUU7b0JBQy9CO29CQUNBO2dCQUNKO2dCQUNBLEtBQUssY0FBYyxFQUFFO29CQUNqQixPQUFPLENBQUMsK0JBQStCLENBQUM7b0JBQ3hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzFDLGdCQUFBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2hFLGdCQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztvQkFDbEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztvQkFDbEM7Z0JBQ0o7O0lBRVIsSUFBQSxDQUFDOzs7UUFJTyxPQUFPLFNBQVMsR0FBRyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztJQUU1RCxJQUFBLE9BQU8sb0JBQW9CLEdBQUE7WUFDL0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUMsRUFBRSxHQUFHLEtBQzFGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBcUIsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUUsT0FBTyxJQUFJLElBQUksRUFBRSxRQUFRLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ3BILFFBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBSztJQUMvQixZQUFBLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLO0lBQ3hDLFlBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDdkIsZ0JBQUEsRUFBRSxFQUFFLGdCQUFnQjtJQUNwQixnQkFBQSxLQUFLLEVBQUUsYUFBYTtJQUN2QixhQUFBLEVBQUUsTUFBSztJQUNKLGdCQUFBLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7O3dCQUUxQjtvQkFDSjtvQkFDQSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUM7b0JBQ2hFLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDO0lBQ3ZFLGdCQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLG9CQUFBLEVBQUUsRUFBRSxRQUFRO0lBQ1osb0JBQUEsUUFBUSxFQUFFLGdCQUFnQjt3QkFDMUIsS0FBSyxFQUFFLFNBQVMsSUFBSSxtQkFBbUI7SUFDMUMsaUJBQUEsQ0FBQztJQUNGLGdCQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLG9CQUFBLEVBQUUsRUFBRSxTQUFTO0lBQ2Isb0JBQUEsUUFBUSxFQUFFLGdCQUFnQjt3QkFDMUIsS0FBSyxFQUFFLFVBQVUsSUFBSSx5QkFBeUI7SUFDakQsaUJBQUEsQ0FBQztJQUNGLGdCQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLG9CQUFBLEVBQUUsRUFBRSxjQUFjO0lBQ2xCLG9CQUFBLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxlQUFlLElBQUksZUFBZTtJQUM1QyxpQkFBQSxDQUFDO0lBQ0YsZ0JBQUEsU0FBUyxDQUFDLHNCQUFzQixHQUFHLElBQUk7SUFDM0MsWUFBQSxDQUFDLENBQUM7SUFDTixRQUFBLENBQUMsQ0FBQztRQUNOO1FBRVEsYUFBYSxZQUFZLEdBQUE7SUFDN0IsUUFBQSxNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsRUFBRTtJQUNwQyxRQUFBLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLEdBQUcsQ0FBQyxJQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUUsRUFBZSxDQUFDO1FBQzFHO1FBRUEsYUFBYSxXQUFXLEdBQUE7SUFDcEIsUUFBQSxNQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUU7SUFDMUIsUUFBQSxNQUFNLENBQ0YsSUFBSSxFQUNKLFNBQVMsRUFDVCxTQUFTLEVBQ1QseUJBQXlCLEVBQ3pCLFlBQVksRUFDZixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDbEIsU0FBUyxDQUFDLFNBQVMsRUFBRTtnQkFDckIsU0FBUyxDQUFDLFlBQVksRUFBRTtnQkFDeEIsU0FBUyxDQUFDLGdCQUFnQixFQUFFO0lBQzVCLFlBQUEsSUFBSSxPQUFPLENBQVUsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUUsWUFBWSxDQUFDLG1CQUFtQixFQUFFO0lBQ3JDLFNBQUEsQ0FBQztZQUNGLE9BQU87SUFDSCxZQUFBLFNBQVMsRUFBRSxTQUFTLENBQUMscUJBQXFCLEVBQUU7SUFDNUMsWUFBQSxPQUFPLEVBQUUsSUFBSTtnQkFDYix5QkFBeUI7Z0JBQ3pCLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUTtnQkFDOUIsSUFBSTtnQkFDSixTQUFTO2dCQUNULFdBQVcsRUFBRSxhQUFhLENBQUMsaUJBQWtCO2dCQUM3QyxZQUFZLEVBQUUsU0FBUyxDQUFDLFNBQVMsS0FBSyxhQUFhLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEtBQUssY0FBYyxHQUFHLE9BQU8sR0FBRyxJQUFJO2dCQUN0SCxTQUFTO2dCQUNULFlBQVk7YUFDZjtRQUNMO1FBRUEsYUFBYSxtQkFBbUIsR0FBQTtJQUM1QixRQUFBLE1BQU0sQ0FDRixnQkFBZ0IsRUFDaEIsZUFBZSxFQUNmLGdCQUFnQixFQUNuQixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDbEIsUUFBUSxDQUFDLHdCQUF3QixFQUFFO2dCQUNuQyxRQUFRLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2hDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtJQUNqQyxTQUFBLENBQUM7WUFDRixPQUFPO2dCQUNILGdCQUFnQjtnQkFDaEIsZUFBZTtnQkFDZixnQkFBZ0I7YUFDbkI7UUFDTDtRQUVRLGFBQWEsZ0JBQWdCLEdBQUE7SUFDakMsUUFBQSxNQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUU7SUFDMUIsUUFBQSxNQUFNLEdBQUcsR0FBRyxNQUFNLFlBQVksRUFBRTtZQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQzNDLFFBQUEsTUFBTSxFQUFDLFlBQVksRUFBRSxXQUFXLEVBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUM3RCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQztZQUMvQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO1lBQ25ELElBQUksbUJBQW1CLEdBQUcsSUFBSTtJQUM5QixRQUFBLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUU7SUFDdEMsWUFBQSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDO1lBQ2hFO1lBQ0EsTUFBTSxFQUFFLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksSUFBSTtZQUNoQyxPQUFPO2dCQUNILEVBQUU7Z0JBQ0YsVUFBVTtnQkFDVixHQUFHO2dCQUNILFlBQVk7Z0JBQ1osV0FBVztnQkFDWCxVQUFVO2dCQUNWLG1CQUFtQjthQUN0QjtRQUNMO1FBRVEsYUFBYSxvQkFBb0IsQ0FBQyxNQUFjLEVBQUUsR0FBVyxFQUFFLFVBQW1CLEVBQUUsb0JBQThCLEVBQUE7SUFDdEgsUUFBQSxNQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUU7SUFDMUIsUUFBQSxPQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLENBQUM7UUFDakY7UUFFUSxhQUFhLFFBQVEsR0FBQTtZQUN6QixTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ2hCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNkLFlBQUEsU0FBUyxDQUFDLFlBQWEsQ0FBQyxTQUFTLEVBQUU7Z0JBQ25DLFdBQVcsQ0FBQyxZQUFZLEVBQUU7SUFDN0IsU0FBQSxDQUFDO1FBQ047SUFFUSxJQUFBLE9BQU8sbUJBQW1CLEdBQUcsT0FBTyxNQUFlLEtBQUk7SUFDM0QsUUFBQSxJQUFJLFNBQVMsQ0FBQyxzQkFBc0IsS0FBSyxNQUFNLEVBQUU7O2dCQUU3QztZQUNKO0lBQ0EsUUFBQSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsTUFBTTtJQUN6QyxRQUFBLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUM7SUFDaEQsUUFBQSxNQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUU7SUFDMUIsUUFBQSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsTUFBTSxFQUFFO2dCQUNoRTtZQUNKO1lBQ0EsU0FBUyxDQUFDLHFCQUFxQixFQUFFO0lBQ3JDLElBQUEsQ0FBQztJQUVPLElBQUEsT0FBTyxxQkFBcUIsR0FBRyxNQUFLO1lBQ3hDLFNBQVMsQ0FBQyxlQUFlLEVBQUU7SUFFM0IsUUFBQSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMscUJBQXFCLEVBQUU7SUFDdEQsUUFBQSxJQUNJLFNBQVMsQ0FBQyxxQkFBcUIsS0FBSyxJQUFJO2dCQUN4QyxTQUFTLENBQUMscUJBQXFCLEtBQUssWUFBWTtnQkFDaEQsU0FBUyxDQUFDLFNBQVMsS0FBSyxhQUFhO0lBQ3JDLFlBQUEsU0FBUyxDQUFDLFNBQVMsS0FBSyxjQUFjLEVBQ3hDO0lBQ0UsWUFBQSxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBWTtnQkFDOUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtnQkFDdkIsVUFBVSxDQUFDLFdBQVcsRUFBRTtnQkFDeEIsU0FBUyxDQUFDLGFBQWEsRUFBRTtJQUN6QixZQUFBLFNBQVMsQ0FBQyxZQUFhLENBQUMsU0FBUyxFQUFFO1lBQ3ZDO0lBQ0osSUFBQSxDQUFDO1FBRUQsYUFBYSxjQUFjLENBQUMsU0FBZ0MsRUFBRSxtQkFBbUIsR0FBRyxLQUFLLEVBQUE7WUFDckYsTUFBTSxRQUFRLEdBQUcsRUFBRTtZQUNuQixNQUFNLElBQUksR0FBRyxFQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBQztJQUV0QyxRQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1lBRTFCLElBQ0ksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTztJQUM5QyxhQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNyRSxhQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztJQUMvRCxhQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztJQUN2RSxhQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMvRCxhQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNuRSxhQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUNuRSxhQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUN2RTtnQkFDRSxTQUFTLENBQUMsZUFBZSxFQUFFO2dCQUMzQixTQUFTLENBQUMsV0FBVyxFQUFFO1lBQzNCO1lBQ0EsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFO0lBQ3pELFlBQUEsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztJQUM5RSxZQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzFCO0lBQ0EsUUFBQSxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLFNBQVMsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRTtJQUN2SSxZQUFBLElBQUksU0FBUyxDQUFDLGtCQUFrQixFQUFFO0lBQzlCLGdCQUFBLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDOUM7cUJBQU87SUFDSCxnQkFBQSxnQkFBZ0IsRUFBRTtnQkFDdEI7WUFDSjtZQUNBLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtJQUNuRCxZQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFO1lBQ3BGO1lBRUEsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtJQUNyRSxZQUFBLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtvQkFDekMsU0FBUyxDQUFDLG9CQUFvQixFQUFFO2dCQUNwQztxQkFBTztJQUNILGdCQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFO2dCQUNuQztZQUNKO1lBQ0EsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDO0lBQ2hFLFFBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsUUFBQSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQy9CO1FBRVEsT0FBTyxRQUFRLENBQUMsTUFBc0IsRUFBQTtJQUMxQyxRQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxFQUFDLEVBQUMsQ0FBQztZQUVwRSxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUU7SUFDOUUsWUFBQSxjQUFjLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDOUM7WUFFQSxTQUFTLENBQUMsaUJBQWlCLEVBQUU7UUFDakM7UUFFUSxhQUFhLGFBQWEsR0FBQTtJQUM5QixRQUFBLE1BQU0sSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFDLFdBQVcsRUFBRTtJQUMxQyxRQUFBLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO1FBQ2pDO1FBRVEsYUFBYSxlQUFlLEdBQUE7SUFDaEMsUUFBQSxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUTtJQUNyQyxRQUFBLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLGdCQUFnQixFQUFFO1lBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ047WUFDSjtJQUNBLFFBQUEsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLEdBQUc7WUFDakIsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUM7SUFDdkQsUUFBQSxNQUFNLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7WUFFdEMsU0FBUyxjQUFjLENBQUMsVUFBb0IsRUFBQTtJQUN4QyxZQUFBLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUU7Z0JBRS9CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbkMsZ0JBQUEsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUNuQztJQUVBLFlBQUEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0lBQ1gsZ0JBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ25CO3FCQUFPO0lBQ0gsZ0JBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QjtJQUNBLFlBQUEsT0FBTyxJQUFJO1lBQ2Y7SUFFQSxRQUFBLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixJQUFJLFFBQVEsQ0FBQyxlQUFlLElBQUksR0FBRyxDQUFDLG1CQUFtQjtZQUMxRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLFlBQVksSUFBSSxpQkFBaUIsRUFBRTtnQkFDakUsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JBQ3ZELFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFDLEVBQUUsSUFBSSxDQUFDO2dCQUN6RDtZQUNKO0lBQ0EsUUFBQSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakUsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JBQ3RELE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUN4RCxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBQyxFQUFFLElBQUksQ0FBQztnQkFDekQ7WUFDSjtZQUVBLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQ3hELFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLEVBQUUsSUFBSSxDQUFDO1FBQzlEOzs7OztJQU9RLElBQUEsT0FBTyxXQUFXLEdBQUE7SUFDdEIsUUFBQSxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dCQUNuQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxPQUFPLEVBQUMsQ0FBQztZQUMxRztpQkFBTztnQkFDSCxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxPQUFPLEVBQUMsQ0FBQztZQUMzRztJQUVBLFFBQUEsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFO2dCQUN6QyxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssY0FBYyxFQUFFO0lBQzdFLGdCQUFBLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDOUM7cUJBQU87SUFDSCxnQkFBQSxnQkFBZ0IsRUFBRTtnQkFDdEI7WUFDSjtRQUNKO0lBRVEsSUFBQSxhQUFhLGlCQUFpQixDQUFDLG1CQUFtQixHQUFHLEtBQUssRUFBQTtJQUM5RCxRQUFBLE1BQU0sU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUMxQixRQUFBLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxTQUFTLENBQUMscUJBQXFCLEVBQUU7SUFDbkUsUUFBQSxVQUFVLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDO1lBQzNDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM1QixTQUFTLENBQUMsYUFBYSxFQUFFO1lBQ3pCLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxPQUFPLEVBQUMsQ0FBQztJQUN0RixRQUFBLFNBQVMsQ0FBQyxZQUFhLENBQUMsU0FBUyxFQUFFO1FBQ3ZDO0lBRVEsSUFBQSxhQUFhLGVBQWUsQ0FBQyxLQUFhLEVBQUUsR0FBVyxFQUFBO0lBQzNELFFBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUNyRCxRQUFBLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBYSxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUN6RSxRQUFBLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBVyxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxFQUFFLElBQUksR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztZQUN2SyxVQUFVLENBQUMsWUFBVztJQUNsQixZQUFBLE1BQU0saUJBQWlCLENBQUMsRUFBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUMsQ0FBQztnQkFDckUsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNwQyxNQUFNLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFJdEQ7Z0JBQ0EsU0FBUyxDQUFDLGFBQWEsRUFBRTtZQUM3QixDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2I7UUFFUSxhQUFhLGVBQWUsR0FBQTtZQUNoQyxNQUFNLGtCQUFrQixDQUFDLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDOUQsTUFBTSxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUlyRCxTQUFTLENBQUMsYUFBYSxFQUFFO1FBQzdCOzs7Ozs7UUFRUSxPQUFPLFVBQVUsQ0FBQyxNQUFjLEVBQUE7WUFDcEMsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDMUQsUUFBQSxNQUFNLFdBQVcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDNUMsT0FBTztnQkFDSCxZQUFZO2dCQUNaLFdBQVc7YUFDZDtRQUNMO0lBRVEsSUFBQSxPQUFPLGFBQWEsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsVUFBbUIsRUFBRSxvQkFBOEIsS0FBYTtJQUN6SCxRQUFBLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzVDLFFBQUEsSUFBSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUN2RyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBQyxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0YsWUFBQSxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzRixJQUFJLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSztJQUMxRSxZQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxhQUFhLElBQUksU0FBUyxDQUFDLFNBQVMsS0FBSyxjQUFjLEVBQUU7SUFDakYsZ0JBQUEsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFNBQVMsS0FBSyxhQUFhLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDMUQsZ0JBQUEsS0FBSyxHQUFHLEVBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFDO2dCQUM1QjtnQkFDQSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsZUFBZSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsa0JBQW1CLEVBQUUsYUFBYSxDQUFDLG9CQUFxQixDQUFDLEdBQUcsSUFBSTtJQUN4SixZQUFBLE1BQU0sZUFBZSxJQUNqQixRQUFRLENBQUMsZUFBZTtJQUN4QixpQkFBQyxVQUFVLElBQUksYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEQsZ0JBQUEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFDekMsZ0JBQUEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQ2pCO0lBRUQsWUFBQSxPQUFPLENBQUMsQ0FBQSxzQkFBQSxFQUF5QixHQUFHLENBQUEsQ0FBRSxDQUFDO2dCQUN2QyxPQUFPLENBQUMsZ0JBQWdCLE1BQU0sR0FBRyxXQUFXLEdBQUcsZUFBZSxDQUFBLGVBQUEsRUFBa0IsTUFBTSxHQUFHLFdBQVcsR0FBRyxlQUFlO3dCQUMxRyxNQUFNLEdBQUcsUUFBUSxHQUFHLE1BQU0sR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFBLG9CQUFBLEVBQXVCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBRSxDQUFDO0lBQzNHLFlBQUEsUUFBUSxLQUFLLENBQUMsTUFBTTtJQUNoQixnQkFBQSxLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUU7d0JBQ3hCLE9BQU87NEJBQ0gsSUFBSSxFQUFFLGlCQUFpQixDQUFDLGNBQWM7SUFDdEMsd0JBQUEsSUFBSSxFQUFFO0lBQ0YsNEJBQUEsR0FBRyxFQUFFQSx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsbUJBQW9CLEVBQUUsYUFBYSxDQUFDLHFCQUFzQixDQUFDO2dDQUNoSSxlQUFlO2dDQUNmLGFBQWE7Z0NBQ2IsS0FBSztJQUNSLHlCQUFBO3lCQUNKO29CQUNMO0lBQ0EsZ0JBQUEsS0FBSyxXQUFXLENBQUMsU0FBUyxFQUFFO3dCQVl4QixPQUFPOzRCQUNILElBQUksRUFBRSxpQkFBaUIsQ0FBQyxjQUFjO0lBQ3RDLHdCQUFBLElBQUksRUFBRTtJQUNGLDRCQUFBLEdBQUcsRUFBRSx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsbUJBQW9CLEVBQUUsYUFBYSxDQUFDLHFCQUFzQixDQUFDO0lBQ2hJLDRCQUFBLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxLQUFLLENBQUM7Z0NBQ3pDLGdCQUFnQixFQUFFLDhCQUE4QixFQUFFO2dDQUNsRCxlQUFlO2dDQUNmLGFBQWE7Z0NBQ2IsS0FBSztJQUNSLHlCQUFBO3lCQUNKO29CQUNMO0lBQ0EsZ0JBQUEsS0FBSyxXQUFXLENBQUMsV0FBVyxFQUFFO3dCQUMxQixPQUFPOzRCQUNILElBQUksRUFBRSxpQkFBaUIsQ0FBQyxnQkFBZ0I7SUFDeEMsd0JBQUEsSUFBSSxFQUFFO0lBQ0YsNEJBQUEsR0FBRyxFQUFFLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7b0NBQzVDLEtBQUssQ0FBQyxVQUFVO0lBQ2hCLGdDQUFBLHNCQUFzQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxpQkFBa0IsRUFBRSxhQUFhLENBQUMsbUJBQW9CLENBQUM7Z0NBQ3hILGVBQWUsRUFBRSxRQUFRLENBQUMsZUFBZTtnQ0FDekMsYUFBYTtnQ0FDYixLQUFLO0lBQ1IseUJBQUE7eUJBQ0o7b0JBQ0w7SUFDQSxnQkFBQSxLQUFLLFdBQVcsQ0FBQyxZQUFZLEVBQUU7d0JBQzNCLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLHVCQUF3QixFQUFFLGFBQWEsQ0FBQyx5QkFBMEIsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQzt3QkFDM0ssT0FBTzs0QkFDSCxJQUFJLEVBQUUsaUJBQWlCLENBQUMsaUJBQWlCO0lBQ3pDLHdCQUFBLElBQUksRUFBRTtnQ0FDRixLQUFLO2dDQUNMLEtBQUs7Z0NBQ0wsUUFBUSxFQUFFLENBQUMsVUFBVTtnQ0FDckIsZUFBZTtnQ0FDZixhQUFhO0lBQ2hCLHlCQUFBO3lCQUNKO29CQUNMO0lBQ0EsZ0JBQUE7d0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFBLGVBQUEsRUFBa0IsS0FBSyxDQUFDLE1BQU0sQ0FBQSxDQUFFLENBQUM7O1lBRTdEO0lBRUEsUUFBQSxPQUFPLENBQUMsQ0FBQSxzQkFBQSxFQUF5QixNQUFNLENBQUEsQ0FBRSxDQUFDO1lBQzFDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLGlCQUFpQixDQUFDLFFBQVE7YUFDbkM7SUFDTCxJQUFBLENBQUM7OztRQUtPLGFBQWEsZ0JBQWdCLEdBQUE7SUFDakMsUUFBQSxNQUFNLFdBQVcsQ0FBQyxZQUFZLEVBQUU7SUFDaEMsUUFBQSxPQUFPLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDMUM7OztJQy90Qko7SUFDa0IsU0FBUyxDQUFDLEtBQUs7SUFFakMsTUFBTSxPQUFPLEdBQUcsQ0FBQTs7O3dCQUdRO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBVUU7UUFDbEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVc7SUFDOUMsUUFBQSxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUk7SUFDaEMsSUFBQSxDQUFDLENBQUM7SUFDRixJQUFBLHFCQUFxQixFQUFFO0lBQzNCO0lBbUxBLFNBQVMsd0JBQXdCLENBQzdCLE9BQXlFLEVBQ3pFLE9BQXdDLEVBQUE7SUFFeEMsSUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUMsWUFBWSxFQUFFLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQyxFQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUk7SUFDaEQsUUFBQSxJQUFJLElBQUksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFO2dCQUM3QjtZQUNKO0lBQ0EsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUMsWUFBWSxFQUFFO0lBQ3ZCLGdCQUFBLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNoQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07SUFDdEIsZ0JBQUEsT0FBTyxFQUFFLE9BQU8sQ0FBQyxlQUFlLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPO0lBQzNFLGFBQUEsRUFBQyxDQUFDO0lBQ1AsSUFBQSxDQUFDLENBQUM7SUFDTjtJQUVBLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sS0FBSTtRQUMvQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7UUFDdkQsd0JBQXdCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO0lBQzFELENBQUMsQ0FBQzs7Ozs7OyJ9
