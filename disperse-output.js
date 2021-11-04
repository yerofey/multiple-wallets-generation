const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const bip39 = require('bip39');
const { fromMnemonic, fromZPrv } = require('ethereum-bip84');
const randomFloat = (min, max, decimals) => (Math.random() * (min - max) + max).toFixed(decimals);

const file = `.${path.sep}wallets-disperse.txt`;
const debug = false;
const accountFirstIndex = 0;
const accountLastIndex = accountFirstIndex + 10; // number of accounts
const accountWalletsFirstIndex = 0;
const accountWalletsLastIndex = accountWalletsFirstIndex + 99; // number of wallets per account
const walletReceiveMinAmount = 100_000;
const walletReceiveMaxAmount = 1_000_000_000;
const walletReceiveDecimals = 16;

if (debug) {
    console.time('runtime');
}

const mnemonic = bip39.generateMnemonic();

fs.writeFileSync(file, '');
fs.appendFileSync(file, mnemonic + "\n\n");

const root = new fromMnemonic(mnemonic, '')
for (let accountId = accountFirstIndex; accountId < accountLastIndex; accountId++) {
    const child = root.deriveAccount(accountId);
    const account = new fromZPrv(child);
    for (let walletId = accountWalletsFirstIndex; walletId <= accountWalletsLastIndex; walletId++) {
        const randomAmount = randomFloat(walletReceiveMinAmount, walletReceiveMaxAmount, walletReceiveDecimals);
        const sendTokensLine = `${account.getAddress(walletId)} ${randomAmount}`;
        fs.appendFileSync(file, sendTokensLine + "\n");
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
