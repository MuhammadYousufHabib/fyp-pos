import React, { useEffect, useRef, useState } from "react";

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [images, setImages] = useState([]);
  const [intervalId, setIntervalId] = useState(null); 

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const captureImages = () => {
    const context = canvasRef.current.getContext("2d");

    const id = setInterval(() => {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageUrl = canvasRef.current.toDataURL("image/png");
      setImages((prevImages) => [...prevImages, imageUrl]);
    }, 500); 

    setIntervalId(id); // Save the interval ID
  };

  const stopCapturing = () => {
    clearInterval(intervalId); // Clear the interval
    setCapturing(false); // Set capturing to false
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Stop the camera stream
    }
  };

  const handleStartCapturing = () => {
    if (window.confirm("Do you want to start the camera?")) {
      setCapturing(true);
      startCamera();
      captureImages();
    }
  };

  useEffect(() => {
    return () => {
      stopCapturing(); 
    };
  }, []);

  return (
    <div>
      <h1>Camera Capture</h1>
      <video ref={videoRef} width="640" height="480" autoPlay style={{ display: capturing ? 'block' : 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      {!capturing ? (
        <button onClick={handleStartCapturing}>
          Start Capturing
        </button>
      ) : (
        <button onClick={stopCapturing}>Stop Capturing</button>
      )}
      {images.length > 0 && (
        <div>
          <h2>Captured Images:</h2>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Captured ${index}`} width="160" height="120" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
