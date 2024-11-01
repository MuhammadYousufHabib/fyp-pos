  import React, { useEffect, useRef, useState } from "react";
  import { Button, Row, Col, Typography, Spin } from "antd";
  import axios from "axios";
  import { useNavigate } from 'react-router-dom'; 
  import { useDispatch } from 'react-redux'; 
  const { Title } = Typography;

  const CameraCapture = () => {
    const navigate = useNavigate(); 
    const dispatch=useDispatch();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [capturedImages, setCapturedImages] = useState([]);
    const [apiResults, setApiResults] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [itemNames, setitemNames] = useState([])
    let counter = 0; 

    useEffect(() => {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setLoading(false);
        } catch (err) {
          console.error("Error accessing the camera: ", err);
        }
      };

      initCamera();

      return () => {
        stopCapturing();
      };
    }, []);

    const capturePhoto = async () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImages((prevImages) => [...prevImages, imageUrl]);

        try {
          const response = await axios.post(
            "http://localhost:5000/predict",
            { image: imageUrl.split(",")[1] }, 
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
          );

          const result = response.data;
          console.log("API result:", result, "count:", counter);
          
          setApiResults((prevResults) => [...prevResults, result]);

          counter++; 

          
        if (Array.isArray(result) && result.length > 0) {
          const detectedNames = result.map((e) => e.name.toLowerCase()); 
          setitemNames((prevItemNames) => [...prevItemNames, ...detectedNames]);}
        } catch (error) {
          console.error("Error sending image to API:", error);
        }
      }
    };

    const startCapturing = () => {
      if (!isCapturing) {
        setIsCapturing(true);
        const id = setInterval(capturePhoto, 500);
        setIntervalId(id);
        if (videoRef.current) {
          videoRef.current.play();
        }
        
      }
    };

    const stopCapturing = async() => {
      if (isCapturing) {
        setIsCapturing(false);
        clearInterval(intervalId);
        setIntervalId(null);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
      console.log(itemNames)
      
      const getAllItems = async () => {
        try {
          const { data } = await axios.get("/api/items/get-item"); 
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
              quantity: item.quantity, 
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
    };

    return (
      <div style={{ position: 'relative', height: '100vh', overflowY: 'auto' }}>
        {loading ? (
          <Spin />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ 
                position: 'fixed', 
                bottom: '20px', 
                left: '20px', 
                width: '300px', 
                borderRadius: '8px',
                zIndex: 1000, 
                border:'2px solid red'
              }} 
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 ,display:'flex',justifyContent:'space-between',width:'100%'}}>
              <Button 
                type="default" 
                onClick={()=>{navigate('/inventory')}} 
                style={{ marginLeft: '35px' }}
              >
  Inventory            </Button>
              <div>
              <Button style={{marginRight:'16px'}} type="Secondary" onClick={()=>{navigate('/cart')}} disabled={isCapturing}>
  Generate Invoice            </Button>
              <Button type="primary" onClick={startCapturing} disabled={isCapturing}>
                Start Capturing
              </Button>
              <Button 
                type="default" 
                onClick={stopCapturing} 
                disabled={!isCapturing} 
                style={{ marginLeft: '10px' }}
              >
                Pause
              </Button></div>
            </div>
            
            <Row justify="center" style={{ marginTop: '80px' }}>
              <Col span={24}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'right',width:'99%' }}>
                  {capturedImages.map((image, index) => (
                    <div key={index} style={{ margin: '10px', textAlign: 'center', width: '200px' }}>
                      <img src={image} alt={`Captured ${index}`} style={{ width: '100%', borderRadius: '8px' }} />
                      {Array.isArray(apiResults[index]) ? (
                        apiResults[index].map((item) => (
                          <div key={item.id} style={{ marginTop: '5px' }}>
                            <span>{item.name}</span>
                          </div>
                        ))
                      ) : (
                        <div>No Detection</div> 
                      )}
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </>
        ) }
      </div>
    );
  };

  export default CameraCapture;
