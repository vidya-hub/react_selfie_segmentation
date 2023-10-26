import { Camera } from "@mediapipe/camera_utils/camera_utils.js";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

import React, { useEffect, useRef } from "react";
const SelfieSegmentationComponent = () => {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  let ctx = null;

  const init = () => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    ctx = canvasRef.current.getContext("2d");

    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      // sendToMediaPipe();
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });

    selfieSegmentation.onResults(onResults);

    const camera = new Camera(inputVideoRef.current, {
      onFrame: async () => {
        // console.log(inputVideoRef.current);
        await selfieSegmentation.send({ image: inputVideoRef.current });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  };

  useEffect(() => {
    if (inputVideoRef.current) {
      init();
    }
  }, [inputVideoRef]);

  function onResults(results) {
    const backgroundImage = new Image();
    backgroundImage.src =
      "https://images.unsplash.com/photo-1682686580003-22d3d65399a8?auto=format&fit=crop&q=80&w=1931&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    backgroundImage.onload = async () => {
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      // // Background image
      ctx.globalCompositeOperation = "source-out";
      const pat = ctx.createPattern(backgroundImage, "no-repeat");
      ctx.fillStyle = pat;
      ctx.filter = "blur(10px)";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      //  over lay image
      ctx.globalCompositeOperation = "destination-atop";
      ctx.filter = "none";
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      ctx.restore();
    };

    // ctx.restore();
  }
  return (
    <div className="container">
      <video
        className="input_video"
        autoPlay
        ref={inputVideoRef}
        width={1280}
        height={720}
      />
      <canvas
        className="output_canvas"
        ref={canvasRef}
        width={1280}
        height={720}
      />
    </div>
  );
};

export default SelfieSegmentationComponent;
