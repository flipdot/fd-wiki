import { Node, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class EmphasisMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'emphasis') return;

    return Inline.create({
      type: "emphasis",
      nodes: List(mdNode.children.map(mapper.fromMd)),
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'emphasis') return;

    return {
      type: 'emphasis',
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}
