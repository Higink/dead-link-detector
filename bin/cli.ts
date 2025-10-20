#!/usr/bin/env node
/**
 * Command Line Interface for the Dead Link Detector
 * Provides a CLI tool to scan websites for broken links
 *
 * Commands:
 * - <url>: Website URL to analyze (required)
 *
 * Options:
 * - -f, --format: Output format (json or csv)
 * - -d, --directory: Output directory for results
 * - -o, --output: Custom output filename
 * - -v, --version: Display version
 * - -h, --help: Display help
 */

import deadLinkDetector from '../src/index';
import {Command} from 'commander';
import console from 'node:console';
import {getErrorMessage} from '../utils/error';
import {generateOutputFilename, saveAsCSV, saveAsJSON} from '../lib/save';

const program = new Command();
program
    .name('dead-link-detector')
    .description('Explore a website and list all broken links')
    .version('1.0.1')
    .argument('<url>', 'Website URL to analyze')
    .option('-f, --format <format>', 'Output format (json or csv)')
    .option('-d, --directory <path>', 'Output directory')
    .option('-o, --output <filename>', 'Output filename')
    .option('-t, --timeout <number>', 'Request timeout in milliseconds')
    .option('-u, --user-agent <string>', 'Custom User-Agent string')
    .action(async (url: string, options) => {
        try {
            console.log(`Start from analysis: ${url}`);
            const resultData = await deadLinkDetector(url, {
                userAgent: options.userAgent,
                timeout: options.timeout,
            });

            console.log('Result report:');
            console.log(resultData);

            if (resultData.success && options.format) {
                // save results in file
                const format = options.format.toLowerCase();
                const filename = options.output || generateOutputFilename(url, format);
                switch (format) {
                    case 'json':
                        console.log('Saving results as JSON...');
                        saveAsJSON(resultData, options.directory || '.', filename);
                        console.log(`Results saved in: ${filename}`);
                        break;
                    case 'csv':
                        console.log('Saving results as CSV...');
                        saveAsCSV(resultData, options.directory || '.', filename);
                        console.log(`Results saved in: ${filename}`);
                        break;
                    default:
                        console.warn(`Unsupported format: ${format}.`);
                }
            }

            process.exit(0);
        } catch (error) {
            console.error(getErrorMessage(error));
            process.exit(1);
        }
    });

program.parse();