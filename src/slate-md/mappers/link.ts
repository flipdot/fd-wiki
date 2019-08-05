import { Node, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

class LinkMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'linkReference') return;

    return Inline.create({
      type: "link",
      nodes: List(mdNode.children.map(mapper.fromMd)),
      data: {
        url: mdNode.url,
        title: mdNode.title
      }
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'link') return;

    return {
      type: 'linkReference',
      url: valueNode.data.get('url'),
      title: valueNode.data.get('title'),
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new LinkMapper());
}
