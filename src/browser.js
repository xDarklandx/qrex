import canPromise from "./can-promise";

import { create as qrCodeCreate } from "./core/qrcode";
import { render as canvasRender, renderToDataURL } from "./renderer/canvas";
import { render as svgTagRender } from "./renderer/svg-tag.js";

function renderCanvas(renderFunc, canvas, text, opts, cb) {
  const args = [].slice.call(arguments, 1);
  const argsNum = args.length;
  const isLastArgCb = typeof args[argsNum - 1] === "function";

  if (!isLastArgCb && !canPromise()) {
    throw new Error("Callback required as last argument");
  }

  if (isLastArgCb) {
    if (argsNum < 2) {
      throw new Error("Too few arguments provided");
    }

    if (argsNum === 2) {
      cb = text;
      text = canvas;
      canvas = opts = undefined;
    } else if (argsNum === 3) {
      if (canvas.getContext && typeof cb === "undefined") {
        cb = opts;
        opts = undefined;
      } else {
        cb = opts;
        opts = text;
        text = canvas;
        canvas = undefined;
      }
    }
  } else {
    if (argsNum < 1) {
      throw new Error("Too few arguments provided");
    }

    if (argsNum === 1) {
      text = canvas;
      canvas = opts = undefined;
    } else if (argsNum === 2 && !canvas.getContext) {
      opts = text;
      text = canvas;
      canvas = undefined;
    }

    return new Promise((resolve, reject) => {
      try {
        const data = create(text, opts);
        resolve(renderFunc(data, canvas, opts));
      } catch (e) {
        reject(e);
      }
    });
  }

  try {
    const data = create(text, opts);
    cb(null, renderFunc(data, canvas, opts));
  } catch (e) {
    cb(e);
  }
}

export const create = qrCodeCreate;
export const toCanvas = renderCanvas.bind(null, canvasRender);
export const toDataURL = renderCanvas.bind(null, renderToDataURL);

export const toString = renderCanvas.bind(null, (data, _, opts) =>
  svgTagRender(data, opts),
);
