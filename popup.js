const powerBtn = document.getElementById("powerBtn");
const themeSelect = document.getElementById("themeSelect");
const brightnessSlider = document.getElementById("brightnessSlider");
const strengthSlider = document.getElementById("strengthSlider");
const controlsDiv = document.getElementById("controls");
const offMsg = document.getElementById("offMsg");
const strengthWrapper = document.getElementById("strengthWrapper");

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

// 👁️ Toggle visibility of Theme Strength based on theme
function updateStrengthVisibility() {
  const selected = themeSelect.value;
  if (selected === "dark") {
    strengthWrapper.style.display = "none";
  } else {
    strengthWrapper.style.display = "block";
  }
}

// ✅ Load settings and apply to UI
chrome.storage.local.get(["nightModeEnabled", "selectedTheme", "brightness", "themeStrength"], (result) => {
  const enabled = result.nightModeEnabled ?? false;
  themeSelect.value = result.selectedTheme ?? "dark";
  brightnessSlider.value = result.brightness ?? 100;
  strengthSlider.value = result.themeStrength ?? 100;
  updateUI(enabled);
  updateStrengthVisibility();
});

// 🔘 Toggle extension ON/OFF
powerBtn.addEventListener("click", () => {
  const enabled = !powerBtn.classList.contains("active");
  chrome.storage.local.set({ nightModeEnabled: enabled }, () => {
    updateUI(enabled);
    sendUpdate();
  });
});

// 🎨 Theme select
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

// 🎛️ Theme Strength slider
strengthSlider.addEventListener("input", () => {
  chrome.storage.local.set({ themeStrength: strengthSlider.value }, sendUpdate);
});

// 🔄 Communicate with content script
function sendUpdate() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    chrome.storage.local.get(["nightModeEnabled", "selectedTheme", "brightness", "themeStrength"], (result) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        nightModeEnabled: result.nightModeEnabled,
        selectedTheme: result.selectedTheme,
        brightness: result.brightness,
        themeStrength: result.themeStrength
      }).catch((err) => {
        // No content script found — not a PDF page — ignore
      });
    });
  });
}
