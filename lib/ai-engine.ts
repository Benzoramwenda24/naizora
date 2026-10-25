// lib/ai-engine.ts

export type TradeCategory = 'MATCHES' | 'DIFFERS' | 'OVER' | 'UNDER' | 'EVEN' | 'ODD';

export interface AISettings {
  symbol: string;
  recoverySymbol: string;
  stake: number;
  tradeType: TradeCategory;
  barrier: number;
  martingaleMultiplier: number;
  takeProfit: number;
  stopLoss: number;
  useRecovery: boolean;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  totalProfit: number;
  currentStake: number;
  isRecovering: boolean;
  status: 'IDLE' | 'RUNNING' | 'TP_HIT' | 'SL_HIT' | 'STOPPED';
}

export class AITradingEngine {
  private settings: AISettings;
  private callback: (stats: TradeStats, log: string) => void;
  private stats: TradeStats;
  private ws: WebSocket | null = null;
  private isRunning: boolean = false;
  private isAuthorized: boolean = false;
  private isContractActive: boolean = false;
  private currentSymbol: string;

  constructor(settings: AISettings, callback: (stats: TradeStats, log: string) => void) {
    this.settings = settings;
    this.callback = callback;
    this.currentSymbol = settings.symbol;
    this.stats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalProfit: 0,
      currentStake: settings.stake,
      isRecovering: false,
      status: 'IDLE',
    };
  }

  public startTrading() {
    this.isRunning = true;
    this.isAuthorized = false;
    this.isContractActive = false;
    this.currentSymbol = this.settings.symbol;
    this.stats.status = 'RUNNING';
    this.callback(this.stats, 'Connecting bot to Deriv API...');

    // Open a dedicated independent WebSocket for the bot
    this.ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

    this.ws.onopen = () => {
      this.callback(this.stats, 'Connected. Authorizing account...');
      this.authorize();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      if (!this.isRunning) return;
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('Parsing error:', e);
      }
    };

    this.ws.onerror = () => {
      this.callback(this.stats, 'WebSocket connection error.');
    };

    this.ws.onclose = () => {
      if (this.isRunning) {
        this.callback(this.stats, 'Connection closed. Reconnecting...');
        setTimeout(() => {
          if (this.isRunning) this.startTrading();
        }, 2000);
      }
    };
  }

  private getToken(): string {
    if (typeof window === 'undefined') return '';
    try {
      const activeLoginid = localStorage.getItem('active_loginid');
      const clientAccountsStr = localStorage.getItem('client.accounts');
      if (clientAccountsStr && activeLoginid) {
        const accounts = JSON.parse(clientAccountsStr);
        if (accounts[activeLoginid] && accounts[activeLoginid].token) {
          return accounts[activeLoginid].token;
        }
      }
      if (clientAccountsStr) {
        const accounts = JSON.parse(clientAccountsStr);
        const firstKey = Object.keys(accounts)[0];
        if (firstKey && accounts[firstKey].token) {
          return accounts[firstKey].token;
        }
      }
    } catch (e) {}

    const directKeys = ['config.token', 'user_token', 'token', 'authToken', 'active_token'];
    for (const k of directKeys) {
      const val = localStorage.getItem(k);
      if (val && val.trim() !== '' && val !== 'undefined' && val !== 'null') {
        return val.trim();
      }
    }
    return '';
  }

  private authorize() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const token = this.getToken();
    if (token) {
      this.ws.send(JSON.stringify({ authorize: token }));
    } else {
      this.callback(this.stats, 'Error: No active login token found. Please sign in.');
      this.stopTrading();
    }
  }

  private handleMessage(data: any) {
    const msgType = data.msg_type;

    if (msgType === 'authorize') {
      if (data.authorize) {
        this.isAuthorized = true;
        this.callback(this.stats, `Authorized (${data.authorize.loginid}). Placing initial trade...`);
        this.requestProposal();
      } else if (data.error) {
        this.callback(this.stats, `Authorization failed: ${data.error.message}`);
        this.stopTrading();
      }
    } else if (msgType === 'proposal') {
      if (data.proposal && data.proposal.id && this.isRunning && !this.isContractActive) {
        this.buyContract(data.proposal.id);
      } else if (data.error) {
        this.callback(this.stats, `Proposal error: ${data.error.message}`);
        this.isContractActive = false;
        setTimeout(() => {
          if (this.isRunning && !this.isContractActive) this.requestProposal();
        }, 1500);
      }
    } else if (msgType === 'buy') {
      if (data.buy) {
        this.isContractActive = true;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: data.buy.contract_id, subscribe: 1 }));
        }
        this.callback(this.stats, `Trade active on [${this.currentSymbol}] | Stake: $${this.stats.currentStake.toFixed(2)}. Waiting result...`);
      } else if (data.error) {
        this.callback(this.stats, `Buy error: ${data.error.message}`);
        this.isContractActive = false;
        setTimeout(() => {
          if (this.isRunning && !this.isContractActive) this.requestProposal();
        }, 1500);
      }
    } else if (msgType === 'proposal_open_contract') {
      const poc = data.proposal_open_contract;
      if (poc && poc.is_sold) {
        const profit = parseFloat(poc.profit || 0);
        const won = profit > 0;

        this.stats.totalTrades++;
        this.stats.totalProfit += profit;

        if (won) {
          this.stats.wins++;
          this.stats.currentStake = this.settings.stake;
          this.stats.isRecovering = false;
          this.currentSymbol = this.settings.symbol; // Return to primary market on win
          this.callback(this.stats, `WIN! +$${profit.toFixed(2)}. Back to primary market [${this.currentSymbol}].`);
        } else {
          this.stats.losses++;
          if (this.settings.useRecovery) {
            this.stats.currentStake = parseFloat((this.stats.currentStake * this.settings.martingaleMultiplier).toFixed(2));
            this.stats.isRecovering = true;
            this.currentSymbol = this.settings.recoverySymbol || this.settings.symbol; // Switch to recovery market on loss
            this.callback(this.stats, `LOSS: -$${Math.abs(profit).toFixed(2)}. Recovery market [${this.currentSymbol}] | $${this.stats.currentStake}.`);
          }
        }

        this.isContractActive = false;

        // Check Take Profit
        if (this.settings.takeProfit > 0 && this.stats.totalProfit >= this.settings.takeProfit) {
          this.stats.status = 'TP_HIT';
          this.callback(this.stats, `Take Profit Reached! Net P/L: +$${this.stats.totalProfit.toFixed(2)}`);
          this.stopTrading();
          return;
        }

        // Check Stop Loss
        if (this.settings.stopLoss > 0 && this.stats.totalProfit <= -Math.abs(this.settings.stopLoss)) {
          this.stats.status = 'SL_HIT';
          this.callback(this.stats, `Stop Loss Reached! Net P/L: -$${Math.abs(this.stats.totalProfit).toFixed(2)}`);
          this.stopTrading();
          return;
        }

        // Instantly request next trade
        setTimeout(() => {
          if (this.isRunning && !this.isContractActive && this.isAuthorized) {
            this.requestProposal();
          }
        }, 500);
      }
    }
  }

  private requestProposal() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isContractActive || !this.isRunning || !this.isAuthorized) return;

    let contractType = 'DIGITMATCH';
    if (this.settings.tradeType === 'DIFFERS') contractType = 'DIGITDIFF';
    else if (this.settings.tradeType === 'OVER') contractType = 'DIGITOVER';
    else if (this.settings.tradeType === 'UNDER') contractType = 'DIGITUNDER';
    else if (this.settings.tradeType === 'EVEN') contractType = 'DIGITEVEN';
    else if (this.settings.tradeType === 'ODD') contractType = 'DIGITODD';

    const proposalReq: any = {
      proposal: 1,
      amount: this.stats.currentStake,
      basis: 'stake',
      currency: 'USD',
      symbol: this.currentSymbol,
      duration: 1,
      duration_unit: 't',
      contract_type: contractType,
    };

    if (!['EVEN', 'ODD'].includes(this.settings.tradeType)) {
      proposalReq.barrier = this.settings.barrier.toString();
    }

    this.callback(this.stats, `Requesting trade on [${this.currentSymbol}] ($${this.stats.currentStake})...`);
    this.ws.send(JSON.stringify(proposalReq));
  }

  private buyContract(proposalId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        buy: proposalId,
        price: this.stats.currentStake,
      })
    );
  }

  public stopTrading() {
    this.isRunning = false;
    this.isAuthorized = false;
    this.isContractActive = false;
    if (this.stats.status === 'RUNNING') {
      this.stats.status = 'STOPPED';
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      this.ws = null;
    }
    this.callback(this.stats, 'Bot stopped immediately.');
  }
}
