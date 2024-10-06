import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CurrencyService } from '../currency/currency.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../blockchain/entities/transaction.entity';
import { In, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EvmService } from '../blockchain/evm.service';
import { TransactionState } from '../utils/enums/transaction-state.enum';
import { formatUnits } from 'ethers';
import { CovalentService } from '../covalent/covalent.service';
import { CovalentTransaction } from '../covalent/types/covalent-transaction';
import { ChainTypeEnum } from '../blockchain/chain-type.enum';

@Injectable()
export class DepositService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly currencyService: CurrencyService,
    private readonly covalentClient: CovalentService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    if (!process.env.COVALENT_API_KEY) {
      throw new Error('Missing COVALENT_API_KEY');
    }
  }

  async checkStaleDeposits(): Promise<void> {
    const staleTransactions = await this.transactionRepository.find({
      where: {
        status: TransactionState.Pending,
        createdAt: LessThanOrEqual(new Date(Date.now() - 600000)), //10 minutes
      },
      relations: ['chainCurrency', 'chain', 'chain.chainType'],
    });
    if (!staleTransactions.length) {
      return;
    }
    const evmTransactions = staleTransactions.filter(
      (transaction) => transaction.chain.chainType.name === ChainTypeEnum.EVM,
    );
    const covalentTransactions = await Promise.all(
      staleTransactions.map((tx) =>
        this.covalentClient.getTransaction({
          transactionHash: tx.hash,
          chainSlug: tx.chain.slug,
        }),
      ),
    );
    const transactionsToMarkAsFailed = evmTransactions.filter(
      (transaction) =>
        !covalentTransactions.find(
          (tx) => tx?.data?.tx_hash === transaction.hash,
        ),
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transactionsToUpdate = evmTransactions.filter((transaction) =>
      covalentTransactions.find((tx) => tx?.data?.tx_hash === transaction.hash),
    );
    await this.transactionRepository.manager.transaction(
      async (entityManagerTransactional) => {
        console.log('**##########');
        const parsedTransactions = covalentTransactions
          .filter((transaction) => transaction !== null)
          .map((transaction) =>
            EvmService.parseEvmTransaction(transaction!.data),
          );
        const relevantTransactions = parsedTransactions.filter(
          (transaction) =>
            transaction.to ===
            evmTransactions.find((elm) => transaction.hash === elm.hash)!
              .chainCurrency!.address,
        );
        console;
        const possibleUsers = relevantTransactions.map(
          (transaction) => transaction.from,
        );
        console.log({ possibleUsers }, 'possibleUsers');
        const users = await entityManagerTransactional.find(User, {
          where: {
            wallets: {
              address: In(possibleUsers),
            },
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const usersAddresses = users
          .map((user) => user.wallets.map((wallet) => wallet.address))
          .flat();

        await entityManagerTransactional.update(
          Transaction,
          transactionsToMarkAsFailed.map((transaction) => transaction.id),
          {
            status: TransactionState.Failed,
          },
        );
      },
    );
  }

  async checkNewDepositsForChain(chainId: number): Promise<void> {
    const chainData = await this.blockchainService.getChainById(chainId);
    const currencies = await this.currencyService.findAllCurrenciesOnChain(
      chainData.id,
    );
    const currencyAddresses = currencies.map((currency) => currency.address);
    const lastTransaction = await this.getLastTransactionForChain(chainId);
    console.log({ lastTransaction, currencyAddresses, currencies, chainData });

    const timeslot = chainData.lastChecked
      ? chainData.lastChecked.getTime() / 1000
      : Date.now() / 1000; //if no last transaction, check from now
    console.log({ timeslot }, 'timeslot');
    const uncheckedTransactions =
      await this.covalentClient.getInitialTimeBucket({
        unixTimestamp: timeslot,
        chainSlug: chainData.slug,
        wallet: chainData.depositAddress,
        quoteCurrency: 'USD',
      });
    console.log({ uncheckedTransactions }, '##########');
    if (!uncheckedTransactions) {
      throw new Error('Unable to fetch transactions');
    }

    const possibleTransactions = this.findRelevantTransactions({
      dbTransaction: lastTransaction,
      uncheckedTransactions: uncheckedTransactions,
    });
    console.log({ possibleTransactions }, 'possibleTransactions');

    if (possibleTransactions.length > 0) {
      await this.transactionRepository.manager.transaction(
        async (entityManagerTransactional) => {
          const parsedTransactions = possibleTransactions.map((transaction) =>
            EvmService.parseEvmTransaction(transaction),
          );
          const possibleUsers = parsedTransactions.map(
            (transaction) => transaction.from,
          );
          console.log({ possibleUsers }, 'possibleUsers');
          const users = await entityManagerTransactional
            .createQueryBuilder(User, 'user')
            .leftJoinAndSelect('user.wallets', 'wallet')
            .where('LOWER(wallet.address) = ANY (ARRAY[:...possibleUsers])', {
              possibleUsers: possibleUsers.map((address) =>
                address.toLowerCase(),
              ),
            })
            .getMany();

          const usersAddresses = users
            .map((user) => user.wallets.map((wallet) => wallet.address))
            .flat();

          console.log(
            {
              parsedTransactions,
              usersAddresses,
              currencyAddresses,
              test1: currencyAddresses.includes(parsedTransactions[0].currency),
              test2: usersAddresses
                .map((elm) => elm.toLowerCase())
                .includes(parsedTransactions[0].from.toLowerCase()),
            },
            'parsedTransactions',
          );
          const transactions = parsedTransactions
            .filter(
              (transaction) =>
                currencyAddresses.includes(transaction.currency) &&
                usersAddresses
                  .map((elm) => elm.toLowerCase())
                  .includes(parsedTransactions[0].from.toLowerCase()),
            )
            .map((transaction) => {
              return entityManagerTransactional.save(Transaction, {
                user: users.find((user) =>
                  Boolean(
                    user.wallets.filter(
                      (wallet) =>
                        wallet.address.toLowerCase() ===
                        transaction.from.toLowerCase(),
                    ),
                  ),
                ),
                amount: Number(
                  formatUnits(transaction.amount!, transaction.decimals ?? 18),
                ),
                blockNumber: transaction.blockNumber,
                hash: transaction.hash,
                chainCurrency: currencies.find(
                  (currency) => currency.address === transaction.currency,
                ),
                chain: chainData,
                usdValue: transaction.usdValue,
                blockTimestamp: transaction.blockTimestamp,
                status: TransactionState.Completed,
              });
            });

          await Promise.all(transactions);
          console.log({ transactions }, 'transactions');
        },
      );
    }
    chainData.lastChecked = new Date();
    await chainData.save();
  }

  private findRelevantTransactions(options: {
    dbTransaction: Transaction | null;
    uncheckedTransactions: CovalentTransaction[];
  }) {
    if (!options.dbTransaction) {
      return options.uncheckedTransactions;
    }
    return options.uncheckedTransactions.filter(
      (transaction) =>
        transaction.block_height > options.dbTransaction!.blockNumber,
    );
  }

  private async getLastTransactionForChain(
    chainId: number,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: {
        chainId,
        status: TransactionState.Completed,
        blockNumber: Not(IsNull()),
      },
      order: { blockTimestamp: 'DESC' },
    });
  }
}
