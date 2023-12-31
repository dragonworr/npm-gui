import type { VFC } from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const InfoWrapper = styled.div`
  min-height: 45px;
  max-height: 45px;
  background: #3e3f3a;
  padding: 5px 15px;
`;

export const Info: VFC = () => {
  const [content, setContent] = useState('');

  const load = async (): Promise<void> => {
    const response = await fetch(
      `/api/info/${window.localStorage.getItem('npm-gui-id')}`,
    );
    setContent(await response.text());
    // Tricky one
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://buttons.github.io/buttons.js';
      document.head.append(script);
    });
  };

  useEffect(() => {
    if (window.localStorage.getItem('npm-gui-id') !== 'developer') {
      load();
    }
  }, []);

  if (!content) {
    return null;
  }

  return (
    <InfoWrapper>
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __html: content,
        }}
      />
    </InfoWrapper>
  );
};
