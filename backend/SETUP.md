# Connecting the AI to the RBI Explainer

Until you do this, the page runs in **demo mode**, and only the 3 example headlines work.
It takes about 10 minutes and doesn't need any software installed.

## 1. Get an Anthropic API key
1. Go to https://console.anthropic.com and sign up.
2. Add a small amount of credit under **Billing**. Each explanation costs roughly ₹2–4.
3. Go to **API Keys**, then **Create Key**, and copy it. It starts with `sk-ant-`.
   Keep it secret: never put it in the website files.

## 2. Create the Cloudflare Worker (free)
1. Sign up at https://dash.cloudflare.com.
2. Go to **Workers & Pages** → **Create** → **Create Worker**. Name it `moneylab-explainer` and click **Deploy**.
3. Click **Edit code**. Delete everything in the editor, paste in all of `backend/worker.js`, and click **Deploy**.

## 3. Add the key to the Worker
1. Open the Worker → **Settings** → **Variables and Secrets** → **Add**.
2. Type: **Secret**, Name: `ANTHROPIC_API_KEY`, Value: your key. Click **Deploy**.
3. (Optional, once the site is online) Add a **Text** variable `ALLOWED_ORIGIN` set to your site's address, e.g. `https://moneylab.in`. Then only your site can use the Worker.

## 4. Connect the website
1. Copy the Worker's URL, e.g. `https://moneylab-explainer.yourname.workers.dev`.
2. Open `js/config.js` and paste it between the quotes:
   ```js
   const EXPLAINER_API_URL = "https://moneylab-explainer.yourname.workers.dev";
   ```
3. Refresh `rbi-explainer.html`. The demo-mode note disappears, and any pasted headline now works.

## Good to know
- Model: Claude Opus 5.5 (`MODEL` at the top of `worker.js`).
- If Claude declines a request, the API automatically retries it on a fallback model (the `fallbacks: "default"` setting).
- Anyone who finds the Worker URL can use your credit. Set `ALLOWED_ORIGIN`, and you can set a monthly spend limit in the Anthropic console.
