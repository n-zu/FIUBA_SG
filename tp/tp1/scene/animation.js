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
};

export { update };
