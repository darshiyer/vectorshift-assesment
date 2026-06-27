// Extract {{ variable }} references from text. Only valid JavaScript identifiers
// count, and each name is returned once in order of first appearance.

const TEMPLATE = /\{\{\s*([^}]*?)\s*\}\}/g;
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export const parseVariables = (text = '') => {
  const names = [];
  const seen = new Set();

  for (const match of text.matchAll(TEMPLATE)) {
    const name = match[1].trim();
    if (IDENTIFIER.test(name) && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
};
