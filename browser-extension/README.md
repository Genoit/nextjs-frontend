# Send to TrendED (Chrome extension)

Imports the product page open in the user's browser. Sites like Alibaba block our server
with a robot check; the user's own browser already got past it, so we parse that page
(`POST /api/v1/products/extract-html`) instead of fetching it.

Load it in Firefox: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" →
pick `manifest.json` here (removed when Firefox restarts; a permanent install needs signing on AMO).
Load it in Chrome: `chrome://extensions` → Developer mode → Load unpacked → this folder.
`web-ext lint` warns that Firefox ignores `background.service_worker`: Chrome needs it, keep it.
Use it: open a product page (solve the captcha if one shows), click the extension icon.
