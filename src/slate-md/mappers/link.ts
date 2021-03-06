import { Node, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class LinkMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'link') return;

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
      type: 'link',
      url: valueNode.data.get('url'),
      title: valueNode.data.get('title'),
      children: valueNode.nodes.map(mapper.toMd).toJS(),
    };
  }
}
