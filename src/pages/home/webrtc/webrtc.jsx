import { useParams } from "react-router-dom";
import { useRef, useEffect } from "react";
import socketio from "socket.io-client";
import JoinMeeting from "./JoinMeeting";
import EndMeeting from "./EndMeeting";
import { Card } from "antd";

function CallScreen({ isConnected, onJoinMeetingClick, onEndMeetingClick }) {
  const params = useParams();
  const localUsername = params.username;
  const roomName = params.room;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const socket = socketio("https://signaling-server-flask.herokuapp.com/", {
    autoConnect: false,
  });

  let pc; // For RTCPeerConnection Object

  const sendData = (data) => {
    socket.emit("data", {
      username: localUsername,
      room: roomName,
      data: data,
    });
  };

  const startConnection = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        console.log("Local Stream found");
        localVideoRef.current.srcObject = stream;
        socket.connect();
        socket.emit("join", { username: localUsername, room: roomName });
      })
      .catch((error) => {
        console.error("Stream not found: ", error);
      });
  };

  const onIceCandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate");
      sendData({
        type: "candidate",
        candidate: event.candidate,
      });
    }
  };

  const onTrack = (event) => {
    console.log("Adding remote track");
    remoteVideoRef.current.srcObject = event.streams[0];
  };

  const createPeerConnection = () => {
    try {
      pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:openrelay.metered.ca:80",
          },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });
      pc.onicecandidate = onIceCandidate;
      pc.ontrack = onTrack;
      const localStream = localVideoRef.current.srcObject;
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
      console.log("PeerConnection created");
    } catch (error) {
      console.error("PeerConnection failed: ", error);
    }
  };

  const setAndSendLocalDescription = (sessionDescription) => {
    pc.setLocalDescription(sessionDescription);
    console.log("Local description set");
    sendData(sessionDescription);
  };

  const sendOffer = () => {
    console.log("Sending offer");
    pc.createOffer().then(setAndSendLocalDescription, (error) => {
      console.error("Send offer failed: ", error);
    });
  };

  const sendAnswer = () => {
    console.log("Sending answer");
    pc.createAnswer().then(setAndSendLocalDescription, (error) => {
      console.error("Send answer failed: ", error);
    });
  };

  const signalingDataHandler = (data) => {
    if (data.type === "offer") {
      createPeerConnection();
      pc.setRemoteDescription(new RTCSessionDescription(data));
      sendAnswer();
    } else if (data.type === "answer") {
      pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === "candidate") {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
      console.log("Unknown Data");
    }
  };

  socket.on("ready", () => {
    console.log("Ready to Connect!");
    createPeerConnection();
    sendOffer();
  });

  socket.on("data", (data) => {
    console.log("Data received: ", data);
    signalingDataHandler(data);
  });

  useEffect(() => {
    startConnection();
    return function cleanup() {
      pc?.close();
    };
  }, [isConnected]);

  return (
    <>
      {isConnected ? (
        <Card 
        actions={[<EndMeeting onEndMeetingClick={onEndMeetingClick}></EndMeeting>]}
        bodyStyle={{margin:0, padding:0}}
        >

        
        <video autoPlay muted playsInline ref={localVideoRef} width={'100%'} style={{ borderRadius:10}}/>
        
        </Card>
      ) : (
        <JoinMeeting onJoinMeetingClick={onJoinMeetingClick}></JoinMeeting>
      )}

      <video autoPlay muted playsInline ref={remoteVideoRef} />
    </>
  );
}

export default CallScreen;
