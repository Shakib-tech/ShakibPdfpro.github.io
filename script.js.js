const pdfViewer = document.getElementById("pdfViewer");
const wordViewer = document.getElementById("wordViewer");
const pdfInput = document.getElementById("pdfInput");
const wordInput = document.getElementById("wordInput");

const choosePdfBtn = document.getElementById("choosePdfBtn");
const chooseWordBtn = document.getElementById("chooseWordBtn");

let zoomLevel = 1;
let historyStack = [];
let redoStack = [];

choosePdfBtn.onclick = () => pdfInput.click();
chooseWordBtn.onclick = () => wordInput.click();

document.getElementById("toggleToolMenu").onclick = () => {
  document.getElementById("toolMenu").classList.toggle("hidden");
};

document.getElementById("togglePalette").onclick = () => {
  document.getElementById("paletteMenu").classList.toggle("hidden");
};

document.getElementById("toggleAnnotationPanel").onclick = () => {
  document.getElementById("annotationPanel").classList.toggle("hidden");
};

pdfInput.onchange = () => {
  const file = pdfInput.files[0];
  if (!file) return;
  const fileURL = URL.createObjectURL(file);
  pdfViewer.src = https://mozilla.github.io/pdf.js/web/viewer.html?file=${fileURL};
  pdfViewer.classList.remove("hidden");
  wordViewer.classList.add("hidden");
  zoomLevel = 1;
  updateZoomDisplay();
};

wordInput.onchange = () => {
  const file = wordInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    const arrayBuffer = event.target.result;
    mammoth.convertToHtml({ arrayBuffer }).then(result => {
      wordViewer.innerHTML = result.value;
      wordViewer.classList.remove("hidden");
      pdfViewer.classList.add("hidden");
      zoomLevel = 1;
      applyZoom();
      saveHistory();
      updateZoomDisplay();
    });
  };
  reader.readAsArrayBuffer(file);
};

function applyZoom() {
  zoomLevel = Math.max(0.2, Math.min(3, zoomLevel));
  wordViewer.style.transform = scale(${zoomLevel});
  wordViewer.style.transformOrigin = "top left";
}

function applyZoomPDF() {
  const message = { type: "zoom", zoom: zoomLevel };
  pdfViewer.contentWindow.postMessage(message, "*");
}

function updateZoomDisplay() {
  document.getElementById("zoomDisplay").innerText = ${Math.round(zoomLevel * 100)}%;
}

document.getElementById("zoomIn").onclick = () => {
  zoomLevel += 0.1;
  if (!pdfViewer.classList.contains("hidden")) applyZoomPDF();
  else applyZoom();
  updateZoomDisplay();
};

document.getElementById("zoomOut").onclick = () => {
  zoomLevel -= 0.1;
  if (!pdfViewer.classList.contains("hidden")) applyZoomPDF();
  else applyZoom();
  updateZoomDisplay();
};

function formatDoc(cmd) {
  document.execCommand(cmd, false, null);
  saveHistory();
}

function applyHighlight(color) {
  document.execCommand("styleWithCSS", false, true);
  document.execCommand("hiliteColor", false, color);
  saveHistory();
}

function addText() {
  const text = prompt("Enter text:");
  if (text) {
    const span = document.createElement("span");
    span.textContent = text;
    span.style.backgroundColor = "yellow";
    const range = window.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    saveHistory();
  }
}

function saveHistory() {
  historyStack.push(wordViewer.innerHTML);
  if (historyStack.length > 100) historyStack.shift();
  redoStack = [];
}

document.getElementById("undoBtn").onclick = () => {
  if (historyStack.length > 1) {
    redoStack.push(historyStack.pop());
    wordViewer.innerHTML = historyStack[historyStack.length - 1];
  }
};

document.getElementById("redoBtn").onclick = () => {
  if (redoStack.length > 0) {
    const next = redoStack.pop();
    historyStack.push(next);
    wordViewer.innerHTML = next;
  }
};

document.getElementById("saveBtn").onclick = () => {
  const blob = new Blob([wordViewer.innerHTML], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "annotated.html";
  link.click();
};

document.getElementById("exportBtn").onclick = () => {
  const content = wordViewer.innerHTML;
  const blob = new Blob([content], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "annotated.docx";
  link.click();
};

document.getElementById("fullscreenBtn").onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

document.getElementById("shareBtn").onclick = () => {
  if (navigator.share) {
    navigator.share({
      title: "Annotated File",
      url: window.location.href
    });
  } else {
    alert("Sharing not supported on this device.");
  }
};

const bgColors = [
  "#ffffff", "#f28b82", "#fbbc04", "#fff475", "#ccff90", "#a7ffeb",
  "#cbf0f8", "#aecbfa", "#d7aefb", "#fdcfe8", "#e6c9a8", "#e8eaed"
];

bgColors.forEach(color => {
  const btn = document.createElement("button");
  btn.style.backgroundColor = color;
  btn.onclick = () => document.body.style.backgroundColor = color;
  document.getElementById("bgColors").appendChild(btn);
});

const eyeColors = ["#d7ffd9", "#ffffcc", "#e0f7fa", "#2c2c2c", "#cccccc", "#ffe0b2"];

eyeColors.forEach(color => {
  const btn = document.createElement("button");
  btn.style.backgroundColor = color;
  btn.onclick = () => {
    document.body.style.backgroundColor = color;
    wordViewer.style.backgroundColor = color;
  };
  document.getElementById("eyeFilters").appendChild(btn);
});