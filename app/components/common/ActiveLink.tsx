import { withRouter } from 'next/router';
import Link from 'next/link';
import Avatar from '@material-ui/core/Avatar';
import { observer, inject } from 'mobx-react';

const ActiveLink = ({ linkText, router, href, as, teamLogo, simple, highlighterSlug, store }) => {
  const style1 = {
    display: 'inline',
    fontWeight: 300,
    fontSize: '14px',
  };

  const style2 = {
    display: 'inline',
    fontWeight: store.currentUrl.includes(highlighterSlug) ? 600 : 300,
    fontSize: '14px',
  };

  const handleClick = e => {
    e.preventDefault();
    router.push(href, as);
  };

  // TODO: solve TS warning
  return simple ? (
    <Link prefetch href={href} as={as}>
      <a onClick={handleClick} style={style1}>
        {linkText}
      </a>
    </Link>
  ) : (
    <Link prefetch href={href} as={as}>
      <a onClick={handleClick} style={style2}>
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
  simple?: boolean;
  highlighterSlug?: string;
}>(inject('store')(observer(ActiveLink)));
