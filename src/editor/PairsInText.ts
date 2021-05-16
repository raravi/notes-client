/**
 * PairsInText Class: For Dealing with Pairs maintenance.
 * It is used to maintain the style information for the
 * Pairs texts in NOTE DOM element.
 */
class PairsInText {
  characters: string[];
  regexOfCharacters: string[];
  countOfCharacters: number[];
  indexOfCharacters: number[][];
  classOfCharacters: string[];
  constructor() {
    this.characters = ["*", "/", "_", "`", "-", "["];
    this.regexOfCharacters = ["\\*[^*]*\\*",
                              "\\/[^/]*\\/",
                             "\\_[^_]*\\_",
                             "\\`[^`]*\\`",
                             "\\-[^-]*\\-",
                             "\\[[^[\\]]*\\]\\([^()]*\\)"];
    this.countOfCharacters = [0, 0, 0, 0, 0, 0];
    this.indexOfCharacters = [[], [], [], [], [], []];
    this.classOfCharacters = ["note__bold",
                              "note__italic",
                              "note__underline",
                              "note__code",
                              "note__strikethrough",
                              "note__link"];
  };

  /**
   *   This function gets the Counts / Index of appropriate Pairs for the
   * given text using the object above.
   */
  getCountAndIndex (text: string, length: number) {
    let _this = this;
  
    this.characters.forEach((_valueOfCharacter, indexOfCharacter) => {
      let arrayOfLinks = Array.from(text.matchAll(new RegExp(_this.regexOfCharacters[indexOfCharacter], "g")));
  
      this.countOfCharacters[indexOfCharacter] = arrayOfLinks.length * 2;
      arrayOfLinks.forEach((item) => {
        let index = item.index || 0;
        _this.indexOfCharacters[indexOfCharacter].push(length + index);
        _this.indexOfCharacters[indexOfCharacter].push(length + index + item[0].length-1);
      });
    });
  };

  /**
   *   This function gets new SPAN text by applying the required SPANS for the
   * given text using the object above.
   */
  getNewSpanText (newText: string, length: number) {
    let _this = this;
    let newSpanText = "<span class='note__text'>";
    [...newText].forEach((value, index) => {
      if (index < length) {
        newSpanText += value;
      } else {
        let indexOfCharacter = -1;
        let indexOfCharacterIndex = -1;
        _this.indexOfCharacters.forEach((valueOfCharIndex, indexOfCharIndex) => {
          if (valueOfCharIndex.indexOf(index) !== -1) {
            indexOfCharacter = indexOfCharIndex;
            indexOfCharacterIndex = valueOfCharIndex.indexOf(index);
          }
        });
  
        if (indexOfCharacter !== -1) {
          if (indexOfCharacterIndex % 2 === 0) {
            newSpanText += `</span><span class='${_this.classOfCharacters[indexOfCharacter]}'>` + value;
          } else {
            newSpanText += value + "</span><span class='note__text'>";
          }
        } else {
          if (value === ' ') {
            newSpanText += '\xa0';
          } else {
            newSpanText += value;
          }
        }
      }
    });
    newSpanText += "</span>";
    while (newSpanText.indexOf("<span class='note__text'></span>") !== -1)
      newSpanText = newSpanText.replace("<span class='note__text'></span>", "");
  
    return newSpanText;
  };
};

export { PairsInText };
