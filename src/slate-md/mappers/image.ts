import { Node, Inline } from "slate";

import { Handler, MdNode, Mapper } from "../mapper";

export default class ImageMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'image') return;

    return Inline.create({
      type: "image",
      // nodes: List(mdNode.children.map(mapper.fromMd)),
      data: {
        url: mdNode.url,
        alt: mdNode.alt,
        title: mdNode.title,
      }
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'image') return;

    return {
      type: 'image',
      url: valueNode.data.get('url'),
      alt: valueNode.data.get('alt'),
      title: valueNode.data.get('title'),
    };
  }
}
