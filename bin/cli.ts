import colors from 'colors'; //@TODO remove
import {Command} from 'commander';
import deadLinkDetector from '../src/index';
import console from "node:console";
import {getErrorMessage} from "../utils/error";

const program = new Command();
program
    .name('dead-link-detector')
    .description('Explore a website and list all broken links')
    .version('1.0.0')
    .argument('<url>', 'Website URL to analyze')
    .action(async (url: string) => {
        try {
            console.log(`Start from analysis: ${url}`);
            const resultData = await deadLinkDetector.scan(url);
            console.log('Result report:');
            console.log(resultData);
            process.exit(0);
        } catch (error) {
            console.error(getErrorMessage(error));
            process.exit(1);
        }
    });

program.parse();