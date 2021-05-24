import { ServerStyleSheets } from '@material-ui/styles';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  public static getInitialProps = async (ctx) => {
    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
  };

  public render() {
    // console.log('rendered on the server');

    const isThemeDark = this.props.__NEXT_DATA__.props.initialState.user
      ? this.props.__NEXT_DATA__.props.initialState.user.darkTheme
      : true;

    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content="#303030" />

          <link
            rel="shortcut icon"
            href="https://storage.googleapis.com/async-await/async-favicon32.png"
          />

          <link
            rel="prefetch"
            href="/fonts/IBM-Plex-Mono/IBMPlexMono-Regular.woff2"
            as="font"
            crossOrigin="anonymous"
            type="font/woff2"
          />
          <link
            rel="prefetch"
            href="/fonts/IBM-Plex-Mono/IBMPlexMono-Bold.woff2"
            as="font"
            crossOrigin="anonymous"
            type="font/woff2"
          />

          <link
            rel="stylesheet"
            href={
              isThemeDark
                ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.1/styles/a11y-dark.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.1/styles/a11y-light.min.css'
            }
          />

          <style>
            {`
              a {
                font-weight: 400;
                color: #58a6ff;
                text-decoration: none;
                outline: none;
              }
              hr {
                border: 0.5px #707070 solid;
                color: #000;
              }
              blockquote {
                padding: 0 0.5em;
                margin: 20px 1em;
                border-left: 0.25em solid #dfe2e5;
                color: #000;
              }
              pre {
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                background: #d0d0d0;
                border: 1px solid #ddd;
                font-size: 14px;
                color: #000;
              }
              pre code {
                font-size: 13px;
                background: #d0d0d0;
                padding: 0px;
                color: #000;
              }
              code {
                font-size: 13px;
                background: #d0d0d0;
                padding: 3px 5px;
                color: #000;
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
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_MEASUREMENT_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
            }}
          />
        </Head>
        <body
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            padding: '0px 0px 0px 0px !important',
            color: isThemeDark ? '#c9d1d9' : '#222',
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
