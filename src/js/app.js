import { initTheme } from "./theme.js";

const form = document.querySelector('.todo__form');
const input = document.querySelector('.todo__form-input');
const list = document.querySelector('.todo__list');
const template = document.querySelector('#task-template');
const empty = document.querySelector('.todo__content-empty');
const filters = document.querySelector('.todo__filters');
const counter = document.querySelector('.js-count');


let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

// Initialize task creation and submission.
function addTask() {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (input.value) {
            const item = {
                id: Date.now(),
                text: input.value.trim(),
                completed: false,
            }

            tasks.push(item);
            input.value = '';
            saveToStorage();
        }

        renderTasks();
    });
}

// Sync data array with UI.
function renderTasks() {
    list.innerHTML = '';

    tasks.forEach(item => {
        const node = template.content.cloneNode(true);
        const taskTitle = node.querySelector('.js-title');
        node.querySelector('.todo__list-item').dataset.id = item.id;
        taskTitle.textContent = item.text;
        if (item.completed === true) {
            node.querySelector('.todo__list-item').classList.add('todo__list-item--done');
            node.querySelector('.js-complete input').checked = true;
        }

        list.append(node);
    });

    if (tasks.length > 0) {
        empty.classList.add('is-hidden');
        list.classList.remove('is-hidden');
        filters.classList.remove('is-hidden');
    } else {
        empty.classList.remove('is-hidden');
        list.classList.add('is-hidden');
        filters.classList.add('is-hidden');
    }

    countTasks();
}

// Handle interactions within task list.
list.addEventListener('click', (e) => {
    // Delete task
    const btnDelete = e.target.closest('.js-delete');

    if (btnDelete) {
        const id = Number(e.target.closest('.todo__list-item').dataset.id);
        tasks = tasks.filter(task => task.id !== id);

        saveToStorage();
        renderTasks();
    }

    // Complete task
    const btnComplete = e.target.tagName === 'INPUT';

    if (btnComplete) {
        const taskElement = e.target.closest('.todo__list-item');
        const id = Number(taskElement.dataset.id);
        const foundTask = tasks.find(task => task.id === id);
        foundTask.completed = !foundTask.completed;
        taskElement.classList.toggle('todo__list-item--done');
        taskElement.querySelector('.js-complete input').checked = foundTask.completed;

        saveToStorage();
        countTasks();
    }
});

// Save to local storage.
function saveToStorage() {
    const tasksValue = JSON.stringify(tasks);
    localStorage.setItem('myTasks', tasksValue);
}

// Tasks counter.
function countTasks() {
    const activeTasks = tasks.filter(item => item.completed === false);
    counter.innerHTML = activeTasks.length;
}

addTask();
renderTasks();
initTheme();