import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { TextNode } from './textNode';
import { FilterNode } from './filterNode';
import { MathNode } from './mathNode';
import { APINode } from './apiNode';
import { KBNode } from './kbNode';
import { NoteNode } from './noteNode';

export const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  text: TextNode,
  filter: FilterNode,
  math: MathNode,
  api: APINode,
  kb: KBNode,
  note: NoteNode,
};

export {
  InputNode,
  OutputNode,
  LLMNode,
  TextNode,
  FilterNode,
  MathNode,
  APINode,
  KBNode,
  NoteNode,
};
