import React from "react";
import styled from "styled-components";

const Sidebar = styled.div`
  padding: 16px 0 64px 0;
  width: 300px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  background: #fafbfc;
  height: 100%;
  overflow: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
`;

export const Logo = styled.div`
  display: flex;
  padding: 8px;
  line-height: 50px;
  margin-bottom: 16px;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.div`
  margin: 0 16px;
  font-size: 34px;
  padding-top: 10px;
  font-family: "ISOCPEUR";
`;

export const BottomButton = styled.button`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: block;
  border: 0;
  width: 300px;
  text-align: start;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  background: #fafbfc;
  color: #666;
`;

export default Sidebar;
