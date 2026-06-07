import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "../frontend/node_modules/jspdf/dist/jspdf.node.min.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "docs", "project-overview-report.md");
const outputPath = path.join(repoRoot, "docs", "project-overview-report.pdf");

const markdown = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const lines = markdown.split("\n");

const doc = new jsPDF({
  orientation: "p",
  unit: "mm",
  format: "a4",
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const marginX = 16;
const marginTop = 18;
const marginBottom = 16;
const contentWidth = pageWidth - marginX * 2;

let y = marginTop;
let pageNumber = 1;

function drawHeader() {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Alumni Connect Project Report", marginX, 7.5);
}

function drawFooter() {
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Page ${pageNumber}`, pageWidth - marginX, pageHeight - 7, { align: "right" });
}

function ensureSpace(requiredHeight = 6) {
  if (y + requiredHeight <= pageHeight - marginBottom) {
    return;
  }
  drawFooter();
  doc.addPage();
  pageNumber += 1;
  drawHeader();
  y = marginTop;
}

function writeWrappedText(text, options = {}) {
  const {
    font = "helvetica",
    style = "normal",
    size = 11,
    color = [51, 65, 85],
    lineHeight = 5.4,
    indent = 0,
    before = 0,
    after = 0.5,
  } = options;

  const wrapped = doc.splitTextToSize(text, contentWidth - indent);
  ensureSpace(wrapped.length * lineHeight + before + after);
  y += before;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(wrapped, marginX + indent, y);
  y += wrapped.length * lineHeight + after;
}

drawHeader();

for (const rawLine of lines) {
  const line = rawLine.trimEnd();

  if (!line.trim()) {
    y += 2.2;
    continue;
  }

  if (line.startsWith("# ")) {
    writeWrappedText(line.slice(2), {
      style: "bold",
      size: 18,
      color: [15, 23, 42],
      lineHeight: 8,
      before: 3,
      after: 3,
    });
    continue;
  }

  if (line.startsWith("## ")) {
    writeWrappedText(line.slice(3), {
      style: "bold",
      size: 14,
      color: [190, 24, 93],
      lineHeight: 6.5,
      before: 3,
      after: 2,
    });
    continue;
  }

  if (line.startsWith("### ")) {
    writeWrappedText(line.slice(4), {
      style: "bold",
      size: 12,
      color: [15, 23, 42],
      lineHeight: 5.8,
      before: 2,
      after: 1,
    });
    continue;
  }

  if (line.startsWith("- ")) {
    writeWrappedText(`• ${line.slice(2)}`, {
      size: 10.8,
      lineHeight: 5.2,
      indent: 2,
      after: 0.8,
    });
    continue;
  }

  if (/^\d+\.\s/.test(line)) {
    writeWrappedText(line, {
      size: 10.8,
      lineHeight: 5.2,
      indent: 1,
      after: 0.8,
    });
    continue;
  }

  writeWrappedText(line, {
    size: 10.8,
    lineHeight: 5.2,
    after: 1.2,
  });
}

drawFooter();
fs.writeFileSync(outputPath, Buffer.from(doc.output("arraybuffer")));
console.log(`PDF generated at ${outputPath}`);
