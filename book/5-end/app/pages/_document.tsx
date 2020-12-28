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

    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content="#303030" />

          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400:latin"
          />

          <link
            rel="shortcut icon"
            href="https://storage.googleapis.com/async-await/async-favicon32.png"
          />

          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link rel="stylesheet" href="https://storage.googleapis.com/async-await/vs2015.min.css" />

          <link
            rel="stylesheet"
            href="https://storage.googleapis.com/async-await/nprogress-light.min.css"
          />

          <style>
            {`
              a,
              a:focus {
                font-weight: 600;
                color: #000;
                text-decoration: none;
                outline: none;
              }
              a:hover,
              button:hover {
                opacity: 0.6;
                cursor: pointer;
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
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
