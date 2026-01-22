// WhatsApp Chat Hider - Popup Script

const blurToggle = document.getElementById('blurToggle');
const intensitySlider = document.getElementById('intensitySlider');
const intensityValue = document.getElementById('intensityValue');
const statusEl = document.getElementById('status');

// Update status display
function updateStatus(enabled) {
  if (enabled) {
    statusEl.textContent = '✓ Chats are blurred - Hover to reveal';
    statusEl.className = 'status active';
  } else {
    statusEl.textContent = '○ Blur is disabled';
    statusEl.className = 'status inactive';
  }
}

// Send message to content script
async function sendToContentScript(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('web.whatsapp.com')) {
      return await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (error) {
    console.log('Could not communicate with WhatsApp tab:', error);
  }
  return null;
}

// Load current settings
async function loadSettings() {
  // Load from storage
  const result = await chrome.storage.sync.get(['blurEnabled', 'blurIntensity']);
  
  const enabled = result.blurEnabled !== undefined ? result.blurEnabled : true;
  const intensity = result.blurIntensity || 8;
  
  blurToggle.checked = enabled;
  intensitySlider.value = intensity;
  intensityValue.textContent = `${intensity}px`;
  updateStatus(enabled);
}

// Toggle blur on/off
blurToggle.addEventListener('change', async () => {
  const enabled = blurToggle.checked;
  
  // Save to storage
  await chrome.storage.sync.set({ blurEnabled: enabled });
  
  // Update content script
  await sendToContentScript({ action: 'toggleBlur', enabled });
  
  updateStatus(enabled);
});

// Change blur intensity
intensitySlider.addEventListener('input', async () => {
  const intensity = parseInt(intensitySlider.value);
  intensityValue.textContent = `${intensity}px`;
  
  // Save to storage
  await chrome.storage.sync.set({ blurIntensity: intensity });
  
  // Update content script
  await sendToContentScript({ action: 'setIntensity', intensity });
});

// Initialize
loadSettings();
