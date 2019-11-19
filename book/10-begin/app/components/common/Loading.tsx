import React from 'react';
import { IS_DEV } from '../../lib/consts';

const Loading = ({ text }: { text: string }) => {
  if (IS_DEV) {
    return <p style={{ height: '1.0em' }} />;
  }

  return <p style={{ height: '1.0em' }}>{text}</p>;
};

export default Loading;
