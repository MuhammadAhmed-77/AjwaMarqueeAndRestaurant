# Ajwa Garden Restaurant & Marriage Hall — Website

## What is included
- Responsive restaurant website
- Ajwa Garden logo from the supplied image
- Menu transcribed from the two supplied menu images
- Search + category filters
- Cart with quantity controls and localStorage persistence
- Checkout form
- WhatsApp order-message generation
- Phone buttons
- Facebook page link
- Marriage hall section
- Sahiwal address from the menu: By Pass, Multan Road, Sahiwal

## IMPORTANT: WhatsApp number
The menu image contains three phone numbers:
- 0306-0153333
- 0306-0183333
- 0306-0193333

The site currently uses 0306-0153333 as the WhatsApp destination. If the restaurant confirms a different WhatsApp number, edit `src/config.js` and change only `whatsappNumber`.

## Run locally — easiest method
No Node.js or npm is required.

Open Command Prompt / PowerShell in this project folder and run:

    python -m http.server 5500

Then open:

    http://localhost:5500

Keep the terminal window open while testing. Press Ctrl+C to stop the local server.

## Alternative
If you prefer VS Code, install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

## Deploy to GitHub + Vercel
1. Create a GitHub repository, e.g. `ajwa-garden-website`.
2. Upload this project (the `src` folder, `public` folder, package files, etc.).
3. On Vercel, import the GitHub repository.
4. Vercel detects Vite automatically.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy.

Vercel gives you a free `*.vercel.app` URL.

## Files
- `config.js` — restaurant phone/WhatsApp/Facebook configuration
- `menu.js` — menu data
- `assets/ajwa-logo.jpg` — supplied logo
- `assets/menu-1.jpg` and `assets/menu-2.jpg` — supplied menu images

## Note
Prices and names were transcribed from the supplied menu images. Before going live, compare the website menu against the original menu and confirm the WhatsApp number with the restaurant.
