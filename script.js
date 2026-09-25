/**
 * 📌 HONEST MODE TOGGLE
 * - Shows/hides the hidden box when the button is clicked.
 */
function toggleSincere() {
  const box = document.getElementById("sincereBox");
  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}

/**
 * 📌 PING-PONG GAME BEHIND THE TITLE
 * - Canvas with orange paddles and a ball in the primary colour.
 * - Slow speed and light style so it doesn't distract.
 */
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");

  // Primary colour from the CSS for the ball
  const root = document.documentElement;
  const primaryColor = getComputedStyle(root).getPropertyValue("--primary").trim();

  // Game settings
  const paddleHeight = 15;
  const paddleWidth = 10;
  const ballRadius = 5;
  let x = 20;
  let y = 50;
  let dx = 1.2; // horizontal speed
  let dy = -1.2; // vertical speed
  let leftPaddleY = 0;
  let rightPaddleY = 0;

  // Match the canvas to the card size so nothing looks stretched
  function resizeCanvas() {
    const card = document.querySelector(".title-card");
    canvas.width = card.clientWidth;
    canvas.height = card.clientHeight;
    y = Math.min(Math.max(y, ballRadius), canvas.height - ballRadius);
    leftPaddleY = Math.min(leftPaddleY, canvas.height - paddleHeight);
    rightPaddleY = Math.min(rightPaddleY, canvas.height - paddleHeight);
  }

  function drawBackground() {
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Orange paddles
  function drawPaddles() {
    ctx.fillStyle = "#ff8c00";
    ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 10 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
  }

  // Ball in the primary colour
  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
  }

  // Net (light grey dashed line)
  function drawNet() {
    ctx.strokeStyle = "#cccccc";
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function collisionDetection() {
    if (x - ballRadius < 20 && y > leftPaddleY && y < leftPaddleY + paddleHeight) dx = -dx;
    if (x + ballRadius > canvas.width - 20 && y > rightPaddleY && y < rightPaddleY + paddleHeight) dx = -dx;
    if (y - ballRadius < 0 || y + ballRadius > canvas.height) dy = -dy;
    if (x - ballRadius < 0 || x + ballRadius > canvas.width) {
      x = 20;
      y = canvas.height / 2;
    }
  }

  // Paddles follow the ball automatically
  function movePaddles() {
    const leftPaddleCenter = leftPaddleY + paddleHeight / 2;
    const rightPaddleCenter = rightPaddleY + paddleHeight / 2;

    if (leftPaddleCenter < y - 5) leftPaddleY += 0.8;
    else if (leftPaddleCenter > y + 5) leftPaddleY -= 0.8;

    if (rightPaddleCenter < y - 5) rightPaddleY += 0.8;
    else if (rightPaddleCenter > y + 5) rightPaddleY -= 0.8;
  }

  function draw() {
    drawBackground();
    drawNet();
    drawPaddles();
    drawBall();

    x += dx;
    y += dy;

    collisionDetection();
    movePaddles();

    requestAnimationFrame(draw);
  }

  resizeCanvas();
  y = canvas.height / 2;
  leftPaddleY = rightPaddleY = canvas.height / 2 - paddleHeight / 2;
  window.addEventListener("resize", resizeCanvas);
  draw();
});

/**
 * 📌 TABS: CV / PROJECTS
 * - Switches views and remembers them in the URL (#projects).
 */
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab");
  const deck = document.getElementById("deck");
  let dealt = false;

  function showView(name) {
    tabs.forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on);
    });
    document.querySelectorAll(".view").forEach((v) => {
      v.hidden = v.id !== "view-" + name;
    });
    if (name === "projects" && !dealt) {
      dealt = true;
      deck.classList.add("dealing");
      setTimeout(() => deck.classList.remove("dealing"), 1200);
    }
  }

  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      showView(t.dataset.view);
      history.replaceState(null, "", t.dataset.view === "cv" ? "#" : "#projects");
    }),
  );
  if (location.hash === "#projects") showView("projects");

  /**
   * 📌 CARD DECK: click a card to flip it open
   */
  const modal = document.getElementById("projectModal");
  const body = document.getElementById("modalBody");
  let lastCard = null;
  let stopHeat = null;

  function openProject(card) {
    lastCard = card;
    const tpl = document.getElementById("tpl-" + card.dataset.project);
    body.replaceChildren(tpl.content.cloneNode(true));
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const heat = body.querySelector(".modal-heat");
    if (heat) stopHeat = heatMap(heat, 7);
    modal.querySelector(".modal-close").focus();
  }

  function closeProject() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (stopHeat) stopHeat();
    stopHeat = null;
    if (lastCard) lastCard.focus();
  }

  document.querySelectorAll(".pcard").forEach((c) =>
    c.addEventListener("click", () => openProject(c)),
  );
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeProject();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeProject();
  });

  // Mini heat map on the card itself
  document.querySelectorAll(".pcard-heat").forEach((c) => heatMap(c, 4));
});

/**
 * 📌 PLACEHOLDER HEAT MAP (sample data)
 * - Draws a street grid with moving "hot spots". Replace with the real map later.
 * - Returns a function that stops the animation.
 */
function heatMap(canvas, spots) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blobs = Array.from({ length: spots }, (_, k) => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: (0.18 + Math.random() * 0.2) * Math.min(W, H),
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    phase: k,
  }));
  let raf = null;
  let t = 0;

  function frame() {
    t += 0.02;
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, W, H);

    // street grid
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 1;
    const step = Math.max(14, W / 16);
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // hot spots
    ctx.globalCompositeOperation = "multiply";
    blobs.forEach((b) => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0 || b.x > W) b.vx *= -1;
      if (b.y < 0 || b.y > H) b.vy *= -1;
      const r = b.r * (0.85 + 0.15 * Math.sin(t + b.phase));
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, "rgba(255, 78, 46, 0.95)");
      g.addColorStop(0.45, "rgba(255, 140, 0, 0.55)");
      g.addColorStop(1, "rgba(255, 220, 120, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";

    if (!reduce) raf = requestAnimationFrame(frame);
  }
  frame();
  return () => cancelAnimationFrame(raf);
}
