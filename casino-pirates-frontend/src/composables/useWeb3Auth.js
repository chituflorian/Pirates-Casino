import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalEvents,
  useWeb3ModalProvider,
} from "@web3modal/ethers/vue";
export function useWeb3Auth() {
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useWeb3ModalAccount();
  const events = useWeb3ModalEvents();
  const { walletProvider } = useWeb3ModalProvider();

  function openConnectWallet() {
    if (typeof open === "function") {
      open();
    }
  }
  function closeConnectWallet() {
    if (typeof close === "function") {
      close();
    }
  }
  function disconnectWallet() {
    if (typeof disconnect === "function") {
      disconnect();
    }
  }

  return {
    openConnectWallet,
    closeConnectWallet,
    disconnectWallet,
    events,
    address,
    isConnected,
    walletProvider,
  };
}
