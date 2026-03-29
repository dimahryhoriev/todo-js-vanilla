const themeButton = document.querySelector('.header__theme');


if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
})