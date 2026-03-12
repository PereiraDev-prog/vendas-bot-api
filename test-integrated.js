const http = require('http');
const { spawn } = require('child_process');

async function testSystem() {
    console.log('Iniciando servidor para teste...');
    const server = spawn('node', ['index.js'], { stdio: 'pipe' });

    server.stdout.on('data', (data) => {
        const msg = data.toString();
        process.stdout.write(`[Server] ${msg}`);
        if (msg.includes('Servidor rodando')) {
            setTimeout(runTest, 1000);
        }
    });

    server.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data}`);
    });

    function runTest() {
        console.log('Enviando requisição para http://localhost:3000/checar-estoque...');
        http.get('http://localhost:3000/checar-estoque', (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('--- RESULTADO ---');
                console.log('Status:', res.statusCode);
                console.log('Resposta:', body);
                console.log('-----------------');
                server.kill();
                process.exit();
            });
        }).on('error', (err) => {
            console.error('Erro na requisição:', err.message);
            server.kill();
            process.exit(1);
        });
    }
}

testSystem();
