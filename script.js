/**
 * 📌 FUNCIÓN PARA ACTIVAR/DESACTIVAR EL "MODO SINCERO"
 * - Alterna la visibilidad del contenido oculto al hacer clic en el botón.
 */
function toggleSincere() {
    const box = document.getElementById('sincereBox');
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
    } else {
        box.style.display = 'none';
    }
}

/**
 * 📌 JUEGO DE PING PONG EN EL FONDO DEL TÍTULO
 * - Canvas con paletas naranjas y pelota en color primario.
 * - Velocidad lenta y estilo claro para no distraer.
 */
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');

    // Ajustamos el tamaño del canvas
    canvas.width = 760;
    canvas.height = 100;

    // Obtenemos el color primario desde el CSS para la pelota
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();

    // Configuración del juego (valores ajustados para estilo claro)
    const paddleHeight = 15;
    const paddleWidth = 10;
    const ballRadius = 5;
    let x = 20;
    let y = canvas.height / 2;
    let dx = 1.2; // Velocidad horizontal
    let dy = -1.2; // Velocidad vertical
    let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

    // Dibujar el fondo claro
    function drawBackground() {
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dibujar las palas (naranjas)
    function drawPaddles() {
        ctx.fillStyle = '#ff8c00'; // Color naranja para las palas
        ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight); // Pala izquierda
        ctx.fillRect(canvas.width - 10 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight); // Pala derecha
    }

    // Dibujar la pelota (color primario)
    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor; // Color primario para la pelota
        ctx.fill();
        ctx.closePath();
    }

    // Dibujar la red (línea discontinua en gris claro)
    function drawNet() {
        ctx.strokeStyle = '#cccccc';
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Lógica de colisiones
    function collisionDetection() {
        if (x - ballRadius < 20 && y > leftPaddleY && y < leftPaddleY + paddleHeight) dx = -dx;
        if (x + ballRadius > canvas.width - 20 && y > rightPaddleY && y < rightPaddleY + paddleHeight) dx = -dx;
        if (y - ballRadius < 0 || y + ballRadius > canvas.height) dy = -dy;
        if (x - ballRadius < 0 || x + ballRadius > canvas.width) {
            x = 20;
            y = canvas.height / 2;
        }
    }

    // Movimiento automático de las palas
    function movePaddles() {
        const leftPaddleCenter = leftPaddleY + paddleHeight / 2;
        const rightPaddleCenter = rightPaddleY + paddleHeight / 2;

        if (leftPaddleCenter < y - 5) leftPaddleY += 0.8;
        else if (leftPaddleCenter > y + 5) leftPaddleY -= 0.8;

        if (rightPaddleCenter < y - 5) rightPaddleY += 0.8;
        else if (rightPaddleCenter > y + 5) rightPaddleY -= 0.8;
    }

    // Dibujar todo
    function draw() {
        drawBackground(); // Dibujar el fondo claro
        drawNet();        // Dibujar la red
        drawPaddles();    // Dibujar las palas naranjas
        drawBall();       // Dibujar la pelota

        x += dx;
        y += dy;

        collisionDetection();
        movePaddles();

        requestAnimationFrame(draw);
    }
    function resizeCanvas() {
        const card = document.querySelector('.title-card');
        canvas.width = card.clientWidth;
        canvas.height = card.clientHeight;
    }

    draw(); // Iniciar el juego
});
