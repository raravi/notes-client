import React from 'react';
import { onKeyDownInEditor, onClickInEditor } from './Editor';
import './App.css';

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1 className="header__title">Notes</h1>
      </header>
      <div contentEditable="true" className="note" onKeyDown={onKeyDownInEditor} onMouseUp={onClickInEditor}>
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

/*
# How to write a blog post!
1. *Come up with an interesting topic*: This can be anything. But it should be something that you're good at. Only then will you be able to write about it in detail.
2. *Research on it*: Do your bit before you start to write. Make a habit of researching about the topic, and check all available literature on it. So that you get an idea of how things stand now.
3. *A broad outline*: Break down the topic into sub-topics so that you can structure your post in a meaningful way.
4. *Write write write*: Just start typing, that's all there is to it. Just keep typing out the thoughts that come randomly into your head. Get everything out.
5. *Edit it*: Once you have typed out everything in your head, then it's time to start structuring it into the outline you had come up with earlier. It's okay if the outline changes, as long as it makes sense!
## Why should I write a blog post?
Writing is a form of expression. We humans have an innate need to express ourselves and be heard. We want to see and wish to be seen. And writing is one of the mediums for doing so. It also helps us become better at thinking objectively and form opinions based on research in a coherent manner.
## How to build an audience
In order to build a loyal following of readers willing to go through what you put up, you need to write good content consistently. And make sure to keep an eye on quality. Follow these guidelines:
* Write every day
* Never compromise on quality.
* Always think about the people who will read your content
* Are you saying something different than others?
*/
