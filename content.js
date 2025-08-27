// // content.js

// // 1) Configure your keywords → colors
// const KEYWORDS = {
//   "Select": "yellow",
//   "Dotnet": "lightblue",
//   "AI": "lightgreen"
// };

// // Build a single regex for all keywords (case-insensitive)
// const WORDS = Object.keys(KEYWORDS);
// const KEYWORD_REGEX = WORDS.length
//   ? new RegExp("(" + WORDS.map(escapeRegex).join("|") + ")", "gi")
//   : null;

// // Escape special regex chars in a keyword
// function escapeRegex(s) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Inject a small CSS to style “copied” feedback (optional)
// (function injectStyle() {
//   const css = `
//     .kh-mark { font-weight: bold; border-radius: 4px; padding: 1px 3px; }
//     .kh-mark.kh-copied { outline: 2px solid; }
//   `;
//   const style = document.createElement("style");
//   style.textContent = css;
//   document.documentElement.appendChild(style);
// })();

// // Should we ignore this text node?
// function shouldIgnore(node) {
//   if (!node || !node.parentNode) return true;
//   const p = node.parentNode;
//   if (p.closest(".kh-mark")) return true; // don't reprocess our own highlights
//   if (p.isContentEditable) return true;

//   const tag = p.nodeName;
//   return (
//     tag === "SCRIPT" ||
//     tag === "STYLE" ||
//     tag === "NOSCRIPT" ||
//     tag === "IFRAME" ||
//     tag === "CANVAS" ||
//     tag === "TEXTAREA" ||
//     tag === "INPUT"
//   );
// }

// // Replace matches within a single text node, preserving structure
// function wrapMatchesInTextNode(textNode, token) {
//   const text = textNode.nodeValue;
//   if (!text || !KEYWORD_REGEX || !KEYWORD_REGEX.test(text)) return false;

//   const frag = document.createDocumentFragment();
//   let lastIndex = 0;
//   text.replace(KEYWORD_REGEX, (match, _g1, offset) => {
//     // text before match
//     if (offset > lastIndex) {
//       frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
//     }

//     // figure out the canonical keyword to pick its color
//     const key = WORDS.find((w) => w.toLowerCase() === match.toLowerCase()) || match;
//     const color = KEYWORDS[key] || "yellow";

//     const mark = document.createElement("mark");
//     mark.className = "kh-mark";
//     mark.style.background = color;
//     mark.textContent = match; // keep original case
//     mark.dataset.key = key;

//     if (token) {
//       mark.dataset.token = token;
//       mark.title = "Auth token ready — click to copy";
//     } else {
//       mark.title = "Token not captured yet. Trigger an API call.";
//     }

//     frag.appendChild(mark);
//     lastIndex = offset + match.length;
//     return match;
//   });

//   // trailing text after last match
//   if (lastIndex < text.length) {
//     frag.appendChild(document.createTextNode(text.slice(lastIndex)));
//   }

//   textNode.parentNode.replaceChild(frag, textNode);
//   return true;
// }

// // Highlight all text nodes under a root
// function highlightAll(root, token) {
//   if (!KEYWORD_REGEX) return;

//   const walker = document.createTreeWalker(
//     root,
//     NodeFilter.SHOW_TEXT,
//     {
//       acceptNode(node) {
//         if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
//         if (shouldIgnore(node)) return NodeFilter.FILTER_REJECT;
//         return NodeFilter.FILTER_ACCEPT;
//       }
//     }
//   );

//   const nodes = [];
//   while (walker.nextNode()) nodes.push(walker.currentNode);
//   nodes.forEach((n) => wrapMatchesInTextNode(n, token));
// }

// // Keep highlights updated if content loads later (SPA)
// function observeMutations(token) {
//   const obs = new MutationObserver((mutations) => {
//     for (const m of mutations) {
//       m.addedNodes.forEach((node) => {
//         if (node.nodeType === Node.TEXT_NODE) {
//           if (!shouldIgnore(node)) wrapMatchesInTextNode(node, token);
//         } else if (node.nodeType === Node.ELEMENT_NODE) {
//           // Re-run inside this subtree
//           highlightAll(node, token);
//         }
//       });
//     }
//   });

//   obs.observe(document.body, {
//     childList: true,
//     subtree: true,
//     characterData: true
//   });
// }

// // If the token changes later, update tooltips/data-token
// function listenForTokenChanges() {
//   chrome.storage.onChanged.addListener((changes, area) => {
//     if (area !== "local" || !changes.authToken) return;
//     const newToken = changes.authToken.newValue || "";
//     document.querySelectorAll(".kh-mark").forEach((el) => {
//       el.dataset.token = newToken;
//       el.title = newToken ? "Auth token ready — click to copy" : "Token not captured yet. Trigger an API call.";
//     });
//   });
// }

// // Click any highlight to copy the token
// document.addEventListener("click", (e) => {
//   const m = e.target.closest(".kh-mark");
//   if (!m) return;

//   const token = m.dataset.token || "";
//   if (!token) {
//     alert("Token not captured yet. Perform an action that triggers an authorized API call.");
//     return;
//   }

//   navigator.clipboard.writeText(token)
//     .then(() => {
//       m.classList.add("kh-copied");
//       setTimeout(() => m.classList.remove("kh-copied"), 700);
//     })
//     .catch(() => alert("Clipboard copy failed. Check site permissions."));
// });

// // --- bootstrap ---
// chrome.storage.local.get("authToken", ({ authToken }) => {
//   const token = authToken || "";
//   console.log("Initial token:", token);
  
//   highlightAll(document.body, token);
//   observeMutations(token);
//   listenForTokenChanges();
// });

// --- Styles for highlights ---
(function injectStyle() {
  const css = `
    .qb-mark { 
      font-weight: bold; 
      border-radius: 4px; 
      padding: 1px 3px; 
      background: #afd1ff; 
    }
    .qb-mark.qb-copied { outline: 2px solid; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.documentElement.appendChild(style);
})();

// --- Helpers ---
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shouldIgnore(node) {
  if (!node || !node.parentNode) return true;
  const p = node.parentNode;
  if (p.closest(".qb-mark")) return true; // don't reprocess our highlights
  if (p.isContentEditable) return true;
  const tag = p.nodeName;
  return (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "NOSCRIPT" ||
    tag === "IFRAME" ||
    tag === "CANVAS" ||
    tag === "TEXTAREA" ||
    tag === "INPUT"
  );
}

// --- Highlighting logic ---
function wrapMatchesInTextNode(textNode, qbNames, token) {
  const text = textNode.nodeValue;
  if (!text || !qbNames || qbNames.length === 0) return false;

  // Build regex dynamically
  const regex = new RegExp("(" + qbNames.map(escapeRegex).join("|") + ")", "gi");
  if (!regex.test(text)) return false;

  const frag = document.createDocumentFragment();
  let lastIndex = 0;

  text.replace(regex, (match, _g1, offset) => {
    if (offset > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
    }

    const mark = document.createElement("mark");
    mark.className = "qb-mark";
    mark.textContent = match;
    mark.dataset.key = match;
    if (token) {
    //   mark.dataset.token = token;
      mark.title = "QB Added in Rule Based Test";
    }

    frag.appendChild(mark);
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  textNode.parentNode.replaceChild(frag, textNode);
  return true;
}

function highlightAll(root, qbNames, token) {
  if (!qbNames || qbNames.length === 0) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldIgnore(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => wrapMatchesInTextNode(n, qbNames, token));
}

// --- Mutation observer to catch SPA changes ---
function observeMutations(qbNames, token) {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!shouldIgnore(node)) wrapMatchesInTextNode(node, qbNames, token);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          highlightAll(node, qbNames, token);
        }
      });
    }
  });
  obs.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// --- Listen for storage updates (QB names + Token) ---
function listenForChanges() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.qbNames || changes.authToken) {
      const qbNames = (changes.qbNames && changes.qbNames.newValue) || currentQBNames;
      const token = (changes.authToken && changes.authToken.newValue) || currentToken;

      console.log("🔄 Updating highlights with QB names:", qbNames, "and token:", token);

      currentQBNames = qbNames;
      currentToken = token;

      highlightAll(document.body, qbNames, token);
    }
  });
}

// // --- Click highlight to copy token ---
// document.addEventListener("click", (e) => {
//   const m = e.target.closest(".qb-mark");
//   if (!m) return;
//   const token = m.dataset.token || "";
//   if (!token) {
//     alert("Token not captured yet. Perform an action that triggers an authorized API call.");
//     return;
//   }
//   navigator.clipboard.writeText(token)
//     .then(() => {
//       m.classList.add("qb-copied");
//       setTimeout(() => m.classList.remove("qb-copied"), 700);
//     })
//     .catch(() => alert("Clipboard copy failed."));
// });

// --- bootstrap ---
let currentQBNames = [];
let currentToken = "";

chrome.storage.local.get(["qbNames", "authToken"], ({ qbNames, authToken }) => {
  currentQBNames = qbNames || [];
  currentToken = authToken || "";

//   console.log("📥 Initial qbNames:", currentQBNames);
//   console.log("🔑 Initial token:", currentToken);

  highlightAll(document.body, currentQBNames, currentToken);
  observeMutations(currentQBNames, currentToken);
  listenForChanges();
});
