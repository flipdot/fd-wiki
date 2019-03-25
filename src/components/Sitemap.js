import React from "react";
import styled, { css } from "styled-components";

const nestedEntryPadding = ({ level = 0, basePadding = 16 }) => css`
  padding-left: ${basePadding + level * 16}px;
`;

const Container = styled.div`
  overflow: hidden;
  white-space: nowrap;

  &.active {
    > title {
      color: #000;
      font-weight: bold;
    }
  }
`;

const Title = styled.div`
  display: flex;
  padding: 4px 16px;
  transition: background 0.3s ease-out;

  ${nestedEntryPadding}

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const TitleButton = styled.button`
  flex: 0 0 auto;
  color: #666;
  background: transparent;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 1em;
  position: relative;
  transition: background 0.2s ease-out;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const InnerTitleButton = styled.div`
  position: absolute;
  top: -4px;
  left: 4px;
  height: 12px;
  width: 12px;
  font-size: 1.2em;
  ${props => props.expanded && "transform: rotate(90deg) translate(7px, -7px);"}
`;

const TitleLink = styled.a`
  text-decoration: none;
  color: #666;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 4px;
  line-height: 20px;
`;

const NoPages = styled.p`
  padding: 4px 0;
  color: #aaa;
  ${props => nestedEntryPadding({ level: props.level, basePadding: 24 })}
`;

export class Sitemap extends React.Component {
  constructor() {
    super();

    this.state = {
      expanded: false
    };
  }

  toggleExpand() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { tree, subPath = "", level = 0 } = this.props;
    const { expanded } = this.state;

    function title(i) {
      return i.endsWith(".md") ? i.substring(0, i.length - 3) : i;
    }

    return (
      <Container>
        <Title level={level}>
          <TitleButton type="button" onClick={this.toggleExpand.bind(this)}>
            <InnerTitleButton expanded={expanded}>›</InnerTitleButton>
          </TitleButton>
          <TitleLink href={"#" + subPath + "/" + title(tree.name)}>
            {title(tree.name)}
          </TitleLink>
        </Title>
        {expanded &&
          (tree.children.length > 0 ? (
            tree.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(i => (
                <Sitemap
                  level={level + 1}
                  tree={i}
                  subPath={subPath + "/" + title(tree.name)}
                />
              ))
          ) : (
            <NoPages level={level + 1}>No Pages Inside</NoPages>
          ))}
      </Container>
    );
  }
}
