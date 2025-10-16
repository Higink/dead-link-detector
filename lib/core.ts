import colors from 'colors';
import normalizeUrl from "./normalizeUrl";
import {getErrorMessage} from "../utils/error";

function scan(url: string) {
    let domain;
    try {
        domain = new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error)
        };
    }

    const urlsToVisit: Set<string> = new Set();
    const visitedUrls: Set<string> = new Set();
    const visitedUrlsData: { url: string; status: number }[] = [];

    // @TODO utiliser plus tard la fonction DETECT NEW URL qui normalise
    urlsToVisit.add(url)


    while (urlsToVisit.size > 0) {
        const currentUrl = urlsToVisit.values().next().value;
        console.log(colors.blue(`[DEBUG] Visiting: ${currentUrl}`)); //@TODO remove

        if (typeof currentUrl !== "string") {
            console.error(colors.red(`[ERROR] Invalid URL: ${currentUrl}`));
            // @ts-ignore
            urlsToVisit.delete(currentUrl); //@TODO fix ts-ignore
            continue;
        }

        urlsToVisit.delete(currentUrl);
        visitedUrls.add(currentUrl);

        // @TODO

        visitedUrlsData.push({url: currentUrl, status: 200});
    }


    return {
        success: true,
        domain: domain
    };


}

export default scan;