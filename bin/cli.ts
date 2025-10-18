import {Command} from 'commander';
import deadLinkDetector from '../src/index';
import console from "node:console";
import {getErrorMessage} from "../utils/error";
import {generateOutputFilename, saveAsJson} from "../lib/save";
import colors from "colors";

const program = new Command();
program
    .name('dead-link-detector')
    .description('Explore a website and list all broken links')
    .version('1.0.0')
    .argument('<url>', 'Website URL to analyze')
    .option('-f, --format <format>', 'Output format (json or csv)')
    .option('-o, --output <filename>', 'Output filename')
    .action(async (url: string, options) => {
        try {
            console.log(`Start from analysis: ${url}`);
            const resultData = await deadLinkDetector.scan(url);
            console.log('Result report:');
            console.log(resultData);

            if (options.format) {
                // save results in file
                const format = options.format.toLowerCase();
                switch (format) {
                    case 'json':
                        console.log(colors.green('Saving results as JSON...'));
                        const filename = options.output || generateOutputFilename(url, format);
                        saveAsJson(resultData, filename);
                        break;
                    default:
                        console.log(colors.red(`Unsupported format: ${format}.`));
                }
            }

            process.exit(0);
        } catch (error) {
            console.error(getErrorMessage(error));
            process.exit(1);
        }
    });

program.parse();