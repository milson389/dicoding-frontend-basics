const todos = [];
const RENDER_EVENT = "render-todo";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const addTodo = () => {
  const textTodo = document.getElementById("title").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const makeTodo = (todoObject) => {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", () => {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", () => {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", () => {
      addTaskToComplete(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
};

const findTodo = (todoId) => {
  for (todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
};

const findTodoIndex = (todoId) => {
  for (index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
};

const addTaskToComplete = (todoId) => {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const undoTaskFromCompleted = (todoId) => {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const removeTaskFromCompleted = (todoId) => {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Web Storage Not Supported!");
    return false;
  }

  return true;
};

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const generateId = () => {
  return +new Date();
};

const generateTodoObject = (id, task, timestamp, isCompleted) => {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  };
};

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

  for (todoItem of todos) {
    const todoElement = makeTodo(todoItem);

    if (todoItem.isCompleted == false) uncompletedTODOList.append(todoElement);
    else completedTODOList.append(todoElement);
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});
