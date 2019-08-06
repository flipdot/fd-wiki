import { Value, Node, Document } from "slate";
import unified from "unified";
import markdown from "remark-parse";
import markdownStringify from "remark-stringify";

import { configure } from './mappers';
import console = require("console");

export function valueFromMarkdown(input: string) {
  const processor = unified().use(markdown, { gfm: true, footnotes: true });
  const tree = processor.parse(input);
  console.log(tree);
  const document = mapper.fromMd(tree) as Document;
  console.log(document.toJS());

  const rootValue = Value.create({
    object: "value",
    document,
  });

  return rootValue;
}

export function markdownFromValue(value: Value) {
  const ast = mapper.toMd(value.document);
  const processor = unified().use(markdownStringify, { gfm: true, footnotes: true, fences: true, rule: '-' });
  return processor.stringify(ast);
}

export type MdNode = any;

export interface Handler {
  fromMd: (mdNode: MdNode, mapper: Mapper) => Node | undefined;
  toMd: (valueNode: Node, mapper: Mapper) => MdNode | undefined;
}

export class Mapper {
  handlers: Handler[] = [];

  addHandler = (handler: Handler) => {
    this.handlers.push(handler);
  }

  fromMd = (mdNode: MdNode): Node => {
    let mapped = undefined;

    for (const handler of this.handlers) {
      mapped = handler.fromMd(mdNode, this);
      if (mapped !== undefined) break;
    }

    if (mapped === undefined) {
      console.error('[Mapper] fromMd: Missing handler for node', { ...mdNode });
    }

    return mapped;
  }

  toMd = (valueNode: Node): MdNode => {
    let mapped = undefined;

    for (const handler of this.handlers) {
      mapped = handler.toMd(valueNode, this);
      if (mapped !== undefined) break;
    }

    return mapped;
  }
}

const mapper = new Mapper();
configure(mapper);
