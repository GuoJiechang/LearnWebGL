import {showError} from "./log.js";

class Shader {
  constructor(glContext, vertexShaderSource, fragmentShaderSource) {
    this.ID = null;
    this.gl = glContext;

    this.compileShaders(vertexShaderSource, fragmentShaderSource);
  }

  use() {
    this.gl.useProgram(this.ID);
  }

  getAttribLocation(name){
    return this.gl.getAttribLocation(this.ID, name)
  }
  setBool(name, value) {
    this.gl.uniform1i(this.gl.getUniformLocation(this.ID, name), value);
  }

  setInt(name, value) {
    this.gl.uniform1i(this.gl.getUniformLocation(this.ID, name), value);
  }

  setFloat(name, value) {
    this.gl.uniform1f(this.gl.getUniformLocation(this.ID, name), value);
  }

  setVec2(name, value) {
    this.gl.uniform2fv(this.gl.getUniformLocation(this.ID, name), value);
  }

  setVec3(name, value) {
    this.gl.uniform3fv(this.gl.getUniformLocation(this.ID, name), value);
  }

  setVec4(name, value) {
    this.gl.uniform4fv(this.gl.getUniformLocation(this.ID, name), value);
  }

  setMat2(name, mat) {
    this.gl.uniformMatrix2fv(this.gl.getUniformLocation(this.ID, name), false, mat);
  }

  setMat3(name, mat) {
    this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.ID, name), false, mat);
  }

  setMat4(name, mat) {
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.ID, name), false, mat);
  }


  compileShaders(vertexCode, fragmentCode) {
    const vertex = this.compileShader(vertexCode, this.gl.VERTEX_SHADER);
    const fragment = this.compileShader(fragmentCode, this.gl.FRAGMENT_SHADER);

    this.ID = this.createProgram(vertex, fragment);

    this.gl.deleteShader(vertex);
    this.gl.deleteShader(fragment);
  }

  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const infoLog = this.gl.getShaderInfoLog(shader);
      showError(`Error compiling shader: ${infoLog}`);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createProgram(vertex, fragment) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertex);
    this.gl.attachShader(program, fragment);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const infoLog = this.gl.getProgramInfoLog(program);
      showError(`Error linking program: ${infoLog}`);
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }
}

// Usage example:
// const shader = new Shader('vertexShader.glsl', 'fragmentShader.glsl', 'geometryShader.glsl');
// shader.use();
// shader.setFloat('time', 0.5);
export {Shader}