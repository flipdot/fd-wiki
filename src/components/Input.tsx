import React from 'react';
import styled, { css } from 'styled-components';

const Input = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  margin-bottom: 16px;
`;

const InnerLabel = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 4px;
`;

type InputGroupProps = {
  label: string;
  children: React.ReactChild;
};

export function InputGroup({ label, children }: InputGroupProps) {
  return (
    <label>
      <InnerLabel>{label}</InnerLabel>
      {children}
    </label>
  )
}

export default Input;
