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
import { renderNode, valueFromMarkdown, markdownFromValue } from './slateMd';
import Button, { ButtonGroup } from './components/Button';

function MarkdownShortcutPlugin() {
  function onSpace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;

    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);

    if (startBlock.type !== 'paragraph') return next();

    if (leadingChars.match(/^#+$/) && leadingChars.length <= 6) {
      // create headline

      event.preventDefault();

      editor.setBlocks({
        type: 'heading',
        data: {
          depth: leadingChars.length,
        },
      });

      editor.moveFocusToStartOfNode(startBlock).delete();
    } else if (leadingChars === '-' || leadingChars === '*') {
      // create headline

      event.preventDefault();

      editor.setBlocks({
        type: 'listItem',
        data: {
          ordered: false,
        },
      });

      editor.moveFocusToStartOfNode(startBlock).delete();
    } else {
      next();
    }
  }

  function onBackspace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);

    if (leadingChars.length === 0) {
      event.preventDefault();
      editor.setBlocks({
        type: 'paragraph',
      });
    } else {
      next();
    }
  }

  function onEnter(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);

    if (startBlock.type === 'heading') {
      event.preventDefault();
      editor.splitBlock().setBlocks({ type: 'paragraph' });
    } else if (startBlock.type === 'code') {
      editor.insertText('\n');
      event.preventDefault();
    } else if (startBlock.type === 'paragraph' && leadingChars === '```') {
      event.preventDefault();
      editor.moveFocusToStartOfNode(startBlock).delete();
      editor.setBlocks({ type: 'code' });
    } else {
      return next();
    }
  }

  function onArrowDown(event, editor, next) {
    const { value } = editor;
    const { startBlock } = value;

    // if cursor is in code block and there is no block to move to -> create a new one
    if (startBlock.type === 'code' && !value.nextBlock) {
      event.preventDefault();
      editor.moveToEndOfNode(startBlock).splitBlock().setBlocks({ type: 'paragraph' });
    } else {
      return next();
    }

  }

  return {
    onKeyDown(event, editor, next) {
      // Return with no changes if the keypress is not '&'
      if (event.key === ' ') onSpace(event, editor, next);
      else if (event.key === 'Backspace') onBackspace(event, editor, next);
      else if (event.key === 'Enter') onEnter(event, editor, next);
      else if (event.key === 'ArrowDown') onArrowDown(event, editor, next);
      else next();
    },
  };
}

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
