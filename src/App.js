import React from 'react';
import { Pairs } from './Pairs';
import { Headers } from './Headers';
import './App.css';

function App() {
  function setCaretPositionToOffset(el, offset) {
    el.focus();
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el.firstChild, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function setCaretPositionInChildNode(node, offset) {
    let offsetLeft = offset;
    let children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (offsetLeft <= children[i].innerText.length) {
        setCaretPositionToOffset(children[i], offsetLeft);
        return;
      } else {
        offsetLeft -= children[i].innerText.length;
      }
    }
  }

  function checkForPairs(parentNode, newText, length, offset, e) {
    let pairs = new Pairs();
    let text = newText.slice(length);
    console.log("text : '" + text + "'");
    pairs.getCount(text);
    if (pairs.totalCountOfCharacters >= 1) {
      pairs.getIndex(text, length);
      parentNode.innerHTML = pairs.getNewSpanText(newText, length);
      setCaretPositionInChildNode(parentNode, offset);
      e.preventDefault();
    }
  }

  function checkHeader(el, currentText, offset, e) {
    let newText = "";
    for (let i = 0; i < currentText.length-1; i++) {
      if (currentText[i] === '\xa0')
        newText += " ";
      else
        newText += currentText[i];
    }

    let strings = newText.split(" ");
    let regexForOrderedList = new RegExp('^\\d+\\.$');
    let isOrderedList = regexForOrderedList.test(strings[0]);

    let headers = new Headers();
    headers.setHeader(el.parentNode, strings, isOrderedList);

    // Handle *word*
    let isHeader = headers.characterCodeOfHeaders.indexOf(strings[0]);
    if (strings.length > 1 && (isHeader !== -1 || isOrderedList)) {
      // Not a paragraph
      checkForPairs(el.parentNode, newText, strings[0].length, offset, e);
    } else {
      // Paragraph
      checkForPairs(el.parentNode, newText, 0, offset, e);
    }
  }

  function onKeyDownInEditor(e) {
    // Get current SPAN details
    let currentSelection = window.getSelection();
    let currentNode = currentSelection.anchorNode.parentNode;
    let currentOffset = currentSelection.anchorOffset;
    let currentText = currentNode.innerText;
    let parentOffset = 0;

    let children = currentNode.parentNode.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i] === currentNode) {
        parentOffset += currentOffset;
        break;
      } else {
        parentOffset += children[i].innerText.length;
      }
    }

    // trap the return key being pressed
    if (e.keyCode === 13) {
      // Prevent the <div /> creation.
      e.preventDefault();

      // Create new DIV with an 'empty' SPAN inside it
      let innerSpanElement = document.createElement('span');
      innerSpanElement.setAttribute("class", "note__text");
      innerSpanElement.innerText = '\xa0';

      let spanElement = document.createElement('span');
      spanElement.setAttribute("class", "note__paragraph");
      spanElement.appendChild(innerSpanElement);

      let divElement = document.createElement('div');
      divElement.setAttribute("class", "note__line");
      divElement.appendChild(spanElement);

      // Check for conditions to edit DIVs
      if (parentOffset === 0) {
        currentNode.parentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.parentNode);
        // Set the Cursor position
        setCaretPositionToOffset(currentNode, 0);
      } else if (parentOffset === currentNode.parentNode.innerText.length-1) {
        // Insert new DIV after updating it above
        currentNode.parentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.parentNode.nextSibling);
        // Set the Cursor position
        setCaretPositionToOffset(innerSpanElement, 0);
      } else {
        let indexOfSpan = -1, haveToBreakSpan, breakAtOffset = -1;
        let offsetLeft = parentOffset;
        let children = currentNode.parentNode.childNodes;
        for (let i = 0; i < children.length; i++) {
          if (offsetLeft < children[i].innerText.length) {
            // Have to break current SPAN
            indexOfSpan = i;
            haveToBreakSpan = true;
            breakAtOffset = offsetLeft;
            break;
          } else if (offsetLeft === children[i].innerText.length) {
            indexOfSpan = i;
            haveToBreakSpan = false;
            break;
          } else {
            offsetLeft -= children[i].innerText.length;
          }
        }
        // console.log("indexOfSpan :", indexOfSpan, "haveToBreakSpan :", haveToBreakSpan, "breakAtOffset :", breakAtOffset);
        let tempNodes = [];
        for (let i = 0; i < children.length; i++) {
          if (i === indexOfSpan) {
            if (haveToBreakSpan) {
              let tempText = children[i].innerText;
              children[i].innerText = tempText.slice(0, breakAtOffset) + '\xa0';

              let textElement = document.createElement('span');
              textElement.setAttribute("class", children[i].getAttribute("class"));
              textElement.innerText = tempText.slice(breakAtOffset);
              tempNodes.push(textElement);
            } else {
              children[i].innerText += '\xa0';
            }
          }
          if (i > indexOfSpan) {
            tempNodes.push(children[i]);
          }
        }
        spanElement.firstChild.remove();
        tempNodes.forEach((childNode) => {
          childNode.remove();
          spanElement.appendChild(childNode);
        });
        currentNode.parentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.parentNode.nextSibling);
        // Check if Header or Paragraph
        checkHeader(currentNode, currentNode.parentNode.innerText, parentOffset, e);
        checkHeader(spanElement.firstChild, spanElement.innerText, parentOffset, e);
        // Set the Cursor position
        setCaretPositionToOffset(spanElement.firstChild, 0);
      }

    } else if (e.key.length === 1) {
      // 'e.key' of length 1 represents the character to insert
      console.log("In length=1", e.key, e.keyCode);

      // Calculate new Text after addition of character from 'e.key'
      let stringBeforeCaret = currentNode.parentNode.innerText.slice(0, parentOffset);
      let stringAfterCaret = currentNode.parentNode.innerText.slice(parentOffset);
      currentText = "" + stringBeforeCaret + e.key + stringAfterCaret;

      // Check if Header or Paragraph
      checkHeader(currentNode, currentText, stringBeforeCaret.length+1, e);

    } else if (e.key === "Backspace") {
      console.log("In Backspace", e.key, e.keyCode);

      if (parentOffset === 0) {
        let previousDivNode = currentNode.parentNode.parentNode.previousSibling;
        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent move to last cursor position.
          let previousOffset = previousDivNode.firstChild.innerText.length-1;
          let previousLastChild = previousDivNode.firstChild.lastChild;
          let previousText = previousLastChild.innerText;
          previousDivNode.firstChild.lastChild.innerText = previousText.slice(0, -1);
          previousDivNode.firstChild.innerText += currentNode.parentNode.innerText;
          checkHeader(previousDivNode.firstChild.firstChild, previousDivNode.firstChild.innerText, previousOffset, e);
          currentNode.parentNode.parentNode.remove();
        }
      } else {
        let stringBeforeCaret = currentNode.parentNode.innerText.slice(0, parentOffset);
        let stringAfterCaret = currentNode.parentNode.innerText.slice(parentOffset);
        currentText = "" + stringBeforeCaret.slice(0, -1) + stringAfterCaret;

        checkHeader(currentNode, currentText, stringBeforeCaret.length-1, e);
      }

    } else if (e.key === "ArrowRight") {
      console.log("In ArrowRight", e.key, e.keyCode);

      if (currentNode === currentNode.parentNode.lastChild && currentOffset === currentText.length-1) {
        e.preventDefault(); // Prevent the cursor move to right.
        let nextDivNode = currentNode.parentNode.parentNode.nextSibling;
        if (nextDivNode && nextDivNode.getAttribute("class") === "note__line") {
          setCaretPositionToOffset(nextDivNode.firstChild.firstChild, 0);
        }
      }

    } else if (e.key === "ArrowDown") {
      console.log("In ArrowDown", e.key, e.keyCode);

      let nextDivNode = currentNode.parentNode.parentNode.nextSibling;
      if (!nextDivNode) {
        e.preventDefault(); // Dont move to the last cursor position.
        setCaretPositionToOffset(currentNode.parentNode.lastChild, currentNode.parentNode.lastChild.innerText.length-1);
      } else if (nextDivNode.getAttribute("class") === "note__line") {
        e.preventDefault(); // Prevent the <div /> creation.
        let nextText = nextDivNode.firstChild.innerText;
        if (parentOffset >= nextText.length-1) {
          setCaretPositionToOffset(nextDivNode.firstChild.lastChild, nextDivNode.firstChild.lastChild.innerText.length-1);
        } else {
          setCaretPositionInChildNode(nextDivNode.firstChild, parentOffset);
        }
      }

    } else if (e.key === "ArrowLeft") {
      console.log("In ArrowLeft", e.key, e.keyCode);

      if (currentOffset === 0) {
        let previousDivNode = currentNode.parentNode.parentNode.previousSibling;
        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent the <div /> creation.
          setCaretPositionToOffset(previousDivNode.firstChild.lastChild, previousDivNode.firstChild.lastChild.innerText.length-1);
        }
      }

    } else if (e.key === "ArrowUp") {
      console.log("In ArrowUp", e.key, e.keyCode);

      let previousDivNode = currentNode.parentNode.parentNode.previousSibling;
      if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
        e.preventDefault(); // Prevent the <div /> creation.
        let previousText = previousDivNode.firstChild.innerText;
        if (parentOffset >= previousText.length-1) {
          setCaretPositionToOffset(previousDivNode.firstChild.lastChild, previousDivNode.firstChild.lastChild.innerText.length-1);
        } else {
          setCaretPositionInChildNode(previousDivNode.firstChild, parentOffset);
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
          <span className="note__header1">
            <span className="note__text"># Header </span>
            <span className="note__text">One&nbsp;</span>
          </span>
        </div>
        <div className="note__line">
          <span className="note__paragraph">
            <span className="note__text">Simple </span>
            <span className="note__text">lineeeeeeeeee&nbsp;</span>
          </span>
        </div>
        <div className="note__line">
          <span className="note__header1">
            <span className="note__text"># Head</span>
            <span className="note__bold">*er O*</span>
            <span className="note__text">ne&nbsp;</span>
          </span>
        </div>
        <div className="note__line">
          <span className="note__paragraph">
            <span className="note__text">Sim</span>
            <span className="note__bold">*ple l*</span>
            <span className="note__text">ine&nbsp;</span>
          </span>
        </div>
        <div className="note__line">
          <span className="note__paragraph">
            <span className="note__text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&nbsp;</span>
          </span>
        </div>
      </div>
      <footer className="footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="/">Github</a></p>
      </footer>
    </div>
  );
}

export default App;
