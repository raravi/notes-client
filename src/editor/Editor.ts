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
function setCaretPositionToOffset(el: HTMLElement, offset: number) {
  el.focus();
  let range = document.createRange();
  let sel = window.getSelection() as Selection;
  range.setStart(el.firstChild as HTMLElement, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 *   This function sets the CARET position to the specified
 * parent offset in the specified parent DOM node.
 */
function setCaretPositionInChildNode(node: HTMLElement, offset: number) {
  let offsetLeft = offset;
  let children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i] as HTMLElement;
    const textContent = childNode.textContent as string;
    if (offsetLeft <= textContent.length) {
      setCaretPositionToOffset(childNode, offsetLeft);
      return;
    } else {
      offsetLeft -= textContent.length;
    }
  }
}

/**
 *   This function gets the current NODE from the
 * provided selectionNode.
 */
function getNodeFromSelection(selectionNode: HTMLElement) {
  let node = selectionNode;
  if (node.nodeType === 3 || node.nodeName === "BR") {
    node = node.parentNode as HTMLElement;
  } else if(node.nodeName === "P") {
    node = node.firstChild as HTMLElement;
  }
  return node;
}

/**
 *   This function gets the parent offset from the
 * specified DOM node and the specified offset.
 */
function getParentOffset(node: HTMLElement, offset: number) {
  let parentOffset = 0;
  let children = node?.parentNode?.childNodes as NodeListOf<HTMLElement>;
  for (let i = 0; i < children.length; i++) {
    if (children[i] === node) {
      parentOffset += offset;
      break;
    } else {
      const textContent = children[i].textContent as string;
      parentOffset += textContent.length;
    }
  }
  return parentOffset;
}

/**
 *   This function creates a new DIV element for the
 * given text and returns it.
 */
function createNewDivForText(text: string) {
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
function replaceNbspWithBlankspace(currentText: string) {
  let newText = currentText.replace(/\xa0/g, ' ');
  newText = newText.replace(/&nbsp;/g, ' ');

  return newText;
}

/**
 *   This function checks if the given text is
 * an Ordered List.
 */
function checkIfOrderedList (string: string) {
  let regexForOrderedList = new RegExp('^\\d+\\.$');
  return regexForOrderedList.test(string);
}

/**
 *   This function checks if the Previous Node is
 * an Ordered List.
 */
function checkPreviousNodeIsOrderedList(el: HTMLElement, newText: string) {
  let previousDivNode = el?.parentNode?.parentNode?.previousSibling as HTMLElement;
  if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
    let previousText = replaceNbspWithBlankspace(previousDivNode?.firstChild?.textContent as string);
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
function fixNextItemsInOrderedList(el: HTMLElement, currentText: string) {
  const grandParentNode = el?.parentNode?.parentNode as HTMLElement;
  let nextDivNode = grandParentNode.nextSibling as HTMLElement | null;
  let strings = replaceNbspWithBlankspace(currentText).split(" ");
  while(nextDivNode && nextDivNode.getAttribute("class") === "note__line") {
    let nextText = replaceNbspWithBlankspace(nextDivNode?.firstChild?.textContent as string);
    let nextTextStrings = nextText.split(" ");
    let isOrderedList = checkIfOrderedList(nextTextStrings[0]);
    if (isOrderedList) {
      nextText = nextText.replace ( nextTextStrings[0].slice(0, -1),
                                  (Number(strings[0].slice(0, -1))+1).toString());
      checkForPairs(nextDivNode.firstChild as HTMLElement, nextText, nextTextStrings[0].length, undefined, undefined);

      nextDivNode = nextDivNode.nextSibling as HTMLElement;
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
function checkForPairs(parentNode: HTMLElement, newText: string, length: number, offset: number | undefined, e: React.KeyboardEvent | undefined) {
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
function getTextFromNodes(fromNode: HTMLElement, fromNodeOffset: number, toNode: HTMLElement, toNodeOffset: number) {
  let text = "";
  let currentDivNode: HTMLElement | null = fromNode;
  while (currentDivNode) {
    const textContent = currentDivNode?.firstChild?.textContent as string;
    if (currentDivNode === fromNode) { // first node
      text += textContent.slice(fromNodeOffset) + "\n";
      currentDivNode = currentDivNode.nextSibling as HTMLElement;
    } else if (currentDivNode === toNode) { // last node
      text += textContent.slice(0, toNodeOffset);
      // processing done
      currentDivNode = null;
    } else { // middle node(s)
      text += textContent.slice() + "\n";
      currentDivNode = currentDivNode.nextSibling as HTMLElement;
    }
  }
  return text;
}

/**
 *   This function checks if the Focus Node comes
 * before / after the Anchor Node.
 */
function getFocusNodeComesAfter(anchorNode: HTMLElement, focusNode: HTMLElement) {
  let focusNodeComesAfter = true;
  let currentNode = anchorNode;
  while (currentNode.previousSibling) {
    if (currentNode.previousSibling === focusNode) {
      focusNodeComesAfter = false;
      break;
    }
    currentNode = currentNode.previousSibling as HTMLElement;
  }
  return focusNodeComesAfter;
}

/**
 *   This function cuts the text from the same SPAN DOM element.
 */
function cutTextInSameSpan(node: HTMLElement, fromOffset: number, toOffset: number) {
  const textContent = node.textContent as string;
  const parentNode = node.parentNode as HTMLElement;
  let remainingText = textContent.slice(0, fromOffset) + textContent.slice(toOffset);
  if (remainingText === "") {
    if (parentNode.childNodes.length === 1) {
      node.innerHTML = "<br>";
      setCaretPositionToOffset(node, 0);
    } else {
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
function cutTextInSameDiv(parentNode: HTMLElement, fromOffset: number, toOffset: number) {
  const textContent = parentNode.textContent as string;
  let remainingText = textContent.slice(0, fromOffset) + textContent.slice(toOffset);
  if (remainingText === "") {
    parentNode.setAttribute("class", "note__paragraph");
    parentNode.innerHTML = "<span class='note__text'><br></span>";
    setCaretPositionToOffset(parentNode.firstChild as HTMLElement, 0);
  } else {
    parentNode.textContent = remainingText;
    checkHeader(parentNode.firstChild as HTMLElement, parentNode.textContent, fromOffset, undefined);
  }
}

/**
 *   This function cuts the text from different DIV DOM elements.
 */
function cutTextInDifferentDivs(fromNode: HTMLElement, fromOffset: number, toNode: HTMLElement, toOffset: number) {
  let fromDivNode = fromNode?.parentNode?.parentNode;
  let toDivNode = toNode?.parentNode?.parentNode;
  let fromParentOffset = getParentOffset(fromNode, fromOffset);
  let toParentOffset = getParentOffset(toNode, toOffset);
  let currentDivNode = fromDivNode as HTMLElement | null;
  const fromChild = fromDivNode?.firstChild as HTMLElement;
  const toChild = toDivNode?.firstChild as HTMLElement;
  const fromChildString = fromChild.textContent as string;
  const toChildString = toChild.textContent as string;

  let remainingText = fromChildString.slice(0, fromParentOffset) + toChildString.slice(toParentOffset);

  while (currentDivNode) {
    if (currentDivNode === fromDivNode) {
      currentDivNode = currentDivNode.nextSibling as HTMLElement;
    } else if (currentDivNode === toDivNode) {
      let divNodeToDelete = currentDivNode as HTMLElement;
      currentDivNode = null;
      divNodeToDelete.remove();
    } else { // middle DIV node(s)
      let divNodeToDelete = currentDivNode as HTMLElement;
      currentDivNode = currentDivNode.nextSibling as HTMLElement;
      divNodeToDelete.remove();
    }
  }

  if (remainingText === "") {
    fromChild.setAttribute("class", "note__paragraph");
    fromChild.innerHTML = "<span class='note__text'><br></span>";
    setCaretPositionToOffset(fromChild.firstChild as HTMLElement, 0);
  } else {
    fromChild.textContent = remainingText;
    checkHeader(fromChild.firstChild as HTMLElement, fromChild.textContent, fromParentOffset, undefined);
  }
}

/**
 *   This function styles the given text upon each change
 * made to the NOTE.
 */
function checkHeader(el: HTMLElement, currentText: string, offset: number | null, e: React.KeyboardEvent | undefined) {
  let newText = replaceNbspWithBlankspace(currentText);

  let strings = newText.split(" ");
  let isOrderedList = checkIfOrderedList(strings[0]);
  let previousNode;

  let headersInText = new HeadersInText();
  headersInText.setHeader(el.parentNode as HTMLElement, strings, isOrderedList);

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
    checkForPairs(el.parentNode as HTMLElement, newText, strings[0].length, offset as number, e);
  } else {
    // Paragraph
    checkForPairs(el.parentNode as HTMLElement, newText, 0, offset as number, e);
  }
}

/**
 *   This function gets the text to copy from the
 * specified Anchor Node / Focus Node.
 */
function getTextToCopy(anchorNode: HTMLElement, anchorOffset: number, focusNode: HTMLElement, focusOffset: number) {
  let text = "";

  let anchorParentOffset = getParentOffset(anchorNode, anchorOffset);
  let focusParentOffset = getParentOffset(focusNode, focusOffset);

  if (anchorNode.parentNode === focusNode.parentNode) {
    // Same Div
    if (anchorParentOffset < focusParentOffset)
      text = anchorNode?.parentNode?.textContent?.slice(anchorParentOffset, focusParentOffset) as string;
    else
      text = anchorNode?.parentNode?.textContent?.slice(focusParentOffset, anchorParentOffset) as string;
  } else {
    // Different Divs
    let anchorDivNode = anchorNode?.parentNode?.parentNode as HTMLElement;
    let focusDivNode = focusNode?.parentNode?.parentNode as HTMLElement;
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
      cutTextInSameDiv(anchorNode.parentNode as HTMLElement, anchorParentOffset, focusParentOffset);
    } else {
      // focus to anchor
      cutTextInSameDiv(anchorNode.parentNode as HTMLElement, focusParentOffset, anchorParentOffset);
    }
  } else {
    // Different Divs
    let anchorDivNode = anchorNode?.parentNode?.parentNode as HTMLElement;
    let focusDivNode = focusNode?.parentNode?.parentNode as HTMLElement;
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
function keyPressedInEditor(e: React.KeyboardEvent | undefined, currentSelection: Selection) {
  // Get current SPAN details
  if (e === undefined || currentSelection === undefined)
    return false;
  let currentNode = getNodeFromSelection(currentSelection.anchorNode as HTMLElement);
  let currentOffset = currentSelection.anchorOffset;
  let currentText = currentNode.textContent as string;
  let parentOffset = getParentOffset(currentNode, currentOffset);

  if (currentText.length < currentOffset)
    return false;

  let focusNode, focusOffset;
  if (currentSelection.isCollapsed === false) {
    focusNode = getNodeFromSelection(currentSelection.focusNode as HTMLElement);
    focusOffset = currentSelection.focusOffset;
  }

  if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + C", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + C (Cmd + C)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      let copiedText = getTextToCopy(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);
      localStorage.setItem("text", replaceNbspWithBlankspace(copiedText));
    }
  } else if (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + X", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + X (Cmd + X)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      let copiedText = getTextToCopy(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);
      localStorage.setItem("text", replaceNbspWithBlankspace(copiedText));

      cutNodes(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);
    }
  } else if (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) {
    console.log("In CMD + V", e.keyCode, e.ctrlKey, e.metaKey);
    //it was Ctrl + V (Cmd + V)
    e.preventDefault();
    if (currentSelection.isCollapsed === false) {
      cutNodes(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode as HTMLElement);
      currentOffset = currentSelection.anchorOffset;
      parentOffset = getParentOffset(currentNode, currentOffset);
    }
    let textToCopy = localStorage.getItem("text");
    if (textToCopy && textToCopy.length > 0) {
      let textLines = textToCopy.split("\n");
      let parentNode = currentNode.parentNode as HTMLElement;

      let stringBeforeCaret = parentNode?.textContent?.slice(0, parentOffset);
      let stringAfterCaret = parentNode?.textContent?.slice(parentOffset);

      if ((currentNode as HTMLElement).innerHTML === "<br>") {
        stringBeforeCaret = "";
        stringAfterCaret = "";
      }

      if (textLines.length === 1) {
        // Same Div
        let currentPNode = currentNode.parentNode as HTMLElement;
        currentPNode.textContent = stringBeforeCaret + textLines[0] + stringAfterCaret;
        checkHeader(currentPNode.firstChild as HTMLElement, currentPNode.textContent, parentOffset + textLines[0].length, undefined);
      } else {
        // Multiple Divs
        let currentDivNode = currentNode?.parentNode?.parentNode as HTMLElement;
        let nextDivNode = currentDivNode.nextSibling;
        textLines.forEach((line, index, array) => {
          if (index === 0) {
            // First Line
            const firstChild = currentDivNode.firstChild as HTMLElement;
            firstChild.textContent = stringBeforeCaret + line;
            checkHeader(firstChild.firstChild as HTMLElement, firstChild.textContent, null, undefined);
          } else if (index === array.length-1) {
            // Last line
            let divElement = createNewDivForText(line + stringAfterCaret);
            const parentNode = currentDivNode.parentNode as HTMLElement;
            parentNode.insertBefore(divElement, nextDivNode);
            checkHeader(divElement?.firstChild?.firstChild as HTMLElement, divElement?.firstChild?.textContent as string, line.length, undefined);
          } else {
            // Middle Lines
            let divElement = createNewDivForText(line);
            const parentNode = currentDivNode.parentNode as HTMLElement;
            parentNode.insertBefore(divElement, nextDivNode);
            checkHeader(divElement?.firstChild?.firstChild as HTMLElement, divElement?.firstChild?.textContent as string, null, undefined);
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
      cutNodes(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode as HTMLElement);
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
    const parentNode = currentNode.parentNode as HTMLElement;
    const grandParentNode = parentNode.parentNode as HTMLElement;
    const greatGrandParentNode = grandParentNode.parentNode as HTMLElement;
    if (parentOffset === 0) {
      greatGrandParentNode.insertBefore(divElement, grandParentNode);
      // Set the Cursor position
      setCaretPositionToOffset(currentNode as HTMLElement, 0);
    } else if (parentOffset === parentNode?.textContent?.length) {
      // Insert new DIV after updating it above
      greatGrandParentNode.insertBefore(divElement, grandParentNode.nextSibling);
      // Set the Cursor position
      setCaretPositionToOffset(innerSpanElement, 0);
    } else {
      let indexOfSpan = -1, haveToBreakSpan, breakAtOffset = -1;
      let offsetLeft = parentOffset;
      let children = parentNode.childNodes as NodeListOf<HTMLElement>;
      for (let i = 0; i < children.length; i++) {
        const textContent = children[i].textContent as string;
        if (offsetLeft < textContent.length) {
          // Have to break current SPAN
          indexOfSpan = i;
          haveToBreakSpan = true;
          breakAtOffset = offsetLeft;
          break;
        } else if (offsetLeft === textContent.length) {
          indexOfSpan = i;
          haveToBreakSpan = false;
          break;
        } else {
          offsetLeft -= textContent.length;
        }
      }
      let tempNodes = [];
      for (let i = 0; i < children.length; i++) {
        if (i === indexOfSpan && haveToBreakSpan) {
          let tempText = children[i].textContent as string;
          children[i].textContent = tempText.slice(0, breakAtOffset);

          let textElement = document.createElement('span');
          textElement.setAttribute("class", children[i].getAttribute("class") as string);
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
      greatGrandParentNode.insertBefore(divElement, grandParentNode.nextSibling);
      // Check if Header or Paragraph
      checkHeader(currentNode as HTMLElement, parentNode.textContent as string, parentOffset, e);
      checkHeader(spanElement.firstChild as HTMLElement, spanElement.textContent as string, parentOffset, e);
      // Set the Cursor position
      setCaretPositionToOffset(spanElement.firstChild as HTMLElement, 0);
    }

  } else if (e.key.length === 1) {
    // 'e.key' of length 1 represents the character to insert
    console.log("In length=1", e.key, e.keyCode);
    if (currentSelection.isCollapsed === false) {
      // Selection to be deleted, and then character to be processed
      cutNodes(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode as HTMLElement);
      currentOffset = currentSelection.anchorOffset;
      parentOffset = getParentOffset(currentNode, currentOffset);
    }
    // Calculate new Text after addition of character from 'e.key'
    const textContent = currentNode?.parentNode?.textContent as string;
    let stringBeforeCaret = textContent.slice(0, parentOffset);
    let stringAfterCaret = textContent.slice(parentOffset);
    currentText = "" + stringBeforeCaret + e.key + stringAfterCaret;

    // This screws up text while editing!!!
    // Try entering blankspaces at the beginning of a line
    // currentText = purify.sanitize(currentText);
    // if (currentText === purify.sanitize(stringBeforeCaret)) {
    //   e.preventDefault();
    //   return;
    // }

    // Check if Header or Paragraph
    checkHeader(currentNode as HTMLElement, currentText, stringBeforeCaret.length+1, e);

  } else if (e.key === "Backspace") {
    console.log("In Backspace", e.key, e.keyCode);

    if (currentSelection.isCollapsed === false) {
      e.preventDefault();
      // Selection to be deleted, and then Backspace to be processed
      cutNodes(currentNode, currentOffset, focusNode as HTMLElement, focusOffset as number);

      currentSelection = window.getSelection() as Selection;
      currentNode = getNodeFromSelection(currentSelection.anchorNode as HTMLElement);
      currentOffset = currentSelection.anchorOffset;
    } else {
      const parentNode = currentNode.parentNode as HTMLElement;
      const grandParentNode = parentNode.parentNode as HTMLElement;
      if (parentOffset === 1 && parentNode?.textContent?.length === 1) {
        e.preventDefault();
        parentNode.innerHTML = "<span class='node__text'><br></span>";
        setCaretPositionToOffset(parentNode.firstChild as HTMLElement, 0);
      } else if (parentOffset === 0) {
        let previousDivNode = grandParentNode.previousSibling as HTMLElement;

        if (previousDivNode && previousDivNode.getAttribute("class") === "note__line") {
          e.preventDefault(); // Prevent move to last cursor position.
          let previousOffset = previousDivNode?.firstChild?.textContent?.length;
          const firstChild = previousDivNode.firstChild as HTMLElement;
          const firstGrandChild = firstChild.firstChild as HTMLElement;

          if (previousDivNode?.firstChild?.textContent === "" && currentNode?.parentNode?.textContent === "") {
            previousDivNode.innerHTML = "<p class='note__paragraph'><span class='node__text'><br></span></p>";
            setCaretPositionToOffset(firstGrandChild, 0);
            grandParentNode.remove();
          } else if (firstChild.textContent === "") {
            previousDivNode.innerHTML = grandParentNode.innerHTML;
            setCaretPositionToOffset(firstGrandChild, 0);
            grandParentNode.remove();
          } else if (parentNode.textContent === "") {
            setCaretPositionInChildNode(firstChild, previousOffset as number);
            grandParentNode.remove();
            checkHeader(firstGrandChild, firstChild.textContent as string, previousOffset as number, undefined);
          } else {
            firstChild.innerHTML += parentNode.innerHTML;
            setCaretPositionInChildNode(firstChild, previousOffset as number);
            grandParentNode.remove();
            checkHeader(firstGrandChild, firstChild.textContent as string, previousOffset as number, e);
          }
        } else {
          e.preventDefault();
        }
      } else {
        let stringBeforeCaret = parentNode?.textContent?.slice(0, parentOffset) as string;
        let stringAfterCaret = parentNode?.textContent?.slice(parentOffset) as string;
        currentText = "" + stringBeforeCaret.slice(0, -1) + stringAfterCaret;

        checkHeader(currentNode as HTMLElement, currentText, stringBeforeCaret.length-1, e);
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
      checkHeader(divElement?.firstChild?.firstChild as HTMLElement, divElement?.firstChild?.textContent as string, null, undefined);
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
