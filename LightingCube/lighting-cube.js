import {showError} from "./modules/log.js";
import {getContext, loadTexture} from "./modules/gl-helper.js";
import {Shader} from "./modules/shader.js";
import * as mat4 from "./modules/mat4.js";
import * as vec3 from "./modules/vec3.js";
import {degreesToRadians,radiansToDegrees} from "./modules/math-helper.js";
import {Camera} from "./modules/camera.js";

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
       //position, texcoords, normal
      -0.5, -0.5, -0.5,  0.0, 0.0, 0.0,  0.0, -1.0,
       0.5, -0.5, -0.5,  1.0, 0.0, 0.0,  0.0, -1.0,
       0.5,  0.5, -0.5,  1.0, 1.0, 0.0,  0.0, -1.0,
       0.5,  0.5, -0.5,  1.0, 1.0, 0.0,  0.0, -1.0,
      -0.5,  0.5, -0.5,  0.0, 1.0, 0.0,  0.0, -1.0,
      -0.5, -0.5, -0.5,  0.0, 0.0, 0.0,  0.0, -1.0,

      -0.5, -0.5,  0.5,  0.0, 0.0, 0.0,  0.0,  1.0,
       0.5, -0.5,  0.5,  1.0, 0.0, 0.0,  0.0,  1.0,
       0.5,  0.5,  0.5,  1.0, 1.0, 0.0,  0.0,  1.0,
       0.5,  0.5,  0.5,  1.0, 1.0, 0.0,  0.0,  1.0,
      -0.5,  0.5,  0.5,  0.0, 1.0, 0.0,  0.0,  1.0,
      -0.5, -0.5,  0.5,  0.0, 0.0, 0.0,  0.0,  1.0,

      -0.5,  0.5,  0.5,  1.0, 0.0, 1.0,  0.0,  0.0,
      -0.5,  0.5, -0.5,  1.0, 1.0, 1.0,  0.0,  0.0,
      -0.5, -0.5, -0.5,  0.0, 1.0, 1.0,  0.0,  0.0,
      -0.5, -0.5, -0.5,  0.0, 1.0, 1.0,  0.0,  0.0,
      -0.5, -0.5,  0.5,  0.0, 0.0, 1.0,  0.0,  0.0,
      -0.5,  0.5,  0.5,  1.0, 0.0, 1.0,  0.0,  0.0,

       0.5,  0.5,  0.5,  1.0, 0.0, 1.0,  0.0,  0.0,
       0.5,  0.5, -0.5,  1.0, 1.0, 1.0,  0.0,  0.0,
       0.5, -0.5, -0.5,  0.0, 1.0, 1.0,  0.0,  0.0,
       0.5, -0.5, -0.5,  0.0, 1.0, 1.0,  0.0,  0.0,
       0.5, -0.5,  0.5,  0.0, 0.0, 1.0,  0.0,  0.0,
       0.5,  0.5,  0.5,  1.0, 0.0, 1.0,  0.0,  0.0,

      -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, -1.0,  0.0,
       0.5, -0.5, -0.5,  1.0, 1.0, 0.0, -1.0,  0.0,
       0.5, -0.5,  0.5,  1.0, 0.0, 0.0, -1.0,  0.0,
       0.5, -0.5,  0.5,  1.0, 0.0, 0.0, -1.0,  0.0,
      -0.5, -0.5,  0.5,  0.0, 0.0, 0.0, -1.0,  0.0,
      -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, -1.0,  0.0,

      -0.5,  0.5, -0.5,  0.0, 1.0, 0.0,  1.0,  0.0,
       0.5,  0.5, -0.5,  1.0, 1.0, 0.0,  1.0,  0.0,
       0.5,  0.5,  0.5,  1.0, 0.0, 0.0,  1.0,  0.0,
       0.5,  0.5,  0.5,  1.0, 0.0, 0.0,  1.0,  0.0,
      -0.5,  0.5,  0.5,  0.0, 0.0, 0.0,  1.0,  0.0,
      -0.5,  0.5, -0.5,  0.0, 1.0, 0.0,  1.0,  0.0

    ];
    const cubeGeoCpuBuffer = new Float32Array(cubeVertices);



    //the shader of the lighting cube
     const lightVs = `#version 300 es
        precision mediump float;
        in vec3 vertexPosition;
        
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        
        void main() {
           gl_Position = projection * view * model * vec4(vertexPosition, 1.0);
           
        }`;

    const lightFs = `#version 300 es
        precision mediump float;
        
        out vec4 outputColor;

        void main() {
            outputColor = vec4(1.0); // set all 4 vector values to 1.0
        }`;

    const lightShader = new Shader(gl,lightVs,lightFs);
    const lightVertexPositionAttributeLocation = lightShader.getAttribLocation('vertexPosition');
    if (lightVertexPositionAttributeLocation < 0) {
      showError(`Failed to get attribute locations: (pos=${lightVertexPositionAttributeLocation})`);
      return;
    }

    const lightCubeGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightCubeGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeGeoCpuBuffer, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(lightVertexPositionAttributeLocation);
    // Input assembler (how to read vertex information from buffers?)
    gl.bindBuffer(gl.ARRAY_BUFFER, lightCubeGeoBuffer);
    gl.vertexAttribPointer(
      /* index: vertex attrib location */
      lightVertexPositionAttributeLocation,
      /* size: number of components in the attribute */
      3,
      /* type: type of data in the GPU buffer for this attribute */
      gl.FLOAT,
      /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
      false,
      /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
      8 * Float32Array.BYTES_PER_ELEMENT,
      /* offset: bytes between the start of the buffer and the first byte of the attribute */
      0
    );

    //
    // Create the vertex and fragment shader for this demo. GLSL shader code is
    //  written as a plain JavaScript string, attached to a shader, and compiled
    //  with the "compileShader" call.
    const vertexShaderSourceCode = `#version 300 es
        precision mediump float;
        
        in vec3 vertexPosition;
        in vec3 aNormal;
        
        out vec3 Normal;
        out vec3 FragPos;
        
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        
        void main() {
           FragPos = vec3(model * vec4(vertexPosition, 1.0));
           Normal = mat3(transpose(inverse(model))) * aNormal;  
           gl_Position = projection * view * vec4(FragPos, 1.0f);
           
        }`;

    const fragmentShaderSourceCode = `#version 300 es
        precision mediump float;
        
        out vec4 outputColor;
        
        in vec3 Normal;  
        in vec3 FragPos;  
  
        uniform vec3 lightPos; 
        uniform vec3 viewPos; 
        uniform vec3 lightColor;
        uniform vec3 objectColor;

        void main() {
            // ambient
            float ambientStrength = 0.1;
            vec3 ambient = ambientStrength * lightColor;
            
            // diffuse 
            vec3 norm = normalize(Normal);
            vec3 lightDir = normalize(lightPos - FragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * lightColor;
            
            // specular
            float specularStrength = 0.5;
            vec3 viewDir = normalize(viewPos - FragPos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float temp = max(dot(viewDir, reflectDir), 0.0);
            float spec = pow(temp, 32.0);
            //float spec = 32.0;
            vec3 specular = specularStrength * spec * lightColor;  
                
            vec3 result = (ambient + diffuse + specular) * objectColor;
            outputColor = vec4(result, 1.0);
            //outputColor = vec4(objectColor, 1.0);
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

    const cubeGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeGeoCpuBuffer, gl.STATIC_DRAW);

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
      8 * Float32Array.BYTES_PER_ELEMENT,
      /* offset: bytes between the start of the buffer and the first byte of the attribute */
      0
    );

    const normalAttributeLocation = shader.getAttribLocation('aNormal');
    if (normalAttributeLocation < 0) {
      showError(`Failed to get attribute locations: (normal=${normalAttributeLocation})`);
      return;
    }

    gl.enableVertexAttribArray(normalAttributeLocation);

    // Input assembler (how to read vertex information from buffers?)
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
    gl.vertexAttribPointer(
      /* index: vertex attrib location */
      normalAttributeLocation,
      /* size: number of components in the attribute */
      3,
      /* type: type of data in the GPU buffer for this attribute */
      gl.FLOAT,
      /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
      false,
      /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
      8 * Float32Array.BYTES_PER_ELEMENT,
      /* offset: bytes between the start of the buffer and the first byte of the attribute */
      5 * Float32Array.BYTES_PER_ELEMENT
    );


    // Rasterizer (which output pixels are covered by a triangle?)
    gl.viewport(0, 0, canvas.width, canvas.height);
    let camera = new Camera( vec3.fromValues(0.0,0.0,10.0));

    //loop frame
    let lightPos = vec3.fromValues(1.2,1.0,2.0);
    let objectCol = vec3.fromValues(1.0, 0.5, 0.31);
    let lightColor = vec3.fromValues(1.0, 1.0, 1.0);
    let lastFrameTime = performance.now();
    const frame = function(now) {
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.clearColor(0.08, 0.08, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // change the light's position values over time (can be done anywhere in the render loop actually, but try to do it at least before using the light source positions)
        const x = 1.0 + Math.sin(performance.now()/1000.0) * 2.0;
        const y =  Math.sin(performance.now()/1000.0 / 2.0);
        lightPos = vec3.fromValues(x,y,2.0);

        // activate shader
        shader.use();
        shader.setVec3("objectColor",objectCol );
        shader.setVec3("lightColor",lightColor );
        shader.setVec3("lightPos", lightPos);
        shader.setVec3("viewPos", camera.Position);


        // Set up GPU program

        // Set up perspective matrix
        const fieldOfView = Math.PI / 4;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        shader.setMat4('projection',projectionMatrix)

        // Set up initial model-view matrix
        const modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix,  degreesToRadians(-10));
        //showError(`modelMatrix = ${modelMatrix}`);
        shader.setMat4('model',modelMatrix);
        const viewMatrix = camera.getViewMatrix();
        shader.setMat4('view',viewMatrix)

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeGeoBuffer);
        // Draw call (Primitive assembly (which vertices form triangles together?))
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        //lamp cube
        lightShader.use();
        lightShader.setMat4('projection',projectionMatrix)
        lightShader.setMat4("view", viewMatrix);
        const lightModelMat = mat4.create();
        mat4.translate(lightModelMat, lightModelMat, lightPos);
        mat4.scale(lightModelMat,lightModelMat,vec3.fromValues(0.1,0.1,0.1));
        lightShader.setMat4("model", lightModelMat);

        gl.bindBuffer(gl.ARRAY_BUFFER, lightCubeGeoBuffer)
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