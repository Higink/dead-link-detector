# Dead Link Detector

A Node.js module to detect dead links that spread across a domain and return the broken links.

## Features

- Crawls all internal links on a domain
- Customizable User-Agent and timeout settings
- Export report in JSON or CSV format

## Installation

Globally

```bash
npm install -g dead-link-detector
```

or use NPX

```bash
npx dead-link-detector https://example.com
```

## Usage CLI

```bash
dead-link-detector <url> [options]
```

### Arguments

- `<url>`: Website URL to analyze (required)

### Options

| Option                  | Alias | Description                         |
|-------------------------|-------|-------------------------------------|
| `--help`                | `-h`  | Display help information            |
| `--format <format>`     | `-f`  | Output format (JSON or CSV)         |
| `--directory <path>`    | `-d`  | Output directory for saving results |
| `--output <filename>`   | `-o`  | Custom output filename              |
| `--timeout <number>`    | `-t`  | Request timeout in milliseconds     |
| `--user-agent <string>` | `-u`  | Custom User-Agent string            |
| `--version`             | `-v`  | Display version                     |

### Examples

```bash
# Basic scan
dead-link-detector https://example.com

# Scan with custom timeout and save as JSON
dead-link-detector https://example.com -t 10000 -f json

# Save results to specific directory with custom filename
dead-link-detector https://example.com -f csv -d ./reports -o my-scan-report

# Use custom User-Agent
dead-link-detector https://example.com -u "Mozilla/5.0 TrustMeImNotABot/1.0"
```

## Usage in NodeJS

```typescript
import deadLinkDetector from 'dead-link-detector';

// Basic usage
const result = await deadLinkDetector('https://example.com');

// With options
const resultAgain = await deadLinkDetector('https://example.com', {
    userAgent: "Mozilla/5.0 TrustMeImNotABot/1.0", // Custom User-Agent string for HTTP requests
    timeout: 5000 // Request timeout in milliseconds
});
```

### Returns

Returns a Promise that resolves to a `ScanResult` object:

```typescript
export interface ScanResult {
    /** Date when the report was generated */
    generatedAt: string;
    /** Analyzed domain */
    domain: string;
    /** Indicates if the scan was completed successfully */
    success: boolean;
    /** Error message if success is false */
    error?: string;
    /** Total number of visited URLs */
    totalVisitedUrls: number;
    /** Count of HTTP status codes returned during the scan */
    statusCodesCount: { [key: string]: number };
    /** List of visited URLs */
    visitedUrls: string[];
    /** Detailed data about visited URLs */
    visitedUrlsData: {
        /** Visited URL */
        url: string;
        /** HTTP status code or error message */
        status: number | string;
    }[];
}
```

## License

This project is licensed under CC BY-NC-SA.  
![CC BY-NC-SA](https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.png)
