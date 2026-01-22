// WhatsApp Chat Hider - Content Script

let isBlurEnabled = true;
let blurIntensity = 8;

// Apply blur to various WhatsApp elements
function applyBlur() {
  document.body.classList.add('wa-blur-enabled');
  document.body.style.setProperty('--wa-blur-amount', `${blurIntensity}px`);
}

// Remove blur from all elements
function removeBlur() {
  document.body.classList.remove('wa-blur-enabled');
}

// Toggle blur state
function toggleBlur(enabled) {
  isBlurEnabled = enabled;
  if (enabled) {
    applyBlur();
  } else {
    removeBlur();
  }
}

// Update blur intensity
function updateBlurIntensity(intensity) {
  blurIntensity = intensity;
  document.body.style.setProperty('--wa-blur-amount', `${intensity}px`);
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['blurEnabled', 'blurIntensity'], (result) => {
    isBlurEnabled = result.blurEnabled !== undefined ? result.blurEnabled : true;
    blurIntensity = result.blurIntensity || 8;
    
    if (isBlurEnabled) {
      applyBlur();
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleBlur') {
    toggleBlur(request.enabled);
    sendResponse({ success: true });
  } else if (request.action === 'setIntensity') {
    updateBlurIntensity(request.intensity);
    sendResponse({ success: true });
  } else if (request.action === 'getStatus') {
    sendResponse({ 
      enabled: isBlurEnabled, 
      intensity: blurIntensity 
    });
  }
  return true;
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSettings);
} else {
  loadSettings();
}

// Re-apply blur when navigating within WhatsApp
const observer = new MutationObserver(() => {
  if (isBlurEnabled && !document.body.classList.contains('wa-blur-enabled')) {
    applyBlur();
  }
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

console.log('WhatsApp Chat Hider loaded!');
