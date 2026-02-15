import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Copy these into .env.local and your Vercel project env vars:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:you@example.com");
