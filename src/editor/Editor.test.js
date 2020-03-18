import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {onKeyDownInEditor,
          onClickInEditor,
          loadNoteInEditor,
          getTextFromEditor} from './Editor.js';

const MockApp = () => {
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
              "\n" +
              "1. The next paragraph goes here.",
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
    const { getByText } = render(<MockApp />);

    loadNoteInEditor("", "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe("");
  });

  it('empty lines', () => {
    const { getByText } = render(<MockApp />);

    loadNoteInEditor("\n", "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe("\n");
  });

  it('single line of text', () => {
    const { getByText } = render(<MockApp />);

    loadNoteInEditor(firstLineOfText, "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe(firstLineOfText);
  });

  it('multiple lines of text', () => {
    const { getByText } = render(<MockApp />);

    loadNoteInEditor(text, "false");
    const textFromEditor = getTextFromEditor();

    expect(textFromEditor).toBe(text);
  });
});
