import normalizeUrl from "./normalizeUrl";
import colors from "colors";
import {getErrorMessage} from "../utils/error";

export function analyzeLink(link: string, sourceUrl: string): string | undefined {
    try {
        // Ignore other links types than page links
        if (link.startsWith('#')
            || link.startsWith('mailto:')
            || link.startsWith('ftp:')
            || link.startsWith('tel:')) {
            //@TODO search if can reverse condition (only http/https or relative)
            console.log(colors.magenta(`[DEBUG] Link is not a page`)); //@TODO remove
            return;
        }

        const absoluteUrl = new URL(link, sourceUrl).toString();
        const normalizedUrl = normalizeUrl(absoluteUrl);

        if(!isSameDomain(absoluteUrl, sourceUrl)) {
            console.log(colors.magenta(`[DEBUG] Link is external`)); //@TODO remove
            return;
        }

        return normalizedUrl;
    } catch (error) {
        console.error(colors.red(`Error analyzing link: ${getErrorMessage(error)}`));
        return;
    }
}

function isSameDomain(url1: string, url2: string ): boolean {
    try {
        const parsedUrl = new URL(url1);
        const parsedDomain = new URL(url2);
        return parsedUrl.hostname === parsedDomain.hostname;
    } catch {
        return false;
    }
}
