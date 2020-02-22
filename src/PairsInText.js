function PairsInText() {
  this.characters = ["*", "/", "_", "`", "-"];
  this.countOfCharacters = [0, 0, 0, 0, 0];
  this.totalCountOfCharacters = 0;
  this.indexOfCharacters = [[], [], [], [], []];
  this.classOfCharacters = ["note__bold",
                            "note__italic",
                            "note__underline",
                            "note__code",
                            "note__strikethrough"];
}

PairsInText.prototype.getCount = function (text) {
  let _this = this;
  this.totalCountOfCharacters = 0;
  this.characters.forEach((value, index) => {
    _this.countOfCharacters[index] = (text.match(new RegExp(`\\${value}`, "g")) || []).length;
    _this.totalCountOfCharacters += _this.countOfCharacters[index];
  });
};

PairsInText.prototype.getIndex = function (text, length) {
  let _this = this;
  [...text].forEach((characterInText, indexOfCharacterInText) => {
    _this.characters.forEach((character, indexOfCharacter) => {
      if (characterInText === character) {
        _this.indexOfCharacters[indexOfCharacter].push(length + indexOfCharacterInText)
      }
    });
  });
  this.countOfCharacters.forEach((count, index) => {
    if (count % 2 !== 0)
      _this.indexOfCharacters[index].pop();
  });
};

PairsInText.prototype.getNewSpanText = function (newText, length) {
  let _this = this;
  let newSpanText = "<span class='note__text'>";
  [...newText].forEach((value, index, array) => {
    if (index < length) {
      newSpanText += value;
    } else {
      let valueIsAPairCharacter = _this.characters.indexOf(value);
      if (valueIsAPairCharacter !== -1) {

      }
      if (valueIsAPairCharacter !== -1 && _this.indexOfCharacters[valueIsAPairCharacter].indexOf(index) !== -1) {
        let indexOfCharacterIndex = _this.indexOfCharacters[valueIsAPairCharacter].indexOf(index);
        if (indexOfCharacterIndex % 2 === 0) {
          newSpanText += `</span><span class='${_this.classOfCharacters[valueIsAPairCharacter]}'>` + value;
        } else {
          if (index === array.length-1)
            newSpanText += value;
          else
            newSpanText += value + "</span><span class='note__text'>";
        }
      } else {
        newSpanText += value;
      }
    }
  });
  newSpanText += "\xa0</span>";
  while (newSpanText.indexOf("<span class='note__text'></span>") !== -1)
    newSpanText = newSpanText.replace("<span class='note__text'></span>", "");

  return newSpanText;
};

export { PairsInText };
