import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import Link from 'next/link';
import React from 'react';

import MenuWithLinks from '../common/MenuWithLinks';
import Confirmer from '../common/Confirmer';
import Notifier from '../common/Notifier';

import { Store } from '../../lib/store';


const styleGrid = {
  width: '100vw',
  minHeight: '100vh',
  maxWidth: '100%',
  padding: '0px 10px',
};

const styleGridIsMobile = {
  width: '100vw',
  minHeight: '100vh',
  maxWidth: '100%',
  padding: '0px 0px 0px 10px',
};

function LayoutWrapper({
  children,
  isMobile,
  firstGridItem,
  store,
  isThemeDark,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  firstGridItem: boolean;
  store: Store;
  isThemeDark: boolean;
}) {
  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="stretch"
        style={isMobile ? styleGridIsMobile : styleGrid}
      >
        {firstGridItem ? (
          <Grid
            item
            sm={2}
            xs={12}
            style={{
              borderRight: '1px #707070 solid',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="124"
                height="40"
                viewBox="0 0 124 40"
                style={{
                  marginTop: '20px',
                  display: 'inline-flex',
                  height: '40px',
                }}
              >
                <g id="async-logo">
                  <g id="async-logo-40">
                    <circle id="Ellipse 2" cx="20" cy="20" r="20" fill="black" />
                    <path
                      id="path-async-logo"
                      d="M7.07825 -0.0960007V16H4.51825V13.088C4.04892 14.0907 3.33425 14.8693 2.37425 15.424C1.43558 15.9573 0.336917 16.224 -0.92175 16.224C-2.35108 16.224 -3.60975 15.8827 -4.69775 15.2C-5.76442 14.5173 -6.59642 13.5573 -7.19375 12.32C-7.76975 11.0613 -8.05775 9.6 -8.05775 7.936C-8.05775 6.272 -7.75908 4.81067 -7.16175 3.552C-6.56442 2.272 -5.73242 1.28 -4.66575 0.576C-3.57775 -0.128 -2.32975 -0.48 -0.92175 -0.48C0.336917 -0.48 1.43558 -0.202666 2.37425 0.352C3.31292 0.906667 4.02758 1.68533 4.51825 2.688V-0.0960007H7.07825ZM-0.40975 14.08C1.16892 14.08 2.38492 13.5467 3.23825 12.48C4.09158 11.392 4.51825 9.856 4.51825 7.872C4.51825 5.888 4.09158 4.36267 3.23825 3.296C2.38492 2.22933 1.16892 1.696 -0.40975 1.696C-1.98842 1.696 -3.22575 2.25067 -4.12175 3.36C-4.99642 4.448 -5.43375 5.97333 -5.43375 7.936C-5.43375 9.89867 -4.99642 11.4133 -4.12175 12.48C-3.24708 13.5467 -2.00975 14.08 -0.40975 14.08Z"
                      transform="translate(19.5938 12)"
                      fill="white"
                    />
                  </g>
                  <path
                    id="path-async-text"
                    d="M22.6251 11.928V24H20.7051V21.816C20.3531 22.568 19.8171 23.152 19.0971 23.568C18.3931 23.968 17.5691 24.168 16.6251 24.168C15.5531 24.168 14.6091 23.912 13.7931 23.4C12.9931 22.888 12.3691 22.168 11.9211 21.24C11.4891 20.296 11.2731 19.2 11.2731 17.952C11.2731 16.704 11.4971 15.608 11.9451 14.664C12.3931 13.704 13.0171 12.96 13.8171 12.432C14.6331 11.904 15.5691 11.64 16.6251 11.64C17.5691 11.64 18.3931 11.848 19.0971 12.264C19.8011 12.68 20.3371 13.264 20.7051 14.016V11.928H22.6251ZM17.0091 22.56C18.1931 22.56 19.1051 22.16 19.7451 21.36C20.3851 20.544 20.7051 19.392 20.7051 17.904C20.7051 16.416 20.3851 15.272 19.7451 14.472C19.1051 13.672 18.1931 13.272 17.0091 13.272C15.8251 13.272 14.8971 13.688 14.2251 14.52C13.5691 15.336 13.2411 16.48 13.2411 17.952C13.2411 19.424 13.5691 20.56 14.2251 21.36C14.8811 22.16 15.8091 22.56 17.0091 22.56ZM30.4637 24.168C28.4317 24.168 26.8237 23.648 25.6397 22.608L26.2877 21.168C26.9437 21.68 27.6077 22.048 28.2797 22.272C28.9517 22.496 29.7037 22.608 30.5357 22.608C31.4477 22.608 32.1357 22.456 32.5997 22.152C33.0797 21.832 33.3197 21.376 33.3197 20.784C33.3197 20.304 33.1597 19.92 32.8397 19.632C32.5197 19.344 31.9917 19.12 31.2557 18.96L29.2157 18.48C28.2077 18.256 27.4237 17.856 26.8637 17.28C26.3197 16.704 26.0477 16.016 26.0477 15.216C26.0477 14.16 26.4717 13.304 27.3197 12.648C28.1677 11.976 29.2877 11.64 30.6797 11.64C31.5277 11.64 32.3277 11.776 33.0797 12.048C33.8317 12.32 34.4637 12.712 34.9757 13.224L34.3277 14.64C33.1917 13.696 31.9757 13.224 30.6797 13.224C29.8157 13.224 29.1437 13.392 28.6637 13.728C28.1997 14.048 27.9677 14.504 27.9677 15.096C27.9677 15.592 28.1117 15.984 28.3997 16.272C28.7037 16.56 29.1837 16.784 29.8397 16.944L31.8797 17.448C32.9997 17.704 33.8317 18.104 34.3757 18.648C34.9197 19.176 35.1917 19.872 35.1917 20.736C35.1917 21.776 34.7677 22.608 33.9197 23.232C33.0717 23.856 31.9197 24.168 30.4637 24.168ZM48.687 11.928L43.047 25.104C42.455 26.48 41.711 27.488 40.815 28.128C39.919 28.768 38.815 29.208 37.503 29.448L37.095 27.936C38.231 27.68 39.087 27.336 39.663 26.904C40.255 26.488 40.743 25.84 41.127 24.96L41.607 23.88L36.495 11.928H38.535L42.615 21.888L46.743 11.928H48.687ZM56.853 11.64C59.749 11.64 61.197 13.232 61.197 16.416V24H59.253V16.512C59.253 15.392 59.029 14.576 58.581 14.064C58.133 13.536 57.429 13.272 56.469 13.272C55.349 13.272 54.453 13.616 53.781 14.304C53.109 14.992 52.773 15.92 52.773 17.088V24H50.829V15.312C50.829 14.064 50.765 12.936 50.637 11.928H52.485L52.677 14.088C53.045 13.304 53.597 12.704 54.333 12.288C55.069 11.856 55.909 11.64 56.853 11.64ZM69.9321 24.168C68.7641 24.168 67.7401 23.912 66.8601 23.4C65.9961 22.888 65.3241 22.168 64.8441 21.24C64.3801 20.296 64.1481 19.2 64.1481 17.952C64.1481 16.704 64.3881 15.608 64.8681 14.664C65.3481 13.704 66.0281 12.96 66.9081 12.432C67.8041 11.904 68.8441 11.64 70.0281 11.64C70.8441 11.64 71.6281 11.784 72.3801 12.072C73.1481 12.344 73.7801 12.728 74.2761 13.224L73.6281 14.664C73.0201 14.184 72.4281 13.832 71.8521 13.608C71.2921 13.384 70.7161 13.272 70.1241 13.272C68.8921 13.272 67.9241 13.688 67.2201 14.52C66.5161 15.336 66.1641 16.48 66.1641 17.952C66.1641 19.408 66.5081 20.544 67.1961 21.36C67.9001 22.16 68.8761 22.56 70.1241 22.56C70.7161 22.56 71.2921 22.448 71.8521 22.224C72.4281 22 73.0201 21.648 73.6281 21.168L74.2761 22.608C73.7641 23.088 73.1161 23.472 72.3321 23.76C71.5641 24.032 70.7641 24.168 69.9321 24.168Z"
                    transform="translate(39 4)"
                    fill={isThemeDark ? 'white' : 'black'}
                  />
                </g>
              </svg>
              <MenuWithLinks
                options={[
                  {
                    text: 'Team Settings',
                    href: `/team-settings?teamSlug=${store.currentTeam.slug}`,
                    as: `/team/${store.currentTeam.slug}/team-settings`,
                    simple: true,
                  },
                  {
                    text: 'Billing',
                    href: `/billing?teamSlug=${store.currentTeam.slug}`,
                    as: `/team/${store.currentTeam.slug}/billing`,
                    simple: true,
                  },
                  {
                    text: 'Your Settings',
                    href: '/your-settings',
                    highlighterSlug: '/your-settings',
                  },
                  {
                    separator: true,
                  },
                  {
                    text: 'Log out',
                    href: `${process.env.URL_API}/logout`,
                    as: `${process.env.URL_API}/logout`,
                    externalServer: true,
                  },
                ]}
              >
                <Avatar
                  src={'https://storage.googleapis.com/async-await/default-user.png'}
                  alt="Add username here later in the book"
                  style={{
                    margin: '20px auto',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    width: '40px',
                    height: '40px',
                  }}
                />

                <i className="material-icons" color="action" style={{ verticalAlign: 'super' }}>
                  arrow_drop_down
                </i>
              </MenuWithLinks>
            </div>
            <hr />
            <p />
            <p />
          </Grid>
        ) : null}

        {children}
      </Grid>
      <Notifier />
      <Confirmer />
    </React.Fragment>
  );
}

type MyProps = {
  children: React.ReactNode;
  isMobile?: boolean;
  firstGridItem?: boolean;
  store?: Store;
  teamRequired?: boolean;
};

class Layout extends React.Component<MyProps> {
  public render() {
    const { children, isMobile, firstGridItem, store, teamRequired } = this.props;

    const { currentUser, currentTeam } = store;

    const isThemeDark = currentUser && currentUser.darkTheme === true;

    // console.log(this.props.store.currentUser.darkTheme);

    // const isThemeDark = false;

    // console.log(isMobile);

    console.log(firstGridItem);

    if (!currentUser) {
      return (
        <LayoutWrapper firstGridItem={firstGridItem} isMobile={isMobile} isThemeDark={isThemeDark} store={store}>
          <Grid item sm={12} xs={12}>
            {children}
          </Grid>
        </LayoutWrapper>
      );
    }

    if (!currentTeam) {
      if (teamRequired) {
        return (
          <LayoutWrapper firstGridItem={firstGridItem} isMobile={isMobile} isThemeDark={isThemeDark} store={store}>
            <Grid item sm={10} xs={12}>
              <div style={{ padding: '20px' }}>
                Select existing team or create a new team.
                <p />
                <Link href="/create-team" as="/create-team">
                  <Button variant="outlined" color="primary">
                    Create new team
                  </Button>
                </Link>
              </div>
            </Grid>
          </LayoutWrapper>
        );
      } else {
        console.log('team not required');
        return (
          <LayoutWrapper firstGridItem={firstGridItem} isMobile={isMobile} isThemeDark={isThemeDark} store={store}>
            <Grid item sm={10} xs={12}>
              {children}
            </Grid>
          </LayoutWrapper>
        );
      }
    }

    return (
      <LayoutWrapper firstGridItem={firstGridItem} isMobile={isMobile} isThemeDark={isThemeDark} store={store}>
        <Grid item sm={firstGridItem ? 10 : 12} xs={12}>
          <div>
            {isMobile || store.currentUrl.includes('create-team') ? null : (
              <React.Fragment>
                <i
                  style={{
                    float: 'left',
                    margin: '15px 0px 10px 25px',
                    opacity: 0.8,
                    fontSize: '18px',
                    cursor: 'pointer',
                    verticalAlign: 'top',
                  }}
                  className="material-icons"
                  onClick={async () => {
                    await store.currentUser.toggleTheme(!store.currentUser.darkTheme);
                  }}
                >
                  lens
                </i>
              </React.Fragment>
            )}
            <div style={{ clear: 'both' }} />
          </div>
          {children}
        </Grid>
      </LayoutWrapper>
    );
  }
}

export default Layout;
