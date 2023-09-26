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

export {getContext};