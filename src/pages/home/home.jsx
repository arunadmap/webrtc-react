import { Col, Row, Card, Button } from "antd";
import WebRTC from "./webrtc/webrtc";
const Home = ({ children, isConnected, onJoinMeetingClick,onEndMeetingClick, ...props }) => (
  <>
    <Row>
      <Col span={24}>
        <Card>{children}</Card>
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <Card
          bodyStyle={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 400,
          }}
          title={<Button></Button>}
          style={{ height: "100%" }}
        >
          <WebRTC
            isConnected={isConnected}
            onJoinMeetingClick={onJoinMeetingClick}
            onEndMeetingClick={onEndMeetingClick}
          ></WebRTC>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          bodyStyle={{ height: 400 }}
          title={<Button></Button>}
          actions={[<Button>Back</Button>, <Button>Next</Button>]}
        ></Card>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Card></Card>
      </Col>
    </Row>
  </>
);
export default Home;
