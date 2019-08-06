import React, { useState, useEffect } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

import { getPage, getSitemap } from './api';
import { extractFrontmatter } from './frontmatter';
import { Sitemap } from './components/Sitemap';
import Sidebar, { Title, Logo, BottomButton } from './components/Sidebar';
import Content from './components/Content';
import GlobalStyle from './components/GlobalStyle';
import Header from './components/Header';
import { renderNode, valueFromMarkdown, markdownFromValue } from './slate-md';
import Button, { ButtonGroup } from './components/Button';
import MarkdownShortcutPlugin from './slate-md/MarkdownShortcutPlugin';

const plugins = [MarkdownShortcutPlugin()];

export default function App() {
  const [content, setContent] = useState(Value.fromJSON({}));
  const [currentPage, setCurrentPage] = useState('');
  const [sitemap, setSitemap] = useState(null);

  function navigate() {
    const page = window.location.hash || '#/index';
    loadPage(page.substr(1));
  }

  async function loadPage(page) {
    setCurrentPage(decodeURIComponent(page));
    setContent(Value.fromJSON({}));

    const rawPage = await getPage(page);

    const { frontmatter, content } = extractFrontmatter(rawPage);

    if (frontmatter.title) {
      document.title = frontmatter.title;
    }

    setContent(valueFromMarkdown(content));
  }

  function updateContent(e) {
    setContent(e.value);
  }

  useEffect(() => {
    window.addEventListener('hashchange', navigate);

    navigate();

    getSitemap().then(sitemap => {
      setSitemap(sitemap);
    });

    return () => {
      window.removeEventListener('hashchange', navigate);
    };
  }, []);

  return (
    <div>
      <GlobalStyle />
      <Sidebar>
        <Logo>
          <img src="https://flipdot.org/wikistatic/common/flipdot.png" alt="flipdot" />
          <Title>/wiki</Title>
        </Logo>
        {sitemap && sitemap.map(element => <Sitemap tree={element} />)}
        <BottomButton type="button">New Page</BottomButton>
      </Sidebar>
      <Header
        page={currentPage}
        actions={
          <>
            <ButtonGroup>
              <Button>
                <b>B</b>
              </Button>
              <Button>
                <i>i</i>
              </Button>
              <Button>aA</Button>
              <Button>{'<>'}</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                primary
                onClick={() => {
                  const md = markdownFromValue(content);
                  console.log(markdownFromValue(content));
                  setContent(valueFromMarkdown(md));
                }}
              >
                Save
              </Button>
            </ButtonGroup>
          </>
        }
      />
      <Content>
        <Editor
          plugins={plugins}
          value={content}
          onChange={updateContent}
          renderNode={renderNode}
        />
      </Content>
    </div>
  );
}
