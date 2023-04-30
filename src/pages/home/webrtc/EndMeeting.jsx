import { Button } from "antd";
import { BsFillTelephoneXFill } from "react-icons/bs";
const EndMeeting = ({ onEndMeetingClick }) => (
  <Button
    onClick={onEndMeetingClick}
    icon={<BsFillTelephoneXFill></BsFillTelephoneXFill>}
    type="primary"
  ></Button>
);

export default EndMeeting;
