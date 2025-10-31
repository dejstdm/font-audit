import { Buffer } from "buffer";
import { create as createFont } from "fontkit";

let selectedFile = null;
let currentFont = null;

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");

// Click to upload
uploadArea.addEventListener("click", () => fileInput.click());

// File selection
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Drag and drop
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  const validExtensions = [".ttf", ".otf", ".woff", ".woff2"];
  const isValid = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  if (!isValid) {
    showStatus(
      "error",
      "Please select a valid font file (TTF, OTF, WOFF, or WOFF2)",
    );
    return;
  }

  selectedFile = file;
  analyzeBtn.disabled = false;
  showStatus(
    "success",
    `File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
  );
}

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  try {
    analyzeBtn.disabled = true;
    showStatus("info", "Analyzing font...");

    const arrayBuffer = await selectedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Browser-safe Buffer polyfill

    // fontkit handles WOFF2 natively!
    currentFont = createFont(buffer);

    displayFontInfo(currentFont, selectedFile.name);
  } catch (error) {
    showStatus("error", `Analysis failed: ${error.message}`);
    console.error("Font parsing error:", error);
  } finally {
    analyzeBtn.disabled = false;
  }
});

clearBtn.addEventListener("click", () => {
  selectedFile = null;
  currentFont = null;
  fileInput.value = "";
  analyzeBtn.disabled = true;
  output.innerHTML = "";
});

function displayFontInfo(font, filename) {
  const format = filename.split(".").pop().toUpperCase();

  const html = `
    <div class="font-preview">
      <div class="preview-text" style="font-family: '${font.fullName}';">
        The quick brown fox jumps over the lazy dog
      </div>
      <div class="preview-text" style="font-family: '${font.fullName}'; font-size: 1.5rem;">
        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
        abcdefghijklmnopqrstuvwxyz<br>
        0123456789
      </div>
    </div>

    <div class="font-info">
      <h3 style="margin-bottom: 20px; color: #1e293b;">Font Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Font Name</div>
          <div class="info-value">${font.fullName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Family</div>
          <div class="info-value">${font.familyName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Subfamily</div>
          <div class="info-value">${font.subfamilyName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Format</div>
          <div class="info-value">${format}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Version</div>
          <div class="info-value">${font.version}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Glyphs</div>
          <div class="info-value">${font.numGlyphs}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Units Per Em</div>
          <div class="info-value">${font.unitsPerEm}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ascent</div>
          <div class="info-value">${font.ascent}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Descent</div>
          <div class="info-value">${font.descent}</div>
        </div>
        ${
          font.copyright
            ? `
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-label">Copyright</div>
          <div class="info-value" style="font-size: 0.9rem;">${font.copyright}</div>
        </div>
        `
            : ""
        }
      </div>
    </div>
  `;

  output.innerHTML = html;
  showStatus("success", `✅ Successfully analyzed ${format} font!`);
}

function showStatus(type, message) {
  const existing = output.querySelector(".status");
  if (existing) existing.remove();

  const status = document.createElement("div");
  status.className = `status ${type}`;
  status.textContent = message;
  output.insertBefore(status, output.firstChild);
}

