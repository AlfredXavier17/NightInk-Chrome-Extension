chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = details.url;

    // Only intercept PDFs
    if (url.toLowerCase().endsWith(".pdf")) {

      // Redirect to FULL PDF.js viewer inside /viewer/web/
      const viewerUrl =
        chrome.runtime.getURL(
          `viewer/web/viewer.html?file=${encodeURIComponent(url)}`
        );

      return { redirectUrl: viewerUrl };
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame"]
  },
  ["blocking"]
);
