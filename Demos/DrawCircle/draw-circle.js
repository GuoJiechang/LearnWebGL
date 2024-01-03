import {showError} from "../../modules/log.js";
import {getContext} from "../../modules/gl-helper.js";
import {Shader} from "../../modules/shader.js";

function buildCircleVertexBufferData(segmentCount) {
  const vertexData = [];

  // Append the vertices for each of the N triangle segments
  for (let i = 0; i < segmentCount; i++) {
    const vertex1Angle = i * Math.PI * 2 / segmentCount;
    const vertex2Angle = (i + 1) * Math.PI * 2 / segmentCount;
    const x1 = Math.cos(vertex1Angle);
    const y1 = Math.sin(vertex1Angle);
    const x2 = Math.cos(vertex2Angle);
    const y2 = Math.sin(vertex2Angle);

    // Center vertex is a light blue color and in the middle of the shape
    vertexData.push(
      // Position (x, y)
      0, 0,
      // Color (r, g, b)
      0.678, 0.851, 0.957
    );
    // The other two vertices are along the edges of the circle, and a darker blue color
    vertexData.push(
      x1, y1,
      0.251, 0.353, 0.856
    );
    vertexData.push(
      x2, y2,
      0.251, 0.353, 0.856
    );
  }

  return new Float32Array(vertexData);
}
function helloCircle() {
  //
  // Setup Step 1: Get the WebGL rendering context for our HTML canvas rendering area
  //
  const canvas = document.getElementById('demo-canvas');
  const slider = document.getElementById("segment-slider");

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

  let circleGeoCpuBuffer = buildCircleVertexBufferData(parseInt(slider.value));

  const circleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, circleGeoCpuBuffer, gl.STATIC_DRAW);

  //
  // Create the vertex and fragment shader for this demo. GLSL shader code is
  //  written as a plain JavaScript string, attached to a shader, and compiled
  //  with the "compileShader" call.
  const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;

void main() {
    
    gl_Position = vec4(vertexPosition, 0.0, 1.0);

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
  gl.bindBuffer(gl.ARRAY_BUFFER, circleGeoBuffer);
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
    5 * Float32Array.BYTES_PER_ELEMENT,
    /* offset: bytes between the start of the buffer and the first byte of the attribute */
    0
  );



  //loop frame
  const frame = function() {
    //slider value change event, here we need to update the segment count of the circle, recalculate the circle buffer
    slider.oninput= function () {
      showError(`segment count: ${slider.value}`);
      circleGeoCpuBuffer = buildCircleVertexBufferData(parseInt(slider.value));
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, circleGeoBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, circleGeoCpuBuffer, gl.STATIC_DRAW);
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rasterizer (which output pixels are covered by a triangle?)
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set up GPU program
    shader.use();

    gl.drawArrays(gl.TRIANGLES, 0, parseInt(slider.value)*3);


    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

try {
  helloCircle();
} catch (e) {
  showError(`Uncaught JavaScript exception: ${e}`);
}