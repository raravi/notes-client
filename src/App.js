import React from 'react';
import { PairsInText } from './PairsInText';
import { HeadersInText } from './HeadersInText';
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

  function getNodeFromSelection(selectionNode) {
    let node = selectionNode;
    if (node.nodeType === 3 || node.nodeName === "BR") {
      node = node.parentNode;
    } else if(node.nodeName === "P") {
      node = node.firstChild;
    }
    return node;
  }

  function getParentOffset(node, offset) {
    let parentOffset = 0;
    let children = node.parentNode.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i] === node) {
        parentOffset += offset;
        break;
      } else {
        parentOffset += children[i].innerText.length;
      }
    }
    return parentOffset;
  }

  function getCurrentNode(divNode, divOffset) {
    let offsetLeft = divOffset;
    let children = divNode.firstChild.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (offsetLeft <= children[i].innerText.length) {
        return children[i];
      } else {
        offsetLeft -= children[i].innerText.length;
      }
    }
  }

  function replaceNbspWithBlankspace(currentText) {
    let newText = "";
    for (let i = 0; i < currentText.length; i++) {
      if (currentText[i] === '\xa0')
        newText += " ";
      else
        newText += currentText[i];
    }
    return newText;
  }

  function checkIfOrderedList (string) {
    let regexForOrderedList = new RegExp('^\\d+\\.$');
    return regexForOrderedList.test(string);
  }

  function checkPreviousNodeIsOrderedList(el, newText) {
    let previousDivNode = el.parentNode.parentNode.previousSibling;
    if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
      let previousText = replaceNbspWithBlankspace(previousDivNode.firstChild.innerText);
      let strings = previousText.split(" ");
      let isOrderedList = checkIfOrderedList(strings[0]);
      if (isOrderedList) {
        let alteredText = replaceNbspWithBlankspace(newText);
        let alteredTextStrings = alteredText.split(" ");
        newText = newText.replace ( alteredTextStrings[0].slice(0, -1),
                                    (Number(strings[0].slice(0, -1))+1).toString());
        return {isOrderedList: true, newText: newText};
      }
    }
    return {isOrderedList: false, newText: ""};
  }

  function fixNextItemsInOrderedList(el, currentText) {
    let nextDivNode = el.parentNode.parentNode.nextSibling;
    let strings = replaceNbspWithBlankspace(currentText).split(" ");
    while(nextDivNode && nextDivNode.getAttribute("class") === "note__line") {
      let nextText = replaceNbspWithBlankspace(nextDivNode.firstChild.innerText);
      let nextTextStrings = nextText.split(" ");
      let isOrderedList = checkIfOrderedList(nextTextStrings[0]);
      if (isOrderedList) {
        nextText = nextText.replace ( nextTextStrings[0].slice(0, -1),
                                    (Number(strings[0].slice(0, -1))+1).toString());
        checkForPairs(nextDivNode.firstChild, nextText, nextTextStrings[0].length);

        nextDivNode = nextDivNode.nextSibling;
        strings = replaceNbspWithBlankspace(nextText).split(" ");
      } else {
        nextDivNode = null;
        return;
      }
    }
  }

  function checkForPairs(parentNode, newText, length, offset, e) {
    let pairsInText = new PairsInText();
    let text = newText.slice(length);
    pairsInText.getCountAndIndex(text, length);
    parentNode.innerHTML = pairsInText.getNewSpanText(newText, length);
    if (offset !== undefined)
      setCaretPositionInChildNode(parentNode, offset);
    if (e !== undefined)
      e.preventDefault();
  }

  function getTextFromNodes(fromNode, fromNodeOffset, toNode, toNodeOffset) {
    let text = "";
    let currentDivNode = fromNode;
    while (currentDivNode) {
      if (currentDivNode === fromNode) { // first node
        text += currentDivNode.firstChild.innerText.slice(fromNodeOffset) + "\n";
        currentDivNode = currentDivNode.nextSibling;
      } else if (currentDivNode === toNode) { // last node
        text += currentDivNode.firstChild.innerText.slice(0, toNodeOffset);
        // processing done
        currentDivNode = null;
      } else { // middle node(s)
        text += currentDivNode.firstChild.innerText.slice() + "\n";
        currentDivNode = currentDivNode.nextSibling;
      }
    }
    return text;
  }

  function getFocusNodeComesAfter(anchorNode, focusNode) {
    let focusNodeComesAfter = true;
    let currentNode = anchorNode;
    while (currentNode.previousSibling) {
      if (currentNode.previousSibling === focusNode) {
        focusNodeComesAfter = false;
        break;
      }
      currentNode = currentNode.previousSibling;
    }
    return focusNodeComesAfter;
  }

  function cutTextInSameSpan(node, fromOffset, toOffset) {
    node.innerText = node.innerText.slice(0, fromOffset) + node.innerText.slice(toOffset);
    setCaretPositionToOffset(node, fromOffset);
  }

  function cutTextInSameDiv(parentNode, fromOffset, toOffset) {
    parentNode.innerText = parentNode.innerText.slice(0, fromOffset) + parentNode.innerText.slice(toOffset);
    checkHeader(parentNode.firstChild, parentNode.innerText, fromOffset);
  }

  function cutTextInDifferentDivs(fromNode, fromOffset, toNode, toOffset) {
    let fromDivNode = fromNode.parentNode.parentNode;
    let toDivNode = toNode.parentNode.parentNode;
    let fromParentOffset = getParentOffset(fromNode, fromOffset);
    let toParentOffset = getParentOffset(toNode, toOffset);
    let currentDivNode = fromDivNode;

    fromDivNode.firstChild.innerText = fromDivNode.firstChild.innerText.slice(0, fromParentOffset) + toDivNode.firstChild.innerText.slice(toParentOffset);

    while (currentDivNode) {
      if (currentDivNode === fromDivNode) {
        currentDivNode = currentDivNode.nextSibling;
      } else if (currentDivNode === toDivNode) {
        let divNodeToDelete = currentDivNode;
        currentDivNode = null;
        divNodeToDelete.remove();
      } else { // middle DIV node(s)
        let divNodeToDelete = currentDivNode;
        currentDivNode = currentDivNode.nextSibling;
        divNodeToDelete.remove();
      }
    }

    checkHeader(fromDivNode.firstChild.firstChild, fromDivNode.firstChild.innerText, fromParentOffset);
  }

  function checkHeader(el, currentText, offset, e) {
    let newText = replaceNbspWithBlankspace(currentText);

    let strings = newText.split(" ");
    let isOrderedList = checkIfOrderedList(strings[0]);
    let previousNode;

    let headersInText = new HeadersInText();
    headersInText.setHeader(el.parentNode, strings, isOrderedList);

    // Handle *word*
    let isHeader = headersInText.characterCodeOfHeaders.indexOf(strings[0]);
    if (strings.length > 1 && (isHeader !== -1 || isOrderedList)) {
      if (isOrderedList) {
        previousNode = checkPreviousNodeIsOrderedList(el, newText);
        if (previousNode && previousNode.isOrderedList) {
          newText = previousNode.newText;
          let oldLength = strings[0].length;
          strings = newText.split(" ");
          if (oldLength + 1 === offset)
            offset = strings[0].length + 1;
        }
        fixNextItemsInOrderedList(el, newText);
      }
      // Not a paragraph
      checkForPairs(el.parentNode, newText, strings[0].length, offset, e);
    } else {
      // Paragraph
      checkForPairs(el.parentNode, newText, 0, offset, e);
    }
  }

  function getTextToCopy(anchorNode, anchorOffset, focusNode, focusOffset) {
    let text = "";

    let anchorParentOffset = getParentOffset(anchorNode, anchorOffset);
    let focusParentOffset = getParentOffset(focusNode, focusOffset);

    if (anchorNode.parentNode === focusNode.parentNode) {
      // Same Div
      if (anchorParentOffset < focusParentOffset)
        text = anchorNode.parentNode.innerText.slice(anchorParentOffset, focusParentOffset);
      else
        text = anchorNode.parentNode.innerText.slice(focusParentOffset, anchorParentOffset);
    } else {
      // Different Divs
      let anchorDivNode = anchorNode.parentNode.parentNode;
      let focusDivNode = focusNode.parentNode.parentNode;
      let focusNodeComesAfter = getFocusNodeComesAfter(anchorDivNode, focusDivNode);

      if (focusNodeComesAfter) {
        // anchor to focus
        text = getTextFromNodes(anchorDivNode, anchorParentOffset, focusDivNode, focusParentOffset);
      } else {
        // focus to anchor
        text = getTextFromNodes(focusDivNode, focusParentOffset, anchorDivNode, anchorParentOffset);
      }
    }

    return text;
  }

  function cutNodes(anchorNode, anchorOffset, focusNode, focusOffset) {
    let anchorParentOffset = getParentOffset(anchorNode, anchorOffset);
    let focusParentOffset = getParentOffset(focusNode, focusOffset);

    if (anchorNode === focusNode) {
      // Same SPAN
      if (anchorOffset < focusOffset) {
        cutTextInSameSpan(anchorNode, anchorOffset, focusOffset);
      } else {
        cutTextInSameSpan(anchorNode, focusOffset, anchorOffset);
      }
    } else if (anchorNode.parentNode === focusNode.parentNode) {
      // Same DIV, Different SPANs
      let focusNodeComesAfter = getFocusNodeComesAfter(anchorNode, focusNode);
      if (focusNodeComesAfter) {
        // anchor to focus
        cutTextInSameDiv(anchorNode.parentNode, anchorParentOffset, focusParentOffset);
      } else {
        // focus to anchor
        cutTextInSameDiv(anchorNode.parentNode, focusParentOffset, anchorParentOffset);
      }
    } else {
      // Different Divs
      let anchorDivNode = anchorNode.parentNode.parentNode;
      let focusDivNode = focusNode.parentNode.parentNode;
      let focusNodeComesAfter = getFocusNodeComesAfter(anchorDivNode, focusDivNode);

      if (focusNodeComesAfter) {
        // anchor to focus
        cutTextInDifferentDivs(anchorNode, anchorOffset, focusNode, focusOffset);
      } else {
        // focus to anchor
        cutTextInDifferentDivs(focusNode, focusOffset, anchorNode, anchorOffset);
      }
    }
  }

  function onKeyDownInEditor(e) {
    // Get current SPAN details
    let currentSelection = window.getSelection();
    let currentNode = getNodeFromSelection(currentSelection.anchorNode);
    let currentOffset = currentSelection.anchorOffset;
    let currentText = currentNode.innerText;
    let parentOffset = getParentOffset(currentNode, currentOffset);

    if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
      console.log("In CMD + C", e.keyCode, e.ctrlKey, e.metaKey);
      //it was Ctrl + C (Cmd + C)
      e.preventDefault();
      if (currentSelection.isCollapsed === false) {
        let focusNode = getNodeFromSelection(currentSelection.focusNode);
        let focusOffset = currentSelection.focusOffset;

        let copiedText = getTextToCopy(currentNode, currentOffset, focusNode, focusOffset);
        localStorage.setItem("text", copiedText);
      }
    } else if (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) {
      console.log("In CMD + X", e.keyCode, e.ctrlKey, e.metaKey);
      //it was Ctrl + X (Cmd + X)
      e.preventDefault();
      if (currentSelection.isCollapsed === false) {
        let focusNode = getNodeFromSelection(currentSelection.focusNode);
        let focusOffset = currentSelection.focusOffset;

        let copiedText = getTextToCopy(currentNode, currentOffset, focusNode, focusOffset);
        localStorage.setItem("text", copiedText);

        cutNodes(currentNode, currentOffset, focusNode, focusOffset);
      }
    } else if (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) {
      console.log("In CMD + V", e.keyCode, e.ctrlKey, e.metaKey);
      //it was Ctrl + V (Cmd + V)
      e.preventDefault();
    } else if (e.keyCode === 13) {
      // trap the return key being pressed
      console.log("In Enter");
      // Prevent the <div /> creation.
      e.preventDefault();

      if (currentSelection.isCollapsed === false) {
        // Selection to be deleted, and then Enter to be processed

        let focusNode = getNodeFromSelection(currentSelection.focusNode);
        let focusOffset = currentSelection.focusOffset;
        let currentDivNode = currentNode.parentNode.parentNode;

        cutNodes(currentNode, currentOffset, focusNode, focusOffset);
        currentNode = getCurrentNode(currentDivNode, parentOffset);
      }
      // Create new DIV with an 'empty' SPAN inside it
      let innerSpanElement = document.createElement('span');
      innerSpanElement.setAttribute("class", "note__text");
      innerSpanElement.innerHTML = '<br>';

      let spanElement = document.createElement('p');
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
      } else if (parentOffset === currentNode.parentNode.innerText.length) {
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
        let tempNodes = [];
        for (let i = 0; i < children.length; i++) {
          if (i === indexOfSpan) {
            if (haveToBreakSpan) {
              let tempText = children[i].innerText;
              children[i].innerText = tempText.slice(0, breakAtOffset);

              let textElement = document.createElement('span');
              textElement.setAttribute("class", children[i].getAttribute("class"));
              textElement.innerText = tempText.slice(breakAtOffset);
              tempNodes.push(textElement);
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

      if (currentSelection.isCollapsed === false) {
        // Selection to be deleted, and then character to be processed
        let focusNode = getNodeFromSelection(currentSelection.focusNode);
        let focusOffset = currentSelection.focusOffset;
        let currentDivNode = currentNode.parentNode.parentNode;

        cutNodes(currentNode, currentOffset, focusNode, focusOffset);
        currentNode = getCurrentNode(currentDivNode, parentOffset);
      }
      // Calculate new Text after addition of character from 'e.key'
      let stringBeforeCaret = currentNode.parentNode.innerText.slice(0, parentOffset);
      let stringAfterCaret = currentNode.parentNode.innerText.slice(parentOffset);
      currentText = "" + stringBeforeCaret + e.key + stringAfterCaret;

      // Check if Header or Paragraph
      checkHeader(currentNode, currentText, stringBeforeCaret.length+1, e);

    } else if (e.key === "Backspace") {
      console.log("In Backspace", e.key, e.keyCode);

      if (currentSelection.isCollapsed === false) {
        e.preventDefault();
        // Selection to be deleted, and then Backspace to be processed
        let focusNode = getNodeFromSelection(currentSelection.focusNode);
        let focusOffset = currentSelection.focusOffset;
        let currentDivNode = currentNode.parentNode.parentNode;

        cutNodes(currentNode, currentOffset, focusNode, focusOffset);
        currentNode = getCurrentNode(currentDivNode, parentOffset);
      } else {
        if (parentOffset === 1 && currentNode.parentNode.innerText.length === 1) {
          e.preventDefault();
          let parentNode = currentNode.parentNode;
          parentNode.innerHTML = "<span class='node__text'><br></span>";
          setCaretPositionToOffset(parentNode.firstChild, 0);
        } else if (parentOffset === 0) {
          let previousDivNode = currentNode.parentNode.parentNode.previousSibling;

          if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
            e.preventDefault(); // Prevent move to last cursor position.
            let previousOffset = previousDivNode.firstChild.innerText.length;

            if (previousDivNode.firstChild.innerText === "\n" && currentNode.parentNode.innerText === "\n") {
              previousDivNode.innerHTML = "<p class='note__paragraph'><span class='node__text'><br></span></p>";
              setCaretPositionToOffset(previousDivNode.firstChild.firstChild, 0);
              currentNode.parentNode.parentNode.remove();
            } else if (previousDivNode.firstChild.innerText === "\n") {
              previousDivNode.innerHTML = currentNode.parentNode.parentNode.innerHTML;
              setCaretPositionToOffset(previousDivNode.firstChild.firstChild, 0);
              currentNode.parentNode.parentNode.remove();
            } else if (currentNode.parentNode.innerText === "\n") {
              setCaretPositionInChildNode(previousDivNode.firstChild, previousOffset);
              currentNode.parentNode.parentNode.remove();
              checkHeader(previousDivNode.firstChild.firstChild, previousDivNode.firstChild.innerText, previousOffset);
            } else {
              previousDivNode.firstChild.innerHTML += currentNode.parentNode.innerHTML;
              checkHeader(previousDivNode.firstChild.firstChild, previousDivNode.firstChild.innerText, previousOffset, e);
              currentNode.parentNode.parentNode.remove();
            }
          } else {
            e.preventDefault();
          }
        } else {
          let stringBeforeCaret = currentNode.parentNode.innerText.slice(0, parentOffset);
          let stringAfterCaret = currentNode.parentNode.innerText.slice(parentOffset);
          currentText = "" + stringBeforeCaret.slice(0, -1) + stringAfterCaret;

          checkHeader(currentNode, currentText, stringBeforeCaret.length-1, e);
        }
      }
    } else if (e.key === "ArrowRight") {
      console.log("In ArrowRight", e.key, e.keyCode);
    } else if (e.key === "ArrowDown") {
      console.log("In ArrowDown", e.key, e.keyCode);
    } else if (e.key === "ArrowLeft") {
      console.log("In ArrowLeft", e.key, e.keyCode);
    } else if (e.key === "ArrowUp") {
      console.log("In ArrowUp", e.key, e.keyCode);
    } else {
      console.log("In else", e.key, e.keyCode);
    }
  }

  function onClick(e) {
    console.log("On Click");
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="header__title">Notes</h1>
      </header>
      <div contentEditable="true" className="note" onKeyDown={onKeyDownInEditor} onMouseUp={onClick}>
        <div className="note__line">
          <p className="note__header1">
            <span className="note__text">#&nbsp;Header&nbsp;One</span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__paragraph">
            <span className="note__text"><br /></span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__paragraph">
            <span className="note__text"><br /></span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__paragraph">
            <span className="note__text">Sim</span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__header1">
            <span className="note__text">#&nbsp;Head</span>
            <span className="note__bold">*er&nbsp;O*</span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__paragraph">
            <span className="note__text">Sim</span>
            <span className="note__bold">*ple&nbsp;l*</span>
            <span className="note__text">ine</span>
          </p>
        </div>
        <div className="note__line">
          <p className="note__blockquote">
            <span className="note__text">&gt; You can have properly indented paragraphs within list items. Notice the blank line above, </span><span className="note__link">[I'm an inline-style link](www.google.com)</span><span className="note__text"> and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).</span>
          </p>
        </div>
      </div>
      <footer className="footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="/">Github</a></p>
      </footer>
    </div>
  );
}

export default App;

/*
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
    <span className="note__text">You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).&nbsp;</span>
  </span>
</div>
*/
