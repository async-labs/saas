import { inject, observer } from 'mobx-react';
import Link from 'next/link';

import { Store } from '../../lib/store';

const ActiveLink = ({
  linkText,
  href,
  as,
  hasIcon,
  highlighterSlug,
  store,
}: {
  store?: Store;
  linkText: string;
  href: string;
  as: string;
  hasIcon: boolean;
  highlighterSlug: string;
}) => {
  const selectedElement = store.currentUrl.includes(highlighterSlug);

  const styleAnchor = {
    fontWeight: 400,
    fontSize: '14px',
  };

  const styleAnchorSelectedWithIcon = {
    fontWeight: 400,
    fontSize: '14px',
    position: 'relative',
    left: '-14px',
  };

  const trimmingLength = 20;

  // TODO: solve TS warning
  return (
    <Link href={href} as={as}>
      <a
        // onClick={handleClick}
        style={hasIcon && selectedElement ? styleAnchorSelectedWithIcon : styleAnchor}
      >
        {hasIcon && selectedElement ? (
          <i
            className="material-icons"
            color="action"
            style={{
              fontSize: 14,
              verticalAlign: 'text-bottom',
            }}
          >
            arrow_right
          </i>
        ) : null}
        {linkText.length > trimmingLength
          ? `${linkText.substring(0, trimmingLength)}...`
          : linkText}
      </a>
    </Link>
  );
};

export default inject('store')(observer(ActiveLink));
