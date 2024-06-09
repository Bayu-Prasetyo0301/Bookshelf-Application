const INCOMPLETE_BOOK = "incompleteBookshelfList";
const COMPLETE_BOOK = "completeBookshelfList";
const BOOKS_KEY = "BOOKSHELF_APPS";

let books = [];

document.addEventListener("DOMContentLoaded", function () {
    const formInput = document.getElementById("inputBook");
    const formSearch = document.getElementById("searchBook");

    formInput.addEventListener("submit", function (event) {
        event.preventDefault();
        const inputBookYear = document.getElementById("inputBookYear").value;

        // Validasi bahwa inputBookYear adalah angka
        if (!isNaN(inputBookYear)) {
            // Hanya menjalankan addBook jika inputBookYear adalah angka
            addBook();

            // Reset input values after submitting the form
            document.getElementById("inputBookTitle").value = "";
            document.getElementById("inputBookAuthor").value = "";
            document.getElementById("inputBookYear").value = "";
            document.getElementById("inputBookIsComplete").checked = false;
        } else {
            alert("Tahun harus berupa angka.");
        }
    });


    formSearch.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputSearch = document.getElementById("searchBookTitle").value.trim(); // Trim whitespace
        if (inputSearch !== "") {
            // Call the bookSearch function with the input search value
            bookSearch(inputSearch);
        } else {
            // If the search input is empty, render all books
            renderFromBooks();
        }
    });

    if (isStorageSupported()) {
        fetchJson();
    }
});

document.addEventListener("onjsonfetched", function () {
    renderFromBooks();
});

function addBook() {
    const idBook = +new Date();
    const inputBookTitle = document.getElementById("inputBookTitle").value;
    const inputBookAuthor = document.getElementById("inputBookAuthor").value;
    const inputBookYear = document.getElementById("inputBookYear").value;
    const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;

    const book = createBook(idBook, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    const bookObject = composeBookObject(idBook, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);

    books.push(bookObject);

    if (inputBookIsComplete) {
        document.getElementById(COMPLETE_BOOK).append(book);
    } else {
        document.getElementById(INCOMPLETE_BOOK).append(book);
    }

    updateJson();
}

function createBook(idBook, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete) {
    const book = document.createElement("article");
    book.setAttribute("id", idBook)
    book.classList.add("card", "my-3");

    const bookTitle = document.createElement("h5");
    bookTitle.classList.add("text-truncate");
    bookTitle.style.maxWidth = "200px";
    bookTitle.innerText = inputBookTitle;

    const bookAuthor = document.createElement("span");
    bookAuthor.classList.add("text-truncate", "d-inline-block");
    bookAuthor.style.maxWidth = "200px";
    bookAuthor.innerText = inputBookAuthor;

    const bookYear = document.createElement("span");
    bookYear.innerText = inputBookYear;

    const br = document.createElement("br");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-body", "border-start", "border-4", "border-info", "d-flex", "justify-content-between");

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardAction = addAction(inputBookIsComplete, idBook);

    cardContent.append(bookTitle, bookAuthor, br, bookYear);
    cardContainer.append(cardContent);
    cardContainer.append(cardAction);
    book.append(cardContainer);

    return book;
}

function addAction(inputBookIsComplete, idBook) {
    const cardActions = document.createElement("div");

    const actionDelete = createActionDelete(idBook);
    const actionRead = createActionRead(idBook);
    const actionUndo = createActionUndo(idBook);

    cardActions.append(actionDelete);

    if (inputBookIsComplete) {
        cardActions.append(actionUndo);
    } else {
        cardActions.append(actionRead);
    }

    return cardActions;
}

function createActionDelete(idBook) {
    const actionDelete = document.createElement("button");
    actionDelete.classList.add("btn", "btn-sm", "btn-outline-danger", "mx-1");
    actionDelete.innerHTML = '<i class="bi bi-x"></i>';

    actionDelete.addEventListener("click", function () {
        let confirmation = confirm("Apakah Anda yakin ingin menghapus buku?");

        if (confirmation) {
            const cardParent = document.getElementById(idBook);
            cardParent.addEventListener("eventDelete", function (event) {
                event.target.remove();
            });
            cardParent.dispatchEvent(new Event("eventDelete"));

            deleteBookFromJson(idBook);
            updateJson();
        }
    });

    return actionDelete;
}

function createActionRead(idBook) {
    const action = document.createElement("button");
    action.classList.add("btn", "btn-sm", "btn-outline-primary");
    action.innerHTML = '<i class="bi bi-check"></i>';

    action.addEventListener("click", function () {
        const cardParent = document.getElementById(idBook);

        const bookTitle = cardParent.querySelector(".card-content > h5").innerText;
        const bookAuthor = cardParent.querySelectorAll(".card-content > span")[0].innerText;
        const bookYear = cardParent.querySelectorAll(".card-content > span")[1].innerText;

        cardParent.remove();

        const book = createBook(idBook, bookTitle, bookAuthor, bookYear, true);
        document.getElementById(COMPLETE_BOOK).append(book);

        deleteBookFromJson(idBook);
        const bookObject = composeBookObject(idBook, bookTitle, bookAuthor, bookYear, true);

        books.push(bookObject);
        updateJson();
    });

    return action;
}

function createActionUndo(idBook) {
    const action = document.createElement("button");
    action.classList.add("btn", "btn-sm", "btn-outline-secondary");
    action.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';

    action.addEventListener("click", function () {
        const cardParent = document.getElementById(idBook);

        const bookTitle = cardParent.querySelector(".card-content > h5").innerText;
        const bookAuthor = cardParent.querySelectorAll(".card-content > span")[0].innerText;
        const bookYear = cardParent.querySelectorAll(".card-content > span")[1].innerText;

        cardParent.remove();

        const book = createBook(idBook, bookTitle, bookAuthor, bookYear, false);
        document.getElementById(INCOMPLETE_BOOK).append(book);

        deleteBookFromJson(idBook);
        const bookObject = composeBookObject(idBook, bookTitle, bookAuthor, bookYear, false);

        books.push(bookObject);
        updateJson();
    });

    return action;
}

function bookSearch(keyword) {
    const filter = keyword.toUpperCase();
    const titles = document.getElementsByTagName("h5");

    for (let i = 0; i < titles.length; i++) {
        const titlesText = titles[i].textContent || titles[i].innerText;

        if (titlesText.toUpperCase().indexOf(filter) > -1) {
            titles[i].closest(".card").style.display = "";
        } else {
            titles[i].closest(".card").style.display = "none";
        }
    }
}

function isStorageSupported() {
    if (typeof Storage === "undefined") {
        alert("Browser Anda tidak mendukung penyimpanan web!");
        return false;
    } else {
        return true;
    }
}

function updateJson() {
    if (isStorageSupported()) {
        localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
}

function fetchJson() {
    let data = JSON.parse(localStorage.getItem(BOOKS_KEY));

    if (data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event("onjsonfetched"));
}

function composeBookObject(id, title, author, year, isComplete) {
    return {
        id, title, author, year: parseInt(year), isComplete,
    };
}

function clearBookshelfList() {
    document.getElementById(INCOMPLETE_BOOK).innerHTML = "";
    document.getElementById(COMPLETE_BOOK).innerHTML = "";
}

function deleteBookFromJson(idBook) {
    for (let arrayPosition = 0; arrayPosition < books.length; arrayPosition++) {
        if (books[arrayPosition].id == idBook) {
            books.splice(arrayPosition, 1);
            break;
        }
    }
}

function renderFromBooks() {
    clearBookshelfList();
    for (book of books) {
        const newBook = createBook(book.id, book.title, book.author, book.year, book.isComplete);

        if (book.isComplete) {
            document.getElementById(COMPLETE_BOOK).append(newBook);
        } else {
            document.getElementById(INCOMPLETE_BOOK).append(newBook);
        }
    }
}
