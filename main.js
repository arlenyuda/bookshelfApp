const books = []
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBooks();
    })

    const submitSearch = document.getElementById('searchBook');
    submitSearch.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    })

    if(isStorageExist()) {
        localDataFromStorage();
    }
})

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event (SAVED_EVENT));
    }
}

function localDataFromStorage() {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event (RENDER_EVENT));
}

function addBooks() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBooks() {
    const inputSearch = document.getElementById('searchBookTitle').value.toLowerCase();
    
    const filterBooks = books.filter(book => book.title.toLowerCase().includes(inputSearch));
    const containerBook = document.querySelectorAll("[data-testid='bookItem']")
    for (const book of containerBook) {
        const bookId = parseInt(book.getAttribute('data-bookid'));

        const bookFilter = filterBooks.some(book => book.id === bookId);
        if (bookFilter) {
            book.removeAttribute('hidden');
        } else {
            book.setAttribute('hidden', true);
        }
    }
    
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findBook(id) {
    for (const book of books) {
        if (book.id === id) {
            return book;
        }
    }
}

function findIndexBook(id) {
    for (let i = 0; i < books.length; i++) {
        if (books[i].id == id) {
            return i;
        }
    }
    return -1;
}

function makeBooks(booksObject) {
    const textTitle = document.createElement('h3');
    textTitle.setAttribute('data-testid', 'bookItemTitle')
    textTitle.innerText = 'Judul ' + booksObject.title;
    
    const textAuthor = document.createElement('p');
    textAuthor.setAttribute('data-testid', 'bookItemAuthor')
    textAuthor.innerText = 'Penulis: ' + booksObject.author;
    
    const textYear = document.createElement('p');
    textYear.setAttribute('data-testid', 'bookItemYear')
    textYear.innerText = 'Tahun: ' + booksObject.year;

    const container = document.createElement('div');
    container.setAttribute('data-bookid', `${booksObject.id}`)
    container.setAttribute('data-testid', 'bookItem')
    container.append(textTitle, textAuthor, textYear);

    if (!booksObject.isComplete) {
        const completedButton = document.createElement('button');
        completedButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
        completedButton.innerText = 'Selesai dibaca'
        completedButton.addEventListener('click', function () {
            addReadFromCompleted(booksObject.id);
        })

        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.innerText = 'Edit Buku'
        editButton.addEventListener('click', function () {
            editReadFromCompleted(booksObject.id);
        })

        const trashButton = document.createElement('button');
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton')
        trashButton.innerText = 'Hapus Buku'
        trashButton.addEventListener('click', function () {
            removeReadFromCompleted(booksObject.id);
        })
        
        const containerButton = document.createElement('div');
        containerButton.classList.add('book-buttons');
        containerButton.append(completedButton, editButton, trashButton);

        container.append(containerButton);
    } else {
        const unCompletedButton = document.createElement('button');
        unCompletedButton.setAttribute('data-testid', 'bookItemDeleteButton')
        unCompletedButton.innerText = 'Belum selesai dibaca'
        unCompletedButton.addEventListener('click', function () {
            undoReadFromCompleted(booksObject.id);
        })

        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.innerText = 'Edit Buku'
        editButton.addEventListener('click', function () {
            editReadFromCompleted(booksObject.id);
        })
        
        const trashButton = document.createElement('button');
        trashButton.setAttribute('data-testid', 'bookItemDeleteButton')
        trashButton.innerText = 'Hapus Buku'
        trashButton.addEventListener('click', function () {
            removeReadFromCompleted(booksObject.id);
        })

        const containerButton = document.createElement('div');
        containerButton.classList.add('book-buttons');
        containerButton.append(unCompletedButton, editButton, trashButton);

        container.append(containerButton);
    }

    return container;
}

function addReadFromCompleted(bookId) {
    const book = findBook(bookId);
    
    if (book == null) return;

    book.isComplete = true;
    document.dispatchEvent(new Event (RENDER_EVENT));
    saveData();
}

function undoReadFromCompleted(bookId) {
    const book = findBook(bookId);

    if (book == null) return;

    book.isComplete = false;
    document.dispatchEvent(new Event (RENDER_EVENT));
    saveData();
}

function removeReadFromCompleted(bookId) {
    const indexBook = findIndexBook(bookId);

    if (indexBook === -1) return;

    books.splice(indexBook, 1);
    document.dispatchEvent(new Event (RENDER_EVENT));
    saveData();
}

function editReadFromCompleted(bookId) {
    const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);
    const bookTitle = bookElement.querySelector('[data-testid="bookItemTitle"]');
    const bookAuthor = bookElement.querySelector('[data-testid="bookItemAuthor"]');
    const bookYear = bookElement.querySelector('[data-testid="bookItemYear"]');
    
    const buttonContainer = bookElement.querySelector('.book-buttons');
    const buttons = Array.from(buttonContainer.children);
    
    bookTitle.style.display = 'none';
    bookAuthor.style.display = 'none';
    bookYear.style.display = 'none';
    
    buttons.forEach(button => button.style.display = 'none');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = bookTitle.innerText.replace('Judul ', '');
    titleInput.placeholder = 'Edit Judul Buku';

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.value = bookAuthor.innerText.replace('Penulis: ', '');
    authorInput.placeholder = 'Edit Penulis';

    const yearInput = document.createElement('input');
    yearInput.type = 'number';
    yearInput.value = bookYear.innerText.replace('Tahun: ', '');
    yearInput.placeholder = 'Edit Tahun';

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Simpan Perubahan';
    saveButton.addEventListener('click', function () {
        const bookIndex = findIndexBook(bookId);
        if (bookIndex !== -1) {
            books[bookIndex].title = titleInput.value;
            books[bookIndex].author = authorInput.value;
            books[bookIndex].year = parseInt(yearInput.value);
        }

        bookTitle.innerText = 'Judul ' + titleInput.value;
        bookAuthor.innerText = 'Penulis: ' + authorInput.value;
        bookYear.innerText = 'Tahun: ' + parseInt(yearInput.value);
        saveData();

        bookTitle.style.display = 'block';
        bookAuthor.style.display = 'block';
        bookYear.style.display = 'block';

        titleInput.remove();
        authorInput.remove();
        yearInput.remove();
        saveButton.remove();
        cancelButton.remove();

        buttons.forEach(button => button.style.display = 'inline');
    });

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Batal';
    cancelButton.addEventListener('click', function () {
        titleInput.remove();
        authorInput.remove();
        yearInput.remove();
        saveButton.remove();
        cancelButton.remove();

        bookTitle.style.display = 'block';
        bookAuthor.style.display = 'block';
        bookYear.style.display = 'block';
        buttons.forEach(button => button.style.display = 'inline');
    });

    buttonContainer.append(titleInput, authorInput, yearInput, saveButton, cancelButton);
}

document.addEventListener(RENDER_EVENT, function () {
    const incompletedBOOKList = document.getElementById('incompleteBookList');
    incompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completeBookList');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        const bookElements = makeBooks(bookItem);
        if (!bookItem.isComplete) 
            incompletedBOOKList.append(bookElements);
        else 
            completedBOOKList.append(bookElements);
    }
});