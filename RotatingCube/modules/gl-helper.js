import {showError} from "./log.js";
//
// Setup Step 1: Get the WebGL rendering context for our HTML canvas rendering area
//
// The WebGL context is the object used to generate images via the WebGL API, and
//  the canvas it is associated with is an area where those generated images will
//  be placed by the browser once the JavaScript code is done working on it
//
function getContext(canvas) {
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
    if (isWebGl1Supported) {
      showError('WebGL 1 is supported, but not v2 - try using a different device or browser');
    } else {
      showError('WebGL is not supported on this device - try using a different device or browser');
    }
  }

  return gl;
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    image.src = url;
    return texture;
}

export {getContext, loadTexture};