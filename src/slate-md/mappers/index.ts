import { Mapper } from '../mapper';

import CodeMapper from "./code";
import DocumentMapper from "./document";
import EmphasisMapper from "./emphasis";
import HeadingMapper from "./heading";
import HtmlMapper from "./html";
import ImageMapper from "./image";
import InlineMapper from "./inline-code";
import LinkReferenceMapper from "./link-reference";
import LinkMapper from "./link";
import ListMapper from "./list";
import ListItemMapper from "./list-item";
import ParagraphMapper from "./paragraph";
import StrongMapper from './strong';
import TextMapper from "./text";

export function configure(mapper: Mapper) {
  mapper.addHandler(new CodeMapper());
  mapper.addHandler(new DocumentMapper());
  mapper.addHandler(new EmphasisMapper());
  mapper.addHandler(new HeadingMapper());
  mapper.addHandler(new HtmlMapper());
  mapper.addHandler(new ImageMapper());
  mapper.addHandler(new InlineMapper());
  mapper.addHandler(new LinkReferenceMapper());
  mapper.addHandler(new LinkMapper());
  mapper.addHandler(new ListMapper());
  mapper.addHandler(new ListItemMapper());
  mapper.addHandler(new ParagraphMapper());
  mapper.addHandler(new StrongMapper());
  mapper.addHandler(new TextMapper());
}
