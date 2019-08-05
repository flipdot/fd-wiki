import { Node, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

class LinkReferenceMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'linkReference') return;

    return Inline.create({
      type: "linkReference",
      nodes: List(mdNode.children.map(mapper.fromMd)),
      data: {
        identifier: mdNode.identifier,
        label: mdNode.label
      }
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'linkReference') return;

    return {
      type: 'linkReference',
      identifier: valueNode.data.get('identifier'),
      label: valueNode.data.get('label'),
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new LinkReferenceMapper());
}
