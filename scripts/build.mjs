import { promises as fs } from "fs";
import path from "path";

const templatePath = path.resolve("index.template.html");
const template = await fs.readFile(templatePath, "utf8");

const outputs = [
  {
    filePath: path.resolve("index.html"),
    replacements: {
      __BASE_HREF__: "/",
      __ROBOTS__: "index, follow",
      __CANONICAL__: "https://mkiexpertisecentrum.nl/",
      __OG_URL__: "https://mkiexpertisecentrum.nl/",
      __SCHEMA_URL__: "https://mkiexpertisecentrum.nl/",
    },
  },
  {
    filePath: path.resolve("test", "index.html"),
    replacements: {
      __BASE_HREF__: "/test/",
      __ROBOTS__: "noindex, nofollow",
      __CANONICAL__: "https://mkiexpertisecentrum.nl/test/",
      __OG_URL__: "https://mkiexpertisecentrum.nl/test/",
      __SCHEMA_URL__: "https://mkiexpertisecentrum.nl/test/",
    },
  },
];

const applyReplacements = (source, replacements) => {
  let output = source;
  for (const [token, value] of Object.entries(replacements)) {
    output = output.replaceAll(token, value);
  }
  return output;
};

await fs.mkdir(path.resolve("test"), { recursive: true });

await Promise.all(
  outputs.map(async ({ filePath, replacements }) => {
    const output = applyReplacements(template, replacements);
    await fs.writeFile(filePath, output, "utf8");
  })
);

console.log("Generated index.html and test/index.html from index.template.html");
