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

// Matches a string literal that contains <EmojiIcon ... />
// We use a replacer function to replace ALL occurrences of <EmojiIcon> within the matched string literal.
// A string literal is matched by matching the opening quote, then anything until the closing quote (handling escapes).

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Pattern for string literals (single, double, or backtick)
  // that don't try to parse too smartly, but enough for our cases
  const strRegex = /(['"`])((?:\\\1|(?!\1).)*)\1/g;

  content = content.replace(strRegex, (match, quote, inner) => {
    if (inner.includes('<EmojiIcon')) {
      // Replace all <EmojiIcon emoji="X" ... /> inside this string with X
      const replacedInner = inner.replace(/<EmojiIcon emoji="([^"]+)"[^>]*\/>/g, '$1');
      return quote + replacedInner + quote;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed strings in', f);
  }
});
