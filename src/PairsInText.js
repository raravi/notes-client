function PairsInText() {
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
}

PairsInText.prototype.getCountAndIndex = function (text, length) {
  let _this = this;

  this.characters.forEach((valueOfCharacter, indexOfCharacter) => {
    let arrayOfLinks = Array.from(text.matchAll(new RegExp(_this.regexOfCharacters[indexOfCharacter], "g")));

    this.countOfCharacters[indexOfCharacter] = arrayOfLinks.length * 2;
    arrayOfLinks.forEach((item, index) => {
      _this.indexOfCharacters[indexOfCharacter].push(length + item.index);
      _this.indexOfCharacters[indexOfCharacter].push(length + item.index + item[0].length-1);
    });
  });
};

PairsInText.prototype.getNewSpanText = function (newText, length) {
  let _this = this;
  let newSpanText = "<span class='note__text'>";
  [...newText].forEach((value, index, array) => {
    if (index < length) {
      if (value === ' ') {
        newSpanText += '\xa0';
      } else {
        newSpanText += value;
      }
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
          if (index === array.length-1) {
            if (value === ' ') {
              newSpanText += '\xa0';
            } else {
              newSpanText += value;
            }
          }
          else
            newSpanText += value + "</span><span class='note__text'>";
        }
      } else {
        if (value === ' ') {
          newSpanText += '\xa0';
        } else {
          newSpanText += value;
        }
      }

      /*let valueIsAPairCharacter = _this.characters.indexOf(value);
      if (valueIsAPairCharacter !== -1 && _this.indexOfCharacters[valueIsAPairCharacter].indexOf(index) !== -1) {
        let indexOfCharacterIndex = _this.indexOfCharacters[valueIsAPairCharacter].indexOf(index);
        if (indexOfCharacterIndex % 2 === 0) {
          newSpanText += `</span><span class='${_this.classOfCharacters[valueIsAPairCharacter]}'>` + value;
        } else {
          if (index === array.length-1) {
            if (value === ' ') {
              newSpanText += '\xa0';
            } else {
              newSpanText += value;
            }
          }
          else
            newSpanText += value + "</span><span class='note__text'>";
        }
      } else {
        if (value === ' ') {
          newSpanText += '\xa0';
        } else {
          newSpanText += value;
        }
      }*/
    }
  });
  newSpanText += "</span>";
  while (newSpanText.indexOf("<span class='note__text'></span>") !== -1)
    newSpanText = newSpanText.replace("<span class='note__text'></span>", "");

  return newSpanText;
};

export { PairsInText };
