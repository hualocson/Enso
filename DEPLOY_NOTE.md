# Deployment Progress

## Client (Cloudflare Pages)

Deploy the frontend to **Cloudflare Pages**.

### Build Settings

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Root directory    | `client`                       |
| Build command     | `npm install && npm run build` |
| Production deploy | `npx wrangler deploy`          |
| Preview deploy    | `npx wrangler versions upload` |

### Notes

* Ensure the `client/` directory contains a valid `wrangler.jsonc` configuration file before deploying.

---

## Server (Render)

Deploy the backend to **Render**.

### MongoDB Access

After creating the Render service:

1. Open your MongoDB Atlas project.
2. Navigate to **Security → Network Access**.
3. In Render, open your service and click **Connect** to view Render's outbound IP addresses.
4. Add those IP addresses to your MongoDB Atlas **Network Access List** (IP whitelist).
5. Wait for Atlas to apply the changes, then redeploy or restart the Render service if necessary.

---

## Deployment Checklist

* [ ] Client deployed successfully to Cloudflare Pages.
* [ ] `wrangler.jsonc` configured correctly.
* [ ] Server deployed successfully to Render.
* [ ] Render IP addresses added to MongoDB Atlas Network Access.
* [ ] Backend can connect to MongoDB.
* [ ] Frontend is connected to the deployed backend API.
