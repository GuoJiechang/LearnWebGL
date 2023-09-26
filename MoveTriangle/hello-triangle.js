import {showError} from "./modules/log.js";
import {getContext} from "./modules/gl-helper.js";
import {Shader} from "./modules/shader.js";

// function drawTriangle(size) {
//
// }
function helloTriangle() {
  //
  // Setup Step 1: Get the WebGL rendering context for our HTML canvas rendering area
  //
  const canvas = document.getElementById('demo-canvas');
  if (!canvas) {
    showError('Could not find HTML canvas element - check for typos, or loading JavaScript file too early');
    return;
  }
  const gl = getContext(canvas)

  //
  // Create a list of [X, Y] coordinates belonging to the corners ("vertices")
  //  of the triangle that will be drawn by WebGL.
  //
  // JavaScript arrays aren't very WebGL-friendly, so create a friendlier Float32Array
  //
  // The data is useless on the CPU, so send it over to a GPU buffer by using the
  //  ARRAY_BUFFER binding point and gl.bufferData WebGL call
  //
  const triangleVertices = [
    // Top middle
    0.0, 1.0,
    // Bottom left
    -1.0, -1.0,
    // Bottom right
    1.0, -1.0
  ];
  const triangleGeoCpuBuffer = new Float32Array(triangleVertices);

  const triangleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleGeoCpuBuffer, gl.STATIC_DRAW);

  //
  // Create the vertex and fragment shader for this demo. GLSL shader code is
  //  written as a plain JavaScript string, attached to a shader, and compiled
  //  with the "compileShader" call.
  const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;

uniform float shapeSize;
uniform vec2 shapeLocation;

void main() {
    
    vec2 position = vertexPosition * shapeSize + shapeLocation;
    gl_Position = vec4(position, 0.0, 1.0);

}`;

  const fragmentShaderSourceCode = `#version 300 es
precision mediump float;

out vec4 outputColor;

void main() {
  outputColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

  const shader = new Shader(gl,vertexShaderSourceCode,fragmentShaderSourceCode);

  // Attribute locations allow us to talk about which shader input should
  //  read from which GPU buffer in the later "vertexAttribPointer" call.
  // NOTE - WebGL 2 and OpenGL 4.1+ should use VertexArrayObjects instead,
  //  which I'll cover in the next tutorial.
  //const vertexPositionAttributeLocation = gl.getAttribLocation(helloTriangleProgram, 'vertexPosition');
  const vertexPositionAttributeLocation = shader.getAttribLocation('vertexPosition');
  if (vertexPositionAttributeLocation < 0) {
    showError(`Failed to get attribute locations: (pos=${vertexPositionAttributeLocation})`);
    return;
  }

  gl.enableVertexAttribArray(vertexPositionAttributeLocation);

  // Input assembler (how to read vertex information from buffers?)
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.vertexAttribPointer(
    /* index: vertex attrib location */
    vertexPositionAttributeLocation,
    /* size: number of components in the attribute */
    2,
    /* type: type of data in the GPU buffer for this attribute */
    gl.FLOAT,
    /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
    false,
    /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
    2 * Float32Array.BYTES_PER_ELEMENT,
    /* offset: bytes between the start of the buffer and the first byte of the attribute */
    0
  );

  const size_slider = document.getElementById("size-slider");
  const x_slider = document.getElementById("x-location-slider");
  const y_slider = document.getElementById("y-location-slider");

  //loop frame
  const frame = function() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rasterizer (which output pixels are covered by a triangle?)
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set up GPU program
    shader.use();

    //showError(`slider (slider=${slider.value})`);

    shader.setFloat('shapeSize',parseFloat(size_slider.value));

    const location = [
      parseFloat(x_slider.value),
      parseFloat(y_slider.value)
    ];
    const locationBuffer = new Float32Array(location);

    shader.setVec2('shapeLocation',locationBuffer)
    // Draw call (Primitive assembly (which vertices form triangles together?))
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

try {
  helloTriangle();
} catch (e) {
  showError(`Uncaught JavaScript exception: ${e}`);
}