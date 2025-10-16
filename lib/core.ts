import colors from 'colors';
import {normalizeUrl} from "./normalizeUrl"; //@TODO remove

function scan(url: string) {
    console.log(colors.blue(`[DEBUG] URL: ${url}`)); //@TODO remove

    // Clean URL
    const startURL = normalizeUrl(url);
    if(!startURL) {
        return {
            success: false,
            message: `Invalid URL: ${url}`
        };
    }
    console.log(colors.blue(`[DEBUG] Normalized URL: ${startURL}`)); //@TODO remove
}

export default scan;