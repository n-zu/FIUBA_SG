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

const color = {
  wall: [0.5, 0.5, 0.5],
  _wall: [0.4, 0.4, 0.4],
  gate: [0.7, 0.5, 0.1],
};
const _radius = 7;
const battlements_height = 0.5;

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

const getTower = (geometry, point, height) =>
  new Mesh(
    ["Tower", geometry, color.wall],
    [
      Transform.rotate([-Math.PI / 2, [1, 0, 0]]),
      Transform.translate([0, +0.5, 0]),
      Transform.scale([1, height, 1]),
      Transform.translate(point),
    ]
  );

const getTowers = (wgl, points, height) => {
  const geometry = new Cylinder(0.6, 0.4).setupBuffers(wgl, 30);
  const towers = new Mesh(
    ["Towers"],
    null,
    points.map((point) =>
      getTower(geometry, point, height + battlements_height)
    )
  );
  return towers;
};
const getWall = (wgl, points, height) => {
  const pi = [1, 0, points[0][2]];
  const pf = [-1, 0, points[0][2]];
  const _points = [pi, ...points, pf];
  const path = Spline.rect(_points, {
    normal: [0, 1, 0],
  });

  const w = [0.5, 0.3];
  const shape_points = [
    [-w[0], 0, 0],
    [-w[1], height, 0],
    [w[1], height, 0],
    [w[0], 0, 0],
  ];
  const shape = Spline.rect(shape_points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  const geometry = new SweepSolid(surface, path).setupBuffers(
    wgl,
    3 * path.segNum,
    3 * surface.shape.segNum
  );

  return new Mesh(["Wall", geometry, color.wall]);
};
const getGate = (wgl, points, height) => {
  const geometry = new Cube(1).setupBuffers(wgl);
  const gate = new Mesh(
    ["Gate", geometry, color._wall],
    [
      Transform.translate([0, 0.5, 0]),
      Transform.scale([2, height, 1]),
      Transform.translate([0, 0, points[0][2]]),
    ]
  );
  return gate;
};

const Walls = (wgl, number = 6, height = 1.5) => {
  const points = getPoints(number);

  const towers = getTowers(wgl, points, height);
  const wall = getWall(wgl, points, height);
  const gate = getGate(wgl, points, height);

  const walls = new Mesh(["Walls"], null, [towers, wall, gate]);

  return walls;
};

export default Walls;
