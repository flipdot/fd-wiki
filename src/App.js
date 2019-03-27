import React from "react";
import { Editor } from "slate-react";
import { Value } from "slate";
import unified from "unified";
import markdown from "remark-parse";

import { getPage, getSitemap } from "./api";
import { Sitemap } from "./components/Sitemap";
import Sidebar, { Title, Logo, BottomButton } from "./components/Sidebar";
import Content from "./components/Content";
import GlobalStyle from "./components/GlobalStyle";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      content: Value.fromJSON({})
    };

    this.navigate();
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.navigate.bind(this));

    getSitemap().then(sitemap => {
      this.setState({ sitemap });
    });
  }

  navigate() {
    const page = window.location.hash || "#/index";
    this.loadPage(page.substr(1));
  }

  parseFrontmatter(frontmatter) {
    return frontmatter.split("\n").reduce((acc, item) => {
      const key = /(.*):/.exec(item)[1];
      const value = /.*: (.*)/.exec(item)[1];

      return {
        ...acc,
        [key]: value
      };
    }, {});
  }

  extractFrontmatter(text) {
    const regex = /^---\n((.|\n)*)\n---\n/gm;
    const match = regex.exec(text);

    if (match) {
      let frontmatter = {};
      const matchEnd = match.index + match[0].length;
      const rawFrontmatter = match[1];
      return {
        frontmatter: this.parseFrontmatter(rawFrontmatter),
        content: text.substr(matchEnd)
      };
    }

    return {
      content: text,
      frontmatter: {}
    };
  }

  async loadPage(page) {
    const rawPage = await getPage(page);

    const { frontmatter, content } = this.extractFrontmatter(rawPage);

    if (frontmatter.title) {
      document.title = frontmatter.title;
    }

    this.setState({ content: valueFromMarkdown(content) });

    /*renderMarkdown(content).then(result => {
      this.setState({ content: result.html });
    });*/
  }

  updateContent(e) {
    this.setState({ content: e.value });
  }

  render() {
    const { content, sitemap } = this.state;
    return (
      <div>
        <GlobalStyle />
        <Sidebar>
          <Logo>
            <img
              src="https://flipdot.org/wikistatic/common/flipdot.png"
              alt="flipdot"
            />
            <Title>/wiki</Title>
          </Logo>
          {sitemap && sitemap.map(element => <Sitemap tree={element} />)}
          <BottomButton type="button">New Page</BottomButton>
        </Sidebar>
        <Content>
          <Editor
            value={content}
            onChange={this.updateContent.bind(this)}
            renderNode={this.renderNode}
          />
        </Content>
      </div>
    );
  }

  renderNode(props, editor, next) {
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
}

function valueFromMarkdown(input) {
  let processor = unified().use(markdown, { gfm: true, footnotes: true });
  const tree = processor.parse(input);

  const rootValue = {
    object: "value",
    document: mapNode(tree)
  };

  return Value.fromJSON(rootValue);
}

function mapNode(node) {
  console.log(node);
  switch (node.type) {
    case "root": {
      return {
        object: "document",
        data: {},
        nodes: node.children.map(mapNode)
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
        nodes: node.children.map(mapNode)
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
        nodes: node.children.map(mapNode),
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
        nodes: node.children.map(mapNode)
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
        nodes: node.children.map(mapNode)
      };

    case "list":
      return {
        object: "block",
        type: "list",
        data: {
          ordererd: node.ordered
        },
        nodes: node.children.map(mapNode)
      };

    case "listItem":
      return {
        object: "block",
        type: "listItem",
        nodes: node.children.map(mapNode)
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
        nodes: node.children.map(mapNode)
      };
  }
}
