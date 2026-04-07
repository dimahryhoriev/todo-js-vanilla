import { initTheme } from "./theme.js";

const form = document.querySelector('.todo__form');
const input = document.querySelector('.todo__form-input');
const list = document.querySelector('.todo__list');
const listWrapper = document.querySelector('.todo__list-wrapper');
const template = document.querySelector('#task-template');
const empty = document.querySelector('.todo__content-empty');
const filters = document.querySelector('.todo__filters');
const counter = document.querySelector('.js-count');
let currentFilter = 'All';


let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

// Initialize task creation and submission.
function addTask() {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (input.value.trim() !== '') {
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
    let filteredTasks = [];
    if (currentFilter === 'Active') {
        filteredTasks = tasks.filter(task => task.completed === false);
    } else if (currentFilter === 'Completed') {
        filteredTasks = tasks.filter(task => task.completed === true);
    } else {
        filteredTasks = tasks;
    }

    const existingMessage = listWrapper.querySelector('.todo__list-message');
    if (filteredTasks.length === 0 && tasks.length > 0) {
        if (!existingMessage) {
            const emptyText = document.createElement('div');
            emptyText.classList.add('todo__list-message');

            if (currentFilter === 'Active') {
                emptyText.textContent = 'No active tasks found 🙁';
            } else if (currentFilter === 'Completed') {
                emptyText.textContent = 'No completed tasks found 🙁';
            }

            listWrapper.append(emptyText)
        }
    } else {
        existingMessage?.remove();
    }

    const listItem = list.querySelectorAll('.todo__list-item');
    listItem.forEach(listItem => {
        const id = Number(listItem.dataset.id);

        if (!filteredTasks.find(task => task.id === id)) {
            listItem.remove();
        }
    });

    filteredTasks.forEach(item => {
        const existingItem = list.querySelector(`[data-id="${item.id}"]`);
        if (existingItem) {
            existingItem.classList.toggle('todo__list-item--done', item.completed);
            existingItem.querySelector('.js-complete input').checked = item.completed;
            const taskTitle = existingItem.querySelector('.js-title');
            if (taskTitle) {
                taskTitle.textContent = item.text;
            }
        } else {
            const node = template.content.cloneNode(true);
            const taskTitle = node.querySelector('.js-title');
            node.querySelector('.todo__list-item').dataset.id = item.id;
            taskTitle.textContent = item.text;
            if (item.completed === true) {
                node.querySelector('.todo__list-item').classList.add('todo__list-item--done');
                node.querySelector('.js-complete input').checked = true;
            }
            list.append(node);
        }
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

    // Scroll mask lifecycle management.
    function isScrollable(list) {
        return list.scrollHeight > list.clientHeight;
    }

    const scrollable = isScrollable(list);
    const existingMask = listWrapper.querySelector('.todo__list-mask');

    if (tasks.length >= 4 && scrollable) {
        if (!existingMask) {
            const maskWrapper = document.createElement('div');
            maskWrapper.classList.add('todo__list-mask');

            const topMask = document.createElement('div');
            topMask.classList.add('todo__list-mask--top');
            topMask.style.opacity = '0';

            const bottomMask = document.createElement('div');
            bottomMask.classList.add('todo__list-mask--bottom');
            bottomMask.style.opacity = '1';

            maskWrapper.appendChild(topMask);
            maskWrapper.appendChild(bottomMask);

            listWrapper.appendChild(maskWrapper);
        }
    } else {
        existingMask?.remove();
    }

    countTasks();
}

// Scroll mask visibility toggle.
list.addEventListener('scroll', () => {
    const topMask = listWrapper.querySelector('.todo__list-mask--top');
    const bottomMask = listWrapper.querySelector('.todo__list-mask--bottom');

    if (topMask && bottomMask) {
        requestAnimationFrame(() => {
            topMask.style.opacity = list.scrollTop > 0 ? '1' : '0';

            const isAtBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
            bottomMask.style.opacity = isAtBottom ? '0' : '1';
        });
    }
})

// Handle interactions within task list.
list.addEventListener('click', (e) => {
    // Delete task
    const btnDelete = e.target.closest('.js-delete');

    if (btnDelete) {
        const id = Number(e.target.closest('.todo__list-item').dataset.id);
        const taskElement = e.target.closest('.todo__list-item');
        taskElement.classList.add('todo__list-item--leaving');

        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
            saveToStorage();
        }, 300)
    }

    // Complete task
    const btnComplete = e.target.type === 'checkbox';

    if (btnComplete) {
        const taskElement = e.target.closest('.todo__list-item');
        if (taskElement.classList.contains('todo__list-item--leaving')) {
            return;
        }

        const id = Number(taskElement.dataset.id);
        const foundTask = tasks.find(task => task.id === id);
        foundTask.completed = !foundTask.completed;
        taskElement.classList.toggle('todo__list-item--done');
        taskElement.querySelector('.js-complete input').checked = foundTask.completed;

        if (currentFilter !== 'All') {
            taskElement.classList.add('todo__list-item--leaving');
        }

        setTimeout(() => {
            renderTasks();
            saveToStorage();
            countTasks();
        }, 300)
    }

    // Edit task
    const btnEdit = e.target.closest('.js-edit');
    if (!btnEdit) return;
    const taskElement = e.target.closest('.todo__list-item');
    const id = Number(taskElement.dataset.id);
    const foundTask = tasks.find(task => task.id === id);

    if (!btnEdit.classList.contains('is-saving')) {
        const itemInput = document.createElement('input');
        const taskTitle = taskElement.querySelector('.js-title');
        const editIcon = taskElement.querySelector('.js-edit');
        itemInput.type = 'text';
        itemInput.value = foundTask.text;
        taskTitle.replaceWith(itemInput);
        editIcon.classList.toggle('is-saving');

        itemInput.classList.add('todo__item-title--editable');
        itemInput.focus();

        itemInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveTask(taskElement, foundTask);
            }
        });
    } else {
        saveTask(taskElement, foundTask);
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
    const mediaQuery = window.matchMedia('(max-width: 400px)').matches;

    if (activeTasks.length > 0) {
        counter.innerHTML = activeTasks.length;
    } else if (activeTasks.length === 0 && mediaQuery) {
        counter.innerHTML = '0';
    } else {
        counter.innerHTML = 'There are no';
    }
}

// Save task.
function saveTask(taskElement, foundTask) {
    const currentInput = taskElement.querySelector('.todo__item-title--editable');
    foundTask.text = currentInput.value.trim();
    taskElement.querySelector('.js-edit').classList.remove('is-saving');
    const taskTitle = document.createElement('p');
    taskTitle.classList.add('todo__item-title', 'js-title');
    taskTitle.textContent = foundTask.text;
    currentInput.replaceWith(taskTitle);

    saveToStorage();
    renderTasks();
}

// Filters for tasks.
function initFilters() {
    filters.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('.todo__filters-btn');
        if (!filterBtn) {
            return
        }
        const filterValue = filterBtn.dataset.filter;
        const allButtons = filters.querySelectorAll('.todo__filters-btn');
        allButtons.forEach((btn) => {
            btn.classList.remove('is-active');
        });
        currentFilter = filterValue;
        filterBtn.classList.toggle('is-active');

        renderTasks();
    });
}

initFilters();
addTask();
renderTasks();
initTheme();