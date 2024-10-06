import { CovalentLogEvent } from './covalent-log-event';

export class CovalentTransaction {
  /** * The block signed timestamp in UTC. */
  block_signed_at: string;
  /** * The height of the block. */
  block_height: number;
  /** * The hash of the block. Use it to remove transactions from re-org-ed blocks. */
  block_hash: string;
  /** * The requested transaction hash. */
  tx_hash: string;
  /** * The offset is the position of the tx in the block. */
  tx_offset: number;
  /** * Indicates whether a transaction failed or succeeded. */
  successful: boolean;
  /** * The sender's wallet address. */
  from_address: string;
  /** * The address of the miner. */
  miner_address: string;
  /** * The label of `from` address. */
  from_address_label: string;
  /** * The receiver's wallet address. */
  to_address: string;
  /** * The label of `to` address. */
  to_address_label: string;
  /** * The value attached to this tx. */
  value: bigint | null;
  /** * The value attached in `quote-currency` to this tx. */
  value_quote: number;
  /** * A prettier version of the quote for rendering purposes. */
  pretty_value_quote: string;
  /** * The requested chain native gas token metadata. */
  gas_metadata: any;
  gas_offered: string;
  /** * The gas spent for this tx. */
  gas_spent: string;
  /** * The gas price at the time of this tx. */
  gas_price: string;
  /** * The total transaction fees (`gas_price` * `gas_spent`) paid for this tx, denoted in wei. */
  fees_paid: bigint | null;
  /** * The gas spent in `quote-currency` denomination. */
  gas_quote: number;
  /** * A prettier version of the quote for rendering purposes. */
  pretty_gas_quote: string;
  /** * The native gas exchange rate for the requested `quote-currency`. */
  gas_quote_rate: number;
  /** * The explorer links for this transaction. */
  explorers: any[];
  /** * The details for the dex transaction. */
  dex_details: any[];
  /** * The details for the NFT sale transaction. */
  nft_sale_details: any[];
  /** * The details for the lending protocol transaction. */
  lending_details: any[];
  /** * The log events. */
  log_events: CovalentLogEvent[];
  /** * The details related to the safe transaction. */
  safe_details: any[];
}
