const themeButton = document.querySelector('.header__theme');


// THEME SWITCHING FUNCTION

function initTheme() {
    if (!themeButton) return;

    themeButton.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-theme');

        if (isDark) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}

export { initTheme };