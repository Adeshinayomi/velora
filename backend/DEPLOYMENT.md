# Backend deployment

Deploy the `backend` directory as a Node.js service. Use Node.js 20 or newer.

## Build and run

```sh
npm ci
npm run build
npm start
```

The service listens on `0.0.0.0` and uses the platform-provided `PORT` (5000 locally).
The health check is `GET /`.

## Runtime environment

Copy `.env.example` as a reference; set values in the hosting provider's secret
or environment-variable settings. Do not deploy a real `.env` file.

- `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters are required.
- `FRONTEND_URLS` must contain the exact origins of the deployed web app,
  comma-separated, including `https://` and any custom domains. Do not include
  paths or trailing slashes. Local development defaults to `localhost:3000`.
- Set `NODE_ENV=production` in the host.
- Production uses the host's DNS by default. Set `DNS_SERVERS` only if that
  platform requires custom DNS resolvers; local development defaults to
  `8.8.8.8,1.1.1.1` for MongoDB Atlas SRV lookup.
- Configure `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL` for checkout.
  Register `POST https://<backend-domain>/api/orders/paystack/webhook` in Paystack.
- Configure all three Cloudinary values for admin product image uploads.
- Set `SHIPPING_FEE` and `CURRENCY` to the values used by the store and Paystack.

Set the frontend's `NEXT_PUBLIC_API_URL` to the deployed backend origin (no API
path suffix). The backend uses secure cross-site cookies in production, so the
frontend must send requests with credentials enabled and be served over HTTPS.

MongoDB must be reachable from the service's network. Payment fulfillment uses
MongoDB transactions, so use a replica set deployment (MongoDB Atlas provides
this by default).
