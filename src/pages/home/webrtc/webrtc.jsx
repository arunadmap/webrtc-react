import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:8000");

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // get access to the user's webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        // create a video element to display the webcam feed
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();
        console.log("stream", stream);
        // send the video stream to the server through socket.io
        const sendStream = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          console.log("sendingStream");
          socket.emit('stream', dataUrl);
          requestAnimationFrame(sendStream);
        };
        sendStream();
      })
      .catch((error) => {
        console.error(error);
      });

    // listen for incoming video streams from the server
    socket.on('stream', (dataUrl) => {
      console.log("data url receiving");
      setVideoUrl(dataUrl);
    });

    // cleanup function to stop streaming on unmount
    return () => {
      socket.off('stream');
    };
  }, []);

  return (
    <div>
      <h1>Webcam Stream</h1>
      <video ref={videoRef} width="640" height="480" muted></video>
      {videoUrl && (
        <div>
          <h1>Broadcasted Stream</h1>
          <video src={videoUrl} width="640" height="480" controls></video>
        </div>
      )}
    </div>
  );
}

export default App;
