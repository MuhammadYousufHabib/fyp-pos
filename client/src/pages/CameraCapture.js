import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Row, Col, Card, Typography, Spin } from "antd";
import { useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate
const { Title, Text } = Typography;

const CameraCapture = () => {
  const navigate = useNavigate(); // Initialize navigate
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [capturing, setCapturing] = useState(false);
  const [frames, setFrames] = useState([]);
  const [itemNames, setitemNames] = useState([])

  const dispatch = useDispatch(); 

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageUrl = canvasRef.current.toDataURL("image/png");

    const frame = { imageUrl, detection: "Processing..." };

    setFrames((prevFrames) => {
      const updatedFrames = [...prevFrames, frame];
      detectObjects(imageUrl, updatedFrames.length - 1);
      return updatedFrames;
    });
  };

  const detectObjects = async (image, index) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        {
          image: image.split(",")[1], 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      const result = response.data;
      console.log("api gives: ",result)
  
      if (Array.isArray(result) && result.length > 0) {
        const detectedNames = result.map((e) => e.name); 

        setitemNames((prevItemNames) => {
          return [...prevItemNames, ...detectedNames]; 
      });

          setFrames((prevFrames) => {
          const updatedFrames = [...prevFrames];
          if (updatedFrames[index]) {
            updatedFrames[index] = { ...updatedFrames[index], detection: detectedNames }; 
          }
          return updatedFrames;
        });
      } else {
        console.error("Result is not an array or is empty:", result);
  
        setFrames((prevFrames) => {
          const updatedFrames = [...prevFrames];
          if (updatedFrames[index]) {
            updatedFrames[index] = { ...updatedFrames[index], detection: "No detections" };
          }
          return updatedFrames;
        });
      }
    } catch (error) {
      console.error("Error detecting objects:", error);
  
      setFrames((prevFrames) => {
        const updatedFrames = [...prevFrames];
        if (updatedFrames[index]) {
          updatedFrames[index] = { ...updatedFrames[index], detection: "Error occurred" };
        }
        return updatedFrames;
      });
    }
  };
  

  const startCapturing = () => {
    setCapturing(true);
    startCamera();
    const intervalId = setInterval(captureImage, 2000); // Capture every second
    return () => clearInterval(intervalId); // Clear interval on stop/unmount
  };
  

  const stopCapturing = async () => {
    
    setCapturing(false);
    const stream = videoRef.current.srcObject;
    if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop camera
    }

    const getAllItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item"); // Replace with your actual API endpoint
        console.log(data,"all items")
        console.log(itemNames,"detected items")
        
        const matchingItems = itemNames.reduce((acc, detectedName) => {
          const foundItems = data.filter((item) =>
            item.ItemName.toLowerCase() === detectedName.toLowerCase()
          );
          foundItems.forEach((foundItem) => {
            const existingItem = acc.find((item) => item._id === foundItem._id);
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              acc.push({ ...foundItem, quantity: 1 }); 
            }
          });
          return acc;
        }, []);
    
        matchingItems.forEach((item) => {
          const cartItem = {
            ...item,
            quantity: item.quantity, // Use the calculated quantity
          };
    
          dispatch({
            type: "ADD_TO_CART",
            payload: cartItem,
          });
        });
    
        console.log("Items added to cart:", matchingItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }

    };
    
  

    await getAllItems();
    navigate("/cart");
};


  useEffect(() => {
    if (capturing) {
      const stopCaptureInterval = startCapturing();
      return stopCaptureInterval;
    }
    
  }, [capturing]);
  return (
    <div style={{ padding: "20px" }}>

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
        <Row gutter={[16, 16]} justify="bottom">
          {!capturing ? (
            <Button type="primary" onClick={() => setCapturing(true)} size="large">
Scan            </Button>
          ) : (
            <Button type="secondary" onClick={stopCapturing} size="large">
Generate bill            </Button>
          )}
        </Row>
      </div>

      <div style={{ position: "fixed", top: "20px", right: "450px", zIndex: 1000 }}>
        <video
          ref={videoRef}
          width="440"
          height="280"
          autoPlay
          style={{ display: capturing ? 'block' : 'none', borderRadius: "8px", border: "2px solid #e0e0e0" }}
        />
        <canvas ref={canvasRef} width="440" height="480" style={{ display: 'none' }} />
      </div>

      {frames.length > 0 && (
        <div style={{ marginTop: "400px" }}>
          <Title level={3}>Captured Frames</Title>
          <Row gutter={[16, 16]} justify="center">
            {frames.map((frame, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={<img src={frame.imageUrl} alt={`Captured ${index}`} />}
                  style={{ borderRadius: "8px", overflow: "hidden" }}
                >
                  <Card.Meta
                    title={`Frame ${index + 1}`}
                    description={
                      <div>
                        <Text strong>Detections:</Text>
                        <pre style={{ textAlign: "left", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
                          {frame.detection && frame.detection !== "Processing..."
                            ? JSON.stringify(frame.detection, null, 2)
                            : <Spin />}
                        </pre>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
    