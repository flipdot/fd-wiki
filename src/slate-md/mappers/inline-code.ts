import { Node, Text, Inline } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class InlineCodeMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'inlineCode') return;

    return Inline.create({
      type: "inlineCode",
      nodes: List([
        Text.create({
          text: mdNode.value,
        })
      ]),
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'inline') return;
    if (valueNode.type !== 'inlineCode') return;

    return {
      type: 'inlineCode',
      value: valueNode.text,
    };
  }
}
