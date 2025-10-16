import colors from 'colors'; //@TODO remove
import {Command} from 'commander';
import deadLinkDetector from '../src/index';

/**
 * CLI entry point
 */
function cli() {
    const program = new Command();
    program
        .name('dead-link-detector')
        .description('Explore a website and list all broken links')
        .version('1.0.0')
        .argument('<url>', 'Website URL to analyze')
        .action((url: string) => {
            console.log(colors.green(`[DEBUG] URL: ${url}`)); //@TODO remove
            deadLinkDetector.scan(url);
        });
    program.parse();
}

cli();