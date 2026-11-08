// iOS universal links: these paths on kanvasfit.com open the Kanvas app when it's installed.
// Apple fetches this from the apex domain (www redirects, and Apple doesn't follow redirects).
// Team AMX72YG8H5, bundle com.kanvasfit.app.
export const dynamic = "force-static";

const APP_ID = "AMX72YG8H5.com.kanvasfit.app";
const PATHS = ["/s/*", "/u/*", "/gyms/*", "/groups/*"];

export function GET() {
  return Response.json({
    applinks: {
      details: [{ appIDs: [APP_ID], components: PATHS.map((path) => ({ "/": path })) }],
    },
  });
}
