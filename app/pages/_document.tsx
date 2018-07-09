import React from 'react';
import JssProvider from 'react-jss/lib/JssProvider';
import Document, { Head, Main, NextScript } from 'next/document';
import htmlescape from 'htmlescape';

import getContext from '../lib/context';

const {
  GA_TRACKING_ID,
  PRODUCTION_URL_APP,
  PRODUCTION_URL_API,
  StripePublishableKey,
} = process.env;
const env = { GA_TRACKING_ID, PRODUCTION_URL_APP, PRODUCTION_URL_API, StripePublishableKey };

class MyDocument extends Document {
  render() {
    return (
      <html lang="en" >
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
            href="https://fonts.googleapis.com/css?family=Muli:300,400:latin"
          />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link
            rel="stylesheet"
            href="https://storage.googleapis.com/async-await/nprogress.min.css?v=1"
          />
          <link rel="stylesheet" href="https://storage.googleapis.com/async-await/vs2015.min.css" />

          <style>
            {`
              #__next {
                width: 100%;
                height: 100%;
              }
              a,
              a:focus {
                font-weight: 600;
                color: #fff;
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
              }
              blockquote {
                padding: 0 0.5em;
                margin: 20px 1em;
                color: #fff;
                border-left: 0.25em solid #dfe2e5;
              }
              pre {
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                background: #303030;
                color: #fff;
                border: 1px solid #ddd;
                font-size: 14px;
              }
              code {
                font-size: 13px;
                background: #303030;
                color: #fff;
                padding: 3px 5px;
              }
              mark {
                background-color: #ffff0060;
              }

              .lazy-load-image-body .image-placeholder {
                background-color: #ddd;
                display: flex;
                margin-bottom: 10px;
                width: 100%;
              }
              .lazy-load-image-body .image-placeholder-text {
                color: #111;
                font-weight: 400;
                align-self: center;
                text-align: center;
                width: 100%;
                overflow: hidden;
              }
              summary:focus {
                outline: none;
              }
            `}
          </style>
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
        </Head>
        <body
          style={{
            font: '15px Muli',
            color: '#fff',
            fontWeight: 300,
            lineHeight: '1.5em',
            padding: '0px 0px 0px 0px !important',
          }}
        >
          <Main />
          {/* eslint-disable-next-line react/no-danger */}
          <script dangerouslySetInnerHTML={{ __html: `__ENV__ = ${htmlescape(env)}` }} />
          <NextScript />
        </body>
      </html>
    );
  }
}

MyDocument.getInitialProps = ({ renderPage }) => {
  const pageContext = getContext();
  const page = renderPage(Component => props => (
    <JssProvider
      registry={pageContext.sheetsRegistry}
      generateClassName={pageContext.generateClassName}
    >
      <Component pageContext={pageContext} {...props} />
    </JssProvider>
  ));

  return {
    ...page,
    pageContext,
    styles: (
      <style
        id="jss-server-side"
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: pageContext.sheetsRegistry.toString() }}
      />
    ),
  };
};

export default MyDocument;
