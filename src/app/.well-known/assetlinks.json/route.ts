// Android App Links: lets com.kanvasfit.app open kanvasfit.com/s, /u, /gyms and /groups links
// directly. One SHA-256 per signing key: the local development builds' debug key now; add the
// Play app-signing key when the app is on Google Play (Play Console, App integrity).
export const dynamic = "force-static";

const FINGERPRINTS = [
  // Android debug keystore (local development builds).
  "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C",
];

export function GET() {
  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: { namespace: "android_app", package_name: "com.kanvasfit.app", sha256_cert_fingerprints: FINGERPRINTS },
    },
  ]);
}
