import React from 'react';

export { valueFromMarkdown, markdownFromValue } from './mapper';

export function renderNode(props, editor, next) {
  const { attributes, children, node } = props;

  switch (node.type) {
    case 'heading': {
      const Element = `h${node.data.get('depth')}`;
      return <Element {...attributes}>{children}</Element>;
    }

    case 'image':
      return (
        <img
          alt={node.data.get('alt')}
          title={node.data.get('title')}
          src={node.data.get('url')}
          {...attributes}
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
      return (
        <a
          title={node.data.get('title')}
          href={node.data.get('url')}
          onClick={() => {
            //window.open(node.data.get("url"), "_blank");
            window.location.assign(node.data.get('url'));
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
