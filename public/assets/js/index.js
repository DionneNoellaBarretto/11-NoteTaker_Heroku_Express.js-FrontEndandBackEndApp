// global variable declaration
// activeNote is used to keep track of the current note in the textarea
let activeNote = {};
let note_Title;
let note_Text;
let save_Btn;
let addNote_Btn;
let noteList;
let noteListItems = [];

// dom selector using class names when url is specified as /notes
if (window.location.pathname === '/notes') {
  note_Title = document.querySelector('.note-title');
  note_Text = document.querySelector('.note-textarea');
  save_Btn = document.querySelector('.save-note');
  addNote_Btn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// function to get all notes from db
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // function to save notes to the db
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  // function to delete not from db
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // for an active/current note display input text else render empty value
const displayCurrentNote = () => {
  hide(save_Btn);

  if (activeNote.id) {
    note_Title.setAttribute('readonly', true);
    note_Text.setAttribute('readonly', true);
    note_Title.value = activeNote.title;
    note_Text.value = activeNote.text;
  } else {
    note_Title.removeAttribute('readonly');
    note_Text.removeAttribute('readonly');
    note_Title.value = '';
    note_Text.value = '';
  }
};

// get the input note text , save to db and update view to display input text
const savingNote = () => {
  const newNote = {
    title: note_Title.value,
    text: note_Text.value,
  };
  saveNote(newNote).then(() => {
    displayCurrentNote();
      // fetchViewNotes(); - not callign this else i see duplicate entries of the notes without a refresh
  });
};

// Delete the clicked note
const deletingNote = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
      // fetchViewNotes(); - not calling this else i see duplicate entries of the notes without a refresh
      displayCurrentNote();
  });
};

// Sets the current activeNote and displays it
const viewingNote = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  displayCurrentNote();
};

// Sets the current activeNote to and empty object and allows the user to enter a new note
const viewingNewNote = (e) => {
  activeNote = {};
  displayCurrentNote();
};

//function to hide save button if note title/text is empty else display it in nav bar
const showingSaveBtn = () => {
  if (!note_Title.value.trim() || !note_Text.value.trim()) {
    hide(save_Btn);
  } else {
    show(save_Btn);
  }
};

// Render the list of note titles
const showingNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  // Returns HTML element with or without a delete button unless withDeleteButton arg is false
  const noteListing = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', viewingNote);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      // hover text for click action
      delBtnEl.setAttribute('title', 'Click to Delete Note and then refresh your browser to view updated list of saved notes');
      delBtnEl.addEventListener('click', deletingNote);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(noteListing('No Saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = noteListing(note.title);
    li.dataset.note = JSON.stringify(note);
    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const fetchViewNotes = () => getNotes().then(showingNoteList);

if (window.location.pathname === '/notes') {
  save_Btn.addEventListener('click', savingNote);
  addNote_Btn.addEventListener('click', viewingNewNote);
  note_Title.addEventListener('keyup', showingSaveBtn);
  note_Text.addEventListener('keyup', showingSaveBtn);
}

// function to get and render initial note list
fetchViewNotes();