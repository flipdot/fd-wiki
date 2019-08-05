import React from 'react';

export { valueFromMarkdown } from './mapper';
export { markdownFromValue } from './mapper';

function mapMdNode(node) {
  switch (node.type) {

    case "list":
      return {
        object: "block",
        type: "list",
        data: {
          ordererd: node.ordered
        },
        nodes: node.children.map(mapMdNode)
      };

    case "listItem":
      return {
        object: "block",
        type: "listItem",
        nodes: node.children.map(mapMdNode)
      };

    case "code":
      return {
        object: "block",
        type: "code",
        data: {
          lang: node.lang
        },
        nodes: [
          {
            object: "text",
            text: node.value
          }
        ]
      };

    case "thematicBreak":
      return {
        object: "block",
        type: "thematicBreak"
      };

    case "blockquote":
      return {
        object: "block",
        type: "blockquote",
        nodes: node.children.map(mapMdNode)
      };

    default:
      console.warn('Unknown AST node.', node);
  }
}

export function renderNode(props, editor, next) {
  const { attributes, children, node } = props;

  switch (node.type) {
    case "heading": {
      const Element = `h${node.data.get("depth")}`;
      return <Element {...attributes}>{children}</Element>;
    }

    case "paragraph":
      return <p {...attributes}>{children}</p>;

    case "code":
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );

    case "link":
      return (
        <a
          title={node.data.get("title")}
          href={node.data.get("url")}
          onClick={() => {
            //window.open(node.data.get("url"), "_blank");
            window.location.assign(node.data.get("url"));
          }}
          {...attributes}
        >
          {children}
        </a>
      );

    case "inlineCode":
      return <code {...attributes}>{children}</code>;

    case "list": {
      const Element = node.data.ordererd ? "ol" : "ul";
      return <Element>{children}</Element>;
    }

    case "listItem":
      return <li>{children}</li>;

    default:
      return next();
  }
}
