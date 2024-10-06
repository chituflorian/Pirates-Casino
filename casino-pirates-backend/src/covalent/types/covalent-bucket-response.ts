import { CovalentTransaction } from './covalent-transaction';

export class CovalentBucketResponse {
  address: string;

  updated_at: string;

  quote_currency: string;

  chain_id: number;

  chain_name: string;

  complete: boolean;

  current_bucket: number;

  links: {
    next: string;
    prev: string;
  };

  items: CovalentTransaction[];
}
