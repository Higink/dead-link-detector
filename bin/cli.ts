import {Command} from 'commander';
import deadLinkDetector from '../src/index';
import console from "node:console";
import {getErrorMessage} from "../utils/error";
import {generateOutputFilename, saveAsCSV, saveAsJSON} from "../lib/save";
import colors from "colors";

const program = new Command();
program
    .name('dead-link-detector')
    .description('Explore a website and list all broken links')
    .version('1.0.0')
    .argument('<url>', 'Website URL to analyze')
    .option('-f, --format <format>', 'Output format (json or csv)')
    .option('-d, --directory <path>', 'Output directory')
    .option('-o, --output <filename>', 'Output filename')
    .action(async (url: string, options) => {
        try {
            console.log(`Start from analysis: ${url}`);
            const resultData = await deadLinkDetector.scan(url);
            console.log('Result report:');
            console.log(resultData);

            if (resultData.success && options.format) {
                // save results in file
                const format = options.format.toLowerCase();
                const filename = options.output || generateOutputFilename(url, format);
                switch (format) {
                    case 'json':
                        console.log(colors.green('Saving results as JSON...'));
                        saveAsJSON(resultData, options.directory || '.', filename);
                        console.log(`Results saved in: ${filename}`);
                        break;
                    case 'csv':
                        console.log(colors.green('Saving results as CSV...'));
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