import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import iconv from 'iconv-lite';
import { DOMParser } from 'xmldom';
import params from './utils/constants.js';

function updateBICDatabase() {
    fetch(params.requestURL)
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const zip = new AdmZip(Buffer.from(buffer));
            const zipEntries = zip.getEntries();
            const xmlEntry = zipEntries.find(entry => entry.entryName.endsWith('.xml'));
            const xmlBuffer = zip.readFile(xmlEntry);
            const xmlData = iconv.decode(xmlBuffer, 'cp1251');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData);
            const entries = Array.from(xmlDoc.getElementsByTagName('BICDirectoryEntry'));
            const result = [];
            entries.forEach((entry) => {
                const accounts = Array.from(entry.getElementsByTagName('Accounts'));
                if (accounts.length > 0) {
                    const bic = entry.getAttribute('BIC');
                    const name = entry.getElementsByTagName('ParticipantInfo')[0].getAttribute('NameP');
                    accounts.forEach((account) => {
                        const accountData = account.getAttribute('Account');
                        result.push({
                            bic: bic,
                            name: name,
                            corrAccount: accountData,
                        })
                    });
                }
            });
            return result;
        })
        .catch(error => {
            console.log(error);
        });
}
updateBICDatabase();