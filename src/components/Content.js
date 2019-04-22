import React from "react";
import styled from "styled-components";

const Content = styled.div`
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 24px;

  h1:not(:first-child),
  h2:not(:first-child),
  h3:not(:first-child),
  h4:not(:first-child) {
    margin-top: 1.5em;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: "ISOCPEUR";
    padding-bottom: 0.5em;
  }

  p {
    margin: 0 0 16px;
  }

  pre {
    background: #f2f5f7;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 4px;

    code {
      padding: 0;
    }
  }

  code {
    font-family: Monaco;
    font-size: 0.9em;
    background: #f2f5f7;
    padding: 2px 4px;
    border-radius: 4px;
  }

  ul,
  ol {
    padding-left: 16px;
  }

  li {
    > p {
      margin-bottom: 0;
    }
  }
`;

export default Content;
