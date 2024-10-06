import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/vue";

export default {
  install: () => {
    let projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
    const mainnet = {
      chainId: 1,
      name: "Ethereum",
      currency: "ETH",
      explorerUrl: "https://etherscan.io",
      rpcUrl: "https://cloudflare-eth.com",
    };

    const metadata = {
      name: "My Website",
      description: "My Website description",
      url: "https://mywebsite.com",
      icons: ["https://avatars.mywebsite.com/"],
    };

    createWeb3Modal({
      ethersConfig: defaultConfig({ metadata }),
      chains: [mainnet],
      projectId,
      themeVariables: {
        "--w3m-font-family": "Outfit Semi Bold, sans-serif",
      },
    });
  },
};
