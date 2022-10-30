import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";
import { mx } from "../../scripts/util.js";

const color = settings.color;
var glob_geometry = {};

const _radius = 7;
const battlements_height = 0.2;
const tower_diff = 1.5 * battlements_height;

const getPoints = (number = 6, radius = _radius) => {
  let points = [];
  let p = [0, 0, radius];
  const angle = (2 * Math.PI) / number;
  mx.transform(p, mx.rotation(angle / 2, [0, 1, 0]));

  for (let i = 0; i < number; i++) {
    points.push([...p]);
    mx.transform(p, mx.rotation(angle, [0, 1, 0]));
  }
  return points;
};

const getTowerSurface = (height) => {
  const bh = battlements_height;

  const y0 = height + tower_diff;
  const y1 = height - tower_diff;

  const x1 = 0.8;
  const x2 = 0.6;
  const x3 = 0.9;

  const p = [
    [0, y0, 0],
    [x1 - bh / 2, y0, 0],
    [x1 - bh / 2, y0 + bh, 0],
    [x1, y0 + bh, 0],
    [x1, y0 - bh, 0],
    [x2, y1, 0],
    [x3, 0, 0],
  ];

  const points = [
    p[0],
    p[1],

    p[0],
    p[1],
    p[2],

    p[1],
    p[2],
    p[3],

    p[2],
    p[3],
    p[4],

    p[3],
    p[4],
    [p[4][0] - bh, p[4][1] - bh, 0],

    [p[5][0], p[5][1] + bh, 0],
    p[5],
    [p[5][0], p[5][1] - bh, 0],

    [p[6][0], tower_diff, 0],
    p[6],
  ];

  const shape = new Spline(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};
const getTowerGeometry = (wgl, height) => {
  const rev = new Revolution();
  const surface = getTowerSurface(height);
  const geometry = new SweepSolid(surface, rev).setupBuffers(
    wgl,
    20,
    parseInt(20 * height),
    false,
    [6, 8]
  );
  return geometry;
};
const getTower = (wgl, point, height) => {
  const geometry = glob_geometry.tower;
  return new Mesh(
    ["Tower", geometry, color.wall],
    [Transform.translate(point)]
  );
};
const getTowers = (wgl, points, height) =>
  new Mesh(
    ["Towers"],
    null,
    points.map((p) => getTower(wgl, p, height))
  );

const getWallSurface = (height) => {
  const bh = battlements_height;

  const y1 = height - 2 * bh;
  const y2 = height - bh;
  const y3 = height;

  const r1 = 0.6;
  const r2 = 0.4;

  const p = [
    [-r1, 0, 0],
    [-r2, y1, 0],
    [-r2, y3, 0],
    [-r2 + bh / 2, y3, 0],
    [-r2 + bh / 2, y2, 0],

    [r2 - bh / 2, y2, 0],
    [r2 - bh / 2, y3, 0],
    [r2, y3, 0],
    [r2, y1, 0],
    [r1, 0, 0],
  ];

  const p23 = [-r2 + bh / 4, y3, 0];
  const p67 = [r2 - bh / 4, y3, 0];

  const points = [
    p[0],
    [p[0][0], tower_diff, 0],

    [p[1][0], p[1][1] - tower_diff, 0],
    p[1],
    p[2],

    ...[p[2], p23, p[3]],

    ...[p[3], p[4], p[5]],
    ...[p[4], p[5], p[6]],

    ...[p[6], p67, p[7]],

    p[7],
    p[8],
    [p[8][0], p[8][1] - tower_diff, 0],

    [p[9][0], 2 * tower_diff, 0],
    p[9],
  ];

  const shape = new Spline(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};
const getWallGeometry = (wgl, points, height) => {
  const pi = [1, 0, points[0][2]];
  const pf = [-1, 0, points[0][2]];
  const _points = [pi, ...points, pf];
  const path = Spline.rect(_points, {
    normal: [0, 1, 0],
  });

  const surface = glob_geometry.wallSurface;

  const geometry = new SweepSolid(surface, path).setupBuffers(
    wgl,
    3 * path.segNum,
    parseInt(30 * height),
    true,
    [100, 10]
  );

  return geometry;
};
const getWall = (wgl, points, height) => {
  const geometry = glob_geometry.walls;

  return new Mesh(["Wall", geometry, color.wall]);
};
const getGate = (wgl, points, height, angle = 15) => {
  const gate_frame_geometry = glob_geometry.gate_frame;
  const gate_geometry = glob_geometry.gate_door;
  const point = points[0][2];

  const depth = 1;

  const thickness = 0.1;
  const frame = new Mesh(["GateFrame"], null, [
    new Mesh(
      ["top", gate_frame_geometry, color.wall],
      [
        Transform.scale([2, thickness, depth]),
        Transform.translate([0, height - thickness / 2, point]),
      ]
    ),
    new Mesh(
      ["left side", gate_frame_geometry, color.wall],
      [
        Transform.translate([0, 0.5, 0]),
        Transform.scale([thickness, height - thickness, depth]),
        Transform.translate([-1 + thickness / 2, 0, point]),
      ]
    ),
    new Mesh(
      ["right side", gate_frame_geometry, color.wall],
      [
        Transform.translate([0, 0.5, 0]),
        Transform.scale([thickness, height - thickness, depth]),
        Transform.translate([1 - thickness / 2, 0, point]),
      ]
    ),
  ]);

  const door_thickness = 0.06;
  const door_rotation = (2 * Math.PI * angle) / 360;
  const door = new Mesh(
    ["Draw Bridge", gate_geometry, color.wood],
    [
      Transform.translate([0, 0.5, 0]),
      Transform.scale([2 - 2 * thickness, height - 0.1, door_thickness]),
      Transform.rotate([door_rotation, [1, 0, 0]]),
      Transform.translate([0, 0, point + depth / 2 - door_thickness]),
    ]
  );

  const gate = new Mesh(["Gate"], null, [frame, door]);
  return gate;
};

const initiate = (wgl, number, height, angle) => {
  const h_dif = Math.abs(height - glob_geometry.height ?? 0);
  const a_dif = Math.abs(angle - glob_geometry.angle ?? 0);
  // Im using a_dif to check if the angle changed
  // If its the only one to change geometry wont be updated
  // But the meshes will
  // If performance is an issue, this can be changed
  // To only update the draw_bridge's matrix
  if (
    glob_geometry.initiated &&
    number == glob_geometry.points.length &&
    h_dif < 0.01 &&
    a_dif < 0.01
  ) {
    if (a_dif >= 0.01) {
      glob_geometry.angle = angle;
      return true;
    }
    return false;
  }

  glob_geometry.points = getPoints(number, _radius);
  glob_geometry.angle = angle;

  if (!glob_geometry.initiated || h_dif >= 0.01) {
    glob_geometry.height = height;

    glob_geometry.tower = getTowerGeometry(wgl, height);

    glob_geometry.wallSurface = getWallSurface(height);
  }
  glob_geometry.walls = getWallGeometry(wgl, glob_geometry.points, height);

  glob_geometry.cube = new Cube().setupBuffers(wgl);
  glob_geometry.gate_frame = new Cube().setupBuffers(wgl, [0.5, 0.5], [2, 2]);
  glob_geometry.gate_door = new Cube().setupBuffers(wgl, [5, 30]);
  glob_geometry.initiated = true;

  return true;
};

let cache = undefined;
const Walls = (wgl, number = 6, height = 1.5, angle = 0) => {
  if (!initiate(wgl, number, height, angle)) return cache;

  const towers = getTowers(wgl, glob_geometry.points, height);
  const wall = getWall(wgl, glob_geometry.points, height);
  const gate = getGate(wgl, glob_geometry.points, height, angle);

  const walls = new Mesh(["Walls"], null, [towers, wall, gate]);
  cache = walls;

  return walls;
};

export default Walls;