import { vec3, mat4, mx } from "./util.js";

const TranslationDelta = 0.1;
const RotationDelta = 0.02;
const InertiaFactor = 0.05;

const InitialState = {
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

class CameraControl {
  constructor(initialPosition = [0, 0, 0]) {
    this.initialPosition = [...initialPosition];
    this.position = initialPosition;
    this.rotation = [0, 0, 0];
    this.worldMatrix = mat4.create();
    this.state = { ...InitialState };

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
          this.state = { ...InitialState };
          break;

        case "t":
          this.rotation = vec3.create();
          this.state = { ...InitialState };
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
}

export { CameraControl };
