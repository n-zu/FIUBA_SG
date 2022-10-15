import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const color = settings.color;
var glob_geometry = {};

const floor_height = 1.0;
const floor_division = 0.1;

const getWindows = (width, length) => {
  const window_depth = 0.1;
  const window_height = 0.5;
  const window_width = 0.4;

  let windows = [];

  const with_windows = parseInt(width / 2 / window_width) - 1;
  const length_windows = parseInt(length / 2 / window_width) - 1;

  let w, l;
  {
    const w_window = () => {
      w += window_width * 2;
      return new Mesh(
        ["window", glob_geometry.cube, color.window],
        [
          Transform.scale([window_width, window_height, window_depth]),
          Transform.translate([w, floor_height / 2, l]),
        ]
      );
    };
    w = -with_windows * window_width - window_width;
    l = length / 2;
    windows.push(...Array(with_windows).fill().map(w_window));
    w = -with_windows * window_width - window_width;
    l = -length / 2;
    windows.push(...Array(with_windows).fill().map(w_window));
  }
  {
    const l_window = () => {
      l += window_width * 2;
      return new Mesh(
        ["window", glob_geometry.cube, color.window],
        [
          Transform.scale([window_width, window_height, window_depth]),
          Transform.rotate([Math.PI / 2, [0, 1, 0]]),
          Transform.translate([w, floor_height / 2, l]),
        ]
      );
    };
    w = width / 2;
    l = -length_windows * window_width - window_width;
    windows.push(...Array(length_windows).fill().map(l_window));
    w = -width / 2;
    l = -length_windows * window_width - window_width;
    windows.push(...Array(length_windows).fill().map(l_window));
  }

  return new Mesh(["windows"], null, [...windows]);
};

const getBuilding = (width, length, floors) => {
  const windows = getWindows(width, length);
  const structure = new Mesh(
    ["structure", glob_geometry.cube, color.castle],
    [
      Transform.scale([width, floor_height, length]),
      Transform.translate([0, floor_height / 2, 0]),
    ]
  );
  const fd = floor_division * 2;
  const divisor = new Mesh(
    ["structure", glob_geometry.cube, color.castle],
    [Transform.scale([width + fd, fd / 2, length + fd])]
  );

  const getFloor = (i) =>
    new Mesh(
      ["floor"],
      [Transform.translate([0, floor_height * i, 0])],
      [structure, windows, i ? divisor : null]
    );

  const building = new Mesh(["building"], null, [
    ...Array(floors)
      .fill()
      .map((_, i) => getFloor(i)),
  ]);

  return building;
};

const initiate = (wgl, width, length, floors) => {
  const _floors = parseInt(floors);
  const w_dif = Math.abs(width - glob_geometry.width ?? 0);
  const l_dif = Math.abs(length - glob_geometry.length ?? 0);
  const f_dif = Math.abs(_floors - glob_geometry.floors ?? 0);

  if (!glob_geometry.initiated) {
    glob_geometry.width = width;
    glob_geometry.length = length;
    glob_geometry.floors = _floors;
    glob_geometry.cube = new Cube().setupBuffers(wgl);
    // WINDOWS GEOMETRY
  }

  if (f_dif > 0) {
    glob_geometry.floors = _floors;

    // TOWER GEOMETRY
  }

  if (w_dif > 0 || l_dif > 0) {
    glob_geometry.width = width;
    glob_geometry.length = length;
  }

  if (!glob_geometry.initiated || f_dif > 0 || w_dif > 0 || l_dif > 0) {
    glob_geometry.initiated = true;
    return true;
  }

  return false;
};

let cache = undefined;
const Castle = (wgl, width = 6, length = 4, floors = 3) => {
  if (!initiate(wgl, width, length, floors)) return cache;

  const geo = glob_geometry;
  const building = getBuilding(geo.width, geo.length, geo.floors);

  const castle = new Mesh(["castle"], null, [building]);
  cache = castle;

  return castle;
};

export default Castle;
