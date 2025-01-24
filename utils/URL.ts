const serverUrls = [process.env.NEXT_PUBLIC_URL];

export const revalUrl = serverUrls[0];
export const loginUrl = "https://proscrape.rahulmarban.workers.dev";

export default function rotateUrl(): string {
	const timestamp = Date.now();
	const index = timestamp % serverUrls.length;
	return serverUrls[index] ?? "";
}
