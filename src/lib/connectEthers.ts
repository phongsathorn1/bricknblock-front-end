import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(
  'https://data-seed-prebsc-1-s1.binance.org:8545'
);

async function connectWallet() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    console.log('Connected account:', await signer.getAddress());
    return signer;
  } else {
    console.error('MetaMask is not installed!');
  }
}

// Export the provider or any other ethers.js setup you need
export { provider, connectWallet };
