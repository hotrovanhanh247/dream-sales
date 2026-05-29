#!/usr/bin/env node
/**
 * Add a domain to Firebase Auth "authorized domains" so Google sign-in popups
 * work on the deployed site. Uses the Identity Toolkit Admin v2 config API.
 *
 *   node scripts/add-auth-domain.cjs dream-sales.vercel.app [more.domains]
 */
const os = require('os');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT = process.env.PROJECT || 'dream-sales-318e8';
const KEY = process.env.KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(os.homedir(), 'Secrets/dream-sales/dream-sales-318e8-firebase-adminsdk-fbsvc-e74d4a1972.json');
const ADD = process.argv.slice(2).filter(Boolean);

const CONFIG = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`;

async function main() {
  if (ADD.length === 0) { console.error('Usage: add-auth-domain.cjs <domain> [...]'); process.exit(1); }
  const auth = new GoogleAuth({ keyFile: KEY, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const token = (await (await auth.getClient()).getAccessToken()).token;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const getRes = await fetch(CONFIG, { headers });
  const cfg = await getRes.json();
  if (!getRes.ok) throw new Error(`GET config ${getRes.status}: ${JSON.stringify(cfg)}`);
  const current = cfg.authorizedDomains || [];
  const merged = Array.from(new Set([...current, ...ADD]));
  if (merged.length === current.length) {
    console.log('Already authorized:', current.join(', '));
    return;
  }

  const patchRes = await fetch(`${CONFIG}?updateMask=authorizedDomains`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ authorizedDomains: merged }),
  });
  const patched = await patchRes.json();
  if (!patchRes.ok) throw new Error(`PATCH config ${patchRes.status}: ${JSON.stringify(patched)}`);
  console.log('Authorized domains now:', (patched.authorizedDomains || merged).join(', '));
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
