export class CovalentLogEvent {
  /** * The block signed timestamp in UTC. */
  block_signed_at: Date;
  /** * The height of the block. */
  block_height: number;
  /** * The offset is the position of the tx in the block. */
  tx_offset: number;
  /** * The offset is the position of the log entry within an event log. */
  log_offset: number;
  /** * The requested transaction hash. */
  tx_hash: string;
  /** * The log topics in raw data. */
  raw_log_topics: string[];
  /** * Use contract decimals to format the token balance for display purposes - divide the balance by `10^{contract_decimals}`. */
  sender_contract_decimals: number;
  /** * The name of the sender. */
  sender_name: string;
  sender_contract_ticker_symbol: string;
  /** * The address of the sender. */
  sender_address: string;
  /** * The label of the sender address. */
  sender_address_label: string;
  /** * The contract logo URL. */
  sender_logo_url: string;
  /** * The log events in raw. */
  raw_log_data: string;
  /** * The decoded item. */
  decoded: DecodedItem;
}

export class DecodedItem {
  name: string;
  signature: string;
  params: Param[];
}

export class Param {
  name: string;
  type: string;
  indexed: boolean;
  decoded: boolean;
  value: string;
}
