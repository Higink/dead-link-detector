export function stringToURL(url: string): URL {
    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
    }
    return new URL(url.trim());
}

export function getDomainFromUrl(url: string): string {
    return stringToURL(url).hostname.replace(/^www\./, '');
}