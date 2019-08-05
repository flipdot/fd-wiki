import { Value, Node, Document } from "slate";
import unified from "unified";
import markdown from "remark-parse";
import markdownStringify from "remark-stringify";

import { register } from './mappers';

export function valueFromMarkdown(input: string) {
  const processor = unified().use(markdown, { gfm: true, footnotes: true });
  const tree = processor.parse(input);

  const document = mapper.fromMd(tree) as Document;

  const rootValue = Value.create({
    object: "value",
    document,
  });

  return rootValue;
}

export function markdownFromValue(value: Value) {
  console.log(value.document.toJS());
  const ast = mapper.toMd(value.document);
  console.log(ast);
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
register(mapper);

