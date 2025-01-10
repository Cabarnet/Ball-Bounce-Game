const container = document.getElementById('game-container');
const ballsСount = document.querySelector('.balls-count');
const containerRadius = container.offsetWidth / 2;

let isGameOver = false, bounceCount = 0, plusSignExists = false, plusSign;
let lastFrameTime = performance.now(); // Время последнего кадра

const gravity = 0.0; // Гравитация
const ballsToWin = 35; // Шаров для победы
const newBallProbability = 0.17; // Вероятность создания нового
const maxSpeed = 13; // Максимальная скорость
const speedupAmount = 0.75; // Ускорение НА это кол-во
const deleterSpeed = 0.005; // Скорость удаляющего элемента
const initialBallSpeed = 3; // Начальная скорость шарика

// Вспомогательная функция для воспроизведения звука
function playSound(src) {
  const sound = new Audio(src);
  sound.play();
}

// Вспомогательная функция для получения случайного углового отклонения
function getRandomAngleOffset(maxDegrees) {
  return ((Math.random() - 0.5) * 2 * maxDegrees * Math.PI) / 180;
}

// Создание нового шара
function createBall(x, y, vx, vy) {
  const ball = document.createElement('div');
  ball.className = 'ball';
  container.appendChild(ball);

  return { element: ball, x, y, vx, vy };
}

function limitSpeed(vx, vy) {
  const speed = Math.sqrt(vx ** 2 + vy ** 2);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    vx *= scale;
    vy *= scale;
  }
  return [vx, vy];
}

function updateBall(ball) {
  if (isGameOver) return;

  ball.vy += gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  const distance = Math.sqrt(ball.x ** 2 + ball.y ** 2);
  const ballRadius = ball.element.offsetWidth / 2;

  if (distance + ballRadius >= containerRadius) {
    const angle = Math.atan2(ball.y, ball.x), normalX = Math.cos(angle), normalY = Math.sin(angle);
    const dot = ball.vx * normalX + ball.vy * normalY;
    ball.vx -= 2 * dot * normalX;
    ball.vy -= 2 * dot * normalY;

    const velocityMagnitude = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    const newAngle = Math.atan2(ball.vy, ball.vx) + getRandomAngleOffset(5);
    ball.vx = velocityMagnitude * Math.cos(newAngle);
    ball.vy = velocityMagnitude * Math.sin(newAngle);

    ball.x = normalX * (containerRadius - ballRadius);
    ball.y = normalY * (containerRadius - ballRadius);
    bounceCount++;

    if (Math.random() < newBallProbability) {
      const newBall = createBall(ball.x, ball.y, ball.vx, ball.vy);
      balls.push(newBall);
    }
    
    if (balls.length >= ballsToWin) {
      showWin();
    }

    playSound('./sound/bounce.mp3');
  }

  // Ограничиваем скорость
  [ball.vx, ball.vy] = limitSpeed(ball.vx, ball.vy);

  ball.element.style.left = `${150 + ball.x - ballRadius}px`;
  ball.element.style.top = `${150 + ball.y - ballRadius}px`;

  if (plusSignExists) checkCollision(ball);

  checkRedSegmentCollision(ball);
}

// Создание знака "+" (ускорителя)
function createPlusSign() {
  if (isGameOver || plusSignExists) return;

  plusSign = document.createElement('div');
  plusSign.className = 'plus-sign';
  const size = 35, angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * (containerRadius - size - 15);
  plusSign.style.left = `${165 + radius * Math.cos(angle) - size / 2}px`;
  plusSign.style.top = `${165 + radius * Math.sin(angle) - size / 2}px`;
  container.appendChild(plusSign);
  plusSignExists = true;

  const currentPlusSign = plusSign;
  setTimeout(() => {
    if (plusSignExists && plusSign === currentPlusSign) {
      plusSign.remove();
      plusSignExists = false;
    }
  }, 3000);
}

// Проверка столкновения шара с ускорителем
function checkCollision(ball) {
  if (!plusSignExists || !plusSign) return;

  const plusRect = plusSign.getBoundingClientRect();
  const ballRect = ball.element.getBoundingClientRect();
  const dx = ballRect.left + ballRect.width / 2 - (plusRect.left + plusRect.width / 2);
  const dy = ballRect.top + ballRect.height / 2 - (plusRect.top + plusRect.height / 2);

  // Проверяем столкновение
  if (Math.hypot(dx, dy) < ballRect.width / 2 + plusRect.width / 2) {
    const magnitude = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) + speedupAmount;
    const angle = Math.atan2(ball.vy, ball.vx);
    ball.vx = magnitude * Math.cos(angle);
    ball.vy = magnitude * Math.sin(angle);

    // Удаляем ускоритель и сбрасываем флаг
    if (plusSignExists) {
      plusSign.remove();
      plusSignExists = false;
      playSound('./sound/speedup.mp3');

      // Мигание желтым цветом
      container.classList.add('flash-yellow');
      setTimeout(() => {
        container.classList.remove('flash-yellow');
      }, 500);
    }
  }
}

// Отображение оконания игры
function showGameOver() {
  isGameOver = true;
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="center-line game-over"><p>Lose</p></div>'
  );
  enableRestart();
}

function showWin() {
  isGameOver = true;
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="center-line win"><p>Win</p></div>'
  );
  enableRestart();
}

function enableRestart() {
  document.addEventListener('click', restartGame, { once: true });
}

function restartGame() {
  document.querySelector('.center-line').remove();
  resetGame();
  updateGame();
}

function resetGame() {
  isGameOver = false;
  bounceCount = 0;
  plusSignExists = false;
  
  // Удаление всех шаров и знаков плюса
  balls.forEach(ball => ball.element.remove());
  balls.length = 0;

  if (plusSign) {
    plusSign.remove();
    plusSignExists = false;
  }

  // Создание нового шара с использованием начальной скорости
  balls.push(createBall(0, 0, 0, initialBallSpeed));

  // Сброс угла и перезапуск красного сегмента
  redSegmentAngle = Math.random() * 2 * Math.PI;
  requestAnimationFrame(updateRedSegment);
}

// Переменные для расчета FPS
let frameCount = 0;
let fpsTimer = 0;

// Функция для обновления FPS
function updateFPS() {
  const now = performance.now();
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  frameCount++;
  fpsTimer += deltaTime;

  if (fpsTimer >= 250) { // Обновляем FPS каждые 250 миллисекунд
    const fps = Math.round((frameCount / fpsTimer) * 1000);
    frameCount = 0;
    fpsTimer = 0;
    document.querySelector('.fps span').textContent = `${fps}`;
  }

  requestAnimationFrame(updateFPS);
}

// Запускаем обновление FPS при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  lastFrameTime = performance.now(); // Инициализация перед первым обновлением
  updateFPS();
});

// Обновление игры
function updateGame() {
  if (isGameOver) return;

  ballsСount.innerHTML = `${balls.length}`;
  balls.forEach(updateBall);
  requestAnimationFrame(updateGame);
}

// Массив для хранения всех шаров
const balls = [createBall(0, 0, 0, initialBallSpeed)];

// Интервалы для создания ускорителей и сброса счётчика столкновений
setInterval(() => (isGameOver ? null : createPlusSign()), 1000);
setInterval(() => (bounceCount = 0), 1000);

let redSegmentAngle = Math.random() * 2 * Math.PI; // Устанавливаем начальный угол в случайное значение

function updateRedSegment() {
  if (isGameOver) return; // Останавливаем обновление, если игра завершена

  redSegmentAngle = (redSegmentAngle + deleterSpeed) % (2 * Math.PI);
  const redSegment = document.querySelector('.red-segment');
  const x = 110 + (containerRadius - 1) * Math.cos(redSegmentAngle);
  const y = 110 + (containerRadius - 1) * Math.sin(redSegmentAngle);
  redSegment.style.left = `${x}px`;
  redSegment.style.top = `${y}px`;
  // redSegment.style.rotate = `${redSegmentAngle * 57.5 + 270.5}deg`;
  requestAnimationFrame(updateRedSegment);
}

document.addEventListener('DOMContentLoaded', () => {
  const redSegment = document.createElement('div');
  redSegment.className = 'red-segment';
  container.appendChild(redSegment);
  updateRedSegment();
});

function checkRedSegmentCollision(ball) {
  const ballRect = ball.element.getBoundingClientRect();
  const redSegment = document.querySelector('.red-segment');
  const redSegmentRect = redSegment.getBoundingClientRect();

  // Координаты центров шара и красного сегмента
  const ballCenterX = ballRect.left + ballRect.width / 2;
  const ballCenterY = ballRect.top + ballRect.height / 2;
  const redSegmentCenterX = redSegmentRect.left + redSegmentRect.width / 2;
  const redSegmentCenterY = redSegmentRect.top + redSegmentRect.height / 2;

  // Проверяем пересечение границ шара и красного сегмента - КВАДРАТНАЯ ОБЛАСТЬ
  const overlap = !(ballRect.right < redSegmentRect.left ||
                    ballRect.left > redSegmentRect.right ||
                    ballRect.bottom < redSegmentRect.top ||
                    ballRect.top > redSegmentRect.bottom);

  // Проверяем пересечение - КРУГЛАЯ ОБЛАСТЬ
  // const ballRadius = ballRect.width / 2;
  // const redSegmentRadius = redSegmentRect.width / 2;
  // const overlap = Math.hypot(ballCenterX - redSegmentCenterX, ballCenterY - redSegmentCenterY) < ballRadius + redSegmentRadius;

  if (overlap) {
    playSound('./sound/delete.mp3');
    ball.element.remove();
    balls.splice(balls.indexOf(ball), 1);
  }

  // Проверка на завершение игры
  if (balls.length === 0) {
    showGameOver();
  }
}

// Начало игры по клику
document.addEventListener('click', () => {
  document.querySelector('.center-line').remove();
  lastFrameTime = performance.now(); // Инициализация перед первым обновлением
  updateGame();
}, { once: true });
