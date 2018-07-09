const Loading = ({ text }) => {
  if (process.env.NODE_ENV === 'production') {
    return <p style={{ height: '1.0em' }} />;
  }

  return <p style={{ height: '1.0em' }}>{text}</p>;
};

export default Loading;
