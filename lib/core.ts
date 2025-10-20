import {getErrorMessage} from '../utils/error';
import axios, {AxiosError} from 'axios';
import * as cheerio from 'cheerio';
import {analyzeLink} from './links';
import {getDomainFromUrl} from '../utils/url';
import normalizeUrl from './normalizeUrl';
import {ScanResult} from '../types/scanResult';
import {VisitedUrlData} from '../types/visitedUrlData';
import {ScanOptions} from '../types/scanOptions';

/**
 * Performs a complete scan of a website starting from a given URL
 * Crawls all internal links and checks their HTTP status
 *
 * @param url - The starting URL to scan
 * @param options - Scan options
 * @param options.userAgent - Custom User-Agent string for HTTP requests
 * @param options.timeout - Request timeout in milliseconds
 * @returns An object containing:
 *   - success: boolean indicating if the scan was successful
 *   - error: error message if success is false
 *   - visitedUrlsData: array of objects containing visited URLs and their status codes
 */
export async function scan(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    let normalizedURL;
    let domain;

    try {
        normalizedURL = normalizeUrl(url);
        domain = getDomainFromUrl(url);
        if (!normalizedURL || !domain) {
            throw new Error('The URL is not valid');
        }
    } catch (error) {
        return {
            generatedAt: new Date().toISOString(),
            domain: url,
            success: false,
            error: getErrorMessage(error),
            totalVisitedUrls: 0,
            statusCodesCount: {},
            visitedUrls: [],
            visitedUrlsData: []
        };
    }

    const urlsToVisit: Set<string> = new Set();
    const visitedUrls: Set<string> = new Set();
    const visitedUrlsData: VisitedUrlData[] = [];
    const statusCodesCount: {[key: string]: number} = {};

    urlsToVisit.add(normalizedURL);

    while (urlsToVisit.size > 0) {
        const currentUrl = urlsToVisit.values().next().value;
        console.log('\r\n===============================');
        console.log(`[Visited:${visitedUrls.size}|Remaining:${urlsToVisit.size}]`);
        console.log(`Start new analysis: ${currentUrl}`);

        if (typeof currentUrl !== 'string') {
            console.error(`URL isn’t a string: ${currentUrl}`);
            // @ts-ignore
            urlsToVisit.delete(currentUrl);
            continue;
        }

        urlsToVisit.delete(currentUrl);
        visitedUrls.add(currentUrl);

        try {
            // Get the page content
            const response = await axios.get(currentUrl, {
                headers: {
                    'User-Agent': options.userAgent  || 'Mozilla/5.0 (compatible; DeadLinkDetector/1.0)',
                },
                timeout: options.timeout || 0, // default axios is no timeout
                validateStatus: () => true, // accept all status codes
            });

            console.log(`Page status: ${response.status}`);
            statusCodesCount[response.status] = (statusCodesCount[response.status] || 0) + 1;
            visitedUrlsData.push({url: currentUrl, status: response.status});

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
                const validatedLink = analyzeLink(link, normalizedURL);
                if (validatedLink && !visitedUrls.has(validatedLink) && !urlsToVisit.has(validatedLink)) {
                    console.log(`\tFound a new link to visit: ${link}`);
                    urlsToVisit.add(validatedLink);
                }
            }

        } catch (error) {
            // Error during the page fetch
            let errorType: number | string = 'UNKNOWN_ERROR';
            const axiosError = error as AxiosError;
            if (axiosError.isAxiosError) {
                if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                    errorType = 'TIMEOUT';
                } else if (axiosError.code === 'ENOTFOUND') {
                    errorType = 'DNS_ERROR';
                } else if (axiosError.code === 'ECONNREFUSED') {
                    errorType = 'CONNECTION_REFUSED';
                } else if (axiosError.response) {
                    errorType = axiosError.response.status;
                }
            }

            console.log(`Page status: ${errorType}`);
            statusCodesCount[errorType] = (statusCodesCount[errorType] || 0) + 1;
            visitedUrlsData.push({
                url: currentUrl,
                status: errorType
            });
        }
    }

    console.log('End of scan');
    return {
        generatedAt: new Date().toISOString(),
        domain: domain,
        success: true,
        totalVisitedUrls: visitedUrls.size,
        statusCodesCount: statusCodesCount,
        visitedUrls: Array.from(visitedUrls),
        visitedUrlsData: visitedUrlsData
    };

}

export default scan;