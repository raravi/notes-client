/**
 * HeadersInText Class: For Dealing with Header maintenance.
 * It is used to maintain the style information for the
 * Header texts in NOTE DOM element.
 */
 class HeadersInText {
  characterCodeOfHeaders: string[];
  classOfHeaders: string[];
  constructor() {
    this.characterCodeOfHeaders = [
      "#",
      "##",
      "###",
      "####",
      "#####",
      "######",
      "*",
      ">",
      "&gt;",
      "1.",
    ];
    this.classOfHeaders = [
      "note__header1",
      "note__header2",
      "note__header3",
      "note__header4",
      "note__header5",
      "note__header6",
      "note__unorderedlist",
      "note__blockquote",
      "note__blockquote",
      "note__orderedlist",
    ];
  }

  /**
   *   This function sets the appropriate Header class for the
   * given text using the object above.
   */
  setHeader (
    parentNode: HTMLElement,
    strings: string[],
    isOrderedList: boolean
  ) {
    if (
      strings.length > 1 &&
      this.characterCodeOfHeaders.indexOf(strings[0]) !== -1
    ) {
      let indexOfHeader = this.characterCodeOfHeaders.indexOf(strings[0]);
      parentNode.setAttribute("class", this.classOfHeaders[indexOfHeader]);
    } else if (strings.length > 1 && isOrderedList) {
      parentNode.setAttribute("class", this.classOfHeaders[9]);
    } else {
      parentNode.setAttribute("class", "note__paragraph");
    }
  }
}

export { HeadersInText };
