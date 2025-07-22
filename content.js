function removeExistingStyle() {
  const oldStyle = document.getElementById("nightInk-style");
  if (oldStyle) oldStyle.remove();
}

function applyTheme(theme, brightness = 100, strength = 100) {
  // ✅ Ignore unknown themes
  if (!["dark", "sepia", "warm"].includes(theme)) return;

  removeExistingStyle();

  const style = document.createElement("style");
  style.id = "nightInk-style";

  const brightnessValue = Number(brightness) / 100;
  const strengthValue = Number(strength);

  let filter = "";
  let bg = "";
  let text = "";

  switch (theme) {
    case "dark":
      filter = `invert(100%) hue-rotate(180deg) brightness(${brightnessValue})`;
      bg = "#000";
      text = "#fff";
      break;

    case "sepia":
      const sepia = Math.max(30, strengthValue);
      filter = `sepia(${sepia}%) brightness(${brightnessValue})`;
      bg = "#f4ecd8";
      text = "#5b4636";
      break;

    case "warm":
      const sep = Math.max(50, strengthValue);
      const hue = 20 + strengthValue * 0.6;
      const boostedBrightness = brightnessValue + 0.05;

      filter = `sepia(${sep}%) hue-rotate(${hue}deg) brightness(${boostedBrightness})`;
      bg = "#1a1a1a";
      text = "#fff3e0";
      break;
  }

  style.innerHTML = `
    html {
      filter: ${filter};
      background-color: ${bg} !important;
      color: ${text} !important;
    }
    img, video, iframe {
      filter: none !important;
    }
  `;

  document.head.appendChild(style);
}

// ✅ Improved PDF detection
function isPDF() {
  const url = window.location.href;
  const isPDFUrl = /\.pdf(\?|#|$)/i.test(url.toLowerCase());
  const isLocalPDF = url.startsWith("file://") && url.toLowerCase().endsWith(".pdf");
  const isPDFViewer = document.contentType === "application/pdf" || document.querySelector("embed[type='application/pdf'], iframe[src*='.pdf']");

  return isPDFUrl || isLocalPDF || isPDFViewer;
}

// ✅ Load and apply if NightInk is enabled AND it's a PDF
chrome.storage.local.get(["nightModeEnabled", "selectedTheme", "brightness", "themeStrength"], (result) => {
  if (result.nightModeEnabled && isPDF()) {
    applyTheme(
      result.selectedTheme ?? "dark",
      result.brightness ?? 100,
      result.themeStrength ?? 100
    );
  }
});

// ✅ Respond to popup.js with no reload
chrome.runtime.onMessage.addListener((message) => {
  if (!isPDF()) return;

  if (message.nightModeEnabled) {
    applyTheme(message.selectedTheme, message.brightness, message.themeStrength);
  } else {
    removeExistingStyle();
    // ✅ Don't reload — just restore default appearance
    document.documentElement.style.backgroundColor = "";
    document.documentElement.style.color = "";
  }
});
