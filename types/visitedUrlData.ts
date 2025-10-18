/**
 * Data about a visited URL
 */
export interface VisitedUrlData {
    /** Visited URL */
    url: string;
    /** HTTP status code or error message */
    status: number | string;
}
