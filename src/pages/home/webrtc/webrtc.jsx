import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000/');

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
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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
          console.log('Candidate', event.candidate);
          socket.emit('iceCandidate', event.candidate);
        }
      };

      peerConnection.ontrack = event => {
        setRemoteStream(event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      socket.on('iceCandidate', candidate => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on('sdp', async sdp => {
        if (sdp.type === 'offer') {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('sdp', answer);
        } else if (sdp.type === 'answer') {
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
      createPeerConnection();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("offer", offer);
      socket.emit('sdp', offer);
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted width={300}/>
      <video ref={remoteVideoRef} autoPlay />
      <button onClick={initiateCall}>Start Call</button>
    </div>
  );
};

export default App;
