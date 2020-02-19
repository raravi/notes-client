import React from 'react';
import './App.css';

function App() {
  function setCaretPosition(el) {
    console.log(el);
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
      let range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(true);
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      let textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(true);
      textRange.select();
    }
  }

  function setCaretPositionToOffset(el, offset) {
    el.focus();
    console.log(el, offset);
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el.firstChild, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function checkHeader(el, text) {
    let currentText;
    if (text) {
      currentText = text;
    } else {
      currentText = el.innerText;
    }
    let newText = "";
    for (let i = 0; i < currentText.length-1; i++) {
      if (currentText[i] === '\xa0')
        newText += " ";
      else
        newText += currentText[i];
    }
    console.log(newText);

    let strings = newText.slice(0).split(" ");
    let firstString = strings[0];
    console.log(strings);
    console.log("'" + firstString + "'");
    if (strings.length > 1 && firstString === "#") {
      console.log("Header 1");
      el.setAttribute("class", "note__header1");
    } else if (strings.length > 1 && firstString === "##") {
      console.log("Header 2");
      el.setAttribute("class", "note__header2");
    } else if (strings.length > 1 && firstString === "###") {
      console.log("Header 3");
      el.setAttribute("class", "note__header3");
    } else if (strings.length > 1 && firstString === "####") {
      console.log("Header 4");
      el.setAttribute("class", "note__header4");
    } else if (strings.length > 1 && firstString === "#####") {
      console.log("Header 5");
      el.setAttribute("class", "note__header5");
    } else if (strings.length > 1 && firstString === "######") {
      console.log("Header 6");
      el.setAttribute("class", "note__header6");
    } else {
      console.log("Para");
      el.setAttribute("class", "note__paragraph");
    }
  }

  function onKeyDownInEditor(e) {
    // Get current SPAN details
    let currentSelection = window.getSelection();
    let currentNode = currentSelection.anchorNode;
    if (currentNode.nodeType === 3)
      currentNode = currentNode.parentNode;
    let currentOffset = currentSelection.anchorOffset;
    let currentText = currentNode.innerText;

    // trap the return key being pressed
    if (e.keyCode === 13) {
      // Prevent the <div /> creation.
      e.preventDefault();

      // Create new DIV with an 'empty' SPAN inside it
      let spanElement = document.createElement('span');
      spanElement.setAttribute("class", "note__paragraph");
      spanElement.innerText = '\xa0';

      let divElement = document.createElement('div');
      divElement.setAttribute("class", "note__line");
      divElement.appendChild(spanElement);

      // Check for conditions to edit DIVs
      if (currentOffset === 0) {
        currentNode.innerText = '\xa0';
        currentNode.setAttribute("class","note__paragraph");
        spanElement.innerText = currentText;
      } else if (currentOffset === currentText.length-1) {

      } else {
        let stringBeforeCaret = currentText.slice(0, currentOffset);
        let stringAfterCaret = currentText.slice(currentOffset, currentText.length);
        currentNode.innerText = stringBeforeCaret + '\xa0';
        spanElement.innerText = stringAfterCaret;
      }
      // Insert new DIV after updating it above
      currentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.nextSibling);

      // Check if Header or Paragraph
      checkHeader(currentNode);
      checkHeader(spanElement);

      // Set the Cursor position
      setCaretPosition(spanElement);

    } else if (e.key.length === 1) {
      // 'e.key' of length 1 represents the character to insert
      console.log("In length=1", e.key, e.keyCode);

      // Calculate new Text after addition of character from 'e.key'
      let stringBeforeCaret = currentText.slice(0, currentOffset);
      let stringAfterCaret = currentText.slice(currentOffset, currentText.length);
      currentText = "" + stringBeforeCaret + e.key + stringAfterCaret;

      // Check if Header or Paragraph
      checkHeader(currentNode, currentText);

    } else if (e.key === "Backspace") {
      console.log("In Backspace", e.key, e.keyCode);

      if (currentOffset === 0) {
        let previousDivNode = currentNode.parentNode.previousSibling;
        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent the <div /> creation.
          let previousText = previousDivNode.firstChild.innerText;
          previousDivNode.firstChild.innerText = previousText.slice(0, -1) + currentText;
          setCaretPositionToOffset(previousDivNode.firstChild, previousText.length-1);
          currentNode.parentNode.remove();
        }
      } else {
        let stringBeforeCaret = currentText.slice(0, currentOffset);
        let stringAfterCaret = currentText.slice(currentOffset);
        currentText = "" + stringBeforeCaret.slice(0, -1) + stringAfterCaret;
        checkHeader(currentNode, currentText);
      }

    } else if (e.key === "ArrowRight") {
      console.log("In ArrowRight", e.key, e.keyCode);

      if (currentOffset === currentText.length-1) {
        e.preventDefault(); // Prevent the <div /> creation.
        let nextDivNode = currentNode.parentNode.nextSibling;
        if (nextDivNode && nextDivNode.getAttribute("class") === "note__line") {
          setCaretPositionToOffset(nextDivNode.firstChild, 0);
        }
      }

    } else if (e.key === "ArrowDown") {
      console.log("In ArrowDown", e.key, e.keyCode);

      let nextDivNode = currentNode.parentNode.nextSibling;
      if (!nextDivNode) {
        e.preventDefault(); // Prevent the <div /> creation.
        setCaretPositionToOffset(currentNode, currentText.length-1);
      } else if (nextDivNode.getAttribute("class") === "note__line") {
        e.preventDefault(); // Prevent the <div /> creation.
        let nextText = nextDivNode.firstChild.innerText;
        if (currentOffset > nextText.length-1) {
          setCaretPositionToOffset(nextDivNode.firstChild, nextText.length-1);
        } else {
          setCaretPositionToOffset(nextDivNode.firstChild, currentOffset);
        }
      }

    } else if (e.key === "ArrowLeft") {
      console.log("In ArrowLeft", e.key, e.keyCode);

      if (currentOffset === 0) {
        let previousDivNode = currentNode.parentNode.previousSibling;
        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent the <div /> creation.
          let previousText = previousDivNode.firstChild.innerText;
          setCaretPositionToOffset(previousDivNode.firstChild, previousText.length-1);
        }
      }

    } else if (e.key === "ArrowUp") {
      console.log("In ArrowUp", e.key, e.keyCode);

      let previousDivNode = currentNode.parentNode.previousSibling;
      if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
        e.preventDefault(); // Prevent the <div /> creation.
        let previousText = previousDivNode.firstChild.innerText;
        if (currentOffset > previousText.length-1) {
          setCaretPositionToOffset(previousDivNode.firstChild, previousText.length-1);
        } else {
          setCaretPositionToOffset(previousDivNode.firstChild, currentOffset);
        }
      }

    } else {
      console.log("In else", e.key, e.keyCode);
    }
  }

  function onClick(e) {
    console.log("On Click");
    // Get current SPAN details
    let currentSelection = window.getSelection();
    let currentNode = currentSelection.anchorNode;
    if (currentNode.nodeType === 3)
      currentNode = currentNode.parentNode;
    let currentOffset = currentSelection.anchorOffset;
    let currentText = currentNode.innerText;

    if (currentOffset > currentText.length-1) {
      e.preventDefault();
      setCaretPositionToOffset(currentNode, currentText.length-1);
    } else {
      setCaretPositionToOffset(currentNode, currentOffset);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="header__title">Notes</h1>
      </header>
      <div contentEditable="true" className="note" onKeyDown={onKeyDownInEditor} onMouseUp={onClick}>
        <div className="note__line">
          <span className="note__header1"># Header 1&nbsp;</span>
        </div>
        <div className="note__line">
          <span className="note__paragraph">Simple line&nbsp;</span>
        </div>
      </div>
      <footer className="footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="/">Github</a></p>
      </footer>
    </div>
  );
}

export default App;
