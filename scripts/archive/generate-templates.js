const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, 'lib', 'generation', 'prompts');
const templatesDir = path.join(promptsDir, 'templates');
const snippetsDir = path.join(promptsDir, 'snippets');

const templatesData = {
  templates: {},
  snippets: {}
};

// Read all snippets
if (fs.existsSync(snippetsDir)) {
  const snippets = fs.readdirSync(snippetsDir);
  for (const file of snippets) {
    if (file.endsWith('.md')) {
      const name = file.replace('.md', '');
      const content = fs.readFileSync(path.join(snippetsDir, file), 'utf-8').trim();
      templatesData.snippets[name] = content;
    }
  }
}

// Read all templates
if (fs.existsSync(templatesDir)) {
  const promptDirs = fs.readdirSync(templatesDir);
  for (const dir of promptDirs) {
    const dirPath = path.join(templatesDir, dir);
    if (fs.statSync(dirPath).isDirectory()) {
      templatesData.templates[dir] = {};
      
      const systemPath = path.join(dirPath, 'system.md');
      if (fs.existsSync(systemPath)) {
        templatesData.templates[dir].system = fs.readFileSync(systemPath, 'utf-8').trim();
      }
      
      const userPath = path.join(dirPath, 'user.md');
      if (fs.existsSync(userPath)) {
        templatesData.templates[dir].user = fs.readFileSync(userPath, 'utf-8').trim();
      }
    }
  }
}

// Write the TS file
const tsContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated from markdown files in templates/ and snippets/
export const PROMPT_DATA = ${JSON.stringify(templatesData, null, 2)};
`;

fs.writeFileSync(path.join(promptsDir, 'templatesData.ts'), tsContent, 'utf-8');
console.log('Successfully generated lib/generation/prompts/templatesData.ts');
