import colors from 'colors';
import normalizeUrl from "./normalizeUrl";
import {getErrorMessage} from "../utils/error";

function scan(url: string) {
    try {
        // Clean URL
        const startURL = normalizeUrl(url);
        if (!startURL) {
            return {
                success: false,
                message: `Invalid URL: ${url}`,
            };
        }

        const domain = new URL(startURL).hostname.replace(/^www\./, '');

        return {
            success: true,
            url: startURL,
            domain: domain
        };
    } catch (error) {
        return {
            success: false,
            message: `Invalid URL: ${url}`,
            error: getErrorMessage(error)
        };
    }
}

export default scan;