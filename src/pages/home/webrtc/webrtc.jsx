import { Button } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('https://a29e-112-134-212-92.ngrok-free.app');

const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

const App = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();



  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
      })
      .catch(error => console.log('Error accessing media devices: ', error));
  }, []);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('on ice candidate event', event);
          socket.emit('iceCandidate', event.candidate);
        }
      };

      peerConnection.ontrack = event => {
        console.log("ontrack event", event.streams[0]);
        console.log("local Stream" , localStream);
        setRemoteStream(event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      socket.on('iceCandidate', candidate => {
        console.log("new iceCandidate");
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on('sdp', async sdp => {
        
        if (sdp.type === 'offer') {
          console.log('sdp offer', sdp);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log('sending sdp answer ', answer);
          socket.emit('sdp', answer);
        } else if (sdp.type === 'answer') {
          console.log('sdp answer', sdp);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      });
    }
  }, [peerConnection]);

  const createPeerConnection = () => {
    console.log("hello");
    const pc = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    setPeerConnection(pc);
  };

  const initiateCall = async () => {
    if (localStream) {
      console.log("hello");
    const pc = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setPeerConnection(pc);
      console.log("offer", offer);
      socket.emit('sdp', offer);
    }
  };


  
    



  return (
    <div style={{position:'relative'}}>
      
      <video ref={remoteVideoRef} autoPlay width={500} style={{position:'absolute'}}/>
      <video ref={localVideoRef} autoPlay muted width={300} style={{position:'absolute'}}/>
      
      <Button onClick={initiateCall}>Start Call</Button>
    </div>
  );
};

export default App;
