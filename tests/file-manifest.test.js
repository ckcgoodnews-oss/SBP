const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('file-manifest.json', 'utf8'));
for (const file of manifest.required_files) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${file}`);
}
console.log(`File manifest passed: ${manifest.required_files.length} required files found.`);
