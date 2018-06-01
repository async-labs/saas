import { withRouter } from 'next/router';
import Link from 'next/link';
import Avatar from '@material-ui/core/Avatar';

const ActiveLink = ({ linkText, router, href, as, teamLogo }) => {
  const style = {
    display: 'inline',
    fontWeight: router.asPath.includes(as) ? 600 : 300,
    fontSize: '14px'
  };

  const handleClick = e => {
    e.preventDefault();
    router.push(href, as);
  };

  // TODO: solve TS warning
  return (
    <Link prefetch href={href} as={as}>
      <a onClick={handleClick} style={style}>
        {teamLogo ? (
          <Avatar
            src={`${teamLogo || 'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
            alt="Team logo"
            style={{
              margin: '0px 10px 0px 0px',
              cursor: 'pointer',
              display: 'inline-flex',
              height: '32px',
              width: '32px',
              verticalAlign: 'middle',
            }}
          />
        ) : null}
        {linkText}
      </a>
    </Link>
  );
};

export default withRouter<{
  linkText?: string;
  href?: string;
  as?: string;
  teamLogo?: string;
}>(ActiveLink);
