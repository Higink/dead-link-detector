import colors from 'colors';
import normalizeUrl from "./normalizeUrl";
import {getErrorMessage} from "../utils/error";
import axios, {AxiosError} from 'axios';
import * as cheerio from 'cheerio';

async function scan(url: string) {
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
    const visitedUrlsData: { url: string; status: number | string }[] = [];

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

        try {
            // Récupérer le contenu de la page
            const response = await axios.get(url, {
                validateStatus: () => true, // accept all status codes
            });

            visitedUrlsData.push({url: currentUrl, status: 200});
            // if the page is on error, stop here
            if (response.status >= 300) {
                continue;
            }

            //@TODO SCRAPE LINKS

        } catch (error) {
            // Error during the page fetch
            console.error(colors.red(`Error during the page fetch ${url}: ${getErrorMessage(error)}`));

            visitedUrlsData.push({
                url: currentUrl,
                status: "UNKNOWN_ERROR"
            });
            continue;
        }
    }

    console.log(colors.blue('END OF scan()')); //@TODO remove
    return {
        success: true,
        domain: domain,
        visitedUrls: Array.from(visitedUrls),
        visitedUrlsData: visitedUrlsData
    };


}

export default scan;