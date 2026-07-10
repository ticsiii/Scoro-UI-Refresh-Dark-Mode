/**
 * Scoro UI Refresh — Popup Script
 *
 * Controls the extension popup (popup.html) which has three toggle buttons:
 *   1. UI Refresh       (uiRefreshEnabled)      — default: ON
 *   2. Noti Groupping   (autoGrouppingEnabled)   — default: ON
 *   3. Dark Mode        (darkModeEnabled)        — default: OFF
 *
 * Settings are persisted in chrome.storage.sync and changes are immediately
 * sent to the active tab's content.js via:
 *   { type: 'UPDATE_SETTINGS', setting: <key>, value: <boolean> }
 */
document.addEventListener('DOMContentLoaded', () => {
  const btnRefresh = document.getElementById('btn-refresh');
  const btnDarkMode = document.getElementById('btn-darkmode');
  const btnAutoGroup = document.getElementById('btn-autogroup');

  // 1. Load saved settings when popup opens
  chrome.storage.sync.get(['uiRefreshEnabled', 'darkModeEnabled', 'autoGrouppingEnabled'], (result) => {
    updateButtonState(btnRefresh, result.uiRefreshEnabled ?? true); // Default to TRUE
    updateButtonState(btnDarkMode, result.darkModeEnabled ?? false); // Default to FALSE
    updateButtonState(btnAutoGroup, result.autoGrouppingEnabled ?? true); // Default to TRUE
  });

  // 2. Handle UI Refresh Click
  btnRefresh.addEventListener('click', () => {
    const isActive = btnRefresh.classList.contains('active');
    const newState = !isActive;
    updateButtonState(btnRefresh, newState);
    saveSetting('uiRefreshEnabled', newState);
  });

  // 3. Handle Dark Mode Click
  btnDarkMode.addEventListener('click', () => {
    const isActive = btnDarkMode.classList.contains('active');
    const newState = !isActive;
    updateButtonState(btnDarkMode, newState);
    saveSetting('darkModeEnabled', newState);
  });

  // 4. Handle Auto Grouping Click
  btnAutoGroup.addEventListener('click', () => {
    const isActive = btnAutoGroup.classList.contains('active');
    const newState = !isActive;
    updateButtonState(btnAutoGroup, newState);
    saveSetting('autoGrouppingEnabled', newState);
  });

  // Helper functions
  function updateButtonState(button, isActive) {
    if (isActive) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }

  function saveSetting(key, value) {
    // Save to storage
    chrome.storage.sync.set({ [key]: value }, () => {
      // Send message to content script to apply changes immediately
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'UPDATE_SETTINGS',
            setting: key,
            value: value
          });
        }
      });
    });
  }
});
