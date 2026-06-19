const fs = require('fs');

function fixFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // ====== Fix comment-line swallowing (missing newlines after //) ======
  // // comment immediately followed by // comment (same line)
  c = c.replace(/(\/\/[^\n]*?)(\/\/)/g, '$1\n$2');
  // // comment immediately followed by declaration keyword
  // NOTE: intentionally avoids 'if ' and 'for ' since they're common English words in comments
  c = c.replace(/(\/\/[^\n]*?)(function |const |let |var |switch |while |try |type |interface |export |class |async |return )/g, '$1\n$2');
  // // comment immediately followed by a property/field declaration (word: type)
  c = c.replace(/(\/\/[^\n]*?)(\n[ \t]*)([a-zA-Z]\w*:)/g, '$1$2$3');
  // // comment with code after it on same line (e.g. `image: string; // comment  languages:`)
  // Match: `// ... text ` followed by word that looks like a property/keyword
  c = c.replace(/(\/\/[^\n]*?)(  +)([a-zA-Z]\w*[:;])/g, '$1\n$2$3');

  // ====== Undo damage from previous fixes ======
  // Catch-all: remove ; before any JSX prop on next line (word= pattern)
  c = c.replace(/};\n([ \t]*)([a-zA-Z]\w+=)/g, '}\n$1$2');
  c = c.replace(/\);\n([ \t]*)([a-zA-Z]\w+=)/g, ')\n$1$2');

  // ====== Fix specific known issues ======

  // Line 105: }    ]    setGithubUser
  c = c.replace(/\}\s{4}\]\s{4}([a-zA-Z])/g, '};\n    ];\n    $1');

  // Missing ; between ) and statement keywords
  c = c.replace(/(\))[ \t]{2,}(const |let |var |function |if |for |while |switch |try |return |throw |export )/g, '$1;\n$2');

  // Missing ; between } and statement keywords
  c = c.replace(/(\})[ \t]{2,}(const |let |var |function |if |for |while |switch |try |return |throw |export )/g, '$1;\n$2');

  // { followed by 2+ spaces + statement keyword
  c = c.replace(/(\{)[ \t]{2,}(const |let |var |if |for |while |try |return |switch |throw )/g, '{\n$2');

  // return followed by 2+ spaces + decl keyword
  c = c.replace(/(return)[ \t]{2,}(const |let |var |function |class )/g, 'return;\n$2');

  // */ followed by function/export/async/type
  c = c.replace(/\*\/\s+(export\s+|function\s+|async\s+|type\s+)/g, '*/\n$1');

  // Fix type literal in AdminPanel
  if (filePath.includes('AdminPanel')) {
    c = c.replace(/(type AdminPanelProps = \{)([^}]+)(\})/, (_, p, body, s) => {
      let b = body;
      b = b.replace(/('light')\s+(\w+)/, "$1; $2");
      b = b.replace(/(void)\s+(\w+)/, "$1; $2");
      return p + b + s;
    });
    c = c.replace(/(type TabType = '.*?')(\/\/)/, '$1\n$2');
    c = c.replace(/(\/\/ =+)(\/\/)/g, '$1\n$2');
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Fixed:', filePath);
}

fixFile('src/components/AdminPanel.tsx');
fixFile('src/data/projectsDB.ts');
