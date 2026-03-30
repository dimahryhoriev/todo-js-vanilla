import { initTheme } from "./theme.js";


const todoForm = document.querySelector('.todo__form');
const todoInput = document.querySelector('.todo__form-input');
const emptyBlock = document.querySelector('.todo__content-empty');
const filtersBlock = document.querySelector('.todo__filters');
const todoList = document.querySelector('.todo__list');
const template = document.querySelector('#task-template');


let tasks = JSON.parse(localStorage.getItem('my-todo-tasks')) || [];

function updateInterface() {
    if (tasks.length > 0) {
        emptyBlock.classList.add('is-hidden');
        filtersBlock.classList.remove('is-hidden');
        todoList.classList.remove('is-hidden');
    } else {
        emptyBlock.classList.remove('is-hidden');
        filtersBlock.classList.add('is-hidden');
        todoList.classList.add('is-hidden');
    }
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();

    if (taskText !== '') {
        tasks.push(taskText);
        todoInput.value = '';

        saveToLocalStorage();
        renderTasks();
        updateInterface();
    }
});

function deleteTask(index) {
    tasks.splice(index, 1);
    
    saveToLocalStorage();
    renderTasks();
    updateInterface();
}

function renderTasks() {
    todoList.innerHTML = '';

    tasks.forEach((task, index) => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.js-title').textContent = task;
        clone.querySelector('.js-delete').onclick = () => deleteTask(index);

        todoList.appendChild(clone);
    })
}

function saveToLocalStorage() {
    localStorage.setItem('my-todo-tasks', JSON.stringify(tasks));
}

initTheme();
renderTasks();
updateInterface();