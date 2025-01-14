import { marked } from 'marked';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.join(__dirname, '../../README.md');
const LICENSE_PATH = path.join(__dirname, '../../LICENSE');

export async function getReadme() {
  try {
    const content = await fs.readFile(README_PATH, 'utf-8');
    if (!content) {
      throw new Error('README content is empty');
    }
    
    return marked.parse(content, {
      gfm: true,
      breaks: true
    });
  } catch (error) {
    console.error('Error parsing README:', error);
    return '<p>Error loading README content</p>';
  }
}

export async function getLicense() {
  try {
    const content = await fs.readFile(LICENSE_PATH, 'utf-8');
    const licenseMarkdown = `# License\n\n\`\`\`\n${content}\n\`\`\``;
    return marked.parse(licenseMarkdown, {
      gfm: true,
      breaks: true
    });
  } catch (error) {
    console.error('Error parsing LICENSE:', error);
    return '<p>Error loading LICENSE content</p>';
  }
}