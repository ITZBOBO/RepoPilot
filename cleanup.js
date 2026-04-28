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
  let modified = false;

  // Reverse: '<EmojiIcon emoji="X" className="inline" />'
  // Notice that it might be inside single quotes, double quotes, or backticks.
  const regex1 = /(['"`])<EmojiIcon emoji="([^"]+)" className="inline" \/>\1/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, "$1$2$1");
    modified = true;
  }

  // Wait, what if it's `{ icon: '<EmojiIcon emoji="🧠" className="inline" />' }`
  // My regex1 covers this if it has matching quotes.

  // Wait, the subagent also saw literal text `<EmojiIcon emoji="🧠" className="inline" />`.
  // This could happen if it was just `{ icon: '<EmojiIcon ... />' }`.
  // Let's also remove `className="inline"` from EmojiIcon tags that are rendered if they are wrong? No, inline is fine for text.
  
  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Fixed quotes in', f);
  }
});
