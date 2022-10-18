import { mx } from "../scripts/util.js";
import { Mesh } from "../scripts/mesh.js";
import { Sphere } from "../scripts/geometry.js";
let animation_meshes = [];

// Ammo

const ammo = {
  dur: 2000,
  geo: new Sphere(0.2),
};
class Ammo {
  constructor(ti, initialTransform) {
    this.ti = ti;
    this.initialTransform = initialTransform;

    this.mesh = new Mesh(["Ammo", new Sphere(0.2), settings.color.stone]);
    this.transform = initialTransform;
  }
  update(t) {
    const anim_t = (t - this.ti) / ammo.dur;

    let transform = mx.translation([0, anim_t * 25, 0]);
    mx.apply(transform, this.transform);
    mx.translate(transform, [0, -20 * anim_t * anim_t, 0]);
    this.mesh.transform = transform;

    return anim_t < 1;
  }
  draw(...params) {
    this.mesh.draw(...params);
  }
}

const shootAmmo = (t) => {
  const transform = settings.getAmmoTransform();
  if (!transform) return;
  const ammo = new Ammo(t, transform);
  animation_meshes.push(ammo);
};

// Catapult
const catapult = {
  state: undefined,
  anim_start: undefined,
  shoot_dur: 200,
  rload_dur: 300,
  i_rot: 25,
  f_rot: -45,
};

const shootCatapult = () => {
  catapult.state = "shooting";
};

const updateCatapult = (t) => {
  const c = catapult;
  if (c.state == "shooting") {
    if (c.anim_start === undefined) c.anim_start = t;

    const anim_t = t - c.anim_start;
    const dur = c.shoot_dur;

    if (anim_t > dur) {
      c.state = "reloading";
      c.anim_start = undefined;
      settings.catapult_ammo = false;
      shootAmmo(t);
      return;
    }

    settings.catapult_arm_rotation =
      c.i_rot + ((c.f_rot - c.i_rot) * anim_t) / dur;
  }
  if (c.state == "reloading") {
    if (c.anim_start === undefined) c.anim_start = t;

    const anim_t = t - c.anim_start;
    const dur = c.rload_dur;

    if (anim_t > dur) {
      c.state = "idle";
      c.anim_start = undefined;
      settings.catapult_ammo = true;
      return;
    }

    settings.catapult_arm_rotation =
      c.f_rot + ((c.i_rot - c.f_rot) * anim_t) / dur;
  }
};

// ----------------------------------------------------------------

settings.catapult_shoot = shootCatapult;

const update = (t) => {
  updateCatapult(t);
  animation_meshes = animation_meshes.filter((mesh) => mesh.update(t));
};

export { update, animation_meshes };
