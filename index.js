import "./index.css";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { checkAuth } from "./auth";

const TASK_TYPES = ["todo", "in-progress", "done"];

let tasks = {
  todo: [],
  "in-progress": [],
  done: [],
};

let modalState = {
  type: "",
  isOpen: false,
};

const openAddTaskModal = (type) => {
  modalState = {
    type,
    isOpen: true,
  };
  renderModal();
};

const closeAddTaskModal = () => {
  modalState = {
    type: "",
    isOpen: false,
  };
  renderModal();
};

document.addEventListener("DOMContentLoaded", async () => {
  // check if user is logged in
  await checkAuth();

  // get the tasks from firebase
  onSnapshot(collection(db, "tasks"), (snapshot) => {
    tasks = { todo: [], "in-progress": [], done: [] }; // Reset tasks

    snapshot.forEach((doc) => {
      const task = {
        id: doc.id,
        ...doc.data(),
      };
      tasks[task.type]?.push(task);
    });

    console.log("tasks", tasks);

    renderTasks();
  });

  // handle drag and drop
  const columns = document.getElementsByClassName("column");
  [...columns].forEach((column) => {
    const type = column.id;
    column.ondragover = (e) => {
      e.preventDefault();
      column.style.border = "2px solid #000";
    };
    column.ondragleave = (e) => {
      e.preventDefault();
      column.style.border = "none";
    };
    column.ondrop = (e) => {
      e.preventDefault();
      column.style.border = "none";
      const task = JSON.parse(e.dataTransfer.getData("text/plain"));
      console.log("dropped task", task);

      // update the task in firebase
      const taskRef = doc(db, "tasks", task.id);
      updateDoc(taskRef, {
        type,
      });
    };
  });

  // add listeners to new task buttons
  [...document.getElementsByClassName("add-task-button")].forEach((button) => {
    button.onclick = () => {
      openAddTaskModal(button.id);
    };
  });

  // add listener to close modal button
  document.getElementById("close-add-task-modal").onclick = closeAddTaskModal;
});

const renderModal = () => {
  document.getElementById("add-task-modal").style.display = modalState.isOpen
    ? "block"
    : "none";
  // find the input element
  const taskTitleInput = document.getElementById("task-title");
  const taskDescriptionInput = document.getElementById("task-description");
  // clear the input value
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  // set the input focus
  taskTitleInput.focus();

  const form = document.getElementById("add-task-modal-content");
  // add the event listener
  form.onsubmit = (e) => {
    e.preventDefault();
    const task = {
      title: taskTitleInput.value,
      description: taskDescriptionInput.value,
    };
    addTask(modalState.type, task);
  };
};

const renderTasks = () => {
  const columns = document.getElementsByClassName("column");
  TASK_TYPES.forEach((type) => {
    const column = [...columns].find((column) => column.id === type);
    const taskContainerInColumn =
      column.getElementsByClassName("task-container")[0];
    taskContainerInColumn.innerHTML = "";
    tasks[type]?.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task";
      taskElement.draggable = true;
      taskElement.innerHTML = `
          <h3>${task.title}</h3>
          <p>${task.description}</p>
        `;

      taskElement.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(task));
        taskElement.style.opacity = 0.25;
      });
      taskElement.addEventListener("dragend", () => {
        taskElement.style.opacity = 1;
      });
      taskContainerInColumn.appendChild(taskElement);
    });
  });
};

const addTask = async (type, task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      title: task.title,
      description: task.description,
      type: type,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  renderTasks();

  modalState = {
    type: "",
    isOpen: false,
  };
  renderModal();
};
