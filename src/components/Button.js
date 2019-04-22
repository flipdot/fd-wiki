import styled from 'styled-components';

const Button = styled.div`
  background: ${props => props.primary ? '#F5C600' : '#eee'};
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.9em;
  cursor: pointer;

  &:hover {
    background: #FED93E;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;

  > *:not(:last-child) {
    margin-right: 5px;
  }

  & + & {
    margin-left: 20px;
  }
`;

export default Button;
