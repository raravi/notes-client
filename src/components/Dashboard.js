import React, { useState, useEffect } from "react";
import axios from 'axios';
import { welcomeNote, helpNote } from "../config/content";
import { keyPressedInEditor,
          onClickInEditor,
          loadNoteInEditor,
          getTextFromEditor } from '../editor/Editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPlus,
          faLayerGroup,
          faQuestion,
          faPowerOff } from '@fortawesome/free-solid-svg-icons';

axios.defaults.withCredentials = true  // enable axios post cookie, default false

/**
 *   Dashboard React Component: This component is for the logged-in state.
 */
export const Dashboard = (props) => {
  let [ currentNoteId, setCurrentNoteId ] = useState(null);
  let [ currentNoteContent, setCurrentNoteContent ] = useState("");

  useEffect(() => {
    loadNoteInEditor(welcomeNote, "false");
  }, []);

  useEffect(() => {
    const id1 = setInterval(syncNote, 5000);
    const id2 = setInterval(syncAll, 5000);
    return () => {clearInterval(id1); clearInterval(id2)};
  });

  /**
   * POST the user request to the API endpoint '/sync'.
   */
  function syncNote() {
    if (currentNoteId) {
      let textContent = getTextFromEditor();
      let options;
      if (currentNoteContent !== textContent) {
        options = {
          userid: props.user.id,
          noteid: currentNoteId,
          notetext: textContent
        };
      } else {
        options = {
          userid: props.user.id,
          noteid: currentNoteId
        };
      }

      axios.post('http://localhost:8000/api/users/sync', options,
      {
        headers: {
          Authorization: sessionStorage.getItem("token")
        }
      })
      .then(response => {
        if (response.data.notemodified) {
          loadNoteInEditor(response.data.note, "true");
          textContent = getTextFromEditor();
        }
        if (currentNoteContent !== textContent) {
          let notes = props.notes.slice();
          let note = notes.find(note => note.id === currentNoteId);
          note.note = textContent;
          if (response.data.modifieddate)
            note.modifieddate = response.data.modifieddate;
          props.setNotes(notes);

          setCurrentNoteContent(textContent);
        }
      })
      .catch(error => console.log(error));
    }
  }

  /**
   * POST the user request to the API endpoint '/sendall'.
   */
  function syncAll() {
    axios.post('http://localhost:8000/api/users/sendall', {
      userid: props.user.id
    },
    {
      headers: {
        Authorization: sessionStorage.getItem("token")
      }
    })
    .then(response => {
      if (response && response.data && response.data.success) {
        if (currentNoteId) {
          let propNote = props.notes.find(note => note.id === currentNoteId);
          let responseNote = response.data.notes.find(note => note.id === currentNoteId);
          if (propNote && !responseNote) {
            loadNoteInEditor(welcomeNote, "false");
            setCurrentNoteId(null);
            setCurrentNoteContent("");
          }
        }

        props.setNotes(response.data.notes);
      }
    })
    .catch(error => console.log(error));
  }

  /**
   * This function sets the content of the HELP page.
   */
  function onHelp() {
    syncNote();
    loadNoteInEditor(helpNote, "true");
    setCurrentNoteId(null);
    setCurrentNoteContent("");
  }

  /**
   * This function logs off the user,
   * POST the user request to the API endpoint '/logout'.
   */
  function onLogout() {
    axios.post('http://localhost:8000/api/users/logout', {
      userid: props.user.id
    },
    {
      headers: {
        Authorization: sessionStorage.getItem("token")
      }
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));

    sessionStorage.removeItem("token");
    props.setUserLoggedIn(null);
  }

  /**
   * This function loads the contents of the note that was clicked.
   */
  function onClickNoteInSidebar(e) {
    let currentNoteInSidebar = e.target;
    if (currentNoteInSidebar.nodeName === "P")
      currentNoteInSidebar = currentNoteInSidebar.parentNode;
    if (currentNoteInSidebar.getAttribute("class") === "sidebar__note sidebar__note--active")
      return;
    let note = props.notes.find(note => note.id === currentNoteInSidebar.dataset.id);
    syncNote();
    loadNoteInEditor(note.note, "true");
    setCurrentNoteId(note.id);
    setCurrentNoteContent(getTextFromEditor());
  }

  /**
   * This function create a new note, and loads the contents of the new note.
   * POST the user request to the API endpoint '/new'.
   */
  function onClickNewNoteInSidebar(e) {
    syncNote();
    setCurrentNoteId(null);
    axios.post('http://localhost:8000/api/users/new', {
      userid: props.user.id
    },
    {
      headers: {
        Authorization: sessionStorage.getItem("token")
      }
    })
    .then(response => {
      if (response && response.data && response.data.note && response.data.note.note) {
        loadNoteInEditor(response.data.note.note, "true");

        let notes = props.notes.slice();
        notes.push(response.data.note);
        props.setNotes(notes);

        setCurrentNoteId(response.data.note.id);
        // Passing response.data.note.note makes a roundtrip of sync ?!
        setCurrentNoteContent(getTextFromEditor());
      }
    })
    .catch(error => console.log(error));
  }

  /**
   * This function deletes the note, and loads the contents of the welcome note.
   * POST the user request to the API endpoint '/delete'.
   */
  function onClickDeleteNote(e) {
    let noteId = e.target.parentNode.dataset.id;
    e.stopPropagation();

    axios.post('http://localhost:8000/api/users/delete', {
      userid: props.user.id,
      noteid: noteId
    },
    {
      headers: {
        Authorization: sessionStorage.getItem("token")
      }
    })
    .then(response => {
      if (response && response.data && response.data.success) {
        if (currentNoteId === noteId) {
          loadNoteInEditor(welcomeNote, "false");
          setCurrentNoteId(null);
          setCurrentNoteContent("");
        }
        let notes = props.notes.slice();
        let noteIndex = notes.findIndex(note => note.id === noteId);
        notes.splice(noteIndex, 1);
        props.setNotes(notes);
      }
    })
    .catch(error => console.log(error));
  }

  /**
   * This function gets the part of the Title that is
   * to be displayed in the sidebar.
   */
  function getTitleSlug(note) {
    let firstLine = note.split("\n")[0];
    if (firstLine.length > 30)
      return firstLine.slice(0, 30) + "...";
    return firstLine;
  }

  /**
   * This function handles the keypress event in the note element.
   */
  function onKeyDownInEditor(e) {
    keyPressedInEditor(e, window.getSelection());
  }

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__title">notes</div>
        </div>
        <div  className="sidebar__new-note"
              data-testid="dashboard-newnote"
              onClick={onClickNewNoteInSidebar}>
          <FontAwesomeIcon className="sidebar__list-icon" icon={faPlus} />
          <p className="sidebar__list-text">New note</p>
        </div>
        <div className="sidebar__notes-header">
          <FontAwesomeIcon className="sidebar__list-icon" icon={faLayerGroup} />
          <p className="sidebar__list-text">All notes</p>
        </div>
        <div className="sidebar__notes">
          {props.notes.map(note =>
            <div className={currentNoteId && currentNoteId === note.id
                            ? "sidebar__note sidebar__note--active"
                            : "sidebar__note"}
                data-testid="sidebar-note"
                data-id={note.id}
                key={note.id}
                onClick={onClickNoteInSidebar}>
              <p>{getTitleSlug(note.note)}</p>
              <span className="sidebar__note-close" onClick={onClickDeleteNote}>x</span>
            </div>
          )}
        </div>
      </div>
      <div className="mainbar">
        <header className="header">
          <div  className="header__help"
                data-testid="dashboard-help"
                onClick={onHelp}>
            <FontAwesomeIcon className="header__icon" icon={faQuestion} />
            <span className="header__help-tooltip">Click for help</span>
          </div>
          <div  className="header__logout"
                data-testid="dashboard-logout"
                onClick={onLogout}>
            <FontAwesomeIcon className="header__icon" icon={faPowerOff} />
            <span className="header__logout-tooltip">Sign off</span>
          </div>
        </header>
        <div  contentEditable="false"
              suppressContentEditableWarning={true}
              className="note"
              onKeyDown={onKeyDownInEditor}
              onMouseUp={onClickInEditor}
              data-testid="dashboard-note">
          <div className="note__line">
            <p className="note__paragraph">
              <span className="note__text"><br /></span>
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
