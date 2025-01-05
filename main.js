const container = document.getElementById('game-container');
const gravity = 0.1, maxBounces = 30, containerRadius = container.offsetWidth / 2;

let isGameOver = false, bounceCount = 0, plusSignExists = false, plusSign;
let lastFrameTime = performance.now(); // Время последнего кадра

const maxSpeed = 17.5; // Максимальная скорость

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

    if (Math.random() < 0.5) {
      const newBall = createBall(ball.x, ball.y, ball.vx, ball.vy);
      balls.push(newBall);
    }

    playSound('bounce.mp3');
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
    const magnitude = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) + 2.5;
    const angle = Math.atan2(ball.vy, ball.vx);
    ball.vx = magnitude * Math.cos(angle);
    ball.vy = magnitude * Math.sin(angle);

    // Удаляем ускоритель и сбрасываем флаг
    if (plusSignExists) {
      plusSign.remove();
      plusSignExists = false;
      playSound('speedup.mp3');

      // Мигание желтым цветом
      container.classList.add('flash-yellow');
      setTimeout(() => {
        container.classList.remove('flash-yellow');
      }, 500);
    }
  }
}

// Отображение "Game Over"
function showGameOver() {
  isGameOver = true;
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="game-over"><p>Game Over</p></div>'
  );
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

  if (bounceCount >= maxBounces) return (velocityX = velocityY = 0), showGameOver();
  balls.forEach(updateBall);
  requestAnimationFrame(updateGame);
}

// Массив для хранения всех шаров
const balls = [createBall(0, 0, 2, 2)];

// Интервалы для создания ускорителей и сброса счётчика столкновений
setInterval(() => (isGameOver ? null : createPlusSign()), 1000);
setInterval(() => (bounceCount = 0), 1000);

// Начало игры по клику
document.addEventListener('click', () => {
  lastFrameTime = performance.now(); // Инициализация перед первым обновлением
  updateGame();
}, { once: true });

// Создание и обновление красного отрезка
let redSegmentAngle = 0;
function updateRedSegment() {
  redSegmentAngle = (redSegmentAngle + 0.02) % (2 * Math.PI);
  const redSegment = document.querySelector('.red-segment');
  const x = 112.5 + (containerRadius - 5) * Math.cos(redSegmentAngle) - 2.5;
  const y = 148 + (containerRadius - 5) * Math.sin(redSegmentAngle) - 2.5;
  redSegment.style.left = `${x}px`;
  redSegment.style.top = `${y}px`;
  redSegment.style.rotate = `${redSegmentAngle * 57.5 + 270.5}deg`;
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
  const dx = ballRect.left + ballRect.width / 2 - (redSegmentRect.left + redSegmentRect.width / 2);
  const dy = ballRect.top + ballRect.height / 2 - (redSegmentRect.top + redSegmentRect.height / 2);
  if (Math.hypot(dx, dy) < ballRect.width / 2 + redSegmentRect.width / 2) {
    ball.element.remove();
    balls.splice(balls.indexOf(ball), 1);
  }
}
