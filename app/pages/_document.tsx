import React from 'react';
import JssProvider from 'react-jss/lib/JssProvider';
import Document, { Head, Main, NextScript } from 'next/document';
import htmlescape from 'htmlescape';

import getContext from '../lib/context';

const { GA_TRACKING_ID, StripePublishableKey } = process.env;
const env = { GA_TRACKING_ID, StripePublishableKey };
// console.log(GA_TRACKING_ID);

class MyDocument extends Document {
  render() {
    return (
      <html lang="en" style={{ height: '100%', overflowY: 'scroll' }}>
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
              div#__next {
                height: 100% !important;
              }
              a, a:focus {
                font-weight: 600;
                color: #fff;
                text-decoration: none;
                outline: none
              }
              a:hover, button:hover {
                opacity: 0.75;
                cursor: pointer
              }
              ul {
                list-style: none;
                padding: 0px;
              }
              hr {
                border: 0.5px #aaa solid;
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
                font-size: 14px;
                background: #303030;
                color: #fff;
              }
              mark {
                background-color: #ffff0060;
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
            font: '16px Muli',
            color: '#fff',
            margin: '0px auto',
            fontWeight: 300,
            lineHeight: '1.5em',
            height: '100%',
            overflowY: 'scroll',
            right: '-15px',
            left: 0,
            position: 'absolute',
            overflow: 'auto !important'
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
