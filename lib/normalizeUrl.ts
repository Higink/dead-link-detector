import * as console from "node:console";
import {getErrorMessage} from "../utils/error";

/**
 * Normalize a URL by ensuring it has a protocol, removing trailing slashes (except for root), and stripping anchors.
 * @param url
 * @returns {string | undefined}
 */
export default function normalizeUrl(url: string): string | undefined {
    try {
        let normalizedUrl = url.trim();

        // Add protocol if missing
        if (!normalizedUrl.match(/^https?:\/\//)) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        const parsedUrl = new URL(normalizedUrl);

        // Check if it's a valid hostname (contains at least one dot)
        if (!parsedUrl.hostname.includes('.')) {
            return undefined;
        }

        // Remove the last slash to correctly detect the same URLs (except if it's the root)
        if (parsedUrl.pathname !== '/' && parsedUrl.pathname.endsWith('/')) {
            parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
        }

        // Remove anchor to correctly detect the same URLs
        parsedUrl.hash = '';

        return parsedUrl.toString();
    } catch (error) {
        console.error(getErrorMessage(error));
        return;
    }
}