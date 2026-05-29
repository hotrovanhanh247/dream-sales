#!/usr/bin/env node
/**
 * Deploy firestore.rules via the Firebase Security Rules REST API, using the
 * Admin SDK service account directly. This avoids the firebase CLI's
 * serviceusage precheck (which the default SA lacks permission for).
 *
 *   GOOGLE_APPLICATION_CREDENTIALS or KEY env -> service account json
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT = process.env.PROJECT || 'dream-sales-318e8';
const KEY = process.env.KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(os.homedir(), 'Secrets/dream-sales/dream-sales-318e8-firebase-adminsdk-fbsvc-e74d4a1972.json');
const RULES_FILE = process.env.RULES_FILE || path.join(__dirname, '..', 'firestore.rules');

const BASE = `https://firebaserules.googleapis.com/v1/projects/${PROJECT}`;
const RELEASE = `projects/${PROJECT}/releases/cloud.firestore`;

async function main() {
  const auth = new GoogleAuth({ keyFile: KEY, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const token = (await (await auth.getClient()).getAccessToken()).token;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const source = fs.readFileSync(RULES_FILE, 'utf8');

  // 1. Create ruleset
  const rsRes = await fetch(`${BASE}/rulesets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: source }] } }),
  });
  const rsBody = await rsRes.json();
  if (!rsRes.ok) throw new Error(`ruleset create ${rsRes.status}: ${JSON.stringify(rsBody)}`);
  const rulesetName = rsBody.name;
  console.log('Created ruleset:', rulesetName);

  // 2. Point the cloud.firestore release at it (create, else update)
  let relRes = await fetch(`${BASE}/releases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: RELEASE, rulesetName }),
  });
  if (relRes.status === 409) {
    relRes = await fetch(`${BASE}/releases/cloud.firestore`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ release: { name: RELEASE, rulesetName } }),
    });
  }
  const relBody = await relRes.json();
  if (!relRes.ok) throw new Error(`release update ${relRes.status}: ${JSON.stringify(relBody)}`);
  console.log('Released to cloud.firestore:', relBody.rulesetName || rulesetName);
  console.log('Firestore rules deployed.');
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
