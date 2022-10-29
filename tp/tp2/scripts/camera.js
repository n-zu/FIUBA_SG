import { vec3, mat4, mx } from "./util.js";

const TranslationDelta = 0.1;
const RotationDelta = 0.02;
const InertiaFactor = 0.05;

const droneInitialState = {
  xVel: 0,
  zVel: 0,
  yVel: 0,
  xVelTarget: 0,
  zVelTarget: 0,
  yVelTarget: 0,

  yRotVelTarget: 0,
  yRotVel: 0,
  zRotVelTarget: 0,
  zRotVel: 0,
  xRotVelTarget: 0,
  xRotVel: 0,
};

class DroneCamera {
  constructor(initialPosition = [0, 0, 0]) {
    this.initialPosition = [...initialPosition];
    this.position = initialPosition;
    this.rotation = [0, 0, 0];
    this.worldMatrix = mat4.create();
    this.state = { ...droneInitialState };

    this.keyDownListener = document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this.state.zVelTarget = TranslationDelta;
          break;
        case "ArrowDown":
          this.state.zVelTarget = -TranslationDelta;
          break;

        case "ArrowLeft":
          this.state.xVelTarget = TranslationDelta;
          break;
        case "ArrowRight":
          this.state.xVelTarget = -TranslationDelta;
          break;

        case "w":
          this.state.yVelTarget = TranslationDelta;
          break;
        case "s":
          this.state.yVelTarget = -TranslationDelta;
          break;

        case "a":
          this.state.yRotVelTarget = RotationDelta;
          break;
        case "d":
          this.state.yRotVelTarget = -RotationDelta;
          break;

        case "r":
          this.rotation = vec3.create();
          this.position = { ...this.initialPosition };
          this.state = { ...droneInitialState };
          break;

        case "t":
          this.rotation = vec3.create();
          this.state = { ...droneInitialState };
          break;
      }
    });

    this.keyUpListener = document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
          this.state.zVelTarget = 0;
          break;

        case "ArrowLeft":
        case "ArrowRight":
          this.state.xVelTarget = 0;
          break;

        case "w":
        case "s":
          this.state.yVelTarget = 0;
          break;

        case "a":
          this.state.yRotVelTarget = 0;
          break;
        case "d":
          this.state.yRotVelTarget = 0;
          break;
      }
    });
  }

  update(wgl) {
    wgl?.setViewMatrix(this.getViewMatrix());

    const { state, rotation, position } = this;

    state.xVel += (state.xVelTarget - state.xVel) * InertiaFactor;
    state.yVel += (state.yVelTarget - state.yVel) * InertiaFactor;
    state.zVel += (state.zVelTarget - state.zVel) * InertiaFactor;

    state.xRotVel += (state.xRotVelTarget - state.xRotVel) * InertiaFactor;
    state.yRotVel += (state.yRotVelTarget - state.yRotVel) * InertiaFactor;
    state.zRotVel += (state.zRotVelTarget - state.zRotVel) * InertiaFactor;

    let translation = vec3.fromValues(-state.xVel, state.yVel, -state.zVel);

    let rotIncrement = vec3.fromValues(
      state.xRotVel,
      state.yRotVel,
      state.zRotVel
    );
    vec3.add(rotation, rotation, rotIncrement);

    rotation[0] = Math.min(Math.PI / 8, Math.max(-Math.PI / 8, rotation[0]));

    let rotationMatrix = mat4.create();

    mat4.rotateX(rotationMatrix, rotationMatrix, rotation[0]);

    let yAxis = vec3.fromValues(0, 1, 0);
    let xRotation = mat4.create();
    mat4.rotateX(xRotation, xRotation, rotation[0]);
    vec3.transformMat4(yAxis, yAxis, xRotation);

    mat4.rotate(rotationMatrix, rotationMatrix, rotation[1], yAxis);

    mat4.rotateY(rotationMatrix, rotationMatrix, rotation[1]);
    mat4.rotateZ(rotationMatrix, rotationMatrix, rotation[2]);

    vec3.transformMat4(translation, translation, rotationMatrix);
    vec3.add(position, position, translation);

    const worldMatrix = mat4.create();
    mat4.translate(worldMatrix, worldMatrix, position);
    mat4.multiply(worldMatrix, worldMatrix, rotationMatrix);
    this.worldMatrix = worldMatrix;
  }

  getViewMatrix() {
    let m = mat4.clone(this.worldMatrix);
    mat4.invert(m, m);
    return m;
  }

  cleanup() {
    document.removeEventListener("keydown", this.keyDownListener);
    document.removeEventListener("keyup", this.keyUpListener);
  }
}

class FreeCamera {
  constructor(wgl, initialPosition = [], initialDirection = [0, 0, -1]) {
    this.position = [...initialPosition];
    this.initialPosition = [...initialPosition];
    this.direction = [...initialDirection];
    this.initialDirection = [...initialDirection];
    this.up = [0, 1, 0];
    this.side = [1, 0, 0];

    this.state = {
      forward: 0,
      right: 0,
      u: 0,
      v: 0,
      du: 0,
      dv: 0,
    };

    this.setupListeners();

    wgl.canvas.requestPointerLock();
  }
  setupListeners() {
    this.keyDownListener = document.addEventListener("keydown", (e) => {
      const vel = 1;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          this.state.forward = vel;
          break;
        case "ArrowDown":
        case "s":
          this.state.forward = -vel;
          break;
        case "ArrowLeft":
        case "a":
          this.state.right = -vel;
          break;
        case "ArrowRight":
        case "d":
          this.state.right = vel;
      }
    });

    this.keyUpListener = document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "ArrowDown":
        case "s":
          this.state.forward = 0;
          break;
        case "ArrowLeft":
        case "a":
        case "ArrowRight":
        case "d":
          this.state.right = 0;
      }
    });

    this.mouseMoveListener = document.addEventListener("mousemove", (e) => {
      const { movementX, movementY } = e;
      const lerp_amt = 0.1;
      this.state.du = mx.lerp(this.state.du, movementX, lerp_amt);
      this.state.dv = mx.lerp(this.state.dv, movementY, lerp_amt);
    });
  }

  updateDirection() {
    const velFactor = 0.01;
    const { du, dv } = this.state;
    this.state.u += du * velFactor;
    this.state.v += dv * velFactor;

    if (this.state.v > 1) this.state.v = 1;
    if (this.state.v < -0.5) this.state.v = -0.5;

    const transform = mx.mat();
    mx.rotate(transform, -this.state.v, this.side);
    mx.rotate(transform, -this.state.u, this.up);

    const dir = [...this.initialDirection];
    mx.transform(dir, transform);

    const frictionFactor = 0.9;
    this.state.du *= frictionFactor;
    this.state.dv *= frictionFactor;

    this.direction = dir;
  }
  updatePosition() {
    const { forward, right } = this.state;
    const velFactor = 0.1;

    const forwardVec = mx.norm(this.direction);
    const rightVec = mx.norm(mx.cross(this.direction, this.up));

    mx.scaleVec(forwardVec, forward * velFactor);
    mx.scaleVec(rightVec, right * velFactor);

    vec3.add(this.position, this.position, forwardVec);
    vec3.add(this.position, this.position, rightVec);
  }

  update(wgl) {
    this.updateDirection();
    this.updatePosition();
    wgl?.setViewMatrix(this.getViewMatrix());
  }

  getViewMatrix() {
    const target = mx.add(this.position, this.direction);
    return mat4.lookAt(mat4.create(), this.position, target, this.up);
  }

  cleanup() {
    document.removeEventListener("keydown", this.keyDownListener);
    document.removeEventListener("keyup", this.keyUpListener);
    document.removeEventListener("mousemove", this.mouseMoveListener);
    document.exitPointerLock();
  }
}

class OrbitalCamera {
  constructor(lookAt = [0, 0, 0], initialOffset = [0, 2, 15]) {
    this.lookAt = lookAt;
    this.position = mx.add(lookAt, initialOffset);
    this.up = [0, 1, 0];
    this.side = [1, 0, 0];

    this.state = {
      x: 0,
      y: initialOffset[1],
      z: initialOffset[2],
      u: 0,
      v: 0,
      du: 0,
      dv: 0,
      dz: 0,
    };

    this.setupListeners();
  }

  setTarget(target) {
    this.lookAt = target;
  }

  setupListeners() {
    this.keyDownListener = document.addEventListener("keydown", (e) => {
      const vel = 0.01;
      const z_vel = 0.08;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          this.state.dv = vel;
          break;
        case "ArrowDown":
        case "s":
          this.state.dv = -vel;
          break;

        case "ArrowLeft":
        case "a":
          this.state.du = vel;
          break;
        case "ArrowRight":
        case "d":
          this.state.du = -vel;
          break;
        case "e":
          this.state.dz = -z_vel;
          break;
        case "q":
          this.state.dz = z_vel;
          break;
      }
    });
    this.keyUpListener = document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "ArrowDown":
        case "s":
          this.state.dv = 0;
          break;

        case "ArrowLeft":
        case "a":
        case "ArrowRight":
        case "d":
          this.state.du = 0;
          break;

        case "e":
        case "q":
          this.state.dz = 0;
      }
    });
  }

  updatePosition() {
    const { du, dv, dz } = this.state;
    this.state.u += du;
    this.state.v += dv;
    this.state.z += dz;

    if (this.state.v > 1) this.state.v = 1;
    if (this.state.v < -0.5) this.state.v = -0.5;
    if (this.state.z < 2) this.state.z = 2;

    const transform = mx.mat();
    mx.rotate(transform, -this.state.v, this.side);
    mx.rotate(transform, -this.state.u, this.up);

    const position = [0, this.state.y, this.state.z];
    mx.transform(position, transform);
    if (position[1] < 0.1) position[1] = 0.1;

    this.position = mx.add(position, this.lookAt);
  }

  update(wgl) {
    this.updatePosition();
    wgl?.setViewMatrix(this.getViewMatrix());
  }

  getViewMatrix() {
    return mat4.lookAt(mat4.create(), this.position, this.lookAt, this.up);
  }

  cleanup() {
    document.removeEventListener("keydown", this.keyDownListener);
    document.removeEventListener("keyup", this.keyUpListener);
  }
}

export { FreeCamera, OrbitalCamera };
