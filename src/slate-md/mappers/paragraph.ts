import { Node, Block } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

class ParagraphMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'paragraph') return;

    return Block.create({
      type: "paragraph",
      nodes: List(mdNode.children.map(mapper.fromMd))
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'block') return;
    if (valueNode.type !== "paragraph") return;

    return {
      type: 'paragraph',
      children: valueNode.nodes.map(mapper.toMd).toJS()
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new ParagraphMapper());
}
