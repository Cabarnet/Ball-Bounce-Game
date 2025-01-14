const settingsBlock = document.querySelector('.settings');

function openSettings() {
    settingsBlock.style.display = 'block';
}

function closeSettings() {
    settingsBlock.style.display = 'none';
}

// document.addEventListener('load', () => {
    const settingBlock = document.querySelectorAll('.setting-row');

    settingBlock.forEach(block => {
        const rangeInput = block.querySelector('input[type="range"]');
        const numberInput = block.querySelector('input[type="number"]');

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
// })