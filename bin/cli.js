#!/usr/bin/env node

const chalk = require("chalk");
const ora = require("ora");
const { scanProject } = require("../src/scanner");
const { runHealthCheck } = require("../src/checker");

async function run() {
    console.log(chalk.cyan.bold('\n🔍 dbhealtychecker: Proje Altyapısı Analiz Ediliyor...\n'));

    const scanSpinner = ora('Proje taranıyor...').start();
    const discovery = scanProject();

    if(discovery.services.length === 0) {
        scanSpinner.warn(chalk.yellow('Bu projede tanınan bir servis bulunamadı. Lütfen .env dosyanızı ve package.json bağımlılıklarınızı kontrol edin.'));
        return;
    }
    scanSpinner.succeed(chalk.green(`${discovery.services.length} potansiyel servis tespit edildi.`));

    console.log(chalk.gray('-----------------------------'));
    const testSpinner = ora('Bağlantılar ve portlar test ediliyor...').start();

    const checkPromises = discovery.services.map(service => runHealthCheck(service));
    const results = await Promise.all(checkPromises);

    testSpinner.stop();

    let errorCount = 0;

    results.forEach(result => {
        const sourceText = chalk.gray(`(Kaynak: ${result.source})`);

        if (result.status === 'success') {
            console.log(`${chalk.green.bold('✅ BAŞARILI')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.green(result.message)}\n`);
        } else if (result.status === 'warning') {
            console.log(`${chalk.yellow.bold('⚠️ UYARI')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.yellow(result.message)}\n`);
        } else {
            console.log(`${chalk.red.bold('❌ HATA')} - ${chalk.bold(result.name)} ${sourceText}`);
            console.log(`   └─ ${chalk.red(result.message)}\n`);
            errorCount++;
            
            if (result.type === 'infrastructure') {
                console.log(`   💡 ${chalk.italic.cyan("İpucu: Docker uygulamasının açık ve çalışıyor olduğundan emin ol.")}\n`);
            } else {
                console.log(`   💡 ${chalk.italic.cyan("İpucu: Servis kapalı olabilir veya .env dosyasındaki port yanlış olabilir.")}\n`);
            }
        }
    });

    console.log(chalk.gray('-----------------------------'));

    if (errorCount === 0) {
        console.log(chalk.bgGreen.black.bold(' 🎉 HARİKA! Tespit edilen tüm servisler ayakta ve çalışıyor. \n'));
    } else {
        console.log(chalk.bgRed.white.bold(` ⚠️ DİKKAT: ${errorCount} servise ulaşılamadı. Projeyi başlatmadan önce bunları kontrol etmelisin. \n`));
    }
}

run().catch(err => {
    console.error(chalk.red('\nBeklenmeyen bir hata oluştu:'), err.message);
    process.exit(1);
});