import React, { useEffect } from "react";
import JoinMeeting from "./JoinMeeting";
import EndMeeting from "./EndMeeting";
import { Card } from "antd";

export default function WebRTC({
    isConnected,
    onJoinMeetingClick,
    onEndMeetingClick,
    ...props
}) {


    useEffect(() => {
        if (isConnected) {
            playVideoFromCamera()
        }
    }, [isConnected])

    async function playVideoFromCamera() {
        try {
            const constraints = { 'video': true, 'audio': false };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const videoElement = document.querySelector('video#localVideo');
            videoElement.srcObject = stream;
        } catch (error) {
            console.error('Error opening video camera.', error);
        }
    }


    return (
        <>
            {isConnected ? (
                <>
                    <Card
                        actions={[
                            <EndMeeting onEndMeetingClick={onEndMeetingClick}></EndMeeting>,
                        ]}
                    >
                        <video id="localVideo" autoplay playsinline controls="false" width={400}/>
                    </Card>
                </>
            ) : (
                <JoinMeeting onJoinMeetingClick={onJoinMeetingClick}></JoinMeeting>
            )}
        </>
    );
}
