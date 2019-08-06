import React from 'react';
import { Editor } from 'slate';

export default function MarkdownShortcutPlugin() {
  function onSpace(event: React.KeyboardEvent, editor: Editor, next: () => void) {
    const { value } = editor;
    const { selection, startBlock, document } = value;
    if (selection.isExpanded) return next();

    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);
    const parent = document.getParent(startBlock.key);

    // only transform paragraphs
    if (startBlock.type !== 'paragraph') return next();

    if (leadingChars.match(/^#+$/) && leadingChars.length <= 6) {
      // create heading

      event.preventDefault();

      editor
        .setBlocks({
          type: 'heading',
          data: {
            depth: leadingChars.length,
          },
        })
        .moveFocusToStartOfNode(startBlock)
        .delete();
    } else if (leadingChars === '-' || leadingChars === '*') {
      // create unordered list

      event.preventDefault();

      editor
        .wrapBlock({ type: 'list' })
        .wrapBlock({
          type: 'listItem',
          data: {
            ordered: false,
          },
        })
        .moveFocusToStartOfNode(startBlock)
        .delete();
    } else if (
      leadingChars.match(/^\[[x\s]?\]$/) &&
      parent.object === 'block' &&
      parent.type === 'listItem'
    ) {
      // convert to check list
      event.preventDefault();
      editor
        .setNodeByKey(parent.key, {
          type: 'listItem',
          data: { ...parent.data, checked: false },
        })
        .moveFocusToStartOfNode(startBlock)
        .delete();
    } else {
      next();
    }
  }

  function onBackspace(event: React.KeyboardEvent, editor: Editor, next: () => void) {
    const { value } = editor;
    const { selection, document, startBlock } = value;

    if (selection.isExpanded) return next();

    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);
    const parent = document.getParent(startBlock.key);

    if (leadingChars.length === 0) {
      // cursor is at start of line -> remove format

      event.preventDefault();

      if (
        startBlock.type === 'paragraph' &&
        parent.object === 'block' &&
        parent.type === 'listItem'
      ) {
        // list items -> special handling
        editor.unwrapBlock('listItem').unwrapBlock('list');
      } else if (startBlock.type !== 'paragraph') {
        // any non-paragraph block -> becomes paragaraph
        editor.setBlocks({ type: 'paragraph' });
      } else {
        // already a paragraph -> default behaviour
        next();
      }
    } else {
      next();
    }
  }

  function onEnter(event: React.KeyboardEvent, editor: Editor, next: () => void) {
    const { value } = editor;
    const { selection, document } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const leadingChars = startBlock.text.slice(0, start.offset);
    const parent = document.getParent(startBlock.key);

    if (startBlock.type === 'heading') {
      // new block after heading becomes paragraph
      event.preventDefault();
      editor.splitBlock(1).setBlocks({ type: 'paragraph' });
    } else if (startBlock.type === 'code') {
      // allow newlines in code blocks
      editor.insertText('\n');
      event.preventDefault();
    } else if (startBlock.type === 'paragraph' && leadingChars === '```') {
      // create code block
      event.preventDefault();
      editor
        .moveFocusToStartOfNode(startBlock)
        .delete()
        .setBlocks({ type: 'code' });
    } else if (
      startBlock.type === 'paragraph' &&
      parent.object === 'block' &&
      parent.type === 'listItem' &&
      parent.text.length === 0
      // leadingChars.length === 0
    ) {
      // blank list item -> end list
      editor.unwrapBlock({ type: 'listItem' }).unwrapBlock({ type: 'list' });
    } else if (
      startBlock.type === 'paragraph' &&
      parent.object === 'block' &&
      parent.type === 'listItem'
    ) {
      // append list item
      editor
        .splitBlock(1)
        .unwrapBlock({ type: 'listItem' })
        .wrapBlock({ type: 'listItem', data: { checked: parent.data.get('checked') } });
    } else {
      return next();
    }
  }

  function onArrowDown(event: React.KeyboardEvent, editor: Editor, next: () => void) {
    const { value } = editor;
    const { startBlock } = value;

    // if cursor is in code block and there is no block to move to -> create a new one
    if (startBlock.type === 'code' && !value.nextBlock) {
      event.preventDefault();
      editor
        .moveToEndOfNode(startBlock)
        .splitBlock(1)
        .setBlocks({ type: 'paragraph' });
    } else {
      return next();
    }
  }

  function onTabDown(event: React.KeyboardEvent, editor: Editor, next: () => void) {
    const { value } = editor;
    const { startBlock, document } = value;
    const parent = document.getParent(startBlock.key);

    if (parent.object === 'block' && parent.type === 'listItem') {
      event.preventDefault();

      if (event.shiftKey) {
        // move item to parent list
        editor
          .unwrapBlock({ type: 'listItem' })
          .unwrapBlock({ type: 'list' })
          .unwrapBlock({ type: 'listItem' })
          .wrapBlock({ type: 'listItem' });
      } else {
        // create sub list
        editor
          .mergeNodeByKey(parent.key)
          .wrapBlock({ type: 'list' })
          .wrapBlock({ type: 'listItem' });
      }
    } else {
      return next();
    }
  }

  return {
    onKeyDown(event: React.KeyboardEvent, editor: Editor, next: () => void) {
      // Return with no changes if the keypress is not '&'
      if (event.key === ' ') onSpace(event, editor, next);
      else if (event.key === 'Backspace') onBackspace(event, editor, next);
      else if (event.key === 'Enter') onEnter(event, editor, next);
      else if (event.key === 'ArrowDown') onArrowDown(event, editor, next);
      else if (event.key === 'Tab') onTabDown(event, editor, next);
      else next();
    },
  };
}
