// Tilted-camera projection for the battle board. The board is a unit square on the sea plane:
// u runs across columns (0 = left edge, 1 = right edge), v runs down rows (0 = far edge, row A;
// 1 = near edge), h is height above the water in board units (1 = board width). The camera
// looks down at the board centre from behind the near edge, so near rows draw larger.
export type Camera = {
  width: number; height: number;
  project: (u: number, v: number, h?: number) => {x: number; y: number; z: number};
  unproject: (x: number, y: number) => {u: number; v: number};
  /** Screen y of the horizon (sea meets sky); the sea is drawn below it. */
  horizon: number;
};
export type CameraOptions = {width: number; height: number; pitchDeg: number; distance: number;
  margin: {top: number; right: number; bottom: number; left: number}; centerU?: number; centerV?: number};

export function createCamera(o: CameraOptions): Camera {
  const th = o.pitchDeg * Math.PI / 180, cu = o.centerU ?? .5, cv = o.centerV ?? .5;
  const fy = -Math.sin(th), fz = -Math.cos(th), uy = Math.cos(th), uz = -Math.sin(th);
  const cy = o.distance * Math.sin(th), cz = o.distance * Math.cos(th);
  // Raw perspective with unit focal length; fitted into the margins below.
  const raw = (u: number, v: number, h = 0) => {
    const dx = u - cu, dy = h - cy, dz = v - cv - cz;
    const zc = dy * fy + dz * fz, yc = dy * uy + dz * uz;
    return {x: dx / zc, y: -yc / zc, z: zc};
  };
  const corners = [raw(0, 0), raw(1, 0), raw(0, 1), raw(1, 1)];
  const minX = Math.min(...corners.map(c => c.x)), maxX = Math.max(...corners.map(c => c.x));
  const minY = Math.min(...corners.map(c => c.y)), maxY = Math.max(...corners.map(c => c.y));
  const m = o.margin, k = Math.min((o.width - m.left - m.right) / (maxX - minX), (o.height - m.top - m.bottom) / (maxY - minY));
  const ox = m.left + (o.width - m.left - m.right - (maxX - minX) * k) / 2 - minX * k;
  const oy = o.height - m.bottom - maxY * k;
  const project = (u: number, v: number, h = 0) => {const p = raw(u, v, h); return {x: ox + p.x * k, y: oy + p.y * k, z: p.z};};
  const unproject = (x: number, y: number) => {
    // Ray from the camera through the screen point, intersected with the sea plane (h = 0).
    const px = (x - ox) / k, py = -(y - oy) / k;
    const dx = px, dy = py * uy + fy, dz = py * uz + fz;
    const t = -cy / dy;
    return {u: cu + t * dx, v: cv + cz + t * dz};
  };
  // Horizon: where rays become parallel to the sea (dy = 0).
  const horizon = oy - (-fy / uy) * k;
  return {width: o.width, height: o.height, project, unproject, horizon};
}

export const BOARD_CANVAS = {width: 1000, height: 820};
/** The battle board camera; both the renderer and pointer/overlay maths use this one. */
export function boardCamera(): Camera {
  return createCamera({...BOARD_CANVAS, pitchDeg: 54, distance: 2.15, margin: {top: 120, right: 46, bottom: 58, left: 64}});
}
/** Row/col under a canvas point, or null outside the board. */
export function cellAt(cam: Camera, x: number, y: number, size: number): {row: number; col: number} | null {
  const {u, v} = cam.unproject(x, y);
  if (!(u >= 0 && u < 1 && v >= 0 && v < 1)) return null;
  return {row: Math.floor(v * size), col: Math.floor(u * size)};
}
/** Centre of a cell as a percentage of the canvas, for HTML overlays placed over the board. */
export function cellPercent(cam: Camera, row: number, col: number, size: number) {
  const p = cam.project((col + .5) / size, (row + .5) / size);
  return {x: p.x / cam.width * 100, y: p.y / cam.height * 100};
}
