import { IS_DEV } from '../../lib/consts';

const Loading = ({ text }) => {
  if (IS_DEV) {
    return <p style={{ height: '1.0em' }} />;
  }

  return <p style={{ height: '1.0em' }}>{text}</p>;
};

export default Loading;
