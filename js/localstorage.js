// Проверка наличия переменных в localStorage и их установка, если их там нет
if (localStorage.getItem('gravity') === null) {
    localStorage.setItem('gravity', 0.05);
}

if (localStorage.getItem('ballsToWin') === null) {
    localStorage.setItem('ballsToWin', 30);
}

if (localStorage.getItem('newBallProbability') === null) {
    localStorage.setItem('newBallProbability', 0.15);
}

if (localStorage.getItem('maxSpeed') === null) {
    localStorage.setItem('maxSpeed', 13);
}

if (localStorage.getItem('speedupAmount') === null) {
    localStorage.setItem('speedupAmount', 0.75);
}

if (localStorage.getItem('deleterSpeed') === null) {
    localStorage.setItem('deleterSpeed', 0.02);
}

if (localStorage.getItem('initialBallSpeed') === null) {
    localStorage.setItem('initialBallSpeed', 3);
}
