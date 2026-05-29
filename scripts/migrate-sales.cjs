#!/usr/bin/env node
/**
 * One-off: copy Sales collections from the MCRoomRent Firebase project into
 * the standalone dream-sales project. Admin SDK bypasses Firestore rules.
 *
 * Service-account keys (override with env vars if needed):
 *   SRC_KEY  default: ~/Secrets/mcroomrent/mcroomrent-firebase-service-account.json
 *   DST_KEY  default: ~/Secrets/dream-sales/dream-sales-318e8-firebase-adminsdk-fbsvc-e74d4a1972.json
 *
 * Usage: node scripts/migrate-sales.cjs
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const admin = require('firebase-admin');

const SRC_KEY = process.env.SRC_KEY ||
  path.join(os.homedir(), 'Secrets/mcroomrent/mcroomrent-firebase-service-account.json');
const DST_KEY = process.env.DST_KEY ||
  path.join(os.homedir(), 'Secrets/dream-sales/dream-sales-318e8-firebase-adminsdk-fbsvc-e74d4a1972.json');

const COLLECTIONS = (process.env.COLLECTIONS || 'salesMonths,salesMembers')
  .split(',').map(s => s.trim()).filter(Boolean);

function loadKey(p) {
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) {
    console.error('Service account key not found:', abs);
    process.exit(2);
  }
  return require(abs);
}

const srcApp = admin.initializeApp({ credential: admin.credential.cert(loadKey(SRC_KEY)) }, 'src');
const dstApp = admin.initializeApp({ credential: admin.credential.cert(loadKey(DST_KEY)) }, 'dst');
const srcDb = srcApp.firestore();
const dstDb = dstApp.firestore();

(async function main() {
  try {
    for (const col of COLLECTIONS) {
      const snap = await srcDb.collection(col).get();
      console.log(`Copying ${col}: ${snap.size} document(s)`);
      let batch = dstDb.batch();
      let n = 0;
      for (const docSnap of snap.docs) {
        batch.set(dstDb.collection(col).doc(docSnap.id), docSnap.data());
        if (++n % 400 === 0) { await batch.commit(); batch = dstDb.batch(); }
      }
      if (n % 400 !== 0) await batch.commit();
      console.log(`  done ${col} (${n})`);
    }
    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
