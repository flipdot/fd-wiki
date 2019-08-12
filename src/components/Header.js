import React, { Component } from 'react';
import styled from 'styled-components';
import { isLoggedIn, initiateLogin, getUserData } from '../api';

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 300px;
  right: 0;
  height: 40px;

  display: flex;
  background: #fff;
  z-index: 50;
  padding: 5px 10px 5px 15px;
  align-items: center;
`;

const LoginButton = styled.button``;

class Fetcher extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: undefined,
      fetched: false,
    };

    this.props.request().then(result => {
      this.setState({
        fetched: true,
        result,
      });
    });
  }

  render() {
    const { fetched, result } = this.state;
    if (!fetched) {
      return null;
    }

    return this.props.children(result);
  }
}

const Avatar = styled.img`
  height: 30px;
  border-radius: 15px;
`;

const UserInfo = styled.div`
  display: flex;
`;

const BreadCrumbs = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9em;
  margin-right: auto;
`;

const PathComponent = styled.div`
  &:not(:first-child):before {
    content: '/';
    opacity: 0.4;
    padding: 0 5px;
  }
`;

const Actions = styled.div`
  margin-right: 40px;
  display: flex;
`;

const Header = ({ page, actions = null }) => (
  <HeaderWrapper>
    <BreadCrumbs>{page.split('/').filter(component => !!component).map(component => <PathComponent>{component}</PathComponent>)}</BreadCrumbs>
    <Actions>{actions}</Actions>
    {isLoggedIn() ? (
      <Fetcher request={getUserData}>{userData => (<UserInfo><Avatar src={userData.avatar_url}/></UserInfo>)}</Fetcher>
    ) : (
      <LoginButton type="button" onClick={initiateLogin}>
        Login
      </LoginButton>
    )}
  </HeaderWrapper>
);

export default Header;
