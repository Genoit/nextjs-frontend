# Send to TrendED (Chrome extension)

Imports the product page open in the user's browser. Sites like Alibaba block our server
with a robot check; the user's own browser already got past it, so we parse that page
(`POST /api/v1/products/extract-html`) instead of fetching it.

Load it: `chrome://extensions` → Developer mode → Load unpacked → this folder.
Use it: open a product page (solve the captcha if one shows), click the extension icon.
