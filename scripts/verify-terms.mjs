import { promises as fs } from "fs";
import path from "path";

const forbiddenTerm = String.fromCharCode(112, 105, 97, 110, 111, 111);
const forbidden = [new RegExp(forbiddenTerm, "i")];
const ignoreDirs = new Set([".git", "node_modules"]);
const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".svg",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
]);

const repoRoot = path.resolve(".");
const matches = [];

const shouldSkipFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return binaryExtensions.has(ext);
};

const scanFile = async (filePath) => {
  if (shouldSkipFile(filePath)) {
    return;
  }

  const content = await fs.readFile(filePath, "utf8");
  for (const regex of forbidden) {
    if (regex.test(content)) {
      matches.push({ filePath, term: regex.source });
    }
  }
};

const scanDir = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) {
          await scanDir(fullPath);
        }
        return;
      }

      if (entry.isFile()) {
        await scanFile(fullPath);
      }
    })
  );
};

await scanDir(repoRoot);

const requiredFiles = [path.resolve("index.html"), path.resolve("test", "index.html")];
for (const filePath of requiredFiles) {
  await scanFile(filePath);
}

if (matches.length > 0) {
  console.error("Forbidden terms found:");
  for (const match of matches) {
    console.error(`- ${match.filePath}`);
  }
  process.exit(1);
}

console.log("No forbidden terms found.");
