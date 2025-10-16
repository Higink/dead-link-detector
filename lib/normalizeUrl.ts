export function normalizeUrl(url: string): string | undefined {
    let normalizedUrl = url.trim();

    // Add protocol if missing
    if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
        const parsedUrl = new URL(normalizedUrl);

        // Remove the last slash to correctly detect the same URLs (except if it's the root)
        if (parsedUrl.pathname !== '/' && parsedUrl.pathname.endsWith('/')) {
            parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
        }

        // Remove anchor to correctly detect the same URLs
        parsedUrl.hash = '';

        return parsedUrl.toString();
    } catch (error) {
        console.error(`Invalid URL: ${url}`);
        return;
    }
}