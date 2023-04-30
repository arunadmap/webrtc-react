import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import { ConnectionState } from "./components/ConnectionState";
import { ConnectionManager } from "./components/ConnectionManager";
import { Events } from "./components/Events";
import { MyForm } from "./components/MyForm";
import Home from "./pages/home/home";
import { Badge, Space, Button } from "antd";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents((previous) => [...previous, value]);
    }

    //socket.on("connect", onConnect);
    //socket.on("disconnect", onDisconnect);
    //socket.on("foo", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onFooEvent);
    };
  }, []);


  function onJoinMeetingClick() {
     socket.on("connect", setIsConnected(true));
  };

  function onEndMeetingClick() {
    socket.off("disconnect", setIsConnected(false));
    };


  return (
    <div className="App">
      <Home
        children={
          <Button>
            {isConnected ? (
              <Badge status="success" />
            ) : (
              <Badge status="default" />
            )}
          </Button>
        }
        isConnected={isConnected}
        onJoinMeetingClick={onJoinMeetingClick}
        onEndMeetingClick={onEndMeetingClick}
      ></Home>
    </div>
  );
}
