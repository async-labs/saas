import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  public static getInitialProps = async ctx => {

    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => <App {...props} />,
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
    };
  };

  public render() {
    return (
      <html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content="#303030" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default MyDocument;
