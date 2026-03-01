const net = require('net');
const { exec } = require('child_process');

const withTimeout = (promise, ms=3000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const checkTCP = (host, port) => {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        }).on('error', (err) => {
            socket.destroy();
            reject(err);
        });
        socket.connect(port, host);
    }); 
};

const checkDocker = () => {
    return new Promise((resolve, reject) => {
        exec('docker info', (error) => {
            if(error) reject(new Error('SOCKER_DOWN'));
            else resolve(true);
        });
    });
};

async function runHealthCheck(service) {
    let host = '127.0.0.1';
    let port = null;

    if(service.type === 'Docker Engine' || service.type === 'infrastructure') {
        try {
            await withTimeout(checkDocker(), 5000);
            return {...service, status:'success', message: 'Konteyner motoru çalışıyor.'};
        } catch (err) {
            return {...service, status:'error', message: 'Konteyner motoru çalışmıyor.'};
        }
    }

    if(service.target) {
        try{
            const urlObj = new URL(service.target);
            host = urlObj.hostname || host;
            port = urlObj.port;
        } catch (err) {
            if(!isNaN(service.target)) port = parseInt(service.target);
        }
    }

    if(!port) {
        if(service.type === 'redis') port = 6379;
        else if(service.type === 'mongodb') port = 27017;
        else if(service.type === 'postgres') port = 5432;
        else if(service.type === 'mysql') port = 3306;
    }

    if (!port) {
        return { ...service, status: 'warning', message: 'Bağlantı portu tespit edilemedi.' };
    }

    try {
        await withTimeout(checkTCP(host, port), 3000);
        return { ...service, status: 'success', message: `Bağlantı başarılı (${host}:${port}).` };
    } catch (err) {
        let errorMsg = "Ulaşılamıyor (Port: ${port}).";
        if (err.message === 'Timeout') errorMsg =`Zaman Aşımı (Port: ${port} yanıt vermiyor)`;
        if (err.code === 'ECONNREFUSED') errorMsg = `Bağlantı Reddedildi (Port: ${port} kapalı olabilir)`;
        return { ...service, status: 'error', message: errorMsg };
    }
}

module.exports = {
    runHealthCheck
};
