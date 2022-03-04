const shelves = [];
let temporary = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
let displayAll = true;

document.addEventListener("DOMContentLoaded", () => {
	const submitForm = document.getElementById("inputBook");
	const cbComplete = document.getElementById("inputBookIsComplete");
	const btnStatus = document.getElementById("book_status");

	submitForm.addEventListener("submit", (e) => {
		e.preventDefault();
		addBook();
	});

	submitForm.addEventListener("change", () => {
		if (cbComplete.checked) {
			btnStatus.innerText = "Selesai dibaca";
		} else {
			btnStatus.innerText = "Belum selesai dibaca";
		}
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

const isStorageExist = () => {
	if (typeof Storage === undefined) {
		alert("Web Storage Not Supported!");
		return false;
	}

	return true;
};

const loadDataFromStorage = () => {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);
	if (data !== null) {
		for (book of data) {
			shelves.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
};

const generateId = () => {
	return +new Date();
};

const generateBookObject = (id, title, author, year, isComplete) => {
	return {
		id,
		title,
		author,
		year,
		isComplete,
	};
};

const makeBook = (bookObj) => {
	const { id, title, author, year, isComplete } = bookObj;

	const bookTitle = document.createElement("h3");
	bookTitle.innerText = title;

	const bookAuthor = document.createElement("p");
	bookAuthor.innerText = `Penulis: ${author}`;

	const bookYear = document.createElement("p");
	bookYear.innerText = `Tahun: ${year}`;

	const btnDone = document.createElement("button");
	btnDone.classList.add("green");

	if (isComplete) {
		btnDone.innerText = "Belum Selesai dibaca";
		btnDone.addEventListener("click", () => {
			undoBookFromCompleted(id);
		});
	} else {
		btnDone.innerText = "Selesai dibaca";
		btnDone.addEventListener("click", () => {
			addBookToCompletedBook(id);
		});
	}

	const btnDelete = document.createElement("button");
	btnDelete.classList.add("red");
	btnDelete.innerText = "Hapus buku";
	btnDelete.addEventListener("click", () => removeBookFromShelves(id));

	const btnContainer = document.createElement("div");
	btnContainer.classList.add("action");
	if (displayAll) {
		btnContainer.append(btnDone, btnDelete);
	}

	const container = document.createElement("article");
	container.classList.add("book_item");
	container.append(bookTitle, bookAuthor, bookYear, btnContainer);
	container.setAttribute("id", `book-${id}`);

	return container;
};

const saveData = () => {
	if (isStorageExist()) {
		const parsed = JSON.stringify(shelves);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
};

const addBook = () => {
	const bookId = generateId();
	const bookTitle = document.getElementById("inputBookTitle").value;
	const bookAuthor = document.getElementById("inputBookAuthor").value;
	const bookYear = document.getElementById("inputBookYear").value;
	const bookCompleted = document.getElementById("inputBookIsComplete").checked;

	const bookObj = generateBookObject(
		bookId,
		bookTitle,
		bookAuthor,
		bookYear,
		bookCompleted
	);

	shelves.push(bookObj);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const findBookById = (bookId) => {
	for (bookItem of shelves) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}

	return null;
};

const findBookByIndex = (bookId) => {
	for (index in shelves) {
		if (shelves[index].id === bookId) {
			return index;
		}
	}

	return -1;
};

const findBookByQuery = (query) => {
	for (bookItem of shelves) {
		if (bookItem.title == query) {
			temporary.push(bookItem);
		} else if (bookItem.author == query) {
			temporary.push(bookItem);
		}
	}
};

const addBookToCompletedBook = (bookId) => {
	const bookTarget = findBookById(bookId);
	if (bookTarget == null) return;

	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const undoBookFromCompleted = (bookId) => {
	const bookTarget = findBookById(bookId);
	if (bookTarget == null) return;

	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
};

const removeBookFromShelves = (bookId) => {
	const bookTarget = findBookByIndex(bookId);
	if (bookTarget === -1) return;
	if (confirm(`Hapus Buku ?`)) {
		shelves.splice(bookTarget, 1);
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	}
};

document.addEventListener(RENDER_EVENT, () => {
	const uncompletedBookList = document.getElementById(
		"incompleteBookshelfList"
	);
	uncompletedBookList.innerHTML = "";

	const completedBookList = document.getElementById("completeBookshelfList");

	completedBookList.innerHTML = "";

	let dataSource = [];

	if (displayAll) {
		dataSource = shelves;
	} else {
		dataSource = temporary;
	}

	for (bookItem of dataSource) {
		const bookElement = makeBook(bookItem);
		if (bookItem.isComplete) {
			completedBookList.append(bookElement);
		} else {
			uncompletedBookList.append(bookElement);
		}
	}
});

document.addEventListener(SAVED_EVENT, () => {
	console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById("searchBook").addEventListener("submit", (e) => {
	e.preventDefault();
	const searchQuery = document.getElementById("searchBookTitle").value;
	displayAll = searchQuery == "" ? true : false;
	findBookByQuery(searchQuery);
	document.dispatchEvent(new Event(RENDER_EVENT));
	temporary = [];
});
