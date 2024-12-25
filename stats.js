document.addEventListener('DOMContentLoaded', () => {
    const boostersOpened = localStorage.getItem('boostersOpened') || 0;
    const totalTime = localStorage.getItem('totalTime') || 0;

    document.getElementById('boosters-opened').textContent = `Boosters ouverts: ${boostersOpened}`;
    document.getElementById('total-time').textContent = `Temps de jeu total: ${Math.floor(totalTime / 1000)} secondes`;
});
