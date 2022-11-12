import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Cylinder,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";
import { mx } from "../../scripts/util.js";

const color = settings.color;
const lampLight = settings.lightColor.lamp;
var glob_geometry = {};
const texScale = 0.5;

const _radius = 7;
const battlements_height = 0.2;
const tower_diff = 1.5 * battlements_height;

const lerp_points = (points, idx1, idx2, t = 0.5) => {
  const p1 = points[idx1];
  const p2 = points[idx2];
  return p1.map((v, i) => v + (p2[i] - v) * t);
};

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
  const lp = (idx1, idx2) => lerp_points(p, idx1, idx2);

  const points = [
    ...[p[0], lp(0, 1)],
    ...[lp(0, 1), p[1], lp(1, 2)],
    ...[lp(1, 2), p[2], lp(2, 3)],
    ...[lp(2, 3), p[3], lp(3, 4)],
    ...[lp(3, 4), p[4], [p[4][0] - bh, p[4][1] - bh, 0]],
    ...[[p[5][0], p[5][1] + bh, 0], p[5], [p[5][0], p[5][1] - bh, 0]],
    ...[[p[6][0], tower_diff, 0], p[6]],
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
    [6 * texScale, parseInt(3 * height) * texScale]
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

  const y1 = height;
  const y2 = height - bh;

  const x0 = 0.7;
  const x1 = 0.5;
  const x2 = x1 - bh;

  const p = [
    [-x0, 0, 0], //0
    [-x1, y1, 0],
    [-x2, y1, 0],
    [-x2, y2, 0],
    [x2, y2, 0],
    [x2, y1, 0],
    [x1, y1, 0],
    [x0, 0, 0], //7
  ];
  const lp = (idx1, idx2) => lerp_points(p, idx1, idx2);

  const points = [
    ...[p[0], [-x0, height / 4, 0]],
    ...[[-x1, (height * 3) / 4, 0], p[1], lp(1, 2)],
    ...[lp(1, 2), p[2], lp(2, 3)],
    ...[lp(2, 3), p[3], lp(3, 4)],
    ...[lp(3, 4), p[4], lp(4, 5)],
    ...[lp(4, 5), p[5], lp(5, 6)],
    ...[lp(5, 6), p[6], [x1, (height * 3) / 4, 0]],
    ...[[x0, height / 4, 0], p[7]],
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
    [100 * texScale, parseInt(4 * height) * texScale]
  );

  return geometry;
};
const getWallMesh = (wgl, points, height) => {
  const pi = [1, 0, points[0][2]];
  const pf = [-1, 0, points[0][2]];
  const initialPath = Spline.rect([pi, points[0]], {
    normal: [0, 1, 0],
  });
  const finalPath = Spline.rect([points[points.length - 1], pf], {
    normal: [0, 1, 0],
  });
  const path = Spline.rect(points, {
    normal: [0, 1, 0],
  });

  const surface = glob_geometry.wallSurface;

  const initialGeometry = new SweepSolid(surface, initialPath).setupBuffers(
    wgl,
    3 * path.segNum,
    parseInt(30 * height),
    true,
    [50 * texScale, parseInt(4 * height) * texScale]
  );

  const geometry = new SweepSolid(surface, path).setupBuffers(
    wgl,
    3 * path.segNum,
    parseInt(30 * height),
    true,
    [150 * texScale, parseInt(4 * height) * texScale]
  );

  const finalGeometry = new SweepSolid(surface, finalPath).setupBuffers(
    wgl,
    3 * path.segNum,
    parseInt(30 * height),
    true,
    [50 * texScale, parseInt(4 * height) * texScale]
  );

  return new Mesh(["Wall"], null, [
    new Mesh(["Wall", initialGeometry, color.wall]),
    new Mesh(["Wall", geometry, color.wall]),
    new Mesh(["Wall", finalGeometry, color.wall]),
  ]);
};
const getWall = (wgl, points, height) => {
  return glob_geometry.wallsMesh;
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
      ["left", gate_frame_geometry, color.wall],
      [
        Transform.scale([height - thickness, thickness, depth]),
        Transform.rotate([Math.PI / 2, [0, 0, 1]]),
        Transform.translate([
          -1 + thickness / 2,
          height / 2 - thickness / 2,
          point,
        ]),
      ]
    ),
    new Mesh(
      ["right", gate_frame_geometry, color.wall],
      [
        Transform.scale([height - thickness, thickness, depth]),
        Transform.rotate([Math.PI / 2, [0, 0, 1]]),
        Transform.translate([
          1 - thickness / 2,
          height / 2 - thickness / 2,
          point,
        ]),
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

const getLightMesh = (wgl) => {
  const rod = new Cylinder(0.02).setupBuffers(wgl);
  const light = new Cube(0.2).setupBuffers(wgl);

  return new Mesh(["Lamp"], null, [
    new Mesh(
      ["Base Rod", rod, color.wood],
      [Transform.translate([0, 0.5, -1])]
    ),
    new Mesh(
      ["Hold Rod", rod, color.wood],
      [
        Transform.scale([0.9, 0.9, 0.6]),
        Transform.rotate([Math.PI / 2, [1, 0, 0]]),
        Transform.translate([0, 0.3, -1.3]),
      ]
    ),
    new Mesh(
      ["Light", light, color.lamp, lampLight],
      [Transform.scale([1, 1.62, 1]), Transform.translate([0, 0.2, -1.3])]
    ),
  ]);
};

const getLights = (number = 6, radius = _radius, height = 1) => {
  const lights = [];
  const r = radius * Math.cos(Math.PI / number) + 0.4;
  const angle = (n) => ((n + 0) * (2 * Math.PI)) / number;

  for (let i = 1; i < number; i++) {
    const light = new Mesh(
      ["Light"],
      [
        Transform.translate([0, height, r]),
        Transform.rotate([angle(i), [0, 1, 0]]),
      ],
      [glob_geometry.light]
    );
    lights.push(light);
  }

  return new Mesh(["Lights"], null, lights);
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
    h_dif < 0.01
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
  glob_geometry.wallsMesh = getWallMesh(wgl, glob_geometry.points, height);

  glob_geometry.cube = new Cube().setupBuffers(wgl);
  glob_geometry.gate_frame = new Cube().setupBuffers(
    wgl,
    [1 * texScale, 30 * texScale],
    [2 * texScale, 1 * texScale]
  );
  glob_geometry.gate_door = new Cube().setupBuffers(
    wgl,
    [5 * texScale * height, 70 * texScale],
    [1, 0.1]
  );

  glob_geometry.light = getLightMesh(wgl);

  glob_geometry.initiated = true;

  return true;
};

let cache = undefined;
const Walls = (wgl, number = 6, height = 1.5, angle = 0) => {
  if (!initiate(wgl, number, height, angle)) return cache;

  const towers = getTowers(wgl, glob_geometry.points, height);
  const wall = getWall(wgl, glob_geometry.points, height);
  const gate = getGate(wgl, glob_geometry.points, height, angle);
  const lights = getLights(number, undefined, height * 0.5);

  const walls = new Mesh(["Walls"], null, [towers, wall, gate, lights]);
  cache = walls;

  return walls;
};

export default Walls;
