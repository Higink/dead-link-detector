import colors from 'colors';
import normalizeUrl from "./normalizeUrl";
import {getErrorMessage} from "../utils/error";

function scan(url: string) {
    try {
        const domain = new URL(url).hostname.replace(/^www\./, '');

        // Clean URL
        const startURL = normalizeUrl(url);
        if (!startURL) {
            return {
                success: false,
                message: `Invalid URL: ${url}`,
            };
        }


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