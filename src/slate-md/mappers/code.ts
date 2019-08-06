import { Node, Block, Text } from "slate";
import { List } from 'immutable';

import { Handler, MdNode, Mapper } from "../mapper";

export default class HtmlMapper implements Handler {
  fromMd(mdNode: MdNode, mapper: Mapper) {
    if (mdNode.type !== 'code') return;

    return Block.create({
      type: "code",
      nodes: List([
        Text.create({
          text: mdNode.value,
        })
      ]),
      data: {
        lang: mdNode.lang,
        meta: mdNode.meta,
      }
    });
  }

  toMd(valueNode: Node, mapper: Mapper) {
    if (valueNode.object !== 'block') return;
    if (valueNode.type !== 'code') return;

    return {
      type: 'code',
      value: valueNode.text,
      lang: valueNode.data.get('lang'),
      meta: valueNode.data.get('meta'),
    };
  }
}
