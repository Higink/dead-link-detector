import console from "node:console";
import * as fs from "node:fs";
import {getDomainFromUrl} from "../utils/url";

export function generateOutputFilename(url: string, format: string): string {
    const domain = getDomainFromUrl(url);
    const date = new Date().toISOString().split('T')[0];
    return `${domain}_${date}.${format}`;
}

export function saveAsJson(data: any, filename: string): void {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Results saved in: ${filename}`);
}

