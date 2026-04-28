const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx')) results.push(file);
  });
  return results;
}

const files = walk('src');
const emojiRegex = /([\u{1F300}-\u{1F9FF}]|\u{2728}|\u{2705}|\u{26A1}|\u{23F1}|\u{2600}-\u{26FF})/gu;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  // Regex to match raw emojis in JSX text (between > and <)
  content = content.replace(/>([^<]+)</g, (match, p1) => {
    if (emojiRegex.test(p1)) {
      return '>' + p1.replace(emojiRegex, (emoji) => `<EmojiIcon emoji="${emoji}" className="inline" />`) + '<';
    }
    return match;
  });

  // Also wrap dynamic variables if they match known names
  const wrapVars = ['item.icon', 'f.icon', 'o.icon', 'p.emoji', 'project.emoji', 's.emoji', 'suggestion.emoji', 'n.icon', 'tip.icon', 'dim.icon', 'draft.suggestion.emoji', 's.icon', 'd.icon', 'feature.icon'];
  wrapVars.forEach(v => {
    const regex = new RegExp(`>\\s*\\{${v.replace('.', '\\.')}\\}\\s*<`, 'g');
    content = content.replace(regex, (match) => match.replace(`{${v}}`, `<EmojiIcon emoji={${v}} />`));
    
    const regex2 = new RegExp(`>\\s*\\{${v.replace('.', '\\.')}\\}\\s+([^<]+)<`, 'g');
    content = content.replace(regex2, (match, txt) => `><EmojiIcon emoji={${v}} /> ${txt}<`);
    
    const regex3 = new RegExp(`>([^<]+)\\s+\\{${v.replace('.', '\\.')}\\}\\s*<`, 'g');
    content = content.replace(regex3, (match, txt) => `>${txt} <EmojiIcon emoji={${v}} /><`);
  });
  
  if (content !== fs.readFileSync(f, 'utf8')) {
    if (!content.includes('EmojiIcon')) {
      const importStmt = "import { EmojiIcon } from '@/components/ui/EmojiIcon';\n";
      const lastImport = content.lastIndexOf('import ');
      if (lastImport !== -1) {
        const nextLine = content.indexOf('\n', lastImport) + 1;
        content = content.slice(0, nextLine) + importStmt + content.slice(nextLine);
      } else {
        content = importStmt + content;
      }
    }
    fs.writeFileSync(f, content);
    console.log('Modified', f);
  }
});
