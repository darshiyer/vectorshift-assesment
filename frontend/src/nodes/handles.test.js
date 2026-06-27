import { isConnectionValid } from './handles';

const nodes = [
  { id: 'llm-1', type: 'llm', data: {} },
  { id: 'llm-2', type: 'llm', data: {} },
  { id: 'math-1', type: 'math', data: {} },
  { id: 'customInput-1', type: 'customInput', data: {} },
];

const connect = (source, sourceHandle, target, targetHandle) =>
  isConnectionValid({ source, sourceHandle, target, targetHandle }, nodes);

test('allows matching data types (text -> text)', () => {
  expect(connect('llm-1', 'llm-1-response', 'llm-2', 'llm-2-prompt')).toBe(true);
});

test('rejects incompatible data types (text -> number)', () => {
  expect(connect('llm-1', 'llm-1-response', 'math-1', 'math-1-a')).toBe(false);
});

test('an "any" handle connects to a typed handle', () => {
  expect(connect('customInput-1', 'customInput-1-value', 'math-1', 'math-1-a')).toBe(true);
});

test('rejects self-connections', () => {
  expect(connect('llm-1', 'llm-1-response', 'llm-1', 'llm-1-prompt')).toBe(false);
});

test('rejects source-to-source connections', () => {
  expect(connect('llm-1', 'llm-1-response', 'llm-2', 'llm-2-response')).toBe(false);
});
