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
 * 📌 PING-PONG GAME BEHIND THE TITLE (real Pong rules)
 * - The ball bounces off the paddles; where it hits the paddle sets the new angle.
 * - Paddles chase the ball with a max speed and a small aiming error, so rallies
 *   speed up until someone misses. A faint score sits by the net.
 */
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");
  const card = document.querySelector(".title-card");
  const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PADDLE_W = 8, PADDLE_H = 34, MARGIN = 12, R = 5;
  const START_SPEED = 3.2, MAX_SPEED = 6, PADDLE_SPEED = 2.8;
  let W, H;
  const left = { y: 0, err: 0, flash: 0, score: 0 };
  const right = { y: 0, err: 0, flash: 0, score: 0 };
  const ball = { x: 0, y: 0, dx: 0, dy: 0, trail: [] };
  let pause = 0, last = performance.now();

  function resize() {
    W = canvas.width = card.clientWidth;
    H = canvas.height = card.clientHeight;
    left.y = right.y = H / 2 - PADDLE_H / 2;
  }

  function serve(dir) {
    ball.x = W / 2; ball.y = H / 2; ball.trail = [];
    const angle = (Math.random() * 0.8 - 0.4);           // up to ~23° up or down
    ball.dx = dir * START_SPEED * Math.cos(angle);
    ball.dy = START_SPEED * Math.sin(angle);
    left.err = right.err = 0;
    pause = 45;                                            // short breath before the serve
  }

  // where the paddle "wants" to be, with a small aiming error so it can miss
  function aim(p) { p.err = (Math.random() - 0.5) * PADDLE_H * 1.7; }

  function movePaddle(p, comingAtMe, dt) {
    const target = comingAtMe ? ball.y + p.err - PADDLE_H / 2 : H / 2 - PADDLE_H / 2;
    const diff = target - p.y;
    const step = Math.min(Math.abs(diff), PADDLE_SPEED * dt * (comingAtMe ? 1 : 0.5));
    p.y += Math.sign(diff) * step;
    p.y = Math.max(0, Math.min(H - PADDLE_H, p.y));
    if (p.flash > 0) p.flash -= dt;
  }

  // bounce off a paddle: the further from its centre, the steeper the angle
  function hit(p, dir) {
    const rel = (ball.y - (p.y + PADDLE_H / 2)) / (PADDLE_H / 2); // -1 … 1
    const speed = Math.min(Math.hypot(ball.dx, ball.dy) * 1.08, MAX_SPEED);
    const angle = rel * 1.0;                                      // up to ~57°
    ball.dx = dir * speed * Math.cos(angle);
    ball.dy = speed * Math.sin(angle);
    p.flash = 8;
  }

  function update(dt) {
    if (pause > 0) { pause -= dt; movePaddle(left, false, dt); movePaddle(right, false, dt); return; }

    const wasGoingRight = ball.dx > 0;
    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) ball.trail.shift();

    // top / bottom walls
    if (ball.y < R) { ball.y = R; ball.dy = Math.abs(ball.dy); }
    if (ball.y > H - R) { ball.y = H - R; ball.dy = -Math.abs(ball.dy); }

    // paddles
    const lx = MARGIN + PADDLE_W, rx = W - MARGIN - PADDLE_W;
    if (ball.dx < 0 && ball.x - R <= lx && ball.x - R > MARGIN - 4 &&
        ball.y > left.y - R && ball.y < left.y + PADDLE_H + R) {
      ball.x = lx + R; hit(left, 1);
    }
    if (ball.dx > 0 && ball.x + R >= rx && ball.x + R < W - MARGIN + 4 &&
        ball.y > right.y - R && ball.y < right.y + PADDLE_H + R) {
      ball.x = rx - R; hit(right, -1);
    }

    // new aiming error each time the ball changes direction
    if (ball.dx > 0 !== wasGoingRight) aim(ball.dx > 0 ? right : left);

    // point scored
    if (ball.x < -R * 2) { right.score++; serve(1); }
    if (ball.x > W + R * 2) { left.score++; serve(-1); }

    movePaddle(left, ball.dx < 0, dt);
    movePaddle(right, ball.dx > 0, dt);
  }

  function draw() {
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, W, H);

    // net
    ctx.strokeStyle = "#cccccc";
    ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // faint score by the net
    ctx.fillStyle = "#e2e2e2";
    ctx.font = "900 22px 'Segoe UI', sans-serif";
    ctx.textAlign = "right"; ctx.fillText(left.score, W / 2 - 14, 26);
    ctx.textAlign = "left"; ctx.fillText(right.score, W / 2 + 14, 26);

    // paddles (flash darker when they hit)
    [[left, MARGIN], [right, W - MARGIN - PADDLE_W]].forEach(([p, x]) => {
      ctx.fillStyle = p.flash > 0 ? "#e06800" : "#ff8c00";
      ctx.fillRect(x, p.y, PADDLE_W, PADDLE_H);
    });

    // ball + little motion trail
    ball.trail.forEach((t, i) => {
      ctx.globalAlpha = (i + 1) / ball.trail.length * 0.25;
      ctx.beginPath(); ctx.arc(t.x, t.y, R * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = primary; ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
    ctx.fillStyle = primary; ctx.fill();
  }

  function loop(now) {
    const dt = Math.min((now - last) / 16.67, 3);          // same speed on 60 Hz and 120 Hz screens
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  serve(Math.random() < 0.5 ? -1 : 1);
  window.addEventListener("resize", resize);
  if (reduce) { pause = 0; draw(); return; }                // static court for reduced motion
  requestAnimationFrame(loop);
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

/**
 * 📌 "SEE MY PROJECTS" (button and hat): jumps to the Projects tab
 */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-goto]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelector('.tab[data-view="' + b.dataset.goto + '"]').click();
      window.scrollTo({ top: document.querySelector(".tabs").offsetTop - 10, behavior: "smooth" });
    }),
  );
});


/**
 * 📌 MAGIC HAT: bunny peeks out, cards spill, two of them hit the button and a word
 */
document.addEventListener("DOMContentLoaded", function () {
  const teaser = document.querySelector(".projects-teaser");
  const magic = teaser.querySelector(".magic");
  const bunny = document.getElementById("bunny");
  const btn = document.getElementById("seeBtn");
  const word = document.getElementById("hitWord");
  const cardBtn = document.getElementById("throwBtn");
  const cardWord = document.getElementById("throwWord");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false, resetTimer = null, anims = [];

  function rel(el) {
    const a = el.getBoundingClientRect(), t = teaser.getBoundingClientRect();
    return { x: a.left - t.left, y: a.top - t.top, w: a.width, h: a.height };
  }

  // throw one card from the hat to a target, then bounce off and fall
  function throwCard(card, target, delay, spin, onHit) {
    const hat = rel(magic.querySelector(".hat-back"));
    const t = rel(target);
    const cw = 34, ch = 48;
    const sx = hat.x + hat.w / 2 - cw / 2, sy = hat.y - 10;
    const tx = t.x + t.w * 0.75 - cw / 2, ty = t.y + t.h / 2 - ch / 2;
    const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 90;
    const fly = card.animate([
      { transform: `translate(${sx}px, ${sy}px) rotate(0) scale(.6)`, opacity: 1 },
      { transform: `translate(${mx}px, ${my}px) rotate(${spin / 2}deg) scale(1)`, opacity: 1, easing: "ease-in" },
      { transform: `translate(${tx}px, ${ty}px) rotate(${spin}deg) scale(1)`, opacity: 1 },
    ], { duration: 750, delay, easing: "ease-out", fill: "both" });
    anims.push(fly);
    return fly.finished.then(() => {
      onHit();
      const fall = card.animate([
        { transform: `translate(${tx}px, ${ty}px) rotate(${spin}deg)`, opacity: 1 },
        { transform: `translate(${tx + 25}px, ${ty - 25}px) rotate(${spin + 60}deg)`, opacity: 1, easing: "ease-in" },
        { transform: `translate(${tx + 45}px, ${ty + 140}px) rotate(${spin + 200}deg)`, opacity: 0 },
      ], { duration: 900, fill: "forwards" });
      anims.push(fall);
    });
  }

  function play() {
    if (running) return;
    running = true;
    clearTimeout(resetTimer);
    magic.classList.add("trick");

    // bunny peeks out and ducks back in
    const hat = rel(magic.querySelector(".hat-back"));
    const bx = hat.x + hat.w / 2 - 32, by = hat.y + 2;
    bunny.style.opacity = 1;
    const peek = bunny.animate([
      { transform: `translate(${bx}px, ${by}px)` },
      { transform: `translate(${bx}px, ${by - 62}px) rotate(-5deg)`, offset: 0.25 },
      { transform: `translate(${bx}px, ${by - 56}px) rotate(4deg)`, offset: 0.4 },
      { transform: `translate(${bx}px, ${by - 60}px) rotate(0)`, offset: 0.7 },
      { transform: `translate(${bx}px, ${by}px)` },
    ], { duration: reduce ? 1 : 1600, delay: 100, easing: "ease-in-out", fill: "both" });
    anims.push(peek);
    peek.finished.then(() => { bunny.style.opacity = 0; }).catch(() => {});

    if (reduce) return;
    // two cards go rogue
    throwCard(cardBtn, btn, 350, -380, () => {
      btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit");
    }).catch(() => {});
    throwCard(cardWord, word, 600, 420, () => word.classList.add("knocked")).catch(() => {});
  }

  function reset() {
    anims.forEach((a) => a.cancel());
    anims = [];
    [bunny, cardBtn, cardWord].forEach((el) => { el.style.opacity = 0; });
    btn.classList.remove("hit");
    word.classList.remove("knocked");
    magic.classList.remove("trick");
    running = false;
  }

  magic.addEventListener("mouseenter", play);
  magic.addEventListener("focus", play);
  teaser.addEventListener("mouseleave", () => { resetTimer = setTimeout(reset, 1500); });
  teaser.addEventListener("mouseenter", () => clearTimeout(resetTimer));
});
