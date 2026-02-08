import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set([".html", ".txt", ".xml", ".md", ".js", ".mjs", ".css"]);
const FORBIDDEN_TERM = String.fromCharCode(112, 105, 97, 110, 111, 111);

const errors = [];

const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() || stat.isDirectory();
  } catch {
    return false;
  }
};

const walkFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
};

const readTextFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    return null;
  }
  return fs.readFile(filePath, "utf8");
};

const verifyAssets = async () => {
  const assetsDir = path.join(ROOT, "assets");
  const cssFile = path.join(assetsDir, "css", "styles.css");
  const jsFile = path.join(assetsDir, "js", "app.js");

  assert(await fileExists(assetsDir), "Missing /assets directory at repo root.");
  assert(await fileExists(cssFile), "Missing /assets/css/styles.css.");
  assert(await fileExists(jsFile), "Missing /assets/js/app.js.");
};

const verifyTestIndex = async () => {
  const testIndexPath = path.join(ROOT, "test", "index.html");
  const testIndex = await fs.readFile(testIndexPath, "utf8");

  assert(testIndex.includes("/assets/"), "/test/index.html does not reference /assets/.");
  assert(
    !testIndex.includes("/test/assets"),
    "/test/index.html still references /test/assets."
  );
};

const verifyForbiddenTerm = async () => {
  const files = await walkFiles(ROOT);
  for (const filePath of files) {
    const contents = await readTextFile(filePath);
    if (contents === null) {
      continue;
    }
    if (contents.toLowerCase().includes(FORBIDDEN_TERM)) {
      const relativePath = path.relative(ROOT, filePath);
      errors.push(`Forbidden term found in ${relativePath}.`);
    }
  }
};

await verifyAssets();
await verifyTestIndex();
await verifyForbiddenTerm();

if (errors.length > 0) {
  console.error("Binary safety verification failed:");
  for (const message of errors) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Binary safety verification passed.");
