import { Node, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class StrongMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'strong') return;

    return Inline.create({
      type: "strong",
      nodes: List(mdNode.children.map(mapper.fromMd)),
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'strong') return;

    return {
      type: 'strong',
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}
