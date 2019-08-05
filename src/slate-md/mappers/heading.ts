import { Node, Block } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

class HeadingMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'heading') return;

    return Block.create({
      type: "heading",
      nodes: List(mdNode.children.map(mapper.fromMd)),
      data: {
        depth: mdNode.depth,
      }
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'block') return;
    if (valueNode.type !== 'heading') return;

    return {
      type: 'heading',
      depth: valueNode.data.get('depth'),
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new HeadingMapper());
}
