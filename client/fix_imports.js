const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetExts = [".jsx", ".js"];
let modifiedCount = 0;

walkDir(path.join(__dirname, "src"), (filePath) => {
  if (targetExts.includes(path.extname(filePath))) {
    let content = fs.readFileSync(filePath, "utf8");
    const regex =
      /import\s+([a-zA-Z0-9_]+)\s+from\s+["'](\/[^"']+?\.(?:webp|png|jpg|svg|ico))["']/g;
    if (regex.test(content)) {
      const newContent = content.replace(regex, 'const $1 = "$2"');
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`Updated ${filePath}`);
      modifiedCount++;
    }
  }
});

console.log(`Finished processing. Modified ${modifiedCount} files.`);
