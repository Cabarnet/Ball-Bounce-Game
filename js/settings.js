const settingsBlock = document.querySelector('.settings');

const gravityInput = document.getElementById('gravityInput');
const ballsToWinInput = document.getElementById('ballsToWinInput');
const newBallProbabilityInput = document.getElementById('newBallProbabilityInput');
const maxBallSpeedInput = document.getElementById('maxBallSpeedInput');
const boosterSpeedupInput = document.getElementById('boosterSpeedupInput');
const startBallSpeedInput = document.getElementById('startBallSpeedInput');
const removalElementSpeedInput = document.getElementById('removalElementSpeedInput');

window.addEventListener('load', () => {
    gravityInput.value = parseFloat(localStorage.getItem('gravity'));
    ballsToWinInput.value = parseInt(localStorage.getItem('ballsToWin'), 10);
    newBallProbabilityInput.value = parseFloat(localStorage.getItem('newBallProbability')) * 100;
    maxBallSpeedInput.value = parseInt(localStorage.getItem('maxSpeed'), 10);
    boosterSpeedupInput.value = parseFloat(localStorage.getItem('speedupAmount'));
    startBallSpeedInput.value = parseFloat(localStorage.getItem('initialBallSpeed'));
    removalElementSpeedInput.value = parseFloat(localStorage.getItem('deleterSpeed'));
});

function openSettings() {
    settingsBlock.style.display = 'block';
}

function closeSettings() {
    settingsBlock.style.display = 'none';
}

const settingBlock = document.querySelectorAll('.setting-row');

settingBlock.forEach(block => {
    const rangeInput = block.querySelector('input[type="range"]');
    const numberInput = block.querySelector('input[type="number"]');

    window.addEventListener('load', () => { 
        rangeInput.value = numberInput.value;
    });

    // Обновляем значение number при изменении range
    rangeInput.addEventListener('input', function() {
        numberInput.value = rangeInput.value;
        numberInput.placeholder = rangeInput.value;
    });

    // Обновляем значение range при изменении number
    numberInput.addEventListener('change', function() {
        const value = parseFloat(numberInput.value);
        const min = parseFloat(rangeInput.min);
        const max = parseFloat(rangeInput.max);

        if (value >= min && value <= max) {
            rangeInput.value = value;
            numberInput.placeholder = value;
        }
        else if (value < min) {
            rangeInput.value = min;
            numberInput.value = min;
            numberInput.placeholder = min;
        }
        else if (value > max) {
            rangeInput.value = max;
            numberInput.value = max;
            numberInput.placeholder = max;
        }
    });
});

// Функция сохранения значений в localStorage
function saveSettings() {
    localStorage.setItem('gravity', gravityInput.value);
    localStorage.setItem('ballsToWin', ballsToWinInput.value);
    localStorage.setItem('newBallProbability', newBallProbabilityInput.value/100);
    localStorage.setItem('maxSpeed', maxBallSpeedInput.value);
    localStorage.setItem('speedupAmount', boosterSpeedupInput.value);
    localStorage.setItem('initialBallSpeed', startBallSpeedInput.value);
    localStorage.setItem('deleterSpeed', removalElementSpeedInput.value);

    window.location.reload();
    console.log(localStorage);
    // alert('Settings saved!');
}