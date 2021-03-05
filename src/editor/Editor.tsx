import { PairsInText } from './PairsInText';
import { HeadersInText } from './HeadersInText';
import createDOMPurify from 'dompurify';

const purify = createDOMPurify(window);

/**
 *   This file contains code to maintain the Editor functionality
 * and handle the processing / output from NOTE DOM component.
 */

/**
 *   This function sets the CARET position to the specified
 * offset in the specified DOM node.
 */
function setCaretPositionToOffset(el, offset) {
  el.focus();
  let range = document.createRange();
  let sel = window.getSelection();
  range.setStart(el.firstChild, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 *   This function sets the CARET position to the specified
 * parent offset in the specified parent DOM node.
 */
function setCaretPositionInChildNode(node, offset) {
  let offsetLeft = offset;
  let children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    if (offsetLeft <= children[i].textContent.length) {
      setCaretPositionToOffset(children[i], offsetLeft);
      return;
    } else {
      offsetLeft -= children[i].textContent.length;
    }
  }
}

/**
 *   This function gets the current NODE from the
 * provided selectionNode.
 */
function getNodeFromSelection(selectionNode) {
  let node = selectionNode;
  if (node.nodeType === 3 || node.nodeName === "BR") {
    node = node.parentNode;
  } else if(node.nodeName === "P") {
    node = node.firstChild;
  }
  return node;
}

/**
 *   This function gets the parent offset from the
 * specified DOM node and the specified offset.
 */
function getParentOffset(node, offset) {
  let parentOffset = 0;
  let children = node.parentNode.childNodes;
  for (let i = 0; i < children.length; i++) {
    if (children[i] === node) {
      parentOffset += offset;
      break;
    } else {
      parentOffset += children[i].textContent.length;
    }
  }
  return parentOffset;
}

/**
 *   This function creates a new DIV element for the
 * given text and returns it.
 */
function createNewDivForText(text) {
  // Create new DIV with an 'empty' SPAN inside it
  let spanElement = document.createElement('span');
  spanElement.setAttribute("class", "note__text");
  if (text === "") {
    spanElement.innerHTML = '<br>';
  } else {
    spanElement.innerHTML = text;
  }

  let pElement = document.createElement('p');
  pElement.setAttribute("class", "note__paragraph");
  pElement.appendChild(spanElement);

  let divElement = document.createElement('div');
  divElement.setAttribute("class", "note__line");
  divElement.appendChild(pElement);

  return divElement;
}

/**
 *   This function replaces all NBSPs with BLANKSPACE
 * in the specified text.
 */
function replaceNbspWithBlankspace(currentText) {
  let newText = currentText.replace(/\xa0/g, ' ');
  newText = newText.replace(/&nbsp;/g, ' ');

  return newText;
}

/**
 *   This function checks if the given text is
 * an Ordered List.
 */
function checkIfOrderedList (string) {
  let regexForOrderedList = new RegExp('^\\d+\\.$');
  return regexForOrderedList.test(string);
}

/**
 *   This function checks if the Previous Node is
 * an Ordered List.
 */
function checkPreviousNodeIsOrderedList(el, newText) {
  let previousDivNode = el.parentNode.parentNode.previousSibling;
  if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
    let previousText = replaceNbspWithBlankspace(previousDivNode.firstChild.textContent);
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

/**
 *   This function checks if the next items in the
 * Ordered List need to fixed.
 */
function fixNextItemsInOrderedList(el, currentText) {
  let nextDivNode = el.parentNode.parentNode.nextSibling;
  let strings = replaceNbspWithBlankspace(currentText).split(" ");
  while(nextDivNode && nextDivNode.getAttribute("class") === "note__line") {
    let nextText = replaceNbspWithBlankspace(nextDivNode.firstChild.textContent);
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

/**
 *   This function checks for Pairs in a give NODE DOM element.
 */
function checkForPairs(parentNode, newText, length, offset, e) {
  let pairsInText = new PairsInText();
  let text = newText.slice(length);
  pairsInText.getCountAndIndex(text, length);
  parentNode.innerHTML = pairsInText.getNewSpanText(newText, length);
  if (offset !== undefined) {
    setCaretPositionInChildNode(parentNode, offset);
  }
  if (e !== undefined) {
    e.preventDefault();
  }
}

/**
 *   This function gets the text from the
 * specified fromNode / ToNode DOM elements.
 */
function getTextFromNodes(fromNode, fromNodeOffset, toNode, toNodeOffset) {
  let text = "";
  let currentDivNode = fromNode;
  while (currentDivNode) {
    if (currentDivNode === fromNode) { // first node
      text += currentDivNode.firstChild.textContent.slice(fromNodeOffset) + "\n";
      currentDivNode = currentDivNode.nextSibling;
    } else if (currentDivNode === toNode) { // last node
      text += currentDivNode.firstChild.textContent.slice(0, toNodeOffset);
      // processing done
      currentDivNode = null;
    } else { // middle node(s)
      text += currentDivNode.firstChild.textContent.slice() + "\n";
      currentDivNode = currentDivNode.nextSibling;
    }
  }
  return text;
}

/**
 *   This function checks if the Focus Node comes
 * before / after the Anchor Node.
 */
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

/**
 *   This function cuts the text from the same SPAN DOM element.
 */
function cutTextInSameSpan(node, fromOffset, toOffset) {
  let remainingText = node.textContent.slice(0, fromOffset) + node.textContent.slice(toOffset);
  if (remainingText === "") {
    if (node.parentNode.childNodes.length === 1) {
      node.innerHTML = "<br>";
      setCaretPositionToOffset(node, 0);
    } else {
      let parentNode = node.parentNode;
      let parentOffset = getParentOffset(node, fromOffset);
      node.remove();
      setCaretPositionInChildNode(parentNode, parentOffset);
    }
  } else {
    node.textContent = remainingText;
    setCaretPositionToOffset(node, fromOffset);
  }
}

/**
 *   This function cuts the text from the same DIV DOM element.
 */
function cutTextInSameDiv(parentNode, fromOffset, toOffset) {
  let remainingText = parentNode.textContent.slice(0, fromOffset) + parentNode.textContent.slice(toOffset);
  if (remainingText === "") {
    parentNode.setAttribute("class", "note__paragraph");
    parentNode.innerHTML = "<span class='note__text'><br></span>";
    setCaretPositionToOffset(parentNode.firstChild, 0);
  } else {
    parentNode.textContent = remainingText;
    checkHeader(parentNode.firstChild, parentNode.textContent, fromOffset);
  }
}

/**
 *   This function cuts the text from different DIV DOM elements.
 */
function cutTextInDifferentDivs(fromNode, fromOffset, toNode, toOffset) {
  let fromDivNode = fromNode.parentNode.parentNode;
  let toDivNode = toNode.parentNode.parentNode;
  let fromParentOffset = getParentOffset(fromNode, fromOffset);
  let toParentOffset = getParentOffset(toNode, toOffset);
  let currentDivNode = fromDivNode;

  let remainingText = fromDivNode.firstChild.textContent.slice(0, fromParentOffset) + toDivNode.firstChild.textContent.slice(toParentOffset);

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

  if (remainingText === "") {
    fromDivNode.firstChild.setAttribute("class", "note__paragraph");
    fromDivNode.firstChild.innerHTML = "<span class='note__text'><br></span>";
    setCaretPositionToOffset(fromDivNode.firstChild.firstChild, 0);
  } else {
    fromDivNode.firstChild.textContent = remainingText;
    checkHeader(fromDivNode.firstChild.firstChild, fromDivNode.firstChild.textContent, fromParentOffset);
  }
}

/**
 *   This function styles the given text upon each change
 * made to the NOTE.
 */
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

/**
 *   This function gets the text to copy from the
 * specified Anchor Node / Focus Node.
 */
function getTextToCopy(anchorNode, anchorOffset, focusNode, focusOffset) {
  let text = "";

  let anchorParentOffset = getParentOffset(anchorNode, anchorOffset);
  let focusParentOffset = getParentOffset(focusNode, focusOffset);

  if (anchorNode.parentNode === focusNode.parentNode) {
    // Same Div
    if (anchorParentOffset < focusParentOffset)
      text = anchorNode.parentNode.textContent.slice(anchorParentOffset, focusParentOffset);
    else
      text = anchorNode.parentNode.textContent.slice(focusParentOffset, anchorParentOffset);
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

/**
 *   This function cuts the NODE Div elements from the
 * specified Anchor Node / Focus Node.
 */
function cutNodes(anchorNode: HTMLElement, anchorOffset: number, focusNode: HTMLElement, focusOffset: number) {
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
    let anchorDivNode = anchorNode?.parentNode?.parentNode;
    let focusDivNode = focusNode?.parentNode?.parentNode;
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

/**
 *   This function handles kepypress event in the NOTE.
 * It will process each event, and do the required changes to the DOM!
 */
function keyPressedInEditor(e: React.KeyboardEvent, currentSelection: Selection) {
  // Get current SPAN details
  if (e === undefined || currentSelection === undefined)
    return false;
  let currentNode = getNodeFromSelection(currentSelection.anchorNode);
  let currentOffset = currentSelection.anchorOffset;
  let currentText = currentNode.textContent;
  let parentOffset = getParentOffset(currentNode, currentOffset);

  if (currentNode.textContent.length < currentOffset)
    return false;

  let focusNode, focusOffset;
  if (currentSelection.isCollapsed === false) {
    focusNode = getNodeFromSelection(currentSelection.focusNode);
    focusOffset = currentSelection.focusOffset;
  }

  if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + C", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + C (Cmd + C)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      let copiedText = getTextToCopy(currentNode, currentOffset, focusNode, focusOffset);
      localStorage.setItem("text", replaceNbspWithBlankspace(copiedText));
    }
  } else if (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + X", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + X (Cmd + X)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      let copiedText = getTextToCopy(currentNode, currentOffset, focusNode, focusOffset);
      localStorage.setItem("text", replaceNbspWithBlankspace(copiedText));

      cutNodes(currentNode, currentOffset, focusNode, focusOffset);
    }
  } else if (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + V", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + V (Cmd + V)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      cutNodes(currentNode, currentOffset, focusNode, focusOffset);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode);
      currentOffset = currentSelection.anchorOffset;
      parentOffset = getParentOffset(currentNode, currentOffset);
    }
    let textToCopy = localStorage.getItem("text");
    if (textToCopy && textToCopy.length > 0) {
      let textLines = textToCopy.split("\n");

      let stringBeforeCaret = currentNode.parentNode.textContent.slice(0, parentOffset);
      let stringAfterCaret = currentNode.parentNode.textContent.slice(parentOffset);

      if (currentNode.innerHTML === "<br>") {
        stringBeforeCaret = "";
        stringAfterCaret = "";
      }

      if (textLines.length === 1) {
        // Same Div
        let currentPNode = currentNode.parentNode;
        currentNode.parentNode.textContent = stringBeforeCaret + textLines[0] + stringAfterCaret;
        checkHeader(currentPNode.firstChild, currentPNode.textContent, parentOffset + textLines[0].length);
      } else {
        // Multiple Divs
        let currentDivNode = currentNode.parentNode.parentNode;
        let nextDivNode = currentDivNode.nextSibling;
        textLines.forEach((line, index, array) => {
          if (index === 0) {
            // First Line
            currentDivNode.firstChild.textContent = stringBeforeCaret + line;
            checkHeader(currentDivNode.firstChild.firstChild, currentDivNode.firstChild.textContent);
          } else if (index === array.length-1) {
            // Last line
            let divElement = createNewDivForText(line + stringAfterCaret);
            currentDivNode.parentNode.insertBefore(divElement, nextDivNode);
            checkHeader(divElement.firstChild.firstChild, divElement.firstChild.textContent, line.length);
          } else {
            // Middle Lines
            let divElement = createNewDivForText(line);
            currentDivNode.parentNode.insertBefore(divElement, nextDivNode);
            checkHeader(divElement.firstChild.firstChild, divElement.firstChild.textContent);
          }
        });
      }
    }

  } else if (e.keyCode === 13) {
    // trap the return key being pressed
    console.log("In Enter");
    // Prevent the <div /> creation.
    e.preventDefault();

    if (currentSelection.isCollapsed === false) {
      // Selection to be deleted, and then Enter to be processed
      cutNodes(currentNode, currentOffset, focusNode, focusOffset);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode);
      currentOffset = currentSelection.anchorOffset;
      parentOffset = getParentOffset(currentNode, currentOffset);
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
    } else if (parentOffset === currentNode.parentNode.textContent.length) {
      // Insert new DIV after updating it above
      currentNode.parentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.parentNode.nextSibling);
      // Set the Cursor position
      setCaretPositionToOffset(innerSpanElement, 0);
    } else {
      let indexOfSpan = -1, haveToBreakSpan, breakAtOffset = -1;
      let offsetLeft = parentOffset;
      let children = currentNode.parentNode.childNodes;
      for (let i = 0; i < children.length; i++) {
        if (offsetLeft < children[i].textContent.length) {
          // Have to break current SPAN
          indexOfSpan = i;
          haveToBreakSpan = true;
          breakAtOffset = offsetLeft;
          break;
        } else if (offsetLeft === children[i].textContent.length) {
          indexOfSpan = i;
          haveToBreakSpan = false;
          break;
        } else {
          offsetLeft -= children[i].textContent.length;
        }
      }
      let tempNodes = [];
      for (let i = 0; i < children.length; i++) {
        if (i === indexOfSpan && haveToBreakSpan) {
          let tempText = children[i].textContent;
          children[i].textContent = tempText.slice(0, breakAtOffset);

          let textElement = document.createElement('span');
          textElement.setAttribute("class", children[i].getAttribute("class"));
          textElement.textContent = tempText.slice(breakAtOffset);
          tempNodes.push(textElement);
        }
        if (i > indexOfSpan) {
          tempNodes.push(children[i]);
        }
      }
      spanElement?.firstChild?.remove();
      tempNodes.forEach((childNode) => {
        childNode.remove();
        spanElement.appendChild(childNode);
      });
      currentNode.parentNode.parentNode.parentNode.insertBefore(divElement, currentNode.parentNode.parentNode.nextSibling);
      // Check if Header or Paragraph
      checkHeader(currentNode, currentNode.parentNode.textContent, parentOffset, e);
      checkHeader(spanElement.firstChild, spanElement.textContent, parentOffset, e);
      // Set the Cursor position
      setCaretPositionToOffset(spanElement.firstChild, 0);
    }

  } else if (e.key.length === 1) {
    // 'e.key' of length 1 represents the character to insert
    console.log("In length=1", e.key, e.keyCode);
    if (currentSelection.isCollapsed === false) {
      // Selection to be deleted, and then character to be processed
      cutNodes(currentNode, currentOffset, focusNode, focusOffset);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode);
      currentOffset = currentSelection.anchorOffset;
      parentOffset = getParentOffset(currentNode, currentOffset);
    }
    // Calculate new Text after addition of character from 'e.key'
    let stringBeforeCaret = currentNode.parentNode.textContent.slice(0, parentOffset);
    let stringAfterCaret = currentNode.parentNode.textContent.slice(parentOffset);
    currentText = "" + stringBeforeCaret + e.key + stringAfterCaret;

    // This screws up text while editing!!!
    // Try entering blankspaces at the beginning of a line
    // currentText = purify.sanitize(currentText);
    // if (currentText === purify.sanitize(stringBeforeCaret)) {
    //   e.preventDefault();
    //   return;
    // }

    // Check if Header or Paragraph
    checkHeader(currentNode, currentText, stringBeforeCaret.length+1, e);

  } else if (e.key === "Backspace") {
    console.log("In Backspace", e.key, e.keyCode);

    if (currentSelection.isCollapsed === false) {
      e.preventDefault();
      // Selection to be deleted, and then Backspace to be processed
      cutNodes(currentNode, currentOffset, focusNode, focusOffset);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode);
      currentOffset = currentSelection.anchorOffset;
    } else {
      if (parentOffset === 1 && currentNode.parentNode.textContent.length === 1) {
        e.preventDefault();
        let parentNode = currentNode.parentNode;
        parentNode.innerHTML = "<span class='node__text'><br></span>";
        setCaretPositionToOffset(parentNode.firstChild, 0);
      } else if (parentOffset === 0) {
        let previousDivNode = currentNode.parentNode.parentNode.previousSibling;

        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent move to last cursor position.
          let previousOffset = previousDivNode.firstChild.textContent.length;

          if (previousDivNode.firstChild.textContent === "" && currentNode.parentNode.textContent === "") {
            previousDivNode.innerHTML = "<p class='note__paragraph'><span class='node__text'><br></span></p>";
            setCaretPositionToOffset(previousDivNode.firstChild.firstChild, 0);
            currentNode.parentNode.parentNode.remove();
          } else if (previousDivNode.firstChild.textContent === "") {
            previousDivNode.innerHTML = currentNode.parentNode.parentNode.innerHTML;
            setCaretPositionToOffset(previousDivNode.firstChild.firstChild, 0);
            currentNode.parentNode.parentNode.remove();
          } else if (currentNode.parentNode.textContent === "") {
            setCaretPositionInChildNode(previousDivNode.firstChild, previousOffset);
            currentNode.parentNode.parentNode.remove();
            checkHeader(previousDivNode.firstChild.firstChild, previousDivNode.firstChild.textContent, previousOffset);
          } else {
            previousDivNode.firstChild.innerHTML += currentNode.parentNode.innerHTML;
            setCaretPositionInChildNode(previousDivNode.firstChild, previousOffset);
            currentNode.parentNode.parentNode.remove();
            checkHeader(previousDivNode.firstChild.firstChild, previousDivNode.firstChild.textContent, previousOffset, e);
          }
        } else {
          e.preventDefault();
        }
      } else {
        let stringBeforeCaret = currentNode.parentNode.textContent.slice(0, parentOffset);
        let stringAfterCaret = currentNode.parentNode.textContent.slice(parentOffset);
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
  return true;
}

/**
 *   This function handles clicks in the NOTE.
 */
function onClickInEditor(e: React.MouseEvent) {
  console.log("On Click");
}

/**
 *   This function loads note to the NOTE DOM element.
 */
function loadNoteInEditor(noteContent: string, editable: string) {
  if (noteContent === undefined || editable === undefined) {
    return;
  }
  if (editable !== "true" && editable !== "false") {
    return;
  }
  noteContent = purify.sanitize(noteContent);
  let textLines = noteContent.split("\n");
  let editor = document.querySelector('.note') as HTMLElement;
  editor.setAttribute("contentEditable", editable);
  editor.innerHTML = "";
  textLines.forEach(line => {
    let divElement = createNewDivForText(line);
    editor.appendChild(divElement);
    if (line !== "") {
      checkHeader(divElement.firstChild.firstChild, divElement.firstChild.textContent);
    }
  });
}

/**
 *   This function gets text from the NOTE DOM element.
 */
function getTextFromEditor() {
  let editor = document.querySelector('.note') as HTMLElement;
  let children = editor.childNodes;
  let textContent = "";
  children.forEach(lineNode => {
    let childNode = lineNode?.firstChild?.firstChild as HTMLElement;
    if (childNode.innerHTML === "<br>") {
      textContent += "";
    } else {
      textContent += lineNode?.firstChild?.textContent;
    }
    if (lineNode !== editor.lastChild) {
      textContent += "\n";
    }
  });
  return replaceNbspWithBlankspace(textContent);
}

export {  keyPressedInEditor,
          onClickInEditor,
          loadNoteInEditor,
          getTextFromEditor };
