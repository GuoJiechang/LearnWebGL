import {showError} from "./modules/log.js";
import {getContext, loadTexture} from "./modules/gl-helper.js";
import {Shader} from "./modules/shader.js";
import * as mat4 from "./modules/mat4.js";

function degreesToRadians(degrees) {
   return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
   return radians * (180 / Math.PI);
}
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
    const cubeVertices = [
       //position, texcoords
      -0.5, -0.5, -0.5,  0.0, 0.0,
       0.5, -0.5, -0.5,  1.0, 0.0,
       0.5,  0.5, -0.5,  1.0, 1.0,
       0.5,  0.5, -0.5,  1.0, 1.0,
      -0.5,  0.5, -0.5,  0.0, 1.0,
      -0.5, -0.5, -0.5,  0.0, 0.0,

      -0.5, -0.5,  0.5,  0.0, 0.0,
       0.5, -0.5,  0.5,  1.0, 0.0,
       0.5,  0.5,  0.5,  1.0, 1.0,
       0.5,  0.5,  0.5,  1.0, 1.0,
      -0.5,  0.5,  0.5,  0.0, 1.0,
      -0.5, -0.5,  0.5,  0.0, 0.0,

      -0.5,  0.5,  0.5,  1.0, 0.0,
      -0.5,  0.5, -0.5,  1.0, 1.0,
      -0.5, -0.5, -0.5,  0.0, 1.0,
      -0.5, -0.5, -0.5,  0.0, 1.0,
      -0.5, -0.5,  0.5,  0.0, 0.0,
      -0.5,  0.5,  0.5,  1.0, 0.0,

       0.5,  0.5,  0.5,  1.0, 0.0,
       0.5,  0.5, -0.5,  1.0, 1.0,
       0.5, -0.5, -0.5,  0.0, 1.0,
       0.5, -0.5, -0.5,  0.0, 1.0,
       0.5, -0.5,  0.5,  0.0, 0.0,
       0.5,  0.5,  0.5,  1.0, 0.0,

      -0.5, -0.5, -0.5,  0.0, 1.0,
       0.5, -0.5, -0.5,  1.0, 1.0,
       0.5, -0.5,  0.5,  1.0, 0.0,
       0.5, -0.5,  0.5,  1.0, 0.0,
      -0.5, -0.5,  0.5,  0.0, 0.0,
      -0.5, -0.5, -0.5,  0.0, 1.0,

      -0.5,  0.5, -0.5,  0.0, 1.0,
       0.5,  0.5, -0.5,  1.0, 1.0,
       0.5,  0.5,  0.5,  1.0, 0.0,
       0.5,  0.5,  0.5,  1.0, 0.0,
      -0.5,  0.5,  0.5,  0.0, 0.0,
      -0.5,  0.5, -0.5,  0.0, 1.0

    ];
    const cubeGeoCpuBuffer = new Float32Array(cubeVertices);

    const cubeGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeGeoCpuBuffer, gl.STATIC_DRAW);


    //textures
    const texture1 = loadTexture(gl,'./Resources/Textures/container.jpg');
    const texture2 = loadTexture(gl,'./Resources/Textures/awesomeface.png');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    //
    // Create the vertex and fragment shader for this demo. GLSL shader code is
    //  written as a plain JavaScript string, attached to a shader, and compiled
    //  with the "compileShader" call.
    const vertexShaderSourceCode = `#version 300 es
        precision mediump float;
        
        in vec3 vertexPosition;
        in vec2 aTexCoord;
        
        out vec2 TexCoord;
        
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        
        void main() {
           gl_Position = projection * view * model * vec4(vertexPosition, 1.0f);
           TexCoord = vec2(aTexCoord.x, aTexCoord.y);
        }`;

    const fragmentShaderSourceCode = `#version 300 es
        precision mediump float;
        
        out vec4 outputColor;
        
        in vec2 TexCoord;
        
        // texture samplers
        uniform sampler2D texture1;
        uniform sampler2D texture2;
        
        void main() {
          //outputColor = vec4(1.0, 1.0, 0.0, 1.0);
          // linearly interpolate between both textures (80% container, 20% awesomeface)
          outputColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
          //outputColor = texture(texture1, TexCoord);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
    gl.vertexAttribPointer(
      /* index: vertex attrib location */
      vertexPositionAttributeLocation,
      /* size: number of components in the attribute */
      3,
      /* type: type of data in the GPU buffer for this attribute */
      gl.FLOAT,
      /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
      false,
      /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
      5 * Float32Array.BYTES_PER_ELEMENT,
      /* offset: bytes between the start of the buffer and the first byte of the attribute */
      0
    );

    const textureCoordAttributeLocation = shader.getAttribLocation('aTexCoord');
    if (textureCoordAttributeLocation < 0) {
      showError(`Failed to get attribute locations: (textureCoord=${textureCoordAttributeLocation})`);
      return;
    }

    gl.enableVertexAttribArray(textureCoordAttributeLocation);

    // Input assembler (how to read vertex information from buffers?)
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
    gl.vertexAttribPointer(
      /* index: vertex attrib location */
      textureCoordAttributeLocation,
      /* size: number of components in the attribute */
      2,
      /* type: type of data in the GPU buffer for this attribute */
      gl.FLOAT,
      /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
      false,
      /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
      5 * Float32Array.BYTES_PER_ELEMENT,
      /* offset: bytes between the start of the buffer and the first byte of the attribute */
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    shader.use();
    shader.setInt("texture1", 0);
    shader.setInt("texture2", 1);

    //loop frame

    let lastFrameTime = performance.now();
    const frame = function(now) {
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.clearColor(0.08, 0.08, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // bind textures on corresponding texture units
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);

          // activate shader
          shader.use();

        // Rasterizer (which output pixels are covered by a triangle?)
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Set up GPU program

        // Set up perspective matrix
        const fieldOfView = Math.PI / 4;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 10.0;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        shader.setMat4('projection',projectionMatrix)

        // Set up initial model-view matrix
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0, 0, -10]);
        mat4.rotateY(modelMatrix, modelMatrix,  performance.now()/1000.0 * degreesToRadians(45));
        //showError(`modelMatrix = ${modelMatrix}`);
        shader.setMat4('model',modelMatrix);
        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, [0, 0, 0]);
        shader.setMat4('view',viewMatrix)

        // Draw call (Primitive assembly (which vertices form triangles together?))
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

try {
    helloTriangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}