import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import App from './App';

export async function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  // Basic head injection — production uses ssrHead.ts for full injection
  const head = `
    <title>Moving Abroad — Your Expat Life Guide</title>
    <meta name="description" content="The practical and psychological guide to moving abroad — the logistics, the culture shock, the identity disruption, and building a real life somewhere new." />
    <link rel="canonical" href="https://expatnewlife.com${url}" />
    <meta property="og:site_name" content="Moving Abroad" />
    <meta property="og:type" content="website" />
  `;

  return { html, head };
}
