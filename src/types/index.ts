/* eslint-disable camelcase */


export const TransactionTypeMapping = {
    Deposit: 'deposit',
    Withdrawal: 'withdrawal',
};

export const TransactionSubtypeMapping = {
    Initiate: 'initiate',
    Prove: 'prove',
    Finalize: 'finalize',
};

export const TransactionStatusMapping = {
    Pending: 'pending',
    Completed: 'completed',
    Failed: 'failed',
};


export type WithdrawalSubtype = 'initiate' | 'prove' | 'finalize';
export type TransactionStatus = 'pending' | 'completed' | 'failed';


export type Deposit = {
  id: string;
  account: string;
  type: 'deposit';
  amount: number;
  currencySymbol: string;
  createdAt: Date;
};


export type DepositQuery = {
  id: string;
  account: string;
  type: 'deposit';
  amount: string;
  currency_symbol: string;
  created_at: Date;
};


export type Withdrawal = {
  id: string;
  account: string;
  type: 'withdrawal';
  amount: string;
  currencySymbol: string;
  createdAt: Date;
};


export type WithdrawalQuery = {
  id: string;
  account: string;
  type: 'withdrawal';
  amount: number;
  currency_symbol: string;
  created_at: Date;
};


export type Activity = {
  id: string;
  transaction_id: string;
  subtype: "initiate";
  transaction_hash: string;
  created_at: string;
  status: TransactionStatus;
  account: string;
  type: "deposit";
  amount: string;
  currency_symbol: "eth";
}

export type ActivityQuery = {
  id: string;
  transaction_id: string;
  subtype: "initiate";
  transaction_hash: string;
  created_at: string;
  status: TransactionStatus;
  account: string;
  type: "deposit";
  amount: string;
  currency_symbol: "eth";
};


export type ApiResponse = {message: string, success: boolean};