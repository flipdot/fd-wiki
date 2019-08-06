import { Node, Block } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class ListMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'list') return;

    return Block.create({
      type: "list",
      nodes: List(mdNode.children.map(mapper.fromMd)),
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'block') return;
    if (valueNode.type !== 'list') return;

    return {
      type: 'list',
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}
