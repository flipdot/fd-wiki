import { Node, Text } from "slate";

import { Handler, MdNode, Mapper } from "../mapper";

class TextMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'text') return;

    return Text.create({
      text: mdNode.value,
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'text') return;

    return {
      type: 'text',
      value: valueNode.text,
    };
  }
}

export function register(mapper: Mapper) {
  mapper.addHandler(new TextMapper());
}
