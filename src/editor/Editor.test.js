import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {  keyPressedInEditor,
          onClickInEditor,
          loadNoteInEditor,
          getTextFromEditor } from './Editor.js';

document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  collapse: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

let selectionObject = {
  anchorNode: {},
  anchorOffset: 0,
  focusNode: {},
  focusOffset: 0,
  isCollapsed: true,
  addRange: () => {},
  removeAllRanges: () => {}
};

window.getSelection = () => {
  return {
    anchorNode: {},
    anchorOffset: 0,
    focusNode: {},
    focusOffset: 0,
    isCollapsed: true,
    addRange: () => {},
    removeAllRanges: () => {}
  };
};

const mockEvent = () => {
  return {
    key: "",
    keyCode: null,
    preventDefault: () => {}
  };
};

const MockApp = () => {
  function onKeyDownInEditor(e) {

  }

  return (
    <div  contentEditable="false"
          className="note"
          onKeyDown={onKeyDownInEditor}
          onMouseUp={onClickInEditor}
          data-testid="dashboard-note">
      <div className="note__line">
        <p className="note__paragraph">
          <span className="note__text"><br /></span>
        </p>
      </div>
    </div>
  )
}

const text =  "Some random text goes here!\n" +
              "Second *line* is here\n" +
              "Third line for some more fun\n" +
              "\n" +
              "1. The next paragraph goes here.\n",
      firstLineOfText = text.split("\n")[0];

it('loads Dashboard note DIV', () => {
  const { getByTestId } = render(<MockApp />);

  expect(getByTestId('dashboard-note')).toBeInTheDocument();
});

describe('loadNoteInEditor', () => {
  it('no parameters: return without affecting DOM', () => {
    const { getByTestId } = render(<MockApp />);

    loadNoteInEditor();

    const dashboardNoteElement = getByTestId('dashboard-note');
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("false");
  });

  it('1 parameter: return without affecting DOM', () => {
    const { getByTestId } = render(<MockApp />);

    loadNoteInEditor(text);

    const dashboardNoteElement = getByTestId('dashboard-note');
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("false");
  });

  it('editable: invalid -> return without affecting DOM', () => {
    const { getByTestId } = render(<MockApp />);

    loadNoteInEditor(text, "invalid");

    const dashboardNoteElement = getByTestId('dashboard-note');
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("false");
  });

  it('text: "" -> insert <br> in DOM', () => {
    const { getByTestId } = render(<MockApp />);

    loadNoteInEditor("", "true");

    const dashboardNoteElement = getByTestId('dashboard-note');
    const spanElement = document.querySelector(".note__text");
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("true");
    expect(spanElement.innerHTML).toBe("<br>");
  });

  it('editable: false -> Editor should not be editable', () => {
    const { getByTestId, getByText } = render(<MockApp />);

    loadNoteInEditor(text, "false");

    const dashboardNoteElement = getByTestId('dashboard-note');
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("false");
    expect(getByText(firstLineOfText)).toBeInTheDocument();
  });

  it('editable: true -> Editor should be editable', () => {
    const { getByTestId, getByText } = render(<MockApp />);

    loadNoteInEditor(text, "true");

    const dashboardNoteElement = getByTestId('dashboard-note');
    expect(dashboardNoteElement.getAttribute("contentEditable")).toBe("true");
    expect(getByText(firstLineOfText)).toBeInTheDocument();
  });
});

describe('getTextFromEditor', () => {
  it('empty string', () => {
    render(<MockApp />);

    loadNoteInEditor("", "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe("");
  });

  it('empty lines', () => {
    render(<MockApp />);

    loadNoteInEditor("\n", "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe("\n");
  });

  it('single line of text', () => {
    render(<MockApp />);

    loadNoteInEditor(firstLineOfText, "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe(firstLineOfText);
  });

  it('multiple lines of text', () => {
    render(<MockApp />);

    loadNoteInEditor(text, "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe(text);
  });
});

describe('keyPressedInEditor', () => {
  it('no parameters: return without further execution', () => {
    const { getByText } = render(<MockApp />);
    loadNoteInEditor(text, "true");

    const executed = keyPressedInEditor();

    expect(executed).toBe(false);
  });

  it('1 parameter:  return without further execution', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    const executed = keyPressedInEditor({});

    expect(executed).toBe(false);
  });

  it('2 parameters: valid, but no branches executed', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 0;

    const executed = keyPressedInEditor(event, selection);

    expect(executed).toBe(true);
  });

  it('copy: same SPAN', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 4;
    selection.isCollapsed = false;
    event.keyCode = 67;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(text.slice(selection.anchorOffset, selection.focusOffset));
    expect(getTextFromEditor().length).toBe(text.length);
  });

  it('copy: same DIV', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[2];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 67;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(text.split("\n")[1].slice(0, 16));
    expect(getTextFromEditor().length).toBe(text.length);
  });

  it('copy: different DIVs', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[3];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 67;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(text.slice(28, 53));
    expect(getTextFromEditor().length).toBe(text.length);
  });

  it('cut: same SPAN', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 4;
    selection.isCollapsed = false;
    event.keyCode = 88;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);
    const textAfterCut = getTextFromEditor();
    const textCut = text.slice(selection.anchorOffset, selection.focusOffset);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textCut);
    expect(textAfterCut.length + textCut.length).toBe(text.length);
  });

  it('cut: same DIV', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[2];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 88;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);
    const textAfterCut = getTextFromEditor();
    const textCut = text.split("\n")[1].slice(0, 16);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textCut);
    expect(textAfterCut.length + textCut.length).toBe(text.length);
  });

  it('cut: different DIVs', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[3];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 88;
    event.metaKey = true;

    const executed = keyPressedInEditor(event, selection);
    const textAfterCut = getTextFromEditor();
    const textCut = text.slice(28, 53);

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textCut);
    expect(textAfterCut.length + textCut.length).toBe(text.length);
  });

  it('paste: one line of text (same SPAN)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 0;
    selection.isCollapsed = true;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length);
  });

  it('paste (with cut): one line of text (same SPAN)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    let windowSelection = {
      anchorNode: {},
      anchorOffset: 0,
      focusNode: {},
      focusOffset: 0,
      isCollapsed: true,
      addRange: () => {},
      removeAllRanges: () => {}
    };
    window.getSelection = () => {
      let spanElement = document.querySelector('.note__text');
      windowSelection.anchorNode = spanElement;
      windowSelection.focusNode = spanElement;
      windowSelection.anchorOffset = 0;
      windowSelection.focusOffset = 0;
      windowSelection.isCollapsed = false;
      return windowSelection;
    };

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 4;
    selection.isCollapsed = false;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length - 4);
  });

  it('paste: one line of text (same DIV)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 0;
    selection.isCollapsed = true;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste a *new* line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length);
  });

  it('paste (with cut): one line of text (same DIV)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    let windowSelection = {
      anchorNode: {},
      anchorOffset: 0,
      focusNode: {},
      focusOffset: 0,
      isCollapsed: true,
      addRange: () => {},
      removeAllRanges: () => {}
    };
    window.getSelection = () => {
      let spanElementList = document.querySelectorAll('.note__text');
      windowSelection.anchorNode = spanElementList[1];
      windowSelection.focusNode = spanElementList[1];
      windowSelection.anchorOffset = 0;
      windowSelection.focusOffset = 0;
      windowSelection.isCollapsed = false;
      return windowSelection;
    };

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[2];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste a *new* line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length - 16);
  });

  it('paste: multiple lines of text (different DIVs)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.focusNode = spanElement;
    selection.anchorOffset = 0;
    selection.focusOffset = 0;
    selection.isCollapsed = true;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste\na *new* line\nanother line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length);
  });

  it('paste (with cut): multiple lines of text (different DIVs)', () => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");

    let spanElementList = document.querySelectorAll('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    let windowSelection = {
      anchorNode: {},
      anchorOffset: 0,
      focusNode: {},
      focusOffset: 0,
      isCollapsed: true,
      addRange: () => {},
      removeAllRanges: () => {}
    };
    window.getSelection = () => {
      let spanElementList = document.querySelectorAll('.note__text');
      windowSelection.anchorNode = spanElementList[1];
      windowSelection.focusNode = spanElementList[1];
      windowSelection.anchorOffset = 0;
      windowSelection.focusOffset = 0;
      windowSelection.isCollapsed = false;
      return windowSelection;
    };

    selection.anchorNode = spanElementList[1];
    selection.focusNode = spanElementList[3];
    selection.anchorOffset = 0;
    selection.focusOffset = 3;
    selection.isCollapsed = false;
    event.keyCode = 86;
    event.metaKey = true;
    const textPasted = "paste\na *new* line\nanother line"
    localStorage.setItem("text", textPasted);

    const executed = keyPressedInEditor(event, selection);
    const textAfterPaste = getTextFromEditor();

    expect(executed).toBe(true);
    expect(localStorage.getItem("text")).toBe(textPasted);
    expect(textAfterPaste.length - textPasted.length).toBe(text.length - 25);
  });
});
