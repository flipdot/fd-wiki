import { Node, Document } from "slate";

import { Handler, MdNode, Mapper } from "../mapper";

class DocumentMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'root') return;

    return Document.create({
      data: {},
      nodes: mdNode.children.map(mapper.fromMd),
    });
  }

  toMd(node: Node, mapper: Mapper) {
    if (node.object !== 'document') return;

    return {
      type: 'root',
      children: node.nodes.map(mapper.toMd).toJS(),
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new DocumentMapper());
}
