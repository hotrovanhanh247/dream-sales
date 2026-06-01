import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This frontend lives in a monorepo subdir; pin Turbopack root to silence
  // the multi-lockfile workspace-root inference warning.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
