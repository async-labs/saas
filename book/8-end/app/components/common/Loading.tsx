import React from 'react';

const Loading = ({ text }: { text: string }) => {
  const IS_DEV = process.env.NODE_ENV !== 'production';
  
  if (IS_DEV) {
    return <p style={{ height: '1.0em' }} />;
  }

  return <p style={{ height: '1.0em' }}>{text}</p>;
};

export default Loading;
