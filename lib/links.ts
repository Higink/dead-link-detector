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
            return;
        }

        const absoluteUrl = new URL(link, sourceUrl).toString();
        const normalizedUrl = normalizeUrl(absoluteUrl);

        if (!isSameDomain(absoluteUrl, sourceUrl)) {
            return;
        }

        return normalizedUrl;
    } catch (error) {
        console.error(`Error during link analysis: ${getErrorMessage(error)}`);
        return;
    }
}

function isSameDomain(url1: string, url2: string): boolean {
    try {
        const domain1 = new URL(url1).hostname.replace(/^www\./, '');
        const domain2 = new URL(url2).hostname.replace(/^www\./, '');
        return domain1 === domain2;
    } catch {
        console.log(colors.red(`Error during domain comparison between ${url1} and ${url2}`));
        return false;
    }
}