import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {  keyPressedInEditor,
          onClickInEditor,
          loadNoteInEditor,
          getTextFromEditor } from './Editor.js';

console.error = jest.fn();

/**
 *   STUB for createRange().
 */
document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  collapse: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

/**
 *   STUB for selection object.
 */
let selectionObject = {
  anchorNode: {},
  anchorOffset: 0,
  focusNode: {},
  focusOffset: 0,
  isCollapsed: true,
  addRange: () => {},
  removeAllRanges: () => {}
};

/**
 *   STUB for window.selection().
 */
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

/**
 *   A Mock Event.
 */
const mockEvent = () => {
  return {
    key: "",
    keyCode: null,
    preventDefault: () => {}
  };
};

/**
 *   A Mock App.
 */
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

/**
 *   STUB for Note text.
 */
const text =  "Some random text goes here!\n" +
              "Second *line* is here\n" +
              "Third line for some more fun\n" +
              "A\n" +
              "\n" +
              "\n" +
              "The next paragraph goes here.\n" +
              "1. The next paragraph goes here.\n" +
              "2. The next _paragraph_ goes here.\n" +
              "3. The next -paragraph- goes here.\n" +
              "8 The next -paragraph- goes here.\n" +
              "6. The next -paragraph- goes here.\n" +
              "# The next /paragraph/ goes here.\n" +
              "* The next `paragraph` goes here.\n" +
              "* The [next paragraph](www.google.com) goes here.\n" +
              "> The next paragraph goes here.\n" +
              "## The next *paragraph* goes here.\n" +
              "### The next /paragraph/ goes here.\n" +
              "#### The next `paragraph` goes here.\n" +
              "##### The next -paragraph- goes here.\n" +
              "###### The next _paragraph_ goes here.\n" +
              "Last line for this sample.",
      firstLineOfText = text.split("\n")[0];

beforeEach(() => {
  localStorage.removeItem("text");
});

it('loads Dashboard note DIV', () => {
  const { getByTestId } = render(<MockApp />);

  expect(getByTestId('dashboard-note')).toBeInTheDocument();
});

/**
 *   Tests for loadNoteInEditor().
 */
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

/**
 *   Tests for getTextFromEditor().
 */
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

/**
 *   Tests for keyPressedInEditor().
 */
describe('keyPressedInEditor', () => {
  beforeEach(() => {
    render(<MockApp />);
    loadNoteInEditor(text, "true");
  });

  it('no parameters: return without further execution', () => {
    const executed = keyPressedInEditor();

    expect(executed).toBe(false);
  });

  it('1 parameter:  return without further execution', () => {
    const executed = keyPressedInEditor({});

    expect(executed).toBe(false);
  });

  it('2 parameters: valid, but no branches executed', () => {
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

  it('invalid offset: return without further execution', () => {
    let spanElement = document.querySelector('.note__text');
    let selection = selectionObject;
    let event = mockEvent();

    selection.anchorNode = spanElement;
    selection.anchorOffset = 100;

    const executed = keyPressedInEditor(event, selection);
    // const textAfterEnter = getTextFromEditor();

    expect(executed).toBe(false);
  });

  describe('same SPAN', () => {
    let spanElement;
    let selection;
    let event;

    beforeEach(() => {
      spanElement = document.querySelector('.note__text');
      selection = selectionObject;
      event = mockEvent();

      selection.anchorNode = spanElement;
      selection.focusNode = spanElement;
      selection.anchorOffset = 0;
      selection.focusOffset = 4;
      selection.isCollapsed = false;
      event.metaKey = true;
    });

    it('copy', () => {
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(text.slice(selection.anchorOffset, selection.focusOffset));
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('copy: no selection', () => {
      selection.anchorNode = spanElement;
      selection.focusNode = spanElement;
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(null);
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('cut: anchorNode before focusNode (default)', () => {
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(selection.anchorOffset, selection.focusOffset);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: focusNode before anchorNode', () => {
      selection.anchorOffset = 4;
      selection.focusOffset = 0;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(selection.focusOffset, selection.anchorOffset);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: complete SPAN (only one SPAN in DIV)', () => {
      selection.anchorNode = spanElement;
      selection.focusNode = spanElement;
      selection.anchorOffset = 0;
      selection.focusOffset = spanElement.textContent.length;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(selection.anchorOffset, selection.focusOffset);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: complete SPAN (many SPANs in DIV)', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 0;
      selection.focusOffset = spanElementList[1].textContent.length;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.split("\n")[1].slice(selection.anchorOffset, selection.focusOffset);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: no selection', () => {
      selection.anchorNode = spanElement;
      selection.focusNode = spanElement;
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(null);
      expect(textAfterCut.length).toBe(text.length);
    });

    it('paste: one line of text', () => {
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 86;

      const textPasted = "paste line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length);
    });

    it('paste (with cut): one line of text', () => {
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
        return windowSelection;
      };

      event.keyCode = 86;

      const textPasted = "paste line";
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length - 4);
    });

    it('paste: no selection', () => {
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 86;

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(null);
      expect(textAfterPaste.length).toBe(text.length);
    });
  });

  describe('same DIV', () => {
    let spanElementList;
    let selection;
    let event;

    beforeEach(() => {
      spanElementList = document.querySelectorAll('.note__text');
      selection = selectionObject;
      event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[2];
      selection.anchorOffset = 0;
      selection.focusOffset = 3;
      selection.isCollapsed = false;
      event.metaKey = true;
    });

    it('copy: anchorNode before focusNode (default)', () => {
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(text.split("\n")[1].slice(0, 16));
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('copy: focusNode before anchorNode', () => {
      selection.anchorNode = spanElementList[2];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 0;
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(text.split("\n")[1].slice(0, 16));
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('cut: anchorNode before focusNode (default)', () => {
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.split("\n")[1].slice(0, 16);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: focusNode before anchorNode', () => {
      selection.anchorNode = spanElementList[2];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 0;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.split("\n")[1].slice(0, 16);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: complete DIV', () => {
      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[2];
      selection.anchorOffset = 0;
      selection.focusOffset = spanElementList[2].textContent.length;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.split("\n")[1].slice(0, 21);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('paste: in empty line', () => {
      selection.anchorNode = spanElementList[5];
      selection.focusNode = spanElementList[5];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 86;

      const textPasted = "paste a *new* line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length);
    });

    it('paste: one line of text', () => {
      selection.focusNode = spanElementList[1];
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 86;

      const textPasted = "paste a *new* line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length);
    });

    it('paste (with cut): one line of text', () => {
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
        return windowSelection;
      };

      event.keyCode = 86;

      const textPasted = "paste a *new* line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length - 16);
    });
  });

  describe('different DIV', () => {
    let spanElementList;
    let selection;
    let event;

    beforeEach(() => {
      spanElementList = document.querySelectorAll('.note__text');
      selection = selectionObject;
      event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 0;
      selection.focusOffset = 3;
      selection.isCollapsed = false;
      event.metaKey = true;
    });

    it('copy: anchorNode before focusNode (default)', () => {
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(text.slice(28, 53));
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('copy: focusNode before anchorNode', () => {
      selection.anchorNode = spanElementList[3];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 0;
      event.keyCode = 67;

      const executed = keyPressedInEditor(event, selection);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(text.slice(28, 53));
      expect(getTextFromEditor().length).toBe(text.length);
    });

    it('cut: anchorNode before focusNode (default)', () => {
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(28, 53);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: focusNode before anchorNode', () => {
      selection.anchorNode = spanElementList[3];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 0;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(28, 53);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: complete DIV nodes', () => {
      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 0;
      selection.focusOffset = spanElementList[3].textContent.length;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(0, 78);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('cut: multiple DIV nodes', () => {
      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 2;
      selection.focusOffset = 5;
      event.keyCode = 88;

      const executed = keyPressedInEditor(event, selection);
      const textAfterCut = getTextFromEditor();
      const textCut = text.slice(2, 55);

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textCut);
      expect(textAfterCut.length + textCut.length).toBe(text.length);
    });

    it('paste: multiple lines of text', () => {
      selection.focusNode = spanElementList[1];
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 86;

      const textPasted = "paste\na *new* line\nanother line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length);
    });

    it('paste (with cut): multiple lines of text', () => {
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
        return windowSelection;
      };

      event.keyCode = 86;

      const textPasted = "paste\na *new* line\nanother line"
      localStorage.setItem("text", textPasted);

      const executed = keyPressedInEditor(event, selection);
      const textAfterPaste = getTextFromEditor();

      expect(executed).toBe(true);
      expect(localStorage.getItem("text")).toBe(textPasted);
      expect(textAfterPaste.length - textPasted.length).toBe(text.length - 25);
    });
  });

  describe('Enter', () => {
    it('start of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1);
    });

    it('middle of DIV in text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1);
    });

    it('middle of DIV in text (with cut)', () => {
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
        windowSelection.anchorOffset = 3;
        windowSelection.focusOffset = 3;
        windowSelection.isCollapsed = true;
        return windowSelection;
      };

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 3;
      selection.focusOffset = 5;
      selection.isCollapsed = false;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1 - 24);
      expect(textAfterEnter.split("\n").length + 1).toBe(text.split("\n").length + 1);
    });

    it('end of DIV, middle of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = spanElementList[1].textContent.length;
      selection.focusOffset = spanElementList[1].textContent.length;
      selection.isCollapsed = true;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1);
    });

    it('middle DIV in text', () => {
      let spanElement = document.querySelector('.note__bold');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElement;
      selection.focusNode = spanElement;
      selection.anchorOffset = 2;
      selection.focusOffset = 2;
      selection.isCollapsed = true;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1);
    });

    it('end of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      // Assumption: In text, Last SPAN of last DIV is of class ".note__text".
      let lastIndex = spanElementList.length - 1;

      selection.anchorNode = spanElementList[lastIndex];
      selection.focusNode = spanElementList[lastIndex];
      selection.anchorOffset = spanElementList[lastIndex].textContent.length;
      selection.focusOffset = spanElementList[lastIndex].textContent.length;
      selection.isCollapsed = true;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1);
    });

    it('end of text (with cut)', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      // Assumption: In text, Last SPAN of last DIV is of class ".note__text".
      let lastIndex = spanElementList.length - 1;

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
        windowSelection.anchorNode = spanElementList[3];
        windowSelection.focusNode = spanElementList[3];
        windowSelection.anchorOffset = 5;
        windowSelection.focusOffset = 5;
        windowSelection.isCollapsed = true;
        return windowSelection;
      };

      selection.anchorNode = spanElementList[3];
      selection.focusNode = spanElementList[lastIndex];
      selection.anchorOffset = 5;
      selection.focusOffset = spanElementList[lastIndex].textContent.length;
      selection.isCollapsed = false;
      event.keyCode = 13;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1 - 591);
      expect(textAfterEnter.split("\n").length).toBe(text.split("\n").length + 1 - 19);
    });
  });

  describe('a character is entered', () => {
    it('single char entered', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'a';
      event.keyCode = 65;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
    });

    it('single blankspace entered', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = ' ';
      event.keyCode = 32;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
    });

    it('single < entered', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 4;
      selection.focusOffset = 4;
      selection.isCollapsed = true;
      event.key = '<';
      event.keyCode = 188;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1);
    });

    it('single char entered (with cut)', () => {
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
        windowSelection.anchorOffset = 3;
        windowSelection.focusOffset = 3;
        windowSelection.isCollapsed = true;
        return windowSelection;
      };

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 3;
      selection.focusOffset = 5;
      selection.isCollapsed = false;
      event.key = 'a';
      event.keyCode = 65;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 1 - 24);
    });

    it('ordered list: single char entered', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[13];
      selection.focusNode = spanElementList[13];
      selection.anchorOffset = 1;
      selection.focusOffset = 1;
      selection.isCollapsed = true;
      event.key = '.';
      event.keyCode = 190;

      let executed = keyPressedInEditor(event, selection);

      spanElementList = document.querySelectorAll('.note__text');
      selection.anchorNode = spanElementList[13];
      selection.focusNode = spanElementList[13];
      selection.anchorOffset = 2;
      selection.focusOffset = 2;
      selection.isCollapsed = true;
      event.key = ' ';
      event.keyCode = 32;

      executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 2);
    });

    it('ordered list: single char entered at first item', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[8];
      selection.focusNode = spanElementList[8];
      selection.anchorOffset = 1;
      selection.focusOffset = 1;
      selection.isCollapsed = true;
      event.key = '1';
      event.keyCode = 49;

      const executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 3);
    });

    it('ordered list: single char entered at first line', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = '1';
      event.keyCode = 49;

      let executed = keyPressedInEditor(event, selection);
      expect(executed).toBe(true);

      spanElementList = document.querySelectorAll('.note__text');
      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 1;
      selection.focusOffset = 1;
      selection.isCollapsed = true;
      event.key = '.';
      event.keyCode = 190;

      executed = keyPressedInEditor(event, selection);
      expect(executed).toBe(true);

      spanElementList = document.querySelectorAll('.note__text');
      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 2;
      selection.focusOffset = 2;
      selection.isCollapsed = true;
      event.key = ' ';
      event.keyCode = 32;

      executed = keyPressedInEditor(event, selection);
      const textAfterEnter = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterEnter.length).toBe(text.length + 3);
    });
  });

  describe('Backspace', () => {
    it('start of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length);
    });

    it('line is empty', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[5].firstChild;
      selection.focusNode = spanElementList[5].firstChild;
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('this line & previous line are empty', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[6];
      selection.focusNode = spanElementList[6];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('previous line is empty', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[7];
      selection.focusNode = spanElementList[7];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('last line', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[spanElementList.length - 1];
      selection.focusNode = spanElementList[spanElementList.length - 1];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('ordered list: offset 0 of 2nd item of list', () => {
      let spanElementList = document.querySelectorAll('.note__orderedlist');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 0;
      selection.focusOffset = 0;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('ordered list: offset "2." of 2nd item of list', () => {
      let spanElementList = document.querySelectorAll('.note__orderedlist');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[1];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('line of length 1', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[4];
      selection.focusNode = spanElementList[4];
      selection.anchorOffset = 1;
      selection.focusOffset = 1;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('middle of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });

    it('middle of text (with cut)', () => {
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
        windowSelection.anchorOffset = 3;
        windowSelection.focusOffset = 3;
        windowSelection.isCollapsed = true;
        return windowSelection;
      };

      selection.anchorNode = spanElementList[1];
      selection.focusNode = spanElementList[3];
      selection.anchorOffset = 3;
      selection.focusOffset = 5;
      selection.isCollapsed = false;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1 - 23);
    });

    it('end of text', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[spanElementList.length - 1];
      selection.focusNode = spanElementList[spanElementList.length - 1];
      selection.anchorOffset = spanElementList[spanElementList.length - 1].textContent.length;
      selection.focusOffset = spanElementList[spanElementList.length - 1].textContent.length;
      selection.isCollapsed = true;
      event.key = 'Backspace';
      event.keyCode = 8;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length - 1);
    });
  });

  describe('ArrowRight', () => {
    it('ArrowRight is pressed', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'ArrowRight';
      event.keyCode = 39;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length);
    });
  });

  describe('ArrowDown', () => {
    it('ArrowDown is pressed', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'ArrowDown';
      event.keyCode = 40;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length);
    });
  });

  describe('ArrowLeft', () => {
    it('ArrowLeft is pressed', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'ArrowLeft';
      event.keyCode = 37;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length);
    });
  });

  describe('ArrowUp', () => {
    it('ArrowUp is pressed', () => {
      let spanElementList = document.querySelectorAll('.note__text');
      let selection = selectionObject;
      let event = mockEvent();

      selection.anchorNode = spanElementList[0];
      selection.focusNode = spanElementList[0];
      selection.anchorOffset = 3;
      selection.focusOffset = 3;
      selection.isCollapsed = true;
      event.key = 'ArrowUp';
      event.keyCode = 38;

      const executed = keyPressedInEditor(event, selection);
      const textAfterUpdate = getTextFromEditor();

      expect(executed).toBe(true);
      expect(textAfterUpdate.length).toBe(text.length);
    });
  });
});

/**
 *   Tests for onClickInEditor().
 */
describe('onClickInEditor', () => {
  it('click in editor', () => {
    // let spanElementList = document.querySelectorAll('.note__text');
    let event = mockEvent();

    onClickInEditor(event);
  });
});
