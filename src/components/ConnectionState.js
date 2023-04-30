import React from 'react';
import { Badge, Space } from 'antd';
export function ConnectionState({ isConnected }) {
  return (<Space>
    <Badge status="success" />
  </Space>);
}