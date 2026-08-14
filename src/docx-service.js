const mammoth = require("mammoth");
const fs = require("fs-extra");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const cheerio = require("cheerio");

/**
 * Read .docx and return plain text (string)
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readDocx(filePath) {
  if (!await fs.pathExists(filePath)) throw new Error("文件不存在：" + filePath);
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Write a simple .docx from plain text.
 * Treats blank-line separated blocks as paragraphs.
 * @param {string} inputText
 * @param {string} outPath
 */
async function writeDocx(inputText, outPath) {
  const paragraphs = [];
  const blocks = inputText.split(/\r?\n\r?\n/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      paragraphs.push(new Paragraph({ children: [new TextRun(line || "")] }));
    }
    paragraphs.push(new Paragraph({ children: [] }));
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }]
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.outputFile(outPath, buffer);
}

/**
 * Extract tables from a .docx file.
 * Returns an array of tables; each table is array-of-rows, row is array-of-cell-text.
 * Implementation: convert docx -> HTML (mammoth), parse with cheerio.
 * @param {string} filePath
 * @returns {Promise<Array>}
 */
async function extractTables(filePath) {
  if (!await fs.pathExists(filePath)) throw new Error("文件不存在：" + filePath);
  const htmlResult = await mammoth.convertToHtml({ path: filePath });
  const $ = cheerio.load(htmlResult.value || "");
  const tables = [];
  $("table").each((i, t) => {
    const table = [];
    $(t).find("tr").each((ri, r) => {
      const row = [];
      $(r).find("td, th").each((ci, c) => {
        const cellText = $(c).text().trim();
        row.push(cellText);
      });
      table.push(row);
    });
    tables.push(table);
  });
  return tables;
}

module.exports = { readDocx, writeDocx, extractTables };
