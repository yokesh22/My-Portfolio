import {
  CAMERA_FOLLOW_RATIO,
  CAMERA_FOLLOW_RATIO_MOBILE,
  FRAME_TIME_THRESHOLD_MS,
  GRAVITY,
  GROUND_OFFSET,
  JUMP_VELOCITY,
  PARTICLE_LIFE_DESKTOP,
  PARTICLE_LIFE_MOBILE,
  PARTICLE_MAX_DESKTOP,
  PARTICLE_MAX_MOBILE,
  PARTICLES_PER_FRAME_DESKTOP,
  PARTICLES_PER_FRAME_MOBILE,
  PIPE_BLOCK_MARGIN,
  PIPE_BODY,
  PIPE_HEIGHT_SCALE_MOBILE,
  PIPE_LIP_HEIGHT,
  PIPE_WIDTH,
  PIPE_WIDTH_MOBILE,
  PLAYER_SPEED,
  PLAYER_SPEED_MOBILE,
  PLAYER_WIDTH,
  STAR_COUNT_DESKTOP,
  STAR_COUNT_MOBILE,
  WORLD_WIDTH,
} from "./constants";
import type { FrameEvents, GameState, Keys, WorldData } from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function createInitialState(): GameState {
  return {
    camX: 0,
    px: 40,
    py: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    collected: new Set<string>(),
    cpX: 40,
    cpCam: 0,
    dead: false,
    ended: false,
    frame: 0,
    lastZone: "",
    particles: [],
    moving: false,
  };
}

function findZone(world: WorldData, worldX: number) {
  return world.zones.find((z) => worldX >= z.start && worldX < z.end) ?? null;
}

function findPothole(world: WorldData, worldX: number) {
  return (
    world.potholes.find(
      (p) => worldX + PLAYER_WIDTH > p.x && worldX < p.x + p.width,
    ) ?? null
  );
}

function respawn(state: GameState) {
  state.px = state.cpX;
  state.camX = state.cpCam;
  state.py = 0;
  state.vy = 0;
  state.onGround = true;
  state.dead = true;
  state.particles = [];
}

export function update(
  state: GameState,
  world: WorldData,
  keys: Keys,
  canvas: { width: number; height: number },
  isMobile = false,
  frameTime = 0,
): FrameEvents {
  const events: FrameEvents = {};
  state.frame += 1;
  state.dead = false;

  if (state.ended) {
    return events;
  }

  const playerSpeed = isMobile ? PLAYER_SPEED_MOBILE : PLAYER_SPEED;
  const pipeWidth = isMobile ? PIPE_WIDTH_MOBILE : PIPE_WIDTH;
  const heightScale = isMobile ? PIPE_HEIGHT_SCALE_MOBILE : 1;
  const cameraFollowRatio = isMobile ? CAMERA_FOLLOW_RATIO_MOBILE : CAMERA_FOLLOW_RATIO;

  // --- Horizontal movement ---
  let moveDelta = 0;
  if (keys.left) {
    moveDelta -= playerSpeed;
    state.facing = -1;
  }
  if (keys.right) {
    moveDelta += playerSpeed;
    state.facing = 1;
  }
  state.moving = moveDelta !== 0;

  const worldX = state.camX + state.px;
  let newWorldX = clamp(worldX + moveDelta, 0, WORLD_WIDTH - PLAYER_WIDTH);

  if (moveDelta !== 0) {
    for (const pipe of world.pipes) {
      // Solid wall only blocks if the player's body would intersect it
      // (i.e. the player is below the pipe's top surface).
      const pipeHeight = pipe.height * heightScale;
      if (state.py >= pipeHeight) continue;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipeWidth;

      if (
        moveDelta > 0 &&
        worldX + PLAYER_WIDTH <= pipeLeft &&
        newWorldX + PLAYER_WIDTH > pipeLeft
      ) {
        newWorldX = pipeLeft - PLAYER_WIDTH - PIPE_BLOCK_MARGIN;
      }
      if (
        moveDelta < 0 &&
        worldX >= pipeRight &&
        newWorldX < pipeRight
      ) {
        newWorldX = pipeRight + PIPE_BLOCK_MARGIN;
      }
    }
  }

  // --- Camera follow ---
  let camCandidate = state.camX;
  const screenX = newWorldX - state.camX;
  if (screenX > canvas.width * cameraFollowRatio) {
    camCandidate = newWorldX - canvas.width * cameraFollowRatio;
  }
  state.camX = clamp(camCandidate, 0, WORLD_WIDTH - canvas.width);
  state.px = clamp(newWorldX - state.camX, 0, canvas.width - PLAYER_WIDTH);

  // --- Vertical movement ---
  if (keys.jump && state.onGround) {
    state.vy = JUMP_VELOCITY;
    state.onGround = false;
  }
  state.vy += GRAVITY;
  state.py -= state.vy;
  state.onGround = false;

  const playerWorldX = state.camX + state.px;
  const playerCenterX = playerWorldX + PLAYER_WIDTH / 2;

  if (state.vy >= 0) {
    // Pipe tops
    for (const pipe of world.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipeWidth;
      const pipeHeight = pipe.height * heightScale;
      if (playerCenterX < pipeLeft || playerCenterX > pipeRight) continue;
      if (state.py <= pipeHeight && state.py + state.vy >= pipeHeight - 6) {
        state.py = pipeHeight;
        state.vy = 0;
        state.onGround = true;
      }
    }

    // Bridge platforms
    for (const pothole of world.potholes) {
      for (const platform of pothole.bridge) {
        const left = platform.x;
        const right = platform.x + platform.width;
        if (playerCenterX < left || playerCenterX > right) continue;
        if (state.py <= platform.y && state.py + state.vy >= platform.y - 6) {
          state.py = platform.y;
          state.vy = 0;
          state.onGround = true;
        }
      }
    }

    // Ground
    if (!state.onGround && state.py <= 0) {
      const pothole = findPothole(world, playerWorldX);
      if (pothole) {
        respawn(state);
        events.respawned = true;
        return events;
      }
      state.py = 0;
      state.vy = 0;
      state.onGround = true;
    }
  }

  // --- Zone transitions ---
  const zone = findZone(world, playerCenterX);
  if (zone && zone.name !== state.lastZone) {
    state.lastZone = zone.name;
    events.zoneChanged = zone;
  }

  // --- Checkpoints / collectibles ---
  for (const pipe of world.pipes) {
    if (state.collected.has(pipe.id)) continue;
    if (playerCenterX >= pipe.x + pipeWidth / 2) {
      state.collected.add(pipe.id);
      state.cpX = state.px;
      state.cpCam = state.camX;
      events.collected = pipe;
      events.checkpointHit = true;
    }
  }

  // --- Nearby pipe for info panel ---
  let nearest = null;
  let nearestDist = 50;
  for (const pipe of world.pipes) {
    const dist = Math.abs(playerCenterX - (pipe.x + pipeWidth / 2));
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = pipe;
    }
  }
  events.nearbyPipe = nearest;

  // --- End ---
  if (playerWorldX >= world.endX) {
    state.ended = true;
    events.ended = true;
  }

  // --- Particles ---
  const lowPerf = frameTime > FRAME_TIME_THRESHOLD_MS;
  const particlesPerFrame = lowPerf
    ? 0
    : isMobile
      ? PARTICLES_PER_FRAME_MOBILE
      : PARTICLES_PER_FRAME_DESKTOP;
  const particleLife = isMobile ? PARTICLE_LIFE_MOBILE : PARTICLE_LIFE_DESKTOP;
  const particleMax = isMobile ? PARTICLE_MAX_MOBILE : PARTICLE_MAX_DESKTOP;

  if (moveDelta !== 0 && state.onGround) {
    for (let i = 0; i < particlesPerFrame; i++) {
      state.particles.push({
        x: playerWorldX + (state.facing > 0 ? 0 : PLAYER_WIDTH),
        y: state.py + 2,
        vx: -state.facing * 0.6 + (Math.random() - 0.5) * 0.4,
        vy: 0.4 + Math.random() * 0.6,
        life: particleLife,
        maxLife: particleLife,
        size: Math.random() < 0.5 ? 1 : 1.5,
      });
    }
  }
  for (const particle of state.particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy -= 0.02;
    particle.life -= 1;
  }
  state.particles = state.particles
    .filter((p) => p.life > 0)
    .slice(-particleMax);

  return events;
}

const makeStarField = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: (i * 97) % WORLD_WIDTH,
    y: 20 + ((i * 53) % 140),
    size: i % 2 === 0 ? 1 : 1.5,
    color: i % 2 === 0 ? "#1e293b" : "#334155",
  }));

const STAR_FIELD_DESKTOP = makeStarField(STAR_COUNT_DESKTOP);
const STAR_FIELD_MOBILE = makeStarField(STAR_COUNT_MOBILE);

// --- Hero palette (matches terminal-green / blueprint-slate theme) ---
const HERO = {
  skin: "#e8b08a",
  skinShade: "#cf9168",
  hair: "#13243a",
  hairHi: "#1d3550",
  hoodie: "#2a3a52",
  hoodieDk: "#1d2a3c",
  hoodieHi: "#38506c",
  accent: "#4ade80",
  accentDk: "#2f9e63",
  pants: "#3a4a60",
  pantsDk: "#2c3a4d",
  white: "#ffffff",
  pupil: "#0a0e17",
} as const;

/**
 * Draws a detailed pixel-art "developer hero": hoodie with terminal-green
 * accents, a headphone, and a full idle / walk / jump animation set.
 * Rendered around a small physics hitbox (PLAYER_WIDTH) but visually larger.
 */
function drawHero(
  ctx: CanvasRenderingContext2D,
  cxRaw: number,
  feetYRaw: number,
  groundY: number,
  state: GameState,
) {
  const facing = state.facing;
  const airborne = !state.onGround;
  const moving = state.moving && !airborne;
  const f = state.frame;

  const cx = Math.round(cxRaw);
  const feetY = Math.round(feetYRaw);

  // Ground shadow — stays on the ground, shrinks as the hero rises.
  const heightAbove = Math.max(0, groundY - feetY);
  const shadowScale = Math.max(0.45, 1 - heightAbove / 130);
  ctx.fillStyle = `rgba(0,0,0,${0.28 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(cx, groundY - 1, 8.5 * shadowScale, 2.6 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walk swing + idle breathing.
  const sw = moving ? Math.sin(f * 0.33) : 0;
  const swing = Math.round(sw * 2);
  const ub = moving || airborne ? 0 : Math.round(Math.sin(f * 0.1)); // upper-body bob

  ctx.save();
  ctx.translate(cx, feetY);
  if (facing < 0) ctx.scale(-1, 1);

  const r = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };

  // --- Legs ---
  if (airborne) {
    // Tucked: front knee up, back leg trailing.
    r(-3, -13, 3, 6, HERO.pantsDk);
    r(-4, -7, 4, 3, HERO.accentDk);
    r(1, -13, 3, 5, HERO.pants);
    r(1, -8, 4, 3, HERO.accent);
  } else {
    const backLegX = -3 - swing;
    const frontLegX = swing;
    r(backLegX, -13, 3, 10, HERO.pantsDk);
    r(backLegX - 1, -3, 4, 3, HERO.accentDk);
    r(frontLegX, -13, 3, 10, HERO.pants);
    r(frontLegX - 1, -3, 4, 3, HERO.accent);
  }

  // --- Back arm (behind torso) ---
  if (airborne) {
    r(-6, -30, 3, 7, HERO.hoodieDk);
    r(-6, -31, 3, 2, HERO.skinShade);
  } else {
    const ax = -6 + swing;
    r(ax, -26 + ub, 3, 9, HERO.hoodieDk);
    r(ax, -18 + ub, 3, 1, HERO.accentDk);
    r(ax, -17 + ub, 3, 2, HERO.skinShade);
  }

  // --- Torso (hoodie) ---
  r(-6, -27 + ub, 12, 14, HERO.hoodie);
  r(-6, -27 + ub, 2, 14, HERO.hoodieHi); // left highlight
  r(4, -27 + ub, 2, 14, HERO.hoodieDk); // right shadow
  r(-4, -18 + ub, 8, 1, HERO.hoodieDk); // pocket seam
  r(-6, -14 + ub, 12, 1, HERO.accentDk); // hem
  r(0, -26 + ub, 1, 12, HERO.accent); // zip
  // Hood-down collar + green lining
  r(-5, -30 + ub, 10, 4, HERO.hoodieDk);
  r(-3, -29 + ub, 6, 1, HERO.accentDk);
  // Drawstrings
  r(-1, -29 + ub, 1, 4, HERO.accent);
  r(2, -29 + ub, 1, 4, HERO.accent);

  // --- Head ---
  r(-4, -36 + ub, 8, 9, HERO.skin);
  r(-4, -34 + ub, 2, 7, HERO.skinShade); // back-of-jaw shade
  r(-4, -32 + ub, 1, 2, HERO.skinShade); // ear
  // Hair
  r(-4, -37 + ub, 8, 3, HERO.hair); // cap
  r(-4, -37 + ub, 2, 8, HERO.hair); // back
  r(-4, -37 + ub, 1, 4, HERO.hairHi); // strand highlight
  r(2, -35 + ub, 2, 2, HERO.hair); // front fringe
  // Face
  r(1, -34 + ub, 2, 1, HERO.hair); // eyebrow
  r(1, -33 + ub, 2, 2, HERO.white); // eye white
  r(2, -33 + ub, 1, 2, HERO.pupil); // pupil
  r(1, -30 + ub, 2, 1, HERO.skinShade); // mouth
  // Headphone (developer nod, themed green)
  r(-4, -38 + ub, 8, 1, HERO.hoodieDk); // band
  r(3, -33 + ub, 2, 3, HERO.accentDk); // ear cup
  r(3, -33 + ub, 2, 1, HERO.accent); // cup highlight

  // --- Front arm (over torso) ---
  if (airborne) {
    r(4, -30, 3, 7, HERO.hoodie);
    r(4, -31, 3, 2, HERO.skin);
  } else {
    const ax = 3 - swing;
    r(ax, -26 + ub, 3, 9, HERO.hoodie);
    r(ax, -18 + ub, 3, 1, HERO.accent);
    r(ax, -17 + ub, 3, 2, HERO.skin);
  }

  ctx.restore();
}

export function draw(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  world: WorldData,
  canvas: { width: number; height: number },
  isMobile = false,
) {
  const { width, height } = canvas;
  const pipeWidth = isMobile ? PIPE_WIDTH_MOBILE : PIPE_WIDTH;
  const heightScale = isMobile ? PIPE_HEIGHT_SCALE_MOBILE : 1;
  const pipeBody = pipeWidth - (PIPE_WIDTH - PIPE_BODY);
  const starField = isMobile ? STAR_FIELD_MOBILE : STAR_FIELD_DESKTOP;
  const groundY = height - GROUND_OFFSET;
  const camX = state.camX;
  const toScreenY = (h: number) => groundY - h;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0a0e17";
  ctx.fillRect(0, 0, width, height);

  const pipeColors = new Map<string, string>();
  for (const zone of world.zones) {
    for (const pipe of zone.pipes) {
      pipeColors.set(pipe.id, zone.color);
    }
  }

  // 1. Stars (parallax)
  for (const star of starField) {
    const sx = star.x - camX * 0.2;
    if (sx < -10 || sx > width + 10) continue;
    ctx.fillStyle = star.color;
    ctx.fillRect(sx, star.y, star.size, star.size);
  }

  // 2. Zone boundary markers
  for (const zone of world.zones) {
    const sx = zone.start - camX;
    if (sx >= -5 && sx <= width + 5) {
      ctx.strokeStyle = `${zone.color}26`;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, groundY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const centerX = (zone.start + zone.end) / 2 - camX;
    if (centerX > -150 && centerX < width + 150) {
      ctx.fillStyle = `${zone.color}1a`;
      ctx.font = `20px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(zone.name, centerX, groundY + 35);
    }
  }
  ctx.textAlign = "left";

  // 3. Bridge platforms
  for (const pothole of world.potholes) {
    for (const platform of pothole.bridge) {
      const sx = platform.x - camX;
      if (sx + platform.width < 0 || sx > width) continue;
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 0.5;
      const y = toScreenY(platform.y);
      ctx.fillRect(sx, y, platform.width, 6);
      ctx.strokeRect(sx, y, platform.width, 6);
    }
  }

  // 4. Pipes
  for (const pipe of world.pipes) {
    const sx = pipe.x - camX;
    if (sx + pipeWidth < 0 || sx > width) continue;

    const pipeHeight = pipe.height * heightScale;
    const bodyHeight = Math.max(pipeHeight - PIPE_LIP_HEIGHT, 0);
    const bodyX = sx + (pipeWidth - pipeBody) / 2;
    const bodyY = toScreenY(bodyHeight);
    const lipY = toScreenY(pipeHeight);
    const color = pipeColors.get(pipe.id) ?? "#4ade80";

    // Body
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = `${color}80`;
    ctx.lineWidth = 0.5;
    ctx.fillRect(bodyX, bodyY, pipeBody, groundY - bodyY);
    ctx.strokeRect(bodyX, bodyY, pipeBody, groundY - bodyY);

    // Lip
    ctx.fillStyle = `${color}4d`;
    ctx.strokeStyle = `${color}80`;
    ctx.fillRect(sx, lipY, pipeWidth, PIPE_LIP_HEIGHT);
    ctx.strokeRect(sx, lipY, pipeWidth, PIPE_LIP_HEIGHT);

    // Inner highlight / shadow
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(bodyX, bodyY, 4, groundY - bodyY);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(bodyX + pipeBody - 4, bodyY, 4, groundY - bodyY);

    // Label (hidden on mobile — info panel shows the name when nearby)
    if (!isMobile) {
      ctx.fillStyle = color;
      ctx.font = `9px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(pipe.label, sx + pipeWidth / 2, lipY - 16);
    }

    // Star / checkmark
    if (state.collected.has(pipe.id)) {
      ctx.fillStyle = "#4ade80";
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("✓", sx + pipeWidth / 2, lipY - 4);
    } else {
      const bob = Math.sin(state.frame * 0.08 + pipe.x) * 3;
      ctx.fillStyle = "#fbbf24";
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("★", sx + pipeWidth / 2, lipY - 4 + bob);
    }
    ctx.textAlign = "left";
  }

  // 5. Ground + potholes
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  for (const pothole of world.potholes) {
    const sx = pothole.x - camX;
    if (sx + pothole.width < 0 || sx > width) continue;
    ctx.fillStyle = "rgba(248,113,113,0.08)";
    ctx.fillRect(sx, groundY, pothole.width, height - groundY);

    ctx.strokeStyle = "rgba(248,113,113,0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, groundY);
    ctx.lineTo(sx, height);
    ctx.moveTo(sx + pothole.width, groundY);
    ctx.lineTo(sx + pothole.width, height);
    ctx.stroke();
    ctx.setLineDash([]);

    if (Math.sin(state.frame * 0.1) > 0) {
      ctx.fillStyle = "#f87171";
      ctx.font = `10px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("! DANGER !", sx + pothole.width / 2, groundY + 20);
      ctx.textAlign = "left";
    }
  }

  // 6. Particles
  for (const particle of state.particles) {
    const sx = particle.x - camX;
    const sy = toScreenY(particle.y);
    ctx.fillStyle = `rgba(74,222,128,${(particle.life / particle.maxLife) * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Player (detailed pixel-art developer hero)
  if (!state.ended) {
    drawHero(ctx, state.px + PLAYER_WIDTH / 2, toScreenY(state.py), groundY, state);
  }

  // 8. End flag
  const flagSx = world.endX - camX;
  if (flagSx > -50 && flagSx < width + 50) {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(flagSx, groundY);
    ctx.lineTo(flagSx, groundY - 50);
    ctx.stroke();

    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.moveTo(flagSx, groundY - 50);
    ctx.lineTo(flagSx + 24, groundY - 42);
    ctx.lineTo(flagSx, groundY - 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = `10px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("END", flagSx, groundY - 58);
    ctx.textAlign = "left";
  }
}
