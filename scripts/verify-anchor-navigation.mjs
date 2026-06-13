import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = resolve(new URL('..', import.meta.url).pathname);
const enhanceJs = await readFile(resolve(root, 'assets/enhance/preview-enhance.js'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

const encodedAnchor = encodeURIComponent('需求概述');
await page.setContent(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <base href="file:///tmp/md-preview-anchor-fixture/">
    <style>
      body { margin: 0; font: 16px system-ui, sans-serif; }
      #preview { padding: 24px; }
      .spacer { height: 1400px; }
      h2 { margin: 0; padding-top: 12px; }
    </style>
  </head>
  <body>
    <div id="preview">
      <ol>
        <li><a id="toc-link" href="#${encodedAnchor}">需求概述</a></li>
      </ol>
      <blockquote id="server-alert" class="markdown-alert-important">
        <p>Desktop alert body</p>
      </blockquote>
      <blockquote id="client-alert">
        <p>[!WARNING]<br>Client alert body</p>
      </blockquote>
      <div class="spacer"></div>
      <h2 id="需求概述">需求概述</h2>
      <div class="spacer"></div>
    </div>
    <script>window.__mdPreviewFeatureFlags = { math: false, mermaid: false };</script>
    <script>${enhanceJs}</script>
    <script>window.__enhancePreview();</script>
  </body>
</html>`);

await page.click('#toc-link');
await page.waitForFunction(() => window.scrollY > 700);

const result = await page.evaluate(() => ({
  scrollY: window.scrollY,
  href: window.location.href,
  top: document.getElementById('需求概述').getBoundingClientRect().top,
  serverAlertTitle: document.querySelector('#server-alert .markdown-alert-title')?.textContent.trim(),
  serverAlertBody: document.querySelector('#server-alert p:not(.markdown-alert-title)')?.textContent.trim(),
  clientAlertTitle: document.querySelector('#client-alert .markdown-alert-title')?.textContent.trim(),
  clientAlertBody: document.querySelector('#client-alert p:not(.markdown-alert-title)')?.textContent.trim(),
}));

await browser.close();

if (result.href.startsWith('file:///tmp/md-preview-anchor-fixture/')) {
  throw new Error(`anchor click followed base href instead of staying in page: ${result.href}`);
}

if (Math.abs(result.top) > 24) {
  throw new Error(`anchor target was not scrolled into view: top=${result.top}, scrollY=${result.scrollY}`);
}

if (result.serverAlertTitle !== 'Important' ||
    result.serverAlertBody !== 'Desktop alert body' ||
    result.clientAlertTitle !== 'Warning' ||
    result.clientAlertBody !== 'Client alert body') {
  throw new Error(`alert enhancement failed: ${JSON.stringify(result)}`);
}

console.log('[anchor-verify] OK');
