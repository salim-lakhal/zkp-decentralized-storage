import { Client, Wallet } from 'xrpl';

const standbySeedValue = "REDACTED_XRPL_SEED";
const net = 'wss://s.altnet.rippletest.net:51233/';

async function burnToken(Id, standbySeedValue, net) {
  const standby_wallet = Wallet.fromSeed("REDACTED_XRPL_SEED");
  const client = new Client('wss://s.altnet.rippletest.net:51233/');

  let results = 'Connecting to ' + 'wss://s.altnet.rippletest.net:51233/' + '...';

  try {
    await client.connect(); // Connectez-vous d'abord

    // Request a list of NFTs owned by the account
    const response = await client.request({
      method: "account_nfts",
      account: "REDACTED_XRPL_ADDRESS",
    });

    // Get the NFT ID
    const nfts = response.result.account_nfts;
    let nftId;

    for (const index in nfts) {
      if (parseInt(index) === Id) {
        nftId = nfts[index].NFTokenID;
        break;
      }
    }

    if (nftId === undefined) {
      throw new Error(`NFT with index ${Id} not found.`);
    }

    results += '\nConnected. Burning NFT...';

    const transactionBlob = {
      "TransactionType": "NFTokenBurn",
      "Account": "REDACTED_XRPL_ADDRESS",
      "NFTokenID": nftId,
    };

    const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet });

    results += `\nBurned NFT with ID: ${nftId}`;
    results += '\nTransaction result: ' + tx.result.meta.TransactionResult;
  } catch (error) {
    console.error("Error burning NFT:", error);
    results += '\nError burning NFT: ' + error.message;
  } finally {
    await client.disconnect();
    return results;
  }
}

export { burnToken };
