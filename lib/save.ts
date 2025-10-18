import * as fs from "node:fs";
import {getDomainFromUrl} from "../utils/url";
import path = require("node:path");

export function generateOutputFilename(url: string, format: string): string {
    const domain = getDomainFromUrl(url);
    const date = new Date().toISOString().split('T')[0];
    return `${domain}_${date}.${format}`;
}

export function saveAsJSON(data: any, directory: string, filename: string): void {
    const filePath = `${directory}/${filename}`;
    writeToFile(filePath, JSON.stringify(data, null, 2));

}

export function saveAsCSV(data: any, directory: string, filename: string): void {
    const lines: string[] = [
        'URL;Status Code',
    ];

    // @ts-ignore
    data.visitedUrlsData.forEach(item => {
        const line = [
            item.url,
            item.status.toString(),
        ].join(';');
        lines.push(line);
    });

    const filePath = `${directory}/${filename}`;
    writeToFile(filePath, lines.join('\n'));
}

function writeToFile(filePath: string, content: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}