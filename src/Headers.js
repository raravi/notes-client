function Headers() {
  this.characterCodeOfHeaders = [ "#",
                                  "##",
                                  "###",
                                  "####",
                                  "#####",
                                  "######",
                                  "*",
                                  ">",
                                  "1."];
  this.classOfHeaders = [ "note__header1",
                          "note__header2",
                          "note__header3",
                          "note__header4",
                          "note__header5",
                          "note__header6",
                          "note__unorderedlist",
                          "note__blockquote",
                          "note__orderedlist"];
}

Headers.prototype.setHeader = function (parentNode, strings, isOrderedList) {
  if (strings.length > 1 && this.characterCodeOfHeaders.indexOf(strings[0]) !== -1) {
    let indexOfHeader = this.characterCodeOfHeaders.indexOf(strings[0]);
    parentNode.setAttribute("class", this.classOfHeaders[indexOfHeader]);
  } else if (strings.length > 1 && isOrderedList) {
    parentNode.setAttribute("class", this.classOfHeaders[8]);
  } else {
    parentNode.setAttribute("class", "note__paragraph");
  }
};

export { Headers };
