import { Button, Space } from "antd";
const JoinMeeting = ({ onJoinMeetingClick }) => (
  <Space wrap>
    <Button onClick={onJoinMeetingClick}>JOIN MEETING</Button>
  </Space>
);

export default JoinMeeting;
