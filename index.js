const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const bip39 = require('bip39');
const pkutils = require('ethereum-mnemonic-privatekey-utils');
const { Account } = require('eth-lib/lib');
const { fromMnemonic, fromZPrv } = require('ethereum-bip84');
const pad = (num, size, symbol = '0') => {
    num = num.toString();
    while (num.length < size) {
        num = symbol + num;
    }
    return num;
}

const file = `.${path.sep}wallets.txt`;
const debug = false;
const accountFirstIndex = 0;
const accountLastIndex = accountFirstIndex + 1; // number of accounts
const accountWalletsFirstIndex = 0;
const accountWalletsLastIndex = accountWalletsFirstIndex + 99; // number of wallets per account

if (debug) {
    console.time('runtime');
}

const mnemonic = bip39.generateMnemonic();
const privateKey = pkutils.getPrivateKeyFromMnemonic(mnemonic);
const account = Account.fromPrivate('0x' + privateKey);

fs.writeFileSync(file, '');
fs.appendFileSync(file, mnemonic + "\n\n" + 'main' + ' ' + account.address.toLowerCase() + ' ' + privateKey + "\n");

const root = new fromMnemonic(mnemonic, '')
for (let accountId = accountFirstIndex; accountId < accountLastIndex; accountId++) {
    const child = root.deriveAccount(accountId);
    const account = new fromZPrv(child);
    for (let walletId = accountWalletsFirstIndex; walletId <= accountWalletsLastIndex; walletId++) {
        const accountWalletId = accountId + '_' + pad(walletId, 2);
        const walletLine = `${accountWalletId} ${account.getAddress(walletId)} ${account.getPrivateKey(walletId)}`;
        fs.appendFileSync(file, walletLine + "\n");
    }
}

if (debug) {
    console.timeEnd('runtime');
}

const fileLines = parseInt(execSync(`wc -l < ${file}`).toString().trim()) || 0;
if (fileLines > 3) {
    const walletsGenerated = fileLines - 3;
    console.log(`${walletsGenerated} wallets created, check "${file}" file`);
}
