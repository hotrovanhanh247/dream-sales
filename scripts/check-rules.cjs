#!/usr/bin/env node
/** Print the currently-LIVE Firestore ruleset for the project. */
const os = require('os');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT = process.env.PROJECT || 'dream-sales-318e8';
const KEY = process.env.KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(os.homedir(), 'Secrets/dream-sales/dream-sales-318e8-firebase-adminsdk-fbsvc-e74d4a1972.json');

async function main() {
  const auth = new GoogleAuth({ keyFile: KEY, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const token = (await (await auth.getClient()).getAccessToken()).token;
  const headers = { Authorization: `Bearer ${token}` };

  const relRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}/releases/cloud.firestore`, { headers });
  const rel = await relRes.json();
  if (!relRes.ok) { console.log(`No live release / cannot read (${relRes.status}):`, JSON.stringify(rel)); return; }
  console.log('Live release ->', rel.rulesetName, '(updated', rel.updateTime + ')');

  const rsRes = await fetch(`https://firebaserules.googleapis.com/v1/${rel.rulesetName}`, { headers });
  const rs = await rsRes.json();
  if (!rsRes.ok) { console.log(`Cannot read ruleset (${rsRes.status}):`, JSON.stringify(rs)); return; }
  for (const f of (rs.source?.files || [])) {
    console.log(`--- ${f.name} ---\n${f.content}`);
  }
}
main().catch(e => { console.error(e.message || e); process.exit(1); });
