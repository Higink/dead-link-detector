import colors from 'colors';
import {getErrorMessage} from "../utils/error";
import axios, {AxiosError} from 'axios';
import * as cheerio from 'cheerio';
import {analyzeLink} from "./links";
import {getDomainFromUrl} from "../utils/url";
import normalizeUrl from "./normalizeUrl";

async function scan(url: string) {
    let normalizedURL;
    let domain;

    try {
        normalizedURL = normalizeUrl(url);
        domain = getDomainFromUrl(url);
        if(!normalizedURL || !domain) {
            throw new Error("The URL is not valid");
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error)
        };
    }

    const urlsToVisit: Set<string> = new Set();
    const visitedUrls: Set<string> = new Set();
    const visitedUrlsData: { url: string; status: number | string }[] = [];

    urlsToVisit.add(normalizedURL)

    while (urlsToVisit.size > 0) {
        const currentUrl = urlsToVisit.values().next().value;
        console.log(colors.rainbow(`[Visited:${visitedUrls.size}|Remaining:${urlsToVisit.size}]`));
        console.log(`Start new analysis: ${currentUrl}`);

        if (typeof currentUrl !== "string") {
            console.error(`URL isn’t a string: ${currentUrl}`);
            // @ts-ignore
            urlsToVisit.delete(currentUrl); //@TODO fix ts-ignore
            continue;
        }

        urlsToVisit.delete(currentUrl);
        visitedUrls.add(currentUrl);

        try {
            // Get the page content
            const response = await axios.get(currentUrl, {
                validateStatus: () => true, // accept all status codes
            });

            console.log(`Page status: ${response.status}`);
            visitedUrlsData.push({url: currentUrl, status: response.status});

            // if the axios call return an error status code
            if (response.status >= 300) {
                continue;
            }

            // Parse HTML
            const $ = cheerio.load(response.data);

            // Extract all links
            const links: string[] = [];
            $('a[href]').each((_, element) => {
                const href = $(element).attr('href');
                if (href) {
                    links.push(href);
                }
            });

            // Process each link
            for (const link of links) {
                const validatedLink = analyzeLink(link, url);
                if (validatedLink && !visitedUrls.has(validatedLink) && !urlsToVisit.has(validatedLink)) {
                    console.log(`\tFound a new link to visit: ${link}`);
                    urlsToVisit.add(validatedLink);
                }
            }

        } catch (error) {
            // Error during the page fetch
            console.error(`Error during the page fetch: ${getErrorMessage(error)}`);
            let errorType: number | string = 'UNKNOWN_ERROR';

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;

                if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                    errorType = 'TIMEOUT';
                }

                if (axiosError.code === 'ENOTFOUND') {
                    errorType = 'DNS_ERROR';
                }

                if (axiosError.code === 'ECONNREFUSED') {
                    errorType = 'CONNECTION_REFUSED';
                }

                if (axiosError.response) {
                    errorType = axiosError.response.status;
                }
            }

            console.log(`Page status: ${errorType}`);
            visitedUrlsData.push({
                url: currentUrl,
                status: errorType
            });
        }
    }

    console.log("End of scan");
    return {
        generatedAt: new Date().toISOString(),
        domain: domain,
        success: true,
        visitedUrls: Array.from(visitedUrls),
        visitedUrlsData: visitedUrlsData
    };

}

export default scan;