import { Node, Block } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class ListItemMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'listItem') return;

    return Block.create({
      type: "listItem",
      nodes: List(mdNode.children.map(mapper.fromMd)),
      data: {
        checked: mdNode.checked,
      },
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'block') return;
    if (valueNode.type !== 'listItem') return;

    return {
      type: 'listItem',
      children: valueNode.nodes.map(mapper.toMd).toJS(),
      checked: valueNode.data.get('checked'),
    };
  }
}
