import { initTheme } from "./theme.js";

const form = document.querySelector('.todo__form');
const input = document.querySelector('.todo__form-input');
const list = document.querySelector('.todo__list');
const template = document.querySelector('#task-template');
const empty = document.querySelector('.todo__content-empty');
const filters = document.querySelector('.todo__filters');


let tasks = [];

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
}

// Handle interactions within task list.
list.addEventListener('click', (e) => {
    const btnDelete = e.target.closest('.js-delete');

    if (btnDelete) {
        const id = Number(e.target.closest('.todo__list-item').dataset.id);
        tasks = tasks.filter(task => task.id !== id);

        renderTasks();
    }
});

addTask();
renderTasks();
initTheme();