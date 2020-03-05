import React from "react";
import axios from 'axios';
import { onKeyDownInEditor, onClickInEditor, loadNoteInEditor } from '../editor/Editor';

axios.defaults.withCredentials = true  // enable axios post cookie, default false

export const Dashboard = (props) => {
  function onSave() {
    /**
     * POST the user request to the API endpoint '/save'.
     */
    axios.post('http://localhost:8000/api/users/save', {
      token: sessionStorage.getItem("token")
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));
  }

  function onLogout() {
    props.setUserLoggedIn(null);
    sessionStorage.removeItem("token");
    /**
     * POST the user request to the API endpoint '/logout'.
     */
    axios.post('http://localhost:8000/api/users/logout')
    .then(response => console.log(response))
    .catch(error => console.log(error));
  }

  function onClickNoteInSidebar(e) {
    let currentNoteInSidebar = e.target;
    let note = props.notes.find(note => note.id === currentNoteInSidebar.dataset.id);
    if (note) {
      let noteContent = note.note;
      loadNoteInEditor(noteContent);
      let children = currentNoteInSidebar.parentNode.childNodes;
      children.forEach(node => {
        node.setAttribute("class", "sidebar__note");
      });
      currentNoteInSidebar.setAttribute("class", "sidebar__note sidebar__note--active");
    }
  }

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar__header"></div>
        <div className="sidebar__new-note">New note</div>
        <div className="sidebar__notes-header">All notes</div>
        <div className="sidebar__notes">
          {props.notes.map(note =>
            <div className="sidebar__note" data-id={note.id} key={note.id} onClick={onClickNoteInSidebar}>{note.id}</div>
          )}
        </div>
      </div>
      <div className="mainbar">
        <header className="header">
          <div className="header__title">notes</div>
          <div className="header__save" onClick={onSave}>Save</div>
          <div className="header__logout" onClick={onLogout}>logout</div>
        </header>
        <div contentEditable="false" className="note" onKeyDown={onKeyDownInEditor} onMouseUp={onClickInEditor}>
          <div className="note__line">
            <p className="note__header1">
              <span className="note__text">Welcome to notes!</span>
            </p>
          </div>
          <div className="note__line">
            <p className="note__paragraph">
              <span className="note__text"><br /></span>
            </p>
          </div>
          <div className="note__line">
            <p className="note__paragraph">
              <span className="note__text">To edit, please click on your saved notes in the sidebar.</span>
            </p>
          </div>
          <div className="note__line">
            <p className="note__paragraph">
              <span className="note__text">Or open a new note!</span>
            </p>
          </div>
        </div>
        <footer className="footer">
          <div className="footer__text">
            <p>&#169; 2020 Amith Raravi - source code on <a href="https://github.com/raravi/notes-client">Github</a></p>
          </div>
        </footer>
      </div>
    </div>
  )
}

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
