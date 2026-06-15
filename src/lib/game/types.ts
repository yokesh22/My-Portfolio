export type Pipe = {
  id: string;
  x: number;
  height: number;
  label: string;
  description: string;
  metrics: string;
  tags: string[];
};

export type Platform = {
  x: number;
  y: number;
  width: number;
};

export type Pothole = {
  x: number;
  width: number;
  bridge: Platform[];
};

export type Zone = {
  name: string;
  color: string;
  start: number;
  end: number;
  role: string;
  pipes: Pipe[];
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

export type WorldData = {
  zones: Zone[];
  potholes: Pothole[];
  pipes: Pipe[];
  endX: number;
};

export type GameState = {
  camX: number;
  px: number;
  py: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  collected: Set<string>;
  cpX: number;
  cpCam: number;
  dead: boolean;
  ended: boolean;
  frame: number;
  lastZone: string;
  particles: Particle[];
  moving: boolean;
};

export type FrameEvents = {
  zoneChanged?: Zone;
  collected?: Pipe;
  respawned?: boolean;
  checkpointHit?: boolean;
  ended?: boolean;
  nearbyPipe?: Pipe | null;
};

export type Keys = {
  left: boolean;
  right: boolean;
  jump: boolean;
};
