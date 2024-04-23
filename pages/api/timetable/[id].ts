import { ImageResponse } from "@vercel/og";
import Timetabler from "@/generator/TimetableGenerator";

export const runtime = "edge";

export default async function GET(request: Request) {
  try {
    const cookie = decodeURIComponent(
      (
        request.headers.getSetCookie()[0] ||
        (request.headers.get("cookie") as string) || getC('token') as string
      ).replace("token=", "")
    );

    if(!cookie) return new Response(JSON.stringify({
      error: 'Unauthorized',
      status: 401,
      message: "Cannot find a session cookie, you might've blocked cookies 🍪 for me or you didn't login."
    }), {
      status: 500,
      
    })

    const { searchParams } = new URL(request.url);

    const batch = searchParams.get("batch") || "2";

    const res = await fetch(
      `https://proscrape.vercel.app/api/timetable?batch=${batch}`,
      {
        method: "GET",

        headers: {
          "X-CSRF-Token": cookie,
          "Set-Cookie": cookie,
          Cookie: cookie,
          Connection: "keep-alive",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=7200",
        },
      }
    );

    const response = await res.json();

    return new ImageResponse(Timetabler({ body: response }), {
      width: 2400,
      height: 920,
      headers: {
        "Accept-Encoding": "gzip, deflate, br, zstd",
      },
    });
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        error: err
      }),
      {
        status: 500,
        statusText: "Server Error",
      }
    );
  }
}

function getC(c_name: string) {
  var i,
  x,
  y,
  ARRcookies = document.cookie.split(";");
for (i = 0; i < ARRcookies.length; i++) {
  x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
  y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
  x = x.replace(/^\s+|\s+$/g, "");
  if (x == c_name) {
    return unescape(y);
  }
}
}