const https = require('https');

const data = JSON.stringify({
    data: {
        product: {
            item: {
                name: 'diario'
            }
        }
    }
});

const options = {
    hostname: 'vendas-bot-api.onrender.com',
    port: 443,
    path: '/checar-estoque',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log('STATUS:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();
