import React from 'react';
import { Value } from "slate";
import unified from "unified";
import markdown from "remark-parse";
import markdownStringify from "remark-stringify";

export function valueFromMarkdown(input) {
  const processor = unified().use(markdown, { gfm: true, footnotes: true });
  const tree = processor.parse(input);

  const rootValue = {
    object: "value",
    document: mapMdNode(tree)
  };

  return Value.fromJSON(rootValue);
}

export function markdownFromValue(value) {
  const ast = mapValueNode(value.toJS().document);
  const processor = unified().use(markdownStringify, { gfm: true, footnotes: true, fences: true, rule: '-' });
  return processor.stringify(ast);
}

function mapValueNode(node) {
  if (node.object === 'document') {
    return {
      type: 'root',
      children: node.nodes.map(mapValueNode),
    };
  }
  else if (node.object === 'block') {
    return {
      ...node.data,

      type: node.type,

      children: node.nodes ? node.nodes.map(mapValueNode) : [],


      ...(node.nodes && node.nodes[0] && node.nodes[0].text && {
        value: node.nodes[0].text,
      }),

      ...(node.nodes && node.nodes[0] && node.nodes[0].leaves && {
        value: node.nodes[0].leaves.map(leaf => leaf.text).join(' '),
      }),
    };
  }
  else if (node.object === 'text') {
    return {
      type: 'text',
      value: node.leaves.map(leaf => leaf.text).join(' '),
    };
  }
  else if (node.object === 'inline') {
    return {
      ...node.data,

      type: node.type,

      value: node.nodes && node.nodes[0] && node.nodes[0].text,


      ...(node.nodes && node.nodes[0] && node.nodes[0].leaves && {
        value: node.nodes[0].leaves.map(leaf => leaf.text).join(' '),
      }),

      ...(node.nodes && {
        children: node.nodes.map(mapValueNode),
      }),
    };
  }
}

function mapMdNode(node) {
  switch (node.type) {
    case "root": {
      return {
        object: "document",
        data: {},
        nodes: node.children.map(mapMdNode)
      };
    }

    case "html": {
      return {
        object: "block",
        type: "html",
        nodes: [
          {
            object: "text",
            text: node.value
          }
        ]
      };
    }

    case "paragraph":
      return {
        object: "block",
        type: "paragraph",
        nodes: node.children.map(mapMdNode)
      };

    case "text":
      return {
        object: "text",
        text: node.value
      };

    case "inlineCode":
      return {
        object: "inline",
        type: "inlineCode",
        //text: node.value
        nodes: [
          {
            object: "text",
            text: node.value
          }
        ]
      };

    case "linkReference":
      return {
        object: "inline",
        type: "linkReference",
        nodes: node.children.map(mapMdNode),
        data: {
          identifier: node.identifier,
          label: node.label
        }
      };

    case "link":
      return {
        object: "inline",
        type: "link",
        data: {
          url: node.url,
          title: node.title
        },
        nodes: node.children.map(mapMdNode)
      };

    case "definition":
      return {
        object: "text",
        text: node.value
      };

    case "heading":
      return {
        object: "block",
        type: "heading",
        data: {
          depth: node.depth
        },
        nodes: node.children.map(mapMdNode)
      };

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
