# Send to TrendED (Chrome extension)

Imports the product page open in the user's browser. Sites like Alibaba block our server
with a robot check; the user's own browser already got past it, so we parse that page
(`POST /api/v1/products/extract-html`) instead of fetching it.

Load it in Firefox: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" →
pick `manifest.json` here (removed when Firefox restarts; a permanent install needs signing on AMO).
Load it in Chrome: `chrome://extensions` → Developer mode → Load unpacked → this folder.
`web-ext lint` warns that Firefox ignores `background.service_worker`: Chrome needs it, keep it.
Use it: open a product page (solve the captcha if one shows), click the extension icon.

## Capture Meta ads

Saves the media of one ad from Meta's Ad Library (EU) as a private capture in TrendED.

1. Install the extension, or reload it on `chrome://extensions` after an update (version 0.2.0 adds the Ad Library permissions).
2. Open the ad in the Meta Ad Library (EU), on its own page: `facebook.com/ads/library/?id=<ad id>`.
3. Click the extension icon. A TrendED tab opens, uploads the images and video, and says when the ad is saved.
4. The capture appears in My captures (`/ads/captures`).

If the icon shows a red `!`, hover it for the reason (no readable ad, or no usable media). Files are JPG, PNG, WebP, MP4 or WebM, 100 MB in total.

## Look into a Shopify store

Shows what a store runs (theme, ad pixels, apps) and what it lists, from the page you have open.

1. Open the store's home page, or its best sellers: `<store>/collections/all?sort_by=best-selling`.
2. Click the extension icon. A TrendED tab opens with the store's tools and the products on the page, in the page's order.
3. Follow the store from there to get its daily changes.

The extension reads only the page you opened. It makes no request to the store. On a product page the click still imports the product.
