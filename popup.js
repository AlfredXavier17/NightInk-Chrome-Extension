const powerBtn = document.getElementById("powerBtn");
const themeSelect = document.getElementById("themeSelect");
const brightnessSlider = document.getElementById("brightnessSlider");
const strengthSlider = document.getElementById("strengthSlider");
const controlsDiv = document.getElementById("controls");
const offMsg = document.getElementById("offMsg");
const strengthWrapper = document.getElementById("strengthWrapper");
const openViewerBtn = document.getElementById("openViewerBtn");

// 🔁 Update popup UI
function updateUI(enabled) {
  if (enabled) {
    powerBtn.classList.add("active");
    powerBtn.textContent = "Disable NightInk";
    offMsg.style.display = "none";
    controlsDiv.style.display = "block";
  } else {
    powerBtn.classList.remove("active");
    powerBtn.textContent = "Enable NightInk";
    offMsg.style.display = "block";
    controlsDiv.style.display = "none";
  }
}

// 👁️ Toggle Theme Strength only for sepia/warm
function updateStrengthVisibility() {
  const selected = themeSelect.value;
  strengthWrapper.style.display = selected === "dark" ? "none" : "block";
}

// ✅ Load saved settings into popup
chrome.storage.local.get(
  ["nightModeEnabled", "selectedTheme", "brightness", "themeStrength"],
  (result) => {
    const enabled = result.nightModeEnabled ?? false;
    themeSelect.value = result.selectedTheme ?? "dark";
    brightnessSlider.value = result.brightness ?? 100;
    strengthSlider.value = result.themeStrength ?? 100;

    updateUI(enabled);
    updateStrengthVisibility();
  }
);

// 🔘 Toggle ON/OFF
powerBtn.addEventListener("click", () => {
  const enabled = !powerBtn.classList.contains("active");
  chrome.storage.local.set({ nightModeEnabled: enabled }, () => {
    updateUI(enabled);
    sendUpdate();
  });
});

// 🎨 Theme change
themeSelect.addEventListener("change", () => {
  chrome.storage.local.set({ selectedTheme: themeSelect.value }, () => {
    updateStrengthVisibility();
    sendUpdate();
  });
});

// 💡 Brightness slider
brightnessSlider.addEventListener("input", () => {
  chrome.storage.local.set({ brightness: brightnessSlider.value }, sendUpdate);
});

// 🎛️ Strength slider
strengthSlider.addEventListener("input", () => {
  chrome.storage.local.set({ themeStrength: strengthSlider.value }, sendUpdate);
});

// 🔄 Send update to content script OR viewer
function sendUpdate() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    chrome.storage.local.get(
      ["nightModeEnabled", "selectedTheme", "brightness", "themeStrength"],
      (result) => {
        const msg = {
          nightModeEnabled: result.nightModeEnabled,
          selectedTheme: result.selectedTheme,
          brightness: result.brightness,
          themeStrength: result.themeStrength
        };

        const isViewer = tab.url.startsWith(
          `chrome-extension://${chrome.runtime.id}/viewer/web/`
        );

        if (isViewer) {
          chrome.runtime.sendMessage(msg);
        } else {
          chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
        }
      }
    );
  });
}

// 📄 OPEN PDF IN FULL PDF.js VIEWER
openViewerBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;

    const pdfUrl = tab.url;

    const viewerUrl = chrome.runtime.getURL(
      `viewer/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`
    );

    chrome.tabs.create({ url: viewerUrl });
  });
});
