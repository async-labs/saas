import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';

class MyDocument extends Document {
  public static getInitialProps = async (ctx) => {
    // Render app and page and get the context of the page with collected side effects.
    const originalRenderPage = ctx.renderPage;

    // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
    // However, be aware that it can have global side effects.
    const cache = createCache({ key: 'css' });
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        // eslint-disable-next-line react/display-name
        enhanceApp: (App) => (props) => <App emotionCache={cache} {...props} />,
      });

    const initialProps = await Document.getInitialProps(ctx);
    // This is important. It prevents emotion to render invalid HTML.
    // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
    };
  };

  public render() {
    // console.log('MyDocument.render');

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
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
            }}
          />
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
