import { parseVariables } from './parseVariables';

test('extracts a simple variable with surrounding spaces', () => {
  expect(parseVariables('Hello {{ name }}')).toEqual(['name']);
});

test('extracts multiple variables in order', () => {
  expect(parseVariables('{{ a }} and {{ b }}')).toEqual(['a', 'b']);
});

test('deduplicates repeated variables', () => {
  expect(parseVariables('{{ x }} {{ x }}')).toEqual(['x']);
});

test('ignores invalid identifiers', () => {
  expect(parseVariables('{{ 1bad }} {{ a-b }} {{ }}')).toEqual([]);
});

test('handles text with no variables', () => {
  expect(parseVariables('plain text')).toEqual([]);
});
