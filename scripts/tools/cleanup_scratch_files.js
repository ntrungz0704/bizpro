const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '..');
const items = fs.readdirSync(scriptsDir);

let deletedCount = 0;
let preservedCount = 0;

for (const item of items) {
  const fullPath = path.join(scriptsDir, item);
  const stat = fs.statSync(fullPath);

  // Preserve directories: backup, cutover, tools
  if (stat.isDirectory()) {
    console.log(`Preserving directory: scripts/${item}`);
    preservedCount++;
    continue;
  }

  // Delete all loose scratch files in scripts root
  fs.unlinkSync(fullPath);
  deletedCount++;
}

console.log(`Cleanup completed! Deleted: ${deletedCount} loose scratch files. Preserved: ${preservedCount} core directories.`);
