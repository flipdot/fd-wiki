import React, { useState, useEffect, useRef } from 'react';
import { Editor } from 'slate-react';
import { Value, Inline, Block } from 'slate';

import { getPage, getSitemap, savePage, createPage } from './api';
import { extractFrontmatter } from './frontmatter';
import { Sitemap } from './components/Sitemap';
import Sidebar, { Title, Logo, BottomButton } from './components/Sidebar';
import Content from './components/Content';
import GlobalStyle from './components/GlobalStyle';
import Header from './components/Header';
import { renderNode, valueFromMarkdown, markdownFromValue } from './slate-md';
import Button, { ButtonGroup } from './components/Button';
import MarkdownShortcutPlugin from './slate-md/MarkdownShortcutPlugin';
import Modal from './components/Modal';
import Input, { InputGroup } from './components/Input';

const plugins = [MarkdownShortcutPlugin()];

const schema = {
  blocks: {
    image: {
      isVoid: true,
    },
  },
  inlines: {
    image: {
      isVoid: true,
    },
  },
};

export default function App() {
  const [content, setContent] = useState(Value.fromJSON({}));
  const [currentPath, setCurrentPath] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [sitemap, setSitemap] = useState(null);
  const [newPagePath, setNewPagePath] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const editorRef = useRef();

  function navigate() {
    const page = window.location.hash || '#/index';
    loadPage(decodeURIComponent(page.substr(1)));
  }

  async function loadPage(path) {
    setCurrentPath(path);
    setContent(Value.fromJSON({}));

    const page = await getPage(path);

    setCurrentPage(page);

    document.title = page.title;

    const { frontmatter, content } = extractFrontmatter(page.content);
    let normalizedContent = content.trim().length === 0 ? '#\n' : content;

    const pageValue = valueFromMarkdown(normalizedContent);

    setContent(pageValue);
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
        <BottomButton type="button" onClick={() => {
          setNewPagePath(currentPath + '/');
          setCreateModalVisible(true);
        }}>
          New Page
        </BottomButton>
        {createModalVisible && <Modal title="New page">
          <InputGroup label="Page">
            <Input value={newPagePath} onChange={(e) => setNewPagePath(e.currentTarget.value)} autoFocus />
          </InputGroup>
          <Button primary inline onClick={async () => {
            await createPage(newPagePath);
            setCreateModalVisible(false);
          }}>Create</Button>
        </Modal>}
      </Sidebar>
      <Header
        page={currentPath}
        actions={
          <>
            <ButtonGroup>
              {/* <Button>
                <b>B</b>
              </Button>
              <Button>
                <i>i</i>
              </Button> */}
              <Button
                onClick={() => {
                  const image = prompt('URL?');
                  editorRef.current.insertInline(
                    Inline.create({ type: 'image', data: { url: image } }),
                  );
                }}
              >
                Insert Image
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                primary
                onClick={async () => {
                  const md = markdownFromValue(content);
                  const sha = await savePage(currentPath, md, currentPage);
                  setCurrentPage({ ...currentPage, sha });
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
          ref={editorRef}
          plugins={plugins}
          value={content}
          onChange={updateContent}
          renderBlock={renderNode}
          renderInline={renderNode}
          schema={schema}
        />
      </Content>
    </div>
  );
}
