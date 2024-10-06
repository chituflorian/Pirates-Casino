import { CovalentTransaction } from '../covalent/types/covalent-transaction';

export interface ITransaction {
  from: string;
  to: string;
  amount: bigint | null;
  currency: string;
  blockNumber: number;
  hash: string;
  decimals?: number;
  usdValue: number;
  blockTimestamp: number;
}
export const nullAddress = '0x0000000000000000000000000000000000000000';

export class EvmService {
  public static parseEvmTransaction(
    transaction: CovalentTransaction,
  ): ITransaction {
    console.log(
      !transaction.log_events || transaction.log_events.length === 0,
      'boolean',
    );
    if (!transaction.log_events || transaction.log_events.length === 0) {
      return {
        from: transaction.from_address,
        to: transaction.to_address,
        amount: transaction.value,
        currency: nullAddress,
        blockNumber: transaction.block_height,
        hash: transaction.tx_hash,
        usdValue: transaction.value_quote,
        blockTimestamp: Math.floor(
          new Date(transaction.block_signed_at).getTime() / 1000,
        ),
      };
    }
    const relevantLogEvent = transaction.log_events.find((logEvent) => {
      return (
        logEvent.decoded?.name === 'Transfer' &&
        logEvent.decoded?.params.length === 3 &&
        logEvent.decoded?.params[0].name === 'from' &&
        logEvent.decoded?.params[1].name === 'to' &&
        logEvent.decoded?.params[2].name === 'value'
      );
    });
    if (!relevantLogEvent) {
      throw new Error('Unable to find relevant log event');
    }
    return {
      from: relevantLogEvent.decoded?.params[0].value,
      to: relevantLogEvent.decoded?.params[1].value,
      amount: BigInt(relevantLogEvent.decoded?.params[2].value),
      currency: transaction.to_address,
      blockNumber: transaction.block_height,
      hash: transaction.tx_hash,
      decimals: relevantLogEvent.sender_contract_decimals,
      usdValue: transaction.value_quote,
      blockTimestamp: Math.floor(
        new Date(transaction.block_signed_at).getTime() / 1000,
      ),
    };
  }
}
