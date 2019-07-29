import { ServerStyleSheets } from '@material-ui/styles';
import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';

import { GA_TRACKING_ID } from '../lib/consts';

class MyDocument extends Document {
  public static getInitialProps = async ctx => {
    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: (
        <React.Fragment>
          {sheets.getStyleElement()}
        </React.Fragment>
      ),
    };
  };

  public render() {
    const isThemeDark =
      this.props.__NEXT_DATA__.props.initialState.user &&
      this.props.__NEXT_DATA__.props.initialState.user.darkTheme;

    return (
      <html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content="#303030" />

          <link
            rel="shortcut icon"
            href="https://storage.googleapis.com/async-await/async-favicon32.png"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400:latin"
          />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link
            rel="stylesheet"
            href={
              isThemeDark
                ? 'https://storage.googleapis.com/async-await/nprogress-light.min.css?v=1'
                : 'https://storage.googleapis.com/async-await/nprogress-dark.min.css?v=1'
            }
          />
          <link rel="stylesheet" href="https://storage.googleapis.com/async-await/vs2015.min.css" />

          <style>
            {`
              a,
              a:focus {
                font-weight: 400;
                color: ${isThemeDark ? '#fff' : '#000'};
                text-decoration: none;
                outline: none;
              }
              a:hover,
              button:hover {
                opacity: 0.75;
                cursor: pointer;
              }
              hr {
                border: 0.5px #707070 solid;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              blockquote {
                padding: 0 0.5em;
                margin: 20px 1em;
                border-left: 0.25em solid #dfe2e5;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              pre {
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                border: 1px solid #ddd;
                font-size: 14px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              pre code {
                font-size: 13px;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                padding: 0px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              code {
                font-size: 13px;
                background: ${isThemeDark ? '#303030' : '#d0d0d0'};
                padding: 3px 5px;
                color: ${isThemeDark ? '#fff' : '#000'};
              }
              mark {
                background-color: #ffff0060;
              }
              summary:focus {
                outline: none;
              }
              table {
                border-collapse: collapse;
                margin: 15px 0px;
              }
              table, th, td {
                border: 1px solid #a1a1a1;
              }
              th, td {
                line-height: 1.5em;
                padding: 10px;
              }
            `}
          </style>
          {this.gtag()}
        </Head>
        <body
          style={{
            font: '15px Roboto',
            color: isThemeDark ? '#fff' : '#000',
            fontWeight: 300,
            lineHeight: '1.5em',
            padding: '0px 0px 0px 0px !important',
            letterSpacing: '0.01em',
          }}
        >
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }

  private gtag() {
    if (!GA_TRACKING_ID) {
      return;
    }

    return (
      <div>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
        <script
          /* eslint-disable-next-line react/no-danger */
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){
                  dataLayer.push(arguments);
                }
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
              `,
          }}
        />
      </div>
    );
  }
}

export default MyDocument;
