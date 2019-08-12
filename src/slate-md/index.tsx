import React from 'react';
import console = require('console');

export { valueFromMarkdown, markdownFromValue } from './mapper';

export function renderNode(props, editor, next) {
  const { attributes, children, node, isFocused } = props;

  switch (node.type) {
    case 'heading': {
      const Element = `h${node.data.get('depth')}`;
      return <Element {...attributes}>{children}</Element>;
    }

    case 'image':
      return (
        <img
          className={isFocused ? 'focused' : undefined}
          {...attributes}
          alt={node.data.get('alt')}
          title={node.data.get('title')}
          src={node.data.get('url')}
        />
      );

    case 'paragraph':
      return <p {...attributes}>{children}</p>;

    case 'strong':
      return <strong {...attributes}>{children}</strong>;

    case 'emphasis':
      return <em {...attributes}>{children}</em>;

    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );

    case 'link':
      let url = node.data.get('url');
      let externalUrl = false;

      if (url.includes('://')) {
        externalUrl = true;
      } else {
        if (url.startsWith('/')) {
          // fix absolute links
          url = `/#${node.data.get('url')}`;
        } else {
          // fix relative links
          const parts = window.location.toString().split('/');
          const strippedLocation = parts.slice(0, parts.length - 1).join('/');
          url = `${strippedLocation}/${node.data.get('url')}`;
        }

        // strip file ending when it's another page
        if (url.endsWith('.md')) {
          url = url.substr(0, url.length - 3);
        }
      }

      return (
        <a
          title={node.data.get('title')}
          href={url}
          onClick={() => {
            console.log(window.getSelection());
            // allow links to be selected without opening them
            if (window.getSelection().isCollapsed) {
              if (externalUrl) {
                // open external url in new tab
                window.open(url, "_blank");
              } else {
                window.location.assign(url);
              }
            }
          }}
          {...attributes}
        >
          {children}
        </a>
      );

    case 'inlineCode':
      return <code {...attributes}>{children}</code>;

    case 'list': {
      const Element = node.data.ordererd ? 'ol' : 'ul';
      return <Element {...attributes}>{children}</Element>;
    }

    case 'listItem':
      if (node.data.get('checked') != null) {
        return (
          <li {...attributes}>
            <input
              checked={node.data.get('checked')}
              type="checkbox"
              onChange={e => {
                debugger;
                editor.setNodeByKey(node.key, {
                  type: 'listItem',
                  data: { ...node.data, checked: e.currentTarget.checked },
                });
              }}
            />
            {children}
          </li>
        );
      } else {
        return <li {...attributes}>{children}</li>;
      }

    default:
      return next();
  }
}
