import * as mat4 from "./mat4.js";
import * as vec3 from "./vec3.js";
class Camera {
    constructor(position = [0.0, 0.0, 0.0], up = [0.0, 1.0, 0.0]) {
        this.Position = position;
        this.Front = [0.0, 0.0, -1.0];
        this.Up = up;
    }

    getViewMatrix() {
        return mat4.lookAt(mat4.create(), this.Position, vec3.add(vec3.create(), this.Position, this.Front), this.Up);
    }
}

export {Camera}