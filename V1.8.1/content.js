/**
 * Scoro UI Refresh — Content Script (V1.8.1)
 *
 * Chrome extension that enhances the Scoro project management UI.
 * Injected into all https://*.scoro.com/* pages (see manifest.json).
 *
 * ─── Architecture ───────────────────────────────────────────────────────────
 *  manifest.json       – Extension config; declares content scripts & permissions
 *  background.js       – Service worker; proxies fetch requests for Dark Reader (CORS bypass)
 *  content.js (this)   – Main logic; injected into every Scoro page at document_start
 *  popup.html/js/css   – Extension popup UI with toggle buttons for each feature
 *  styles.css          – Task page layout grid; injected dynamically only on task pages
 *  lib/darkreader.js   – Bundled Dark Reader library for CSS-filter dark mode
 *
 * ─── Features ───────────────────────────────────────────────────────────────
 *  1.  Dark Mode            – Dark Reader integration with background-fetch CORS bypass
 *                             Applies to: ALL Scoro pages
 *  2.  UI Refresh           – CSS grid layout for task detail pages + duration dropdown cleanup
 *                             Applies to: Task pages (/tasks/view/...)
 *  3.  Duration Dropdown    – Reorders <select> options, separating "Other" from time values
 *                             Applies to: Any page with duration selects (task modals, etc.)
 *  4.  Auto-Resize Editor   – Grows TinyMCE editor iframe to fit content
 *                             Applies to: Any page with TinyMCE editor
 *  5.  Dropdown Navigation  – Type-ahead search in user/assignee dropdowns
 *                             Applies to: Any page with .buttonDropdown elements
 *  6.  Rainbow Easter Egg   – Gradient text on names "Ticsi" / "Zorka" in comment sections
 *                             Applies to: Task pages with comment containers
 *  7.  Notification Sorter  – Groups unread notifications by task; separates read/unread.
 *                             Auto-runs on page load (smart scroll: fast if <50, thorough if ≥50).
 *                             Manual "Regroup" button always scrolls fully without a limit.
 *                             Applies to: /notifications
 *  8.  Timesheet Retouch    – Dims "0h" entries; colors done/not-done in dark mode
 *                             Applies to: /tasks/timesheet
 *  9.  Comment Drafts       – Auto-saves comment drafts to chrome.storage.local per task.
 *                             Restores on next visit; discard modal on cancel if draft exists.
 *                             Only targets the COMMENT TinyMCE editor (not task description).
 *                             Applies to: Task pages (/tasks/view/...)
 *  10. Offer Hour Summaries – Injects per-section hour totals (external + internal) and a
 *                             grand total into quote edit pages. Reads from input fields.
 *                             Selectors: tr.paarotLine.headerLine (sections),
 *                               input[name="paarotLines[][amount]"] (qty),
 *                               input[name="paarotLines[][unit_name]"] (unit, "hour" = counted),
 *                               input[name="paarotLines[][custom_field][c_internalhours]"] (internal)
 *                             V1.8.1: also renders a project-wide "per role" rollup right below
 *                               the grand total — groups every line item across ALL sections by
 *                               input[name="paarotLines[][product_name]"] and shows each role's
 *                               combined external + internal hours. See computeRoleTotals().
 *                             Applies to: /quotes/modify/
 *  11. Offer Hour Summaries (View) – Same as above but for the read-only view page.
 *                             Reads from rendered text cells in table.calculation-table.
 *                             Section headers: tr[nobr] with td > h4.
 *                             Product rows: tr[nobr], role/product name in td[1], qty in td[2],
 *                               unit in td[3].
 *                             Internal hours: custom-field-row where label = "Internal hours".
 *                             V1.8.1: same project-wide per-role rollup as the modify page.
 *                             Applies to: /quotes/view/
 *  12. Quote Back Button    – Injects a "← Back to the project's finances" link on quote
 *                             view pages. Project ID from input[name="project_id"].
 *                             Links to: /projects/view/{projectId}/finances
 *                             Applies to: /quotes/view/
 *  13. Timesheet Future Dim – Dims hour values in future-date columns (opacity 0.15, grey).
 *                             Today is NEVER dimmed (local date comparison to avoid UTC offset).
 *                             Toggle button injected near the View dropdown in the filter bar.
 *                             State persisted in chrome.storage.sync (futureDimEnabled).
 *                             Applies to: /tasks/timesheet
 *  14. Timesheet Future Warning – Popup when a time entry is saved on a future date.
 *                             "Uh, köszi" dismisses; "Vágesz / ne szólj 10 percig" snoozes.
 *                             Snooze stored in localStorage (scoro_future_time_snooze).
 *                             Triggered on blur/Enter on .js-time-entry-duration inputs.
 *                             Applies to: /tasks/timesheet
 *
 * ─── Storage Keys ───────────────────────────────────────────────────────────
 *  chrome.storage.sync (shared across devices):
 *    uiRefreshEnabled       – boolean (default: true)  – Toggle UI Refresh + Duration tweaks
 *    darkModeEnabled        – boolean (default: false) – Toggle Dark Reader
 *    autoGrouppingEnabled   – boolean (default: true)  – Auto-group notifications on page load
 *    futureDimEnabled       – boolean (default: true)  – Dim future timesheet columns
 *
 *  chrome.storage.local (device-only):
 *    scoro_draft_{taskId}   – string (HTML) – Saved comment draft per task
 *
 *  localStorage (device + session):
 *    scoro_future_time_snooze – timestamp (ms) – Snooze expiry for future time warning
 *
 * ─── Message Protocol ───────────────────────────────────────────────────────
 *  popup.js → content.js:  { type: 'UPDATE_SETTINGS', setting: <key>, value: <bool> }
 *  content.js → background.js: { type: 'FETCH_URL', url: <string> }
 */

// =============================================================================
// GLOBAL CONFIG
// =============================================================================

/** CSS selector for duration dropdowns (used across task modals and detail pages) */
const DURATION_SELECTOR = 'select.durations-select, select#duration';

/** Tracks whether dark mode is currently active (read by tweakTimesheetZeros for color logic) */
let darkModeEnabled = false;


// =============================================================================
// DARK MODE (Dark Reader)
// Integrates the bundled Dark Reader library for a full-page dark theme.
// Uses background.js as a CORS proxy so Dark Reader can fetch external CSS.
// Toggled via popup.js → UPDATE_SETTINGS message → setDarkMode().
// =============================================================================

// =============================================================================
// DARK READER CONFIG
// =============================================================================

// Configure Dark Reader to fetch CSS via background script (bypassing CORS)
DarkReader.setFetchMethod(async (url) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'FETCH_URL', url }, (response) => {
      if (response && response.success) {
        resolve({
          ok: true,
          status: 200,
          text: async () => response.data,
          blob: async () => new Blob([response.data]),
          headers: new Headers()
        });
      } else {
        reject(new Error(response ? response.error : 'Unknown error'));
      }
    });
  });
});

function enableDarkMode() {
  console.log('Enabling Dark Reader with background fetch...');

  // Enable Dark Reader with default settings
  // Now that we can fetch external CSS, we shouldn't need hardcoded fixes
  DarkReader.enable({
    brightness: 100,
    contrast: 100,
    sepia: 0,
    styleSystemControls: false,
    useFontMgmt: false
  });
}

function disableDarkMode() {
  DarkReader.disable();
}

function setDarkMode(enabled) {
  darkModeEnabled = enabled;
  enabled ? enableDarkMode() : disableDarkMode();
  // Re-process timesheet entries so colors update immediately when toggled
  if (isTimesheetPage()) {
    document.querySelectorAll('.js-open-time-entry, .js-show-time-entries').forEach(el => {
      delete el.dataset.processed;
      el.style.color = '';
      el.style.opacity = '';
    });
    tweakTimesheetZeros(true);
  }
}

// =============================================================================
// UI REFRESH (Task Layout)
// Injects styles.css on task detail pages to rearrange the layout into a
// CSS grid (description left, time entries right, comments full-width below).
// Also gates the duration dropdown tweaks and editor auto-resize.
// =============================================================================

/** Returns true if the current page is a Scoro task detail view (/tasks/view/ID) */
function isTaskPage() {
  return /^https:\/\/[^/]+\.scoro\.com\/tasks\/view\//.test(location.href);
}

/**
 * Injects or removes a <link> stylesheet by ID.
 * @param {string} id   – Unique element ID for the <link> tag
 * @param {string} file – Filename relative to extension root (e.g. 'styles.css')
 * @param {boolean} enabled – Whether to inject (true) or remove (false)
 */
function setStylesheet(id, file, enabled) {
  let el = document.getElementById(id);
  if (enabled && !el) {
    el = document.createElement('link');
    el.id = id;
    el.rel = 'stylesheet';
    el.href = chrome.runtime.getURL(file);
    (document.head || document.documentElement).appendChild(el);
  } else if (!enabled && el) {
    el.remove();
  }
}

// NOTE: The main setUiRefresh() function is defined further below (after tweakDurations)
// because it depends on tweakDurations, initEditorAutoResize, and initObserver.

// =============================================================================
// DURATION DROPDOWN
// Reorders <select> options in duration dropdowns: "Other" (non-numeric)
// options first, then time values. Preserves the user's current selection.
// Selector: DURATION_SELECTOR (see CONFIG above)
// =============================================================================

function tweakDurations(enabled) {
  const selects = document.querySelectorAll(DURATION_SELECTOR);

  selects.forEach(sel => {
    // Avoid reprocessing if already handled and enabled
    if (enabled && sel.dataset.processed) return;

    if (enabled) {
      if (!sel.dataset.orig) sel.dataset.orig = sel.innerHTML;
      sel.dataset.processed = "true";

      const other = [];
      const times = [];
      const tmp = document.createElement('select');
      tmp.innerHTML = sel.dataset.orig;

      // Separate options into "Other" (non-numeric) and "Time" (numeric)
      for (const o of tmp.options) {
        const v = Number(o.value);
        if (!Number.isFinite(v)) {
          other.push({ v: o.value, l: o.textContent });
        } else {
          times.push({ v: o.value, l: o.textContent });
        }
      }

      const prev = sel.value;
      sel.innerHTML = '';

      // Add "Other" options first
      other.forEach(({ v, l }) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = l;
        sel.appendChild(o);
      });

      // Add existing time options
      times.forEach(({ v, l }) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = l;
        sel.appendChild(o);
      });

      // Restore selection
      let newValue = prev;

      const applyValue = () => {
        const option = sel.querySelector(`[value="${newValue}"]`);
        if (option) {
          sel.value = newValue;

          // Force selection on the option element
          option.selected = true;
          option.setAttribute('selected', 'selected');

          // Deselect others to be sure
          Array.from(sel.options).forEach(o => {
            if (o !== option) {
              o.selected = false;
              o.removeAttribute('selected');
            }
          });

          sel.dispatchEvent(new Event('change', { bubbles: true }));
          sel.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      applyValue();

      // Re-apply after a short delay to override any framework resets
      setTimeout(applyValue, 50);
      setTimeout(applyValue, 200);

    } else if (sel.dataset.orig) {
      const prev = sel.value;
      sel.innerHTML = sel.dataset.orig;
      delete sel.dataset.orig;
      delete sel.dataset.processed;
      if (sel.querySelector(`[value="${prev}"]`)) sel.value = prev;
    }
  });
}

/**
 * MutationObserver that watches for dynamically added DOM nodes (modals,
 * lazy-loaded content) and re-applies tweaks when new content appears.
 */
let observer = null;

function initObserver(enabled) {
  if (observer) observer.disconnect();
  if (!enabled) return;

  observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (const m of mutations) {
      if (m.addedNodes.length) {
        shouldUpdate = true;
        break;
      }
    }
    if (shouldUpdate) {
      tweakDurations(true);
      initEditorAutoResize(true);
      tweakTimesheetZeros(true);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Master toggle for the UI Refresh feature.
 * - Injects/removes styles.css (only on task pages)
 * - Enables/disables duration dropdown tweaks (on ALL pages, for modals)
 * - Starts/stops the editor auto-resize poller
 * - Starts/stops the MutationObserver for dynamic content
 * - Applies timesheet color tweaks
 */
function setUiRefresh(enabled) {
  const active = enabled; // Always run tweakDurations if enabled, regardless of page type (for modals)

  // Only apply CSS on Task pages
  const isTask = isTaskPage();
  setStylesheet('scoro-ui-refresh', 'styles.css', enabled && isTask);

  tweakDurations(active);
  initEditorAutoResize(active);
  initObserver(active);
  tweakTimesheetZeros(active);
}

// =============================================================================
// AUTO-RESIZE EDITOR
// Polls for TinyMCE editor iframes and attaches a ResizeObserver + event
// listeners to auto-grow the editor container to fit content.
// Uses dataset.resizeAttached to avoid duplicate attachments.
// =============================================================================

function initEditorAutoResize(enabled) {
  if (window._scoroAutoResizeInterval) {
    clearInterval(window._scoroAutoResizeInterval);
    window._scoroAutoResizeInterval = null;
  }

  if (!enabled) return;

  const attach = () => {
    const iframe = document.querySelector('iframe.tox-edit-area__iframe') || document.getElementById('mce_0_ifr');

    if (!iframe) return;

    // Check if we already attached to this specific iframe instance
    if (iframe.dataset.resizeAttached === "true") {
      try {
        if (!iframe.contentDocument || !iframe.contentDocument.body.dataset.resizeObserved) {
          iframe.dataset.resizeAttached = "false";
        } else {
          return;
        }
      } catch (e) { return; }
    }

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const body = doc.body;
      if (!body) return;

      console.log('Scoro Fix: Editor iframe found. Attaching auto-resize...');

      iframe.dataset.resizeAttached = "true";
      body.dataset.resizeObserved = "true";

      const resize = () => {
        try {
          const currentBody = iframe.contentDocument?.body;
          if (currentBody) {
            // 1. Get content height
            const contentHeight = Math.max(100, currentBody.scrollHeight);

            // 2. Find the MAIN container (.tox-tinymce)
            // It's usually a few levels up
            const container = iframe.closest('.tox-tinymce') || iframe.closest('.tox-editor-container');

            if (container) {
              // Measure toolbar height (header) + statusbar (footer)
              // We can estimate or measure. Usually around 40px + 30px ~ 70px.
              // Better to measure:
              const header = container.querySelector('.tox-editor-header');
              const footer = container.querySelector('.tox-statusbar');
              const headerH = header ? header.offsetHeight : 40;
              const footerH = footer ? footer.offsetHeight : 30;

              const totalHeight = contentHeight + headerH + footerH + 20; // +20 buffer

              // Only apply if it grows (or shrinks significantly)
              // Start with min-height of e.g. 200
              const finalHeight = Math.max(200, totalHeight);

              // Apply to CONTAINER
              if (Math.abs(container.offsetHeight - finalHeight) > 10) {
                container.style.height = finalHeight + "px";
              }

              // Also ensure iframe takes available space? TinyMCE is flex, so it should.
            } else {
              // Fallback: resize iframe directly if no container found
              if (Math.abs(iframe.clientHeight - contentHeight) > 10) {
                iframe.style.height = contentHeight + "px";
              }
            }
          }
        } catch (e) { /* ignore */ }
      };

      // 1. Resize immediately
      resize();

      // 2. Events inside iframe
      const win = iframe.contentWindow;
      if (win) {
        doc.addEventListener('input', resize);
        doc.addEventListener('keyup', resize);
        doc.addEventListener('paste', resize);
        doc.addEventListener('click', resize);

        const ro = new ResizeObserver(resize);
        ro.observe(body);
      }

    } catch (e) {
      console.log('Scoro Fix: Could not attach to editor (yet)', e);
    }
  };

  attach();
  window._scoroAutoResizeInterval = setInterval(attach, 1000);
}

// =============================================================================
// USER DROPDOWN NAVIGATION
// Adds type-ahead search to Scoro's custom dropdown menus (.buttonDropdown).
// Typing letters filters options by name prefix (500ms buffer reset).
// =============================================================================

function initDropdownNavigation(enabled) {
  if (!enabled) return;

  let searchBuffer = '';
  let searchTimer = null;

  document.addEventListener('keydown', (e) => {
    // Check if the dropdown is visible
    const dropdown = document.querySelector('.buttonDropdown');
    if (!dropdown || dropdown.style.display === 'none') return;

    // Fix: Ignore if user is typing in an input field
    const target = e.target;
    if (target.matches('input, textarea, [contenteditable="true"]')) return;

    // Only handle single letter keys (A-Z) or numbers if needed, avoiding shortcuts
    if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

    // Clear existing timer
    if (searchTimer) clearTimeout(searchTimer);

    // Append key to buffer
    searchBuffer += e.key.toLowerCase();

    // Set new timer to clear buffer after 500ms
    searchTimer = setTimeout(() => {
      searchBuffer = '';
      searchTimer = null;
    }, 500);

    const options = Array.from(dropdown.querySelectorAll('.selectDropdownOption'));

    // Find the first option that starts with the buffer
    const match = options.find(opt => {
      const name = (opt.dataset.name || opt.textContent).trim().toLowerCase();
      return name.startsWith(searchBuffer);
    });

    if (match) {
      e.preventDefault();

      // Scroll the option into view
      match.scrollIntoView({ block: 'center', behavior: 'smooth' });

      // Optional: Highlight the option to show it's active
      match.focus();
    } else {
      // If no match for full buffer, maybe reset and try just the last char? 
      // Or just let it fail until buffer clears. 
      // Standard behavior is usually to hold the buffer even if no match found, 
      // but let's stick to simple start: if "op" is typed and no match, it stays "op".
      // If the user made a typo, they have to wait 500ms. 
      // Alternatively, if "op" fails, we could check if "p" matches (reset buffer).
      // Let's stick to strict prefix for now as requested ("starts with 'op'").
    }
  });
}

// =============================================================================
// RAINBOW EASTER EGG
// Applies a gradient text effect to the names "Ticsi" and "Zorka" in the
// comment section of task pages. Purely cosmetic.
// =============================================================================

function initRainbow(attempt = 0) {
  const container = document.querySelector('#js-comment-error-container')?.closest('.col');

  if (!container && attempt < 15) {
    setTimeout(() => initRainbow(attempt + 1), 400);
    return;
  }

  if (!container) return;

  if (!document.getElementById('rainbow-css')) {
    const s = document.createElement('style');
    s.id = 'rainbow-css';
    s.textContent = `.rainbow-ticsi{font-weight:bold!important;background:linear-gradient(135deg,#3702FA,#FE22D3,#FF2F4D);-webkit-background-clip:text;background-clip:text;color:transparent!important}`;
    document.head.appendChild(s);
  }

  const walk = node => {
    if (node.nodeType === 3 && /Ticsi|Zorka/.test(node.nodeValue)) {
      const span = document.createElement('span');
      span.innerHTML = node.nodeValue.replace(/(Ticsi|Zorka)/g, '<span class="rainbow-ticsi">$1</span>');
      node.replaceWith(span);
    } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE'].includes(node.nodeName)) {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(container);
}

// =============================================================================
// NOTIFICATION SORTER
// On the /notifications page, scrolls to load content, then groups
// notifications by task name. Unread groups appear first with blue headers;
// read notifications are collapsed at the bottom with a grey header.
// A "Regroup Tasks" button is injected for manual re-runs.
// =============================================================================

function isNotificationPage() {
  return /\/notifications/.test(location.href);
}

// Flag to prevent auto-run loop, but allow button click
let notificationSortRun = false;

async function initNotificationSorter(enabled, force = false) {
  if (!isNotificationPage()) return;

  // ALWAYS add the button, regardless of auto-grouping
  addRegroupButton();

  // If not enabled and not forced (clicked), stop here
  if (!enabled && !force) return;

  if (notificationSortRun && !force) return;

  notificationSortRun = true;

  // 1. Create Overlay
  const overlay = document.createElement('div');
  overlay.id = 'scoro-noti-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    color: '#333',
    fontFamily: 'sans-serif'
  });

  const statusText = document.createElement('div');
  statusText.textContent = 'Organizing Notifications...';
  overlay.appendChild(statusText);

  const debugText = document.createElement('div');
  debugText.style.fontSize = '14px';
  debugText.style.color = '#666';
  debugText.style.marginTop = '10px';
  overlay.appendChild(debugText);

  document.body.appendChild(overlay);

  const updateStatus = (msg) => {
    debugText.textContent = msg;
    // console.log('[Scoro Fix]', msg);
  };

  try {
    const countNotifs = () => document.querySelectorAll('.topNotificationRow').length;
    const initialCount = countNotifs();

    if (initialCount < 50 && !force) {
      // Fast path: quick 3-scroll dance (only on auto-run, not manual regroup)
      for (let i = 1; i <= 3; i++) {
        updateStatus(`Scrolling` + '.'.repeat(i));
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 400));
      }
    } else {
      // Slow path: scroll until count stabilises or hits 200
      // Always used when manually triggered via Regroup button
      let prevCount = initialCount;
      let stableRounds = 0;
      let iterations = 0;
      const MAX = 200;
      const MAX_ITER = 30;

      while (iterations < MAX_ITER) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 500));
        const newCount = countNotifs();
        updateStatus(`Loaded: ${newCount} notifications...`);

        if (!force && newCount >= MAX) { updateStatus(`Reached ${MAX} limit, stopping...`); break; }
        if (newCount === prevCount) { stableRounds++; if (stableRounds >= 2) break; }
        else { stableRounds = 0; }

        prevCount = newCount;
        iterations++;
      }
    }

    // 3. Go to Top
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 50));

    // 4. Group Notifications
    updateStatus('Grouping...');
    const result = groupNotificationsByTask();
    if (force && result && result.success) {
      updateStatus(`${result.count} notifications grouped, ${result.groups} tasks, ${result.readCount} read`);
      await new Promise(r => setTimeout(r, 1200));
    }

    // Success: Skip the "Done" message and wait, just remove overlay immediately
    // If error, we still want to show it briefly

  } catch (e) {
    console.error('Error grouping notifications:', e);
    updateStatus('Error: ' + e.message);
    await new Promise(r => setTimeout(r, 2000));
  }

  // 5. Remove Overlay
  overlay.remove();
}

function addRegroupButton() {
  const container = document.querySelector('.filter-additional-fields-container');
  // Look for the "Mark all as read" container to insert before
  const markReadBtn = container ? container.querySelector('.mark-read') : null;

  if (container && markReadBtn && !document.getElementById('scoro-regroup-btn')) {
    const btnDiv = document.createElement('div');
    btnDiv.className = 'mark-read';
    btnDiv.style.marginRight = '10px'; // Add spacing

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'smallbut';
    link.id = 'scoro-regroup-btn';
    link.textContent = 'Regroup Tasks';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Re-run the sorter logic forcefully
      initNotificationSorter(true, true);
    });

    btnDiv.appendChild(link);
    container.insertBefore(btnDiv, markReadBtn);
  }
}

function isNotificationRead(row) {
  // Scoro usually marks unread items with a class like 'unread' or 'new'.
  // If we can't find it, we might assume everything is unread or read.
  // Best guess: look for .unread class on the tr or a div inside.
  return !row.classList.contains('unread') && !row.querySelector('.unread');
}

function groupNotificationsByTask() {
  const notificationsTable = document.querySelector('.notificationsTable');
  if (!notificationsTable) return { success: false, reason: 'No table' };

  const notifications = Array.from(notificationsTable.querySelectorAll('.topNotificationRow'));
  if (notifications.length === 0) return { success: false, reason: 'No rows' };

  const taskGroups = {};
  const readNotifications = [];

  notifications.forEach((notification, index) => {
    const parentLink = notification.closest('a');
    const row = parentLink || notification;

    // Check if read
    if (isNotificationRead(notification)) {
      readNotifications.push({
        element: row,
        originalIndex: index
      });
      return;
    }

    // Process Unread
    const taskName = extractTaskName(notification);
    if (!taskGroups[taskName]) {
      taskGroups[taskName] = [];
    }

    taskGroups[taskName].push({
      element: row,
      originalIndex: index
    });
  });

  const sortedTaskNames = Object.keys(taskGroups).sort((a, b) => {
    const aMin = Math.min(...taskGroups[a].map(n => n.originalIndex));
    const bMin = Math.min(...taskGroups[b].map(n => n.originalIndex));
    return aMin - bMin;
  });

  const fragment = document.createDocumentFragment();

  // 1. Render UNREAD groups
  sortedTaskNames.forEach(taskName => {
    const taskNotifs = taskGroups[taskName].sort((a, b) => a.originalIndex - b.originalIndex);

    // Header for group
    if (taskName !== 'New Task') {
      const header = document.createElement('div');
      Object.assign(header.style, {
        padding: '12px 15px',
        backgroundColor: '#e8f0fe', // Light blue-ish
        color: '#1a73e8', // matching blue text
        fontWeight: '600',
        borderLeft: '4px solid #1a73e8',
        marginTop: '15px',
        marginBottom: '5px',
        borderRadius: '0 4px 4px 0',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      });

      const nameSpan = document.createElement('span');
      nameSpan.textContent = `📂 ${taskName}`;

      const countSpan = document.createElement('span');
      countSpan.textContent = `${taskNotifs.length} items`;
      countSpan.style.fontSize = '12px';
      countSpan.style.opacity = '0.8';

      header.appendChild(nameSpan);
      header.appendChild(countSpan);

      fragment.appendChild(header);
    }

    taskNotifs.forEach(item => {
      fragment.appendChild(item.element);
    });
  });

  // 2. Render READ notifications group (at the bottom)
  if (readNotifications.length > 0) {
    const header = document.createElement('div');
    Object.assign(header.style, {
      padding: '12px 15px',
      backgroundColor: '#f1f3f4', // Gray for read items
      color: '#5f6368',
      fontWeight: '600',
      borderLeft: '4px solid #5f6368',
      marginTop: '30px', // Extra spacing
      marginBottom: '5px',
      borderRadius: '0 4px 4px 0',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `📋 Read Notifications`; // Changed emoji to clipboard or check?

    const countSpan = document.createElement('span');
    countSpan.textContent = `${readNotifications.length} items`;
    countSpan.style.fontSize = '12px';
    countSpan.style.opacity = '0.8';

    header.appendChild(nameSpan);
    header.appendChild(countSpan);

    fragment.appendChild(header);

    readNotifications.forEach(item => {
      fragment.appendChild(item.element);
    });
  }

  notificationsTable.innerHTML = '';
  notificationsTable.appendChild(fragment);

  return {
    success: true,
    count: notifications.length,
    groups: Object.keys(taskGroups).length,
    readCount: readNotifications.length
  };
}

function extractTaskName(notification) {
  const textWrapper = notification.querySelector('.notification-text-wrapper');
  if (!textWrapper) return 'Unknown Task';

  const boldText = textWrapper.querySelector('b');
  if (!boldText) return 'Unknown Task';

  const boldContent = boldText.textContent;

  if (boldContent.includes('added a task')) {
    // Structure: <br> is node 1, so text is node 2
    const secondLine = textWrapper.childNodes[2];
    if (secondLine && secondLine.textContent) {
      return secondLine.textContent.trim().split('|')[0].trim() || 'New Task';
    }
    return 'New Task';
  }

  const quoteMatch = boldContent.match(/"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];

  const toMatch = boldContent.match(/to\s+"([^"]+)"/);
  if (toMatch) return toMatch[1];

  const relatedMatch = boldContent.match(/related to\s+"([^"]+)"/);
  if (relatedMatch) return relatedMatch[1];

  return 'Unknown Task';
}

// =============================================================================
// TIMESHEET DARK MODE RETOUCH
// On /tasks/timesheet pages, dims "0h" entries (opacity 0.2) and recolors
// non-zero entries in dark mode: red = not done, blue = done.
// In light mode, native Scoro colors are preserved.
// =============================================================================

function isTimesheetPage() {
  return /tasks\/timesheet/.test(location.href);
}

function tweakTimesheetZeros(enabled) {
  if (!enabled || !isTimesheetPage()) return;

  const entries = document.querySelectorAll('.js-open-time-entry, .js-show-time-entries');

  entries.forEach(el => {
    if (el.dataset.processed === 'true') return;

    const val = el.textContent.trim();

    if (val === '0h') {
      // Always dim zero entries
      el.style.opacity = '0.2';
      el.style.color = '';
    } else if (darkModeEnabled) {
      // In dark mode: red = not done (has past-time-entry-active), blue = done
      if (el.classList.contains('past-time-entry-active')) {
        el.style.color = '#e8394a'; // red — not done
      } else {
        el.style.color = '#4a90e2'; // blue — done
      }
    } else {
      // Light mode: leave native Scoro color intact
      el.style.color = '';
    }

    el.dataset.processed = 'true';
  });
}

// =============================================================================
// TIMESHEET FUTURE DIM
// Dims hour values in future-date columns with a lighter grey.
// Toggled via a button injected into the timesheet page header.
// =============================================================================

let futureDimEnabled = true;

function tweakTimesheetFuture(enabled) {
  if (!isTimesheetPage()) return;

  // Build today's date string in local time (YYYY-MM-DD) to avoid UTC offset issues
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // Reset previously dimmed future cells
  document.querySelectorAll('[data-future-dimmed="true"]').forEach(el => {
    el.style.opacity = '';
    el.style.color = '';
    delete el.dataset.futureDimmed;
  });

  if (!enabled) return;

  document.querySelectorAll('td[data-date]').forEach(cell => {
    if (cell.dataset.date <= todayStr) return; // today and past — skip

    // Dim all hour display elements within this future cell
    cell.querySelectorAll('.js-open-time-entry, .js-show-time-entries, .empty-duration-container, .zero-duration').forEach(el => {
      el.style.opacity = '0.15';
      el.style.color = '#aaa';
      el.dataset.futureDimmed = 'true';
    });
  });
}

function initTimesheetFutureDim() {
  if (!isTimesheetPage()) return;

  chrome.storage.sync.get(['futureDimEnabled'], res => {
    futureDimEnabled = res.futureDimEnabled ?? true;
    tweakTimesheetFuture(futureDimEnabled);
    injectFutureDimToggle();
  });

  // Re-apply when new rows load; disconnect if extension context is gone
  const obs = new MutationObserver(() => {
    try {
      if (!chrome.runtime?.id) { obs.disconnect(); return; }
      if (futureDimEnabled) tweakTimesheetFuture(true);
    } catch (e) { obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function injectFutureDimToggle() {
  if (document.getElementById('scoro-future-dim-toggle')) return;

  const poll = setInterval(() => {
    try {
      if (!chrome.runtime?.id) { clearInterval(poll); return; }

      // "View" is a .filter-item containing a span.filter-label with text "View"
      const anchor = Array.from(document.querySelectorAll('.filter-item')).find(el =>
        el.querySelector('.filter-label')?.textContent?.trim() === 'View'
      );
      if (!anchor) return;
      clearInterval(poll);
      if (document.getElementById('scoro-future-dim-toggle')) return;

      const btn = document.createElement('button');
      btn.id = 'scoro-future-dim-toggle';
      btn.type = 'button';
      btn.textContent = futureDimEnabled ? 'Future 🙈' : 'Future 👁️';
      btn.style.cssText = `margin-left:8px;padding:5px 12px;font-size:13px;font-family:Inter,sans-serif;font-weight:500;border-radius:6px;border:1.5px solid #d0d0d0;background:#fff;color:#555;cursor:pointer;vertical-align:middle;`;

      btn.addEventListener('click', () => {
        try {
          futureDimEnabled = !futureDimEnabled;
          btn.textContent = futureDimEnabled ? 'Future 🙈' : 'Future 👁️';
          if (chrome.runtime?.id) chrome.storage.sync.set({ futureDimEnabled });
          tweakTimesheetFuture(futureDimEnabled);
        } catch (e) { /* extension reloaded mid-session */ }
      });

      anchor.insertAdjacentElement('afterend', btn);
    } catch (e) { clearInterval(poll); }
  }, 400);
}

// =============================================================================
// COMMENT DRAFTS (chrome.storage.local)
// Auto-saves comment drafts per task to chrome.storage.local under the key
// "scoro_draft_{taskId}". On page load, restores draft into the TinyMCE
// editor and hides the placeholder. Shows a discard modal on cancel if
// a draft exists. Drafts are cleared on successful post or explicit discard.
// =============================================================================

function getTaskId() {
  // Extract ID from URL: https://.../tasks/view/12345/...
  const match = location.href.match(/\/tasks\/view\/(\d+)/);
  return match ? match[1] : null;
}

function findCommentEditorIframe() {
  // Find a comment-specific button first, then locate the iframe in the same container.
  // This avoids false-matching the task description TinyMCE editor.
  const commentAnchor = document.querySelector('.js-edit-comment-button, .js-cancel-comment, .js-comment-cancel');
  if (commentAnchor) {
    let el = commentAnchor.parentElement;
    for (let i = 0; i < 8; i++) {
      if (!el) break;
      const iframe = el.querySelector('iframe.tox-edit-area__iframe');
      if (iframe) return iframe;
      el = el.parentElement;
    }
  }
  // Fallback: if comment box is not yet open there are no buttons visible.
  // Return null so the poll retries — do NOT fall back to any TinyMCE iframe,
  // as that could match the description editor.
  return null;
}

function initCommentDrafts(enabled) {
  if (!enabled) return;
  if (!isTaskPage()) return;

  const taskId = getTaskId();
  if (!taskId) return;

  const storageKey = `scoro_draft_${taskId}`;

  // --- NEW: Status Indicator Logic ---
  let statusEl = null;

  const showStatus = (msg, autoHide = false) => {
    if (!statusEl) {
      statusEl = document.createElement('div');
      Object.assign(statusEl.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '10px 15px',
        background: '#333',
        color: '#fff',
        borderRadius: '6px',
        zIndex: '999999',
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s ease',
        opacity: '0',
        pointerEvents: 'none'
      });
      document.body.appendChild(statusEl);
      // Trigger reflow for transition
      requestAnimationFrame(() => statusEl.style.opacity = '1');
    }
    statusEl.textContent = msg;
    statusEl.style.opacity = '1';

    if (autoHide) {
      setTimeout(() => {
        if (statusEl) statusEl.style.opacity = '0';
        setTimeout(() => { if (statusEl) statusEl.remove(); statusEl = null; }, 300);
      }, 3000);
    }
  };

  const hideStatus = () => {
    if (statusEl) {
      statusEl.style.opacity = '0';
      setTimeout(() => { if (statusEl) statusEl.remove(); statusEl = null; }, 300);
    }
  };

  // Initial check state
  showStatus('Checking for drafts...');

  // Helper to open the comment box if closed
  const ensureCommentBoxOpen = () => {
    // Scoro usually has a button or a collapsed div that needs clicking
    // Let's try to find common selectors for the "Add Comment" button
    const addCommentBtn = document.querySelector('.js-add-comment, .js-comment-add, .comment-box-collapsed, button.add-comment');
    if (addCommentBtn && addCommentBtn.offsetParent !== null) { // Check if visible
      // Only click if the editor is NOT already visible
      if (!document.querySelector('.tox-edit-area__iframe')) {
        console.log('Scoro Fix: Auto-opening comment box...');
        addCommentBtn.click();
      }
    }
  };

  // Check if we already found the draft to avoid showing "Restoring" in loop
  let draftFoundAndWaiting = false;

  // We need to attach to the editor similarly to the resize logic
  const attachDraftLogic = () => {
    // Attempt to open the box first if we have a draft
    // But we need to check if draft exists before opening, to avoid annoyance
    // So we do this check ONCE at the start, or inside the loop?
    // Let's check storage first.
    // Let's check storage first.
    try {
      // Check if extension context is valid
      if (!chrome || !chrome.runtime || !chrome.runtime.id) {
        throw new Error('Extension context invalidated');
      }

      if (!chrome.storage || !chrome.storage.local) {
        console.warn('Scoro Fix: chrome.storage.local not available');
        return;
      }

      chrome.storage.local.get([storageKey], (result) => {
        const draft = result[storageKey];
        if (draft && draft.trim().length > 0) {
          // Draft exists!
          // Draft exists!

          // FIX: Only show status if we haven't already attached to the editor for this session.
          // If the editor is already attached, it means we are either editing the draft or typing a new one.
          // In that case, we shouldn't announce "Draft found" again.
          const existingIframe = document.querySelector('iframe.tox-edit-area__iframe') || document.getElementById('mce_0_ifr');
          const alreadyAttached = existingIframe && existingIframe.dataset.draftAttached === "true";

          if (!draftFoundAndWaiting && !alreadyAttached) {
            showStatus('Draft found. Restoring...');
            draftFoundAndWaiting = true;
          }

          // 1. Ensure box is open
          ensureCommentBoxOpen();

          // 2. Now look for the editor — only the comment editor, not task description
          const iframe = findCommentEditorIframe();
          if (!iframe) return;

          // Check if we already attached to this specific iframe instance
          if (iframe.dataset.draftAttached === "true") {
            // If already attached, we might still need to hide placeholder if it reappeared?
            // But let's respect the "attached" state to avoid re-injecting.
            try {
              if (!iframe.contentDocument || !iframe.contentDocument.body.dataset.draftObserved) {
                iframe.dataset.draftAttached = "false";
              } else {
                return;
              }
            } catch (e) { return; }
          }

          try {
            const doc = iframe.contentDocument;
            if (!doc) return;
            const body = doc.body;
            if (!body) return;

            console.log('Scoro Fix: Editor found. Attaching draft saver...');
            iframe.dataset.draftAttached = "true";
            body.dataset.draftObserved = "true";

            // 3. Restore Draft
            const currentText = body.textContent.trim();
            if (currentText === '') {
              console.log('Restoring draft for task', taskId);
              body.innerHTML = draft;
              showStatus('Draft restored ✨', true);


              // 4. Hide Placeholder
              // Dispatch events to make TinyMCE realize there is content
              body.dispatchEvent(new Event('input', { bubbles: true }));
              body.dispatchEvent(new Event('change', { bubbles: true }));

              // Also manually hide the placeholder element if we can find it
              // It's often a sibling or parent sibling
              const container = iframe.closest('.tox-tinymce');
              if (container && container.parentElement) {
                // Fix: Previous attempt hid the whole editor.
                // Instead of generic class selection, let's find the element containing the specific text.
                // And set its text to empty string as requested.

                const candidates = container.parentElement.querySelectorAll('*');
                for (const cand of candidates) {
                  // Check for the specific Scoro placeholder text
                  if (cand.textContent && cand.textContent.includes('Use the @-sign') && !cand.contains(container)) {
                    // Verify it's not the editor itself or a huge container
                    // It should be relatively small or an overlay
                    // But setting textContent to empty is safer than display:none if targeted correctly
                    if (cand.children.length === 0 || cand.tagName === 'LABEL' || cand.classList.contains('placeholder')) {
                      console.log('Scoro Fix: Clearing placeholder text...');
                      cand.textContent = '';
                      // Also try to hide it via visibility if it's an overlay
                      cand.style.visibility = 'hidden';
                      break; // Found it
                    }
                  }
                }
              }
            }

            // 5. Setup Save Listeners
            // Debounce saving
            let saveTimeout;
            let isDiscarding = false; // Flag to prevent saving when discarding

            const saveDraft = () => {
              if (isDiscarding) return; // Don't save if we are discarding
              if (saveTimeout) clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                if (isDiscarding) return; // Double check inside timeout

                // FIX: Check runtime before accessing storage in async callback
                if (!chrome.runtime || !chrome.runtime.id) return;

                const content = body.innerHTML;
                // If empty, maybe remove from storage?
                // Or just save empty string.
                if (body.textContent.trim() === '') {
                  chrome.storage.local.remove(storageKey);
                } else {
                  chrome.storage.local.set({ [storageKey]: content });
                }
              }, 1000); // 1 second debounce
            };

            doc.addEventListener('input', saveDraft);
            doc.addEventListener('keyup', saveDraft);
            doc.addEventListener('paste', saveDraft);
            doc.addEventListener('cut', saveDraft);

            // 5b. Attach Post Listener (Discard Draft on Post)
            try {
              const container = iframe.closest('.tox-tinymce');
              let postBtn = null;
              if (container) {
                let curr = container.parentElement;
                for (let i = 0; i < 6; i++) {
                  if (!curr) break;
                  const found = curr.querySelector('.js-edit-comment-button');
                  if (found) { postBtn = found; break; }
                  curr = curr.parentElement;
                }
              }
              if (postBtn && postBtn.dataset.draftPostAttached !== 'true') {
                postBtn.dataset.draftPostAttached = 'true';
                postBtn.addEventListener('click', () => {
                  console.log('Scoro Fix: Post clicked — discarding draft');
                  if (saveTimeout) clearTimeout(saveTimeout);
                  saveTimeout = null;
                  isDiscarding = true;
                  draftFoundAndWaiting = false;
                  chrome.storage.local.remove(storageKey);
                }, true);
              }
            } catch (e) {
              console.log('Scoro Fix: Error attaching post listener', e);
            }

            // 6. Attach Cancel Listener (Discard Draft)
            try {
              const container = iframe.closest('.tox-tinymce');
              if (container) {
                // console.log('Scoro Fix: Searching for Cancel button...');
                let cancelBtn = null;

                // Strategy: Traverse up parent levels and search down for the button
                // The button is often OUTSIDE the form that contains the editor on new Scoro
                let curr = container.parentElement;
                for (let i = 0; i < 6; i++) { // Go up max 6 levels
                  if (!curr) break;
                  // Try specific class first
                  const found = curr.querySelector('.js-cancel-comment, .js-comment-cancel');
                  if (found) {
                    cancelBtn = found;
                    // console.log(`Scoro Fix: Found Cancel button via class at level ${i}`, found);
                    break;
                  }
                  curr = curr.parentElement;
                }

                // Fallback: If still not found, search for generic text "Cancel"
                if (!cancelBtn) {
                  curr = container.parentElement;
                  for (let i = 0; i < 5; i++) {
                    if (!curr) break;
                    const buttons = curr.querySelectorAll('a, button, span');
                    for (const btn of buttons) {
                      if (btn.textContent && btn.textContent.trim().toLowerCase() === 'cancel') {
                        // Visible check might be tricky if it has .hide class but display:inline style
                        // Let's trust text content for now
                        cancelBtn = btn;
                        // console.log(`Scoro Fix: Found Generic Cancel button at level ${i}`, btn);
                        break;
                      }
                    }
                    if (cancelBtn) break;
                    curr = curr.parentElement;
                  }
                }

                if (cancelBtn) {
                  if (cancelBtn.dataset.draftCancelAttached !== "true") {
                    cancelBtn.dataset.draftCancelAttached = "true";
                    console.log('Scoro Fix: Attaching Cancel listener to:', cancelBtn);

                    // Helper: show a custom modal instead of native confirm()
                    const showDiscardModal = (onConfirm, onCancel) => {
                      // Remove any existing modal
                      const existing = document.getElementById('scoro-draft-modal');
                      if (existing) existing.remove();

                      const overlay = document.createElement('div');
                      overlay.id = 'scoro-draft-modal';
                      overlay.style.cssText = `
                        position: fixed; inset: 0; z-index: 999999;
                        display: flex; align-items: center; justify-content: center;
                        background: rgba(0,0,0,0.35); backdrop-filter: blur(2px);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      `;

                      const dialog = document.createElement('div');
                      dialog.style.cssText = `
                        background: #fff; border-radius: 12px;
                        padding: 28px 32px 24px; min-width: 300px; max-width: 380px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                        text-align: center;
                      `;

                      const title = document.createElement('p');
                      title.textContent = 'Discard this draft? ✨';
                      title.style.cssText = `
                        margin: 0 0 24px; font-size: 17px; font-weight: 600;
                        color: #1a1a1a; line-height: 1.4;
                      `;

                      const btnRow = document.createElement('div');
                      btnRow.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

                      const keepBtn = document.createElement('button');
                      keepBtn.textContent = 'Keep draft';
                      keepBtn.style.cssText = `
                        flex: 1; padding: 10px 16px; border-radius: 8px; border: 1.5px solid #d0d0d0;
                        background: #fff; color: #333; font-size: 14px; font-weight: 500;
                        cursor: pointer; transition: background 0.15s;
                      `;
                      keepBtn.onmouseenter = () => keepBtn.style.background = '#f5f5f5';
                      keepBtn.onmouseleave = () => keepBtn.style.background = '#fff';

                      const discardBtn = document.createElement('button');
                      discardBtn.textContent = 'Discard';
                      discardBtn.style.cssText = `
                        flex: 1; padding: 10px 16px; border-radius: 8px; border: none;
                        background: #e53935; color: #fff; font-size: 14px; font-weight: 600;
                        cursor: pointer; transition: background 0.15s;
                      `;
                      discardBtn.onmouseenter = () => discardBtn.style.background = '#c62828';
                      discardBtn.onmouseleave = () => discardBtn.style.background = '#e53935';

                      keepBtn.addEventListener('click', () => { overlay.remove(); onCancel(); });
                      discardBtn.addEventListener('click', () => { overlay.remove(); onConfirm(); });
                      // Click outside to keep draft
                      overlay.addEventListener('click', (ev) => { if (ev.target === overlay) { overlay.remove(); onCancel(); } });

                      btnRow.appendChild(keepBtn);
                      btnRow.appendChild(discardBtn);
                      dialog.appendChild(title);
                      dialog.appendChild(btnRow);
                      overlay.appendChild(dialog);
                      document.body.appendChild(overlay);
                      discardBtn.focus();
                    };

                    const cancelHandler = (e) => {
                      console.log('Scoro Fix: Cancel clicked/triggered');

                      // Stop any pending save immediately
                      if (saveTimeout) clearTimeout(saveTimeout);
                      saveTimeout = null;

                      try {
                        if (doc && doc.body && doc.body.textContent.trim() === '') {
                          return; // Empty draft — just let Scoro close normally
                        }
                      } catch (err) { return; }

                      // Prevent Scoro from closing the box immediately
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();

                      showDiscardModal(
                        // onConfirm — user clicked "Discard"
                        () => {
                          console.log('Scoro Fix: Discarding draft');
                          isDiscarding = true;
                          chrome.storage.local.remove(storageKey);
                          draftFoundAndWaiting = false;
                          // Remove our listener then re-click so Scoro closes the box
                          cancelBtn.removeEventListener('click', cancelHandler, true);
                          cancelBtn.click();
                        },
                        // onCancel — user clicked "Keep draft" or clicked outside
                        () => {
                          console.log('Scoro Fix: Keep draft');
                          // Box stays open, draft intact
                        }
                      );
                    };

                    cancelBtn.addEventListener('click', cancelHandler, true);
                  }
                } else {
                  // console.warn('Scoro Fix: Cancel button NOT found');
                }
              }
            } catch (e) {
              console.log('Scoro Fix: Error attaching cancel listener', e);
            }

          } catch (e) {
            console.log('Scoro Fix: Could not attach draft logic', e);
          }
        } else {
          // No draft found
          if (!draftFoundAndWaiting) {
            hideStatus();
          }

          // No draft, but we still want to attach listeners for NEW drafts
          const iframe = findCommentEditorIframe();
          if (iframe && iframe.dataset.draftAttached !== "true") {
            // Attach listeners only
            try {
              const doc = iframe.contentDocument;
              if (doc && doc.body) {
                iframe.dataset.draftAttached = "true";
                doc.body.dataset.draftObserved = "true";

                let saveTimeout;
                let isDiscarding = false;

                const saveDraft = () => {
                  if (isDiscarding) return;
                  if (saveTimeout) clearTimeout(saveTimeout);
                  saveTimeout = setTimeout(() => {
                    if (isDiscarding) return;
                    if (!chrome.runtime || !chrome.runtime.id) return;
                    const content = doc.body.innerHTML;
                    if (doc.body.textContent.trim() === '') {
                      chrome.storage.local.remove(storageKey);
                    } else {
                      chrome.storage.local.set({ [storageKey]: content });
                    }
                  }, 1000);
                };
                doc.addEventListener('input', saveDraft);
                doc.addEventListener('keyup', saveDraft);
                doc.addEventListener('paste', saveDraft);
                doc.addEventListener('cut', saveDraft);

                // Attach Post listener for new drafts
                try {
                  const container = iframe.closest('.tox-tinymce');
                  let postBtn = null;
                  if (container) {
                    let curr = container.parentElement;
                    for (let i = 0; i < 6; i++) {
                      if (!curr) break;
                      const found = curr.querySelector('.js-edit-comment-button');
                      if (found) { postBtn = found; break; }
                      curr = curr.parentElement;
                    }
                  }
                  if (postBtn && postBtn.dataset.draftPostAttached !== 'true') {
                    postBtn.dataset.draftPostAttached = 'true';
                    postBtn.addEventListener('click', () => {
                      console.log('Scoro Fix: Post clicked — discarding draft');
                      if (saveTimeout) clearTimeout(saveTimeout);
                      saveTimeout = null;
                      isDiscarding = true;
                      chrome.storage.local.remove(storageKey);
                    }, true);
                  }
                } catch (e) { }

                // Also attach cancel listener for new drafts
                try {
                  const container = iframe.closest('.tox-tinymce');
                  if (container) {
                    let cancelBtn = null;
                    let curr = container.parentElement;
                    for (let i = 0; i < 6; i++) {
                      if (!curr) break;
                      const found = curr.querySelector('.js-cancel-comment, .js-comment-cancel');
                      if (found) { cancelBtn = found; break; }
                      curr = curr.parentElement;
                    }

                    if (cancelBtn && cancelBtn.dataset.draftCancelAttached !== "true") {
                      cancelBtn.dataset.draftCancelAttached = "true";

                      const showDiscardModal = (onConfirm, onCancel) => {
                        const existing = document.getElementById('scoro-draft-modal');
                        if (existing) existing.remove();
                        const overlay = document.createElement('div');
                        overlay.id = 'scoro-draft-modal';
                        overlay.style.cssText = `position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(2px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;`;
                        const dialog = document.createElement('div');
                        dialog.style.cssText = `background:#fff;border-radius:12px;padding:28px 32px 24px;min-width:300px;max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.18);text-align:center;`;
                        const title = document.createElement('p');
                        title.textContent = 'Discard this draft? ✨';
                        title.style.cssText = `margin:0 0 24px;font-size:17px;font-weight:600;color:#1a1a1a;line-height:1.4;`;
                        const btnRow = document.createElement('div');
                        btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';
                        const keepBtn = document.createElement('button');
                        keepBtn.textContent = 'Keep draft';
                        keepBtn.style.cssText = `flex:1;padding:10px 16px;border-radius:8px;border:1.5px solid #d0d0d0;background:#fff;color:#333;font-size:14px;font-weight:500;cursor:pointer;`;
                        const discardBtn = document.createElement('button');
                        discardBtn.textContent = 'Discard';
                        discardBtn.style.cssText = `flex:1;padding:10px 16px;border-radius:8px;border:none;background:#e53935;color:#fff;font-size:14px;font-weight:600;cursor:pointer;`;
                        keepBtn.addEventListener('click', () => { overlay.remove(); onCancel(); });
                        discardBtn.addEventListener('click', () => { overlay.remove(); onConfirm(); });
                        overlay.addEventListener('click', (ev) => { if (ev.target === overlay) { overlay.remove(); onCancel(); } });
                        btnRow.appendChild(keepBtn);
                        btnRow.appendChild(discardBtn);
                        dialog.appendChild(title);
                        dialog.appendChild(btnRow);
                        overlay.appendChild(dialog);
                        document.body.appendChild(overlay);
                        discardBtn.focus();
                      };

                      const cancelHandler = (e) => {
                        // Stop any pending save immediately
                        if (saveTimeout) clearTimeout(saveTimeout);
                        saveTimeout = null;

                        // Check if there's anything worth confirming
                        const hasContent = doc && doc.body && doc.body.textContent.trim() !== '';
                        // Also check storage in case debounce already fired
                        chrome.storage.local.get([storageKey], (result) => {
                          const hasSavedDraft = result[storageKey] && result[storageKey].trim().length > 0;
                          if (!hasContent && !hasSavedDraft) return; // Nothing to discard

                          // We need to prevent Scoro from closing — but we're in async context now.
                          // So we must stop the event synchronously (before this async check).
                          // This is handled by the outer synchronous stop below.
                        });

                        // Synchronous check on body content
                        try {
                          if (doc && doc.body && doc.body.textContent.trim() === '') {
                            // Body is empty — but draft might be in storage already (debounce fired)
                            // We'll still show modal; it will be a no-op if storage is also empty.
                            // Actually, let's just let it close if body is empty.
                            return;
                          }
                        } catch (err) { return; }

                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        showDiscardModal(
                          () => {
                            isDiscarding = true;
                            chrome.storage.local.remove(storageKey);
                            cancelBtn.removeEventListener('click', cancelHandler, true);
                            cancelBtn.click();
                          },
                          () => { /* Keep draft — box stays open */ }
                        );
                      };

                      cancelBtn.addEventListener('click', cancelHandler, true);
                    }
                  }
                } catch (e) { }
              }
            } catch (e) { }
          }
        }
      });
    } catch (e) {
      // Stop the interval if context is invalidated to prevent loop
      const isInvalidated = e.message && (
        e.message.includes('Extension context invalidated') ||
        e.message.includes('context invalidated')
      );

      if (isInvalidated) {
        if (window._scoroDraftInterval) {
          clearInterval(window._scoroDraftInterval);
          window._scoroDraftInterval = null;
        }
      } else {
        console.warn('Scoro Fix: Error accessing storage', e);
      }
    }
  };

  // Run immediately and then poll because editor loads async
  attachDraftLogic();
  // Using a separate interval or reusing the resize one? 
  // Let's verify if we can reuse or just set a new one.
  // To avoid too many intervals, let's just use a new one for now as it's safer than modifying the other function heavily.
  if (window._scoroDraftInterval) clearInterval(window._scoroDraftInterval);
  window._scoroDraftInterval = setInterval(attachDraftLogic, 2000);
}

// =============================================================================
// ROLE HOUR TOTALS — shared pure helper (also unit-testable via Node)
// Groups line items by role/product name (paarotLines[][product_name] on the
// modify page, td[1] on the view page) and sums external + internal hours
// across the WHOLE offer — all sections combined, not just one section.
// External hours only count for rows whose unit is an hour variant (matches
// the existing per-section rule); internal hours are summed regardless of
// unit, since c_internalhours is already a raw hour figure. Roles whose
// combined total is 0 are dropped, so flat-fee / non-personnel line items
// (e.g. "pcs" cost lines with no internal hours logged) never show up here.
// =============================================================================
function computeRoleTotals(rows) {
  const totals = new Map(); // name -> { ext, int }

  rows.forEach(({ name, unit, qty, internal }) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return;

    const isHourUnit = unit === 'hour' || unit === 'óra' || unit === 'h' || unit === 'hrs';
    const ext = isHourUnit ? (qty || 0) : 0;
    const int = internal || 0;
    if (ext === 0 && int === 0) return;

    const existing = totals.get(cleanName) || { ext: 0, int: 0 };
    existing.ext += ext;
    existing.int += int;
    totals.set(cleanName, existing);
  });

  // Highest combined hours first — most significant roles surface at the top.
  return Array.from(totals, ([name, { ext, int }]) => ({ name, ext, int }))
    .sort((a, b) => (b.ext + b.int) - (a.ext + a.int));
}

// Renders the "per role" block as a single <tr>, shared by both the modify
// and view page injectors. Returns null if there's nothing to show.
function renderRoleTotalsRow(roleTotals, cols) {
  if (!roleTotals.length) return null;

  const rowsHtml = roleTotals.map(({ name, ext, int }) => `
      <div style="display:flex;justify-content:space-between;gap:24px;padding:2px 0;">
        <span>${name}</span>
        <span style="white-space:nowrap;">
          <span style="margin-right:14px;color:#e53935;font-weight:600;">🌍 ${ext} h</span>
          <span style="color:#7b1fa2;font-weight:600;">🏠 ${int} h</span>
        </span>
      </div>`).join('');

  const tr = document.createElement('tr');
  tr.className = 'scoro-ext-role-totals';
  tr.innerHTML = `<td colspan="${cols}" style="padding:10px 14px;font-size:12px;font-family:Inter,sans-serif;background:#f3f0fa;border-top:1px solid #e0d5f0;">
      <strong style="display:block;margin-bottom:4px;">Szerepkörönként összesítve (teljes ajánlat):</strong>
      ${rowsHtml}
    </td>`;
  return tr;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeRoleTotals };
}

// =============================================================================
// OFFER HOUR SUMMARIES
// On quote modify pages, sums external (kiajánlott) and internal hours per
// section header, and shows a grand total at the bottom of the offer.
// Applies to: /quotes/modify/ pages
// =============================================================================

function isQuoteModifyPage() {
  return /\/quotes\/modify\//.test(location.href);
}

function isQuoteViewPage() {
  return /\/quotes\/view\//.test(location.href);
}

function parseOfferNumber(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[\s ]/g, '').replace(',', '.')) || 0;
}

let _offerSummaryTimer = null;
let _offerSummaryInjecting = false;

function scheduleOfferHourSummaries() {
  if (_offerSummaryTimer) clearTimeout(_offerSummaryTimer);
  _offerSummaryTimer = setTimeout(injectOfferHourSummaries, 400);
}

function injectOfferHourSummaries() {
  if (!isQuoteModifyPage() || _offerSummaryInjecting) return;
  _offerSummaryInjecting = true;

  document.querySelectorAll('.scoro-ext-hour-summary, .scoro-ext-grand-total, .scoro-ext-role-totals').forEach(el => el.remove());

  const allRows = Array.from(document.querySelectorAll('tr.paarotLine:not(#templateRow)'));
  const sections = [];
  let current = null;

  for (const row of allRows) {
    if (row.classList.contains('headerLine')) {
      current = { header: row, products: [] };
      sections.push(current);
    } else if (current && row.classList.contains('js-validation-container') && !row.classList.contains('ignore')) {
      current.products.push(row);
    }
  }

  let grandExt = 0, grandInt = 0;
  const allRoleRows = []; // flat list across every section, for the project-wide per-role rollup

  sections.forEach(({ header, products }) => {
    let extHours = 0, intHours = 0;

    products.forEach(row => {
      const unit = row.querySelector('input[name="paarotLines[][unit_name]"]')?.value?.toLowerCase().trim() || '';
      const qty = parseOfferNumber(row.querySelector('input[name="paarotLines[][amount]"]')?.value);
      const internal = parseOfferNumber(row.querySelector('input[name="paarotLines[][custom_field][c_internalhours]"]')?.value);
      const name = row.querySelector('input[name="paarotLines[][product_name]"]')?.value || '';

      if (unit === 'hour' || unit === 'óra' || unit === 'h' || unit === 'hrs') extHours += qty;
      intHours += internal;
      allRoleRows.push({ name, unit, qty, internal });
    });

    grandExt += extHours;
    grandInt += intHours;

    const cols = header.querySelectorAll('td').length || 10;
    const tr = document.createElement('tr');
    tr.className = 'scoro-ext-hour-summary';
    tr.innerHTML = `<td colspan="${cols}" style="padding:4px 14px 5px;font-size:12px;font-family:Inter,sans-serif;background:#fafafa;border-bottom:1px solid #e8e8e8;">
      <span style="margin-right:18px;color:#e53935;font-weight:600;">🌍 Kiajánlott: ${extHours} h</span>
      <span style="color:#7b1fa2;font-weight:600;">🏠 Belső: ${intHours} h</span>
    </td>`;
    header.insertAdjacentElement('afterend', tr);
  });

  const totalRow = document.querySelector('tr.total');
  if (totalRow) {
    const cols = totalRow.querySelectorAll('td').length || 10;
    const tr = document.createElement('tr');
    tr.className = 'scoro-ext-grand-total';
    tr.innerHTML = `<td colspan="${cols}" style="padding:8px 14px;font-size:13px;font-family:Inter,sans-serif;background:#fff8e1;border-top:2px solid #ffc107;">
      <strong style="margin-right:14px;">Teljes ajánlat összesítő:</strong>
      <span style="margin-right:18px;color:#e53935;font-weight:600;">🌍 Kiajánlott: ${grandExt} h</span>
      <span style="color:#7b1fa2;font-weight:600;">🏠 Belső: ${grandInt} h</span>
    </td>`;
    totalRow.insertAdjacentElement('afterend', tr);

    const roleRow = renderRoleTotalsRow(computeRoleTotals(allRoleRows), cols);
    if (roleRow) tr.insertAdjacentElement('afterend', roleRow);
  }

  setTimeout(() => { _offerSummaryInjecting = false; }, 50);
}

function initOfferHourSummaries() {
  if (!isQuoteModifyPage()) return;

  // Wait for section header rows to appear (page loads async)
  const poll = setInterval(() => {
    if (document.querySelector('tr.paarotLine.headerLine')) {
      clearInterval(poll);
      injectOfferHourSummaries();
    }
  }, 300);

  // Re-inject when user edits quantity, unit, internal hours, or the role/product name
  // (product_name added in V1.8.1 so the per-role rollup stays in sync when a role changes)
  document.addEventListener('input', (e) => {
    const n = e.target?.name || '';
    if (n === 'paarotLines[][amount]' || n === 'paarotLines[][unit_name]' ||
        n === 'paarotLines[][custom_field][c_internalhours]' || n === 'paarotLines[][product_name]') {
      scheduleOfferHourSummaries();
    }
  }, true);

  // Autosuggest widgets (like the role picker) often set .value via JS and fire
  // 'change' instead of 'input' when a suggestion is clicked — cover both.
  document.addEventListener('change', (e) => {
    if (e.target?.name === 'paarotLines[][product_name]') {
      scheduleOfferHourSummaries();
    }
  }, true);

  // Re-inject when rows are added or removed
  const rowObserver = new MutationObserver((mutations) => {
    if (_offerSummaryInjecting) return;
    for (const m of mutations) {
      for (const node of [...m.addedNodes, ...m.removedNodes]) {
        if (node.nodeType === 1 && node.tagName === 'TR' &&
            node.classList?.contains('paarotLine') &&
            !node.classList?.contains('scoro-ext-hour-summary')) {
          scheduleOfferHourSummaries();
          return;
        }
      }
    }
  });
  rowObserver.observe(document.body, { childList: true, subtree: true });
}

// =============================================================================
// QUOTE BACK TO FINANCES BUTTON
// On quote view pages, injects a "← Vissza a pénzügyekhez" button that links
// back to the project's finances tab.
// Applies to: /quotes/view/ pages
// =============================================================================

function initQuoteBackButton() {
  if (!isQuoteViewPage()) return;

  const poll = setInterval(() => {
    const projectInput = document.querySelector('input[name="project_id"]');
    if (!projectInput || !projectInput.value) return;

    clearInterval(poll);
    if (document.getElementById('scoro-ext-back-btn')) return;

    const projectId = projectInput.value;
    const financesUrl = `${location.origin}/projects/view/${projectId}/finances`;

    const btn = document.createElement('a');
    btn.id = 'scoro-ext-back-btn';
    btn.href = financesUrl;
    btn.textContent = '← Back to the project\'s finances';
    btn.style.cssText = `
      display: inline-block;
      margin: 8px 16px 4px 0;
      padding: 5px 12px;
      font-size: 13px;
      font-family: Inter, sans-serif;
      font-weight: 500;
      color: #1a73e8;
      background: #e8f0fe;
      border: 1px solid #c5d8fc;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s;
    `;
    btn.onmouseenter = () => btn.style.background = '#d2e3fc';
    btn.onmouseleave = () => btn.style.background = '#e8f0fe';

    // Inject before the first h1/h2 or the main content wrapper
    const anchor = document.querySelector('.salesdoc-view-header, .view-header, h1, .layout-title, .page-header')
      || document.querySelector('.layout-table');
    if (anchor) {
      anchor.insertAdjacentElement('beforebegin', btn);
    } else {
      document.body.prepend(btn);
    }
  }, 300);
}

// =============================================================================
// OFFER HOUR SUMMARIES — VIEW PAGE
// Same as the modify-page version but reads from rendered text cells instead
// of input fields, since the view page has no editable inputs.
// Applies to: /quotes/view/ pages
// =============================================================================

function injectOfferHourSummariesView() {
  if (!isQuoteViewPage()) return;

  document.querySelectorAll('.scoro-ext-hour-summary, .scoro-ext-grand-total, .scoro-ext-role-totals').forEach(el => el.remove());

  const table = document.querySelector('table.calculation-table');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tr'));
  const sections = [];
  let current = null;
  let lastProduct = null;

  for (const row of rows) {
    const isNobr = row.getAttribute('nobr') === 'true';

    if (isNobr && row.querySelector('td h4')) {
      // Section header row
      current = { header: row, products: [] };
      sections.push(current);
      lastProduct = null;
    } else if (isNobr && current) {
      // Product row — role/product name in td[1], qty in td[2], unit in td[3]
      const tds = row.querySelectorAll('td');
      if (tds.length >= 4) {
        // td[1] holds the role/product name AND, when a description is filled in,
        // a nested ".secondary-info" div with that description text (view-page
        // equivalent of the edit page's separate paarotLines[][comment] textarea).
        // Strip it out first so the description doesn't get glued onto the name.
        let nameText = '';
        if (tds[1]) {
          const nameCell = tds[1].cloneNode(true);
          nameCell.querySelectorAll('.secondary-info').forEach(el => el.remove());
          nameText = nameCell.textContent.trim();
        }
        lastProduct = {
          name: nameText,
          qty: parseOfferNumber(tds[2]?.textContent),
          unit: tds[3]?.textContent?.toLowerCase().trim() || '',
          internalHours: 0
        };
        current.products.push(lastProduct);
      }
    } else if (row.classList.contains('custom-field-row') && lastProduct) {
      // Check if this custom field row contains internal hours
      const label = row.querySelector('td:first-child')?.textContent?.toLowerCase().trim() || '';
      // Match only the raw "internal hours" label — exclude cost/rate/margin rows
      // that also contain "internal" and "hour" but store currency values
      if ((label === 'internal hours:' || label === 'internal hours' || label === 'belső órák:' || label === 'belső órák') ||
          (label.includes('internal') && label.includes('hour') && !label.includes('cost') && !label.includes('rate') && !label.includes('margin'))) {
        const valTd = row.querySelector('td.cf-td:not(.bold)');
        lastProduct.internalHours = parseOfferNumber(valTd?.textContent);
      }
    }
  }

  let grandExt = 0, grandInt = 0;
  const allRoleRows = []; // flat list across every section, for the project-wide per-role rollup

  sections.forEach(({ header, products }) => {
    let extHours = 0, intHours = 0;

    products.forEach(p => {
      if (p.unit === 'hour' || p.unit === 'óra' || p.unit === 'h' || p.unit === 'hrs') extHours += p.qty;
      intHours += p.internalHours;
      allRoleRows.push({ name: p.name, unit: p.unit, qty: p.qty, internal: p.internalHours });
    });

    grandExt += extHours;
    grandInt += intHours;

    const cols = header.querySelectorAll('td').length || 8;
    const tr = document.createElement('tr');
    tr.className = 'scoro-ext-hour-summary';
    tr.innerHTML = `<td colspan="${cols}" style="padding:4px 14px 5px;font-size:12px;font-family:Inter,sans-serif;background:#fafafa;border-bottom:1px solid #e8e8e8;">
      <span style="margin-right:18px;color:#e53935;font-weight:600;">🌍 Kiajánlott: ${extHours} h</span>
      <span style="color:#7b1fa2;font-weight:600;">🏠 Belső: ${intHours} h</span>
    </td>`;
    header.insertAdjacentElement('afterend', tr);
  });

  // Grand total before the first total-block-row (Subtotal)
  const subtotalRow = document.querySelector('tr.total-block-row');
  if (subtotalRow) {
    const cols = subtotalRow.querySelectorAll('td').length || 8;
    const tr = document.createElement('tr');
    tr.className = 'scoro-ext-grand-total';
    tr.innerHTML = `<td colspan="${cols}" style="padding:8px 14px;font-size:13px;font-family:Inter,sans-serif;background:#fff8e1;border-top:2px solid #ffc107;">
      <strong style="margin-right:14px;">Teljes ajánlat összesítő:</strong>
      <span style="margin-right:18px;color:#e53935;font-weight:600;">🌍 Kiajánlott: ${grandExt} h</span>
      <span style="color:#7b1fa2;font-weight:600;">🏠 Belső: ${grandInt} h</span>
    </td>`;
    subtotalRow.insertAdjacentElement('beforebegin', tr);

    const roleRow = renderRoleTotalsRow(computeRoleTotals(allRoleRows), cols);
    if (roleRow) tr.insertAdjacentElement('afterend', roleRow);
  }
}

function initOfferHourSummariesView() {
  if (!isQuoteViewPage()) return;

  const poll = setInterval(() => {
    if (document.querySelector('table.calculation-table')) {
      clearInterval(poll);
      injectOfferHourSummariesView();
    }
  }, 300);
}

// =============================================================================
// TIMESHEET FUTURE DATE WARNING
// Shows a popup when the user enters time on a future date.
// Dismissed permanently with "Uh, köszi" or snoozed 10 min with the other button.
// Applies to: /tasks/timesheet pages
// =============================================================================

function initTimesheetFutureWarning() {
  if (!isTimesheetPage()) return;

  const SNOOZE_KEY = 'scoro_future_time_snooze';

  const isSnoozed = () => {
    const until = localStorage.getItem(SNOOZE_KEY);
    return until && Date.now() < parseInt(until);
  };

  const showWarning = () => {
    if (isSnoozed() || document.getElementById('scoro-future-time-popup')) return;

    const overlay = document.createElement('div');
    overlay.id = 'scoro-future-time-popup';
    overlay.style.cssText = `position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(2px);font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;`;

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:#fff;border-radius:12px;padding:28px 32px 24px;min-width:300px;max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.18);text-align:center;`;

    const title = document.createElement('p');
    title.textContent = "⏰ You're logging time on a future date!";
    title.style.cssText = `margin:0 0 24px;font-size:17px;font-weight:600;color:#1a1a1a;line-height:1.4;`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'Got it';
    okBtn.style.cssText = `flex:1;padding:10px 16px;border-radius:8px;border:none;background:#1a73e8;color:#fff;font-size:14px;font-weight:600;cursor:pointer;`;
    okBtn.addEventListener('click', () => overlay.remove());

    const snoozeBtn = document.createElement('button');
    snoozeBtn.innerHTML = 'Dismiss<br><span style="font-size:11px;font-weight:400;opacity:0.75;">Snooze for 10 min</span>';
    snoozeBtn.style.cssText = `flex:1;padding:10px 16px;border-radius:8px;border:1.5px solid #d0d0d0;background:#fff;color:#333;font-size:14px;font-weight:500;cursor:pointer;`;
    snoozeBtn.addEventListener('click', () => {
      localStorage.setItem(SNOOZE_KEY, Date.now() + 10 * 60 * 1000);
      overlay.remove();
    });

    btnRow.appendChild(okBtn);
    btnRow.appendChild(snoozeBtn);
    dialog.appendChild(title);
    dialog.appendChild(btnRow);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  };

  const checkEntry = (input) => {
    const val = input.value?.trim();
    if (!val || val === '0:00' || val === '0') return;

    const cell = input.closest('[data-date]');
    if (!cell) return;

    const entryDate = new Date(cell.dataset.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (entryDate > today) showWarning();
  };

  document.addEventListener('blur', (e) => {
    if (e.target.classList.contains('js-time-entry-duration')) checkEntry(e.target);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('js-time-entry-duration')) checkEntry(e.target);
  }, true);
}

// =============================================================================
// INIT — Entry Point
// Loads saved settings from chrome.storage.sync and applies all features.
// Dark mode is applied immediately (before DOM) to prevent white flash.
// Other features wait for DOMContentLoaded.
// Also listens for UPDATE_SETTINGS messages from popup.js for live toggling.
// =============================================================================

// Load settings and apply dark mode IMMEDIATELY to prevent flash
chrome.storage.sync.get(['uiRefreshEnabled', 'darkModeEnabled', 'autoGrouppingEnabled'], res => {
  // Apply dark mode first (before page renders)
  darkModeEnabled = res.darkModeEnabled ?? false;
  if (darkModeEnabled) {
    enableDarkMode();
  }

  // Apply other features after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setUiRefresh(res.uiRefreshEnabled ?? true);
      initDropdownNavigation(res.uiRefreshEnabled ?? true);
      initRainbow();
      // Pass autoGrouppingEnabled to initNotificationSorter
      initNotificationSorter(res.autoGrouppingEnabled ?? true);
      // Initialize comment drafts
      initCommentDrafts(true);
      initOfferHourSummaries();
      initOfferHourSummariesView();
      initQuoteBackButton();
      initTimesheetFutureWarning();
      initTimesheetFutureDim();
    });
  } else {
    setUiRefresh(res.uiRefreshEnabled ?? true);
    initDropdownNavigation(res.uiRefreshEnabled ?? true);
    initRainbow();
    initNotificationSorter(res.autoGrouppingEnabled ?? true);
    initCommentDrafts(true);
    initOfferHourSummaries();
    initOfferHourSummariesView();
    initQuoteBackButton();
    initTimesheetFutureWarning();
    initTimesheetFutureDim();
  }
});

// Listen for settings changes
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type !== 'UPDATE_SETTINGS') return;
  if (msg.setting === 'darkModeEnabled') setDarkMode(msg.value);
  if (msg.setting === 'uiRefreshEnabled') {
    setUiRefresh(msg.value);
    initDropdownNavigation(msg.value);
  }
  // Handle toggling of auto grouping on the fly?
  // Usually requires page reload or we can just run it if turned ON.
  // If turned OFF, we can't really "ungroup" easily without reload, so maybe just do nothing or warn.
  // For now, let's just respect it on next load or if they click the button.
  if (msg.setting === 'autoGrouppingEnabled' && msg.value === true) {
    if (isNotificationPage()) initNotificationSorter(true, true);
  }
});
