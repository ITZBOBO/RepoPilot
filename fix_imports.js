const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}
const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('<EmojiIcon') && !content.includes('import { EmojiIcon }')) {
    const importStmt = "import { EmojiIcon } from '@/components/ui/EmojiIcon';\n";
    // Add at top or after first use client
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
      const nextLine = content.indexOf('\n') + 1;
      content = content.slice(0, nextLine) + importStmt + content.slice(nextLine);
    } else {
      content = importStmt + content;
    }
    fs.writeFileSync(f, content);
    console.log('Added import to', f);
  }
});
