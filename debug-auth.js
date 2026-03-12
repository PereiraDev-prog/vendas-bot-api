const { google } = require('googleapis');

async function debugAuth() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI',
            range: 'Página1!A1:E',
        });
        console.log('--- DADOS DA PLANILHA ---');
        console.log(JSON.stringify(res.data.values, null, 2));
        console.log('-------------------------');
    } catch (err) {
        console.error('ERRO NO DIAGNÓSTICO:');
        console.error(err.message);
        if (err.response) {
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

debugAuth();
