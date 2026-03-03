#!/usr/bin/env node

const chalk = require("chalk");
const ora = require("ora");
const { scanProject } = require("../src/scanner");
const { runHealthCheck } = require("../src/checker");

async function run() {
    console.log(chalk.cyan.bold('\n🔍 Sys Health Checker: Analyzing project infrastructure...\n'));

    const scanSpinner = ora('Scanning project files and configurations...').start();
    const discovery = scanProject();

    if(discovery.services.length === 0) {
        scanSpinner.warn(chalk.yellow('No recognized services found in this project. Please check your .env file and package.json dependencies.'));
        return;
    }
    scanSpinner.succeed(chalk.green(`${discovery.services.length} potential service(s) detected.`));

    console.log(chalk.gray('-----------------------------'));
    const testSpinner = ora('Testing connections and ports...').start();

    const checkPromises = discovery.services.map(service => runHealthCheck(service));
    const results = await Promise.all(checkPromises);

    testSpinner.stop();

    let errorCount = 0;

    results.forEach(result => {
        const sourceText = chalk.gray(`(Source: ${result.source})`);

        if (result.status === 'success') {
            console.log(`${chalk.green.bold('✅ SUCCESS')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.green(result.message)}\n`);
        } else if (result.status === 'warning') {
            console.log(`${chalk.yellow.bold('⚠️ WARNING')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.yellow(result.message)}\n`);
        } else {
            console.log(`${chalk.red.bold('❌ ERROR')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.red(result.message)}\n`);
            errorCount++;
            
            if (result.type === 'infrastructure') {
                console.log(`   💡 ${chalk.italic.cyan("Tip: Make sure Docker is running and accessible.")}\n`);
            } else {
                console.log(`   💡 ${chalk.italic.cyan("Tip: The service may be down or the port in .env file may be incorrect.")}\n`);
            }
        }
    });

    console.log(chalk.gray('-----------------------------'));

    if (errorCount === 0) {
        console.log(chalk.bgGreen.black.bold(' 🎉 AWESOME! All services are running properly. \n'));
    } else {
        console.log(chalk.bgRed.white.bold(` ⚠️ ATTENTION: ${errorCount} service(s) are not accessible. Please check them before starting the project. \n`));
    }
}

run().catch(err => {
    console.error(chalk.red('\nUnexpected error occurred:'), err.message);
    process.exit(1);
});