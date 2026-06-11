import {
  CAMERA_FOLLOW_RATIO,
  GRAVITY,
  GROUND_OFFSET,
  JUMP_VELOCITY,
  PIPE_BLOCK_MARGIN,
  PIPE_BODY,
  PIPE_LIP_HEIGHT,
  PIPE_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_WIDTH,
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
): FrameEvents {
  const events: FrameEvents = {};
  state.frame += 1;
  state.dead = false;

  if (state.ended) {
    return events;
  }

  // --- Horizontal movement ---
  let moveDelta = 0;
  if (keys.left) {
    moveDelta -= PLAYER_SPEED;
    state.facing = -1;
  }
  if (keys.right) {
    moveDelta += PLAYER_SPEED;
    state.facing = 1;
  }

  const worldX = state.camX + state.px;
  let newWorldX = clamp(worldX + moveDelta, 0, WORLD_WIDTH - PLAYER_WIDTH);

  if (moveDelta !== 0) {
    for (const pipe of world.pipes) {
      // Solid wall only blocks if the player's body would intersect it
      // (i.e. the player is below the pipe's top surface).
      if (state.py >= pipe.height) continue;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

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
  if (screenX > canvas.width * CAMERA_FOLLOW_RATIO) {
    camCandidate = newWorldX - canvas.width * CAMERA_FOLLOW_RATIO;
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
      const pipeRight = pipe.x + PIPE_WIDTH;
      if (playerCenterX < pipeLeft || playerCenterX > pipeRight) continue;
      if (state.py <= pipe.height && state.py + state.vy >= pipe.height - 6) {
        state.py = pipe.height;
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
    if (playerCenterX >= pipe.x + PIPE_WIDTH / 2) {
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
    const dist = Math.abs(playerCenterX - (pipe.x + PIPE_WIDTH / 2));
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
  if (moveDelta !== 0 && state.onGround) {
    for (let i = 0; i < 2; i++) {
      state.particles.push({
        x: playerWorldX + (state.facing > 0 ? 0 : PLAYER_WIDTH),
        y: state.py + 2,
        vx: -state.facing * 0.6 + (Math.random() - 0.5) * 0.4,
        vy: 0.4 + Math.random() * 0.6,
        life: 30,
        maxLife: 30,
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
    .slice(-100);

  return events;
}

const STAR_FIELD = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 97) % WORLD_WIDTH,
  y: 20 + ((i * 53) % 140),
  size: i % 2 === 0 ? 1 : 1.5,
  color: i % 2 === 0 ? "#1e293b" : "#334155",
}));

export function draw(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  world: WorldData,
  canvas: { width: number; height: number },
) {
  const { width, height } = canvas;
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
  for (const star of STAR_FIELD) {
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
    if (sx + PIPE_WIDTH < 0 || sx > width) continue;

    const bodyHeight = Math.max(pipe.height - PIPE_LIP_HEIGHT, 0);
    const bodyX = sx + (PIPE_WIDTH - PIPE_BODY) / 2;
    const bodyY = toScreenY(bodyHeight);
    const lipY = toScreenY(pipe.height);
    const color = pipeColors.get(pipe.id) ?? "#4ade80";

    // Body
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = `${color}80`;
    ctx.lineWidth = 0.5;
    ctx.fillRect(bodyX, bodyY, PIPE_BODY, groundY - bodyY);
    ctx.strokeRect(bodyX, bodyY, PIPE_BODY, groundY - bodyY);

    // Lip
    ctx.fillStyle = `${color}4d`;
    ctx.strokeStyle = `${color}80`;
    ctx.fillRect(sx, lipY, PIPE_WIDTH, PIPE_LIP_HEIGHT);
    ctx.strokeRect(sx, lipY, PIPE_WIDTH, PIPE_LIP_HEIGHT);

    // Inner highlight / shadow
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(bodyX, bodyY, 4, groundY - bodyY);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(bodyX + PIPE_BODY - 4, bodyY, 4, groundY - bodyY);

    // Label
    ctx.fillStyle = color;
    ctx.font = `9px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText(pipe.label, sx + PIPE_WIDTH / 2, lipY - 16);

    // Star / checkmark
    if (state.collected.has(pipe.id)) {
      ctx.fillStyle = "#4ade80";
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.fillText("✓", sx + PIPE_WIDTH / 2, lipY - 4);
    } else {
      const bob = Math.sin(state.frame * 0.08 + pipe.x) * 3;
      ctx.fillStyle = "#fbbf24";
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.fillText("★", sx + PIPE_WIDTH / 2, lipY - 4 + bob);
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

  // 7. Player (8-bit pixel art)
  if (!state.ended) {
    const px = state.px;
    const groundScreenY = groundY;
    const feetY = toScreenY(state.py);
    const airborne = !state.onGround;

    // Shadow
    if (airborne) {
      ctx.fillStyle = "rgba(74,222,128,0.15)";
      ctx.fillRect(px - 2, groundScreenY - 2, PLAYER_WIDTH + 4, 2);
    }

    const bodyY = feetY - PLAYER_HEIGHT;
    const headY = bodyY;
    const headH = 8;
    const torsoY = headY + headH;
    const torsoH = PLAYER_HEIGHT - headH - 5;
    const legY = torsoY + torsoH;
    const legH = 5;

    // Head
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(px + (PLAYER_WIDTH - 6) / 2, headY, 6, headH);
    // Head highlight
    ctx.fillStyle = "#86efac";
    ctx.fillRect(px + (PLAYER_WIDTH - 6) / 2 + 1, headY + 1, 2, 3);

    // Eyes
    ctx.fillStyle = "#ffffff";
    const eyeX = state.facing > 0 ? px + (PLAYER_WIDTH - 6) / 2 + 3 : px + (PLAYER_WIDTH - 6) / 2 + 1;
    ctx.fillRect(eyeX, headY + 2, 2, 2);

    // Torso
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(px + (PLAYER_WIDTH - 8) / 2, torsoY, 8, torsoH);

    // Legs
    if (airborne) {
      ctx.fillRect(px, legY, 3, legH);
      ctx.fillRect(px + PLAYER_WIDTH - 3, legY, 3, legH);
    } else {
      const walking = (state.frame % 10) < 5;
      if (walking) {
        ctx.fillRect(px, legY, 3, legH);
        ctx.fillRect(px + PLAYER_WIDTH - 3, legY, 3, legH - 2);
      } else {
        ctx.fillRect(px, legY, 3, legH - 2);
        ctx.fillRect(px + PLAYER_WIDTH - 3, legY, 3, legH);
      }
    }
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
