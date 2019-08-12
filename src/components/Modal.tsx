import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

type Props = {
  title: string;
  children?: React.ReactNode;
};

function Modal({ title, children }: Props) {
  const divRef = React.useRef(document.createElement('div'));

  useEffect(() => {
    window.document.body.appendChild(divRef.current);
  }, []);

  return ReactDOM.createPortal(
    <Dim>
      <ModalDialog>
        <ModalTitle>{title}</ModalTitle>
        <ModalBody>{children}</ModalBody>
      </ModalDialog>
    </Dim>,
    divRef.current,
  );
}

const ModalDialog = styled.div`
  max-width: 540px;
  margin: 50px auto;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
`;

const ModalBody = styled.div``;

const Dim = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
`;

export default Modal;
