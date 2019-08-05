import * as document from './document';
import * as heading from './heading';
import * as html from './html';
import * as inlineCode from './inline-code';
import * as linkReference from './link-reference';
import * as link from './link';
import * as paragraph from './paragraph';
import * as text from './text';

import { Mapper } from '../mapper';

export function register(mapper: Mapper) {
  document.register(mapper);
  heading.register(mapper);
  html.register(mapper);
  inlineCode.register(mapper);
  linkReference.register(mapper);
  link.register(mapper);
  paragraph.register(mapper);
  text.register(mapper);
}
