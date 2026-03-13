const { google } = require('googleapis');

async function checkSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = '1MxL-Z61mNOM6Zipb5f4NjR1-hlA2zeZDvhVoG2nD7bI';

    try {
        const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        console.log('Abas encontradas:');
        res.data.sheets.forEach(s => console.log(`- ${s.properties.title}`));
    } catch (err) {
        console.error('Erro ao buscar abas:', err.message);
    }
}

checkSheets();
