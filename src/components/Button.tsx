import styled, { css } from 'styled-components';

const Button = styled.div<{ inline?: boolean; primary?: boolean }>`
  background: ${props => (props.primary ? '#F5C600' : '#eee')};
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.9em;
  cursor: pointer;

  &:hover {
    background: #fed93e;
  }

  ${props => props.inline && css`
    display: inline;
  `}
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
