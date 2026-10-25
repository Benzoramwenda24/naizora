// lib/ai-engine.ts

export type TradeCategory = 'MATCHES' | 'DIFFERS' | 'OVER' | 'UNDER' | 'EVEN' | 'ODD';

export interface AISettings {
  symbol: string;
  stake: number;
  tradeType: TradeCategory;
  barrier: number;
  useEntryCondition: boolean;
  entryDigit: number;
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
  private onUpdate: (stats: TradeStats, log: string) => void;
  private ws: any | null = null;
  private stats: TradeStats;
  private isRunning: boolean = false;
  private currentProposalId: string | null = null;

  constructor(settings: AISettings, onUpdate: (stats: TradeStats, log: string) => void) {
    this.settings = settings;
    this.onUpdate = onUpdate;
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

  public startTrading(ws: any) {
    this.ws = ws;
    this.isRunning = true;
    this.stats.status = 'RUNNING';
    this.onUpdate(this.stats, 'AI Engine active. Waiting for entry digit signal...');

    if (this.ws && this.ws.readyState === 1) {
      this.subscribeTicks();
    } else if (this.ws) {
      this.ws.onopen = () => this.subscribeTicks();
    }

    if (this.ws) {
      this.ws.onmessage = (event: any) => this.handleMessage(event);
    }
  }

  public stopTrading() {
    this.isRunning = false;
    this.stats.status = 'STOPPED';
    this.onUpdate(this.stats, 'Trading stopped by user.');
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({ forget_all: 'ticks' }));
    }
  }

  private subscribeTicks() {
    if (!this.ws || !this.isRunning) return;
    this.ws.send(
      JSON.stringify({
        ticks: this.settings.symbol,
        subscribe: 1,
      })
    );
  }

  private handleMessage(event: any) {
    if (!this.isRunning) return;
    const data = JSON.parse(event.data);

    if (data.msg_type === 'tick') {
      const tick = data.tick;
      const priceStr = tick.quote.toString();
      const lastDigit = parseInt(priceStr.slice(-1), 10);

      this.onUpdate(
        this.stats,
        `Tick: ${tick.quote} | Last Digit: ${lastDigit} | Target: ${this.settings.entryDigit}`
      );

      if (this.settings.useEntryCondition) {
        if (lastDigit === this.settings.entryDigit) {
          this.executeTrade();
        }
      } else {
        this.executeTrade();
      }
    } else if (data.msg_type === 'proposal') {
      if (data.proposal) {
        this.currentProposalId = data.proposal.id;
        this.buyProposal(this.currentProposalId);
      } else if (data.error) {
        this.onUpdate(this.stats, `Proposal Error: ${data.error.message}`);
      }
    } else if (data.msg_type === 'buy') {
      if (data.buy) {
        this.onUpdate(this.stats, `Trade Executed! ID: ${data.buy.contract_id}`);
      } else if (data.error) {
        this.onUpdate(this.stats, `Buy Error: ${data.error.message}`);
      }
    } else if (data.msg_type === 'proposal_open_contract') {
      const contract = data.proposal_open_contract;
      if (contract && contract.is_sold) {
        const profit = contract.profit;
        this.stats.totalTrades += 1;
        this.stats.totalProfit += profit;

        if (profit >= 0) {
          this.stats.wins += 1;
          this.stats.currentStake = this.settings.stake;
          this.stats.isRecovering = false;
          this.onUpdate(this.stats, `Win! +$${profit.toFixed(2)}. Reset stake.`);
        } else {
          this.stats.losses += 1;
          this.stats.isRecovering = true;
          if (this.settings.useRecovery) {
            this.stats.currentStake *= this.settings.martingaleMultiplier;
            this.onUpdate(
              this.stats,
              `Loss: -$${Math.abs(profit).toFixed(2)}. Recovery Stake: $${this.stats.currentStake.toFixed(2)}`
            );
          }
        }

        if (this.stats.totalProfit >= this.settings.takeProfit) {
          this.stats.status = 'TP_HIT';
          this.onUpdate(this.stats, `Take Profit Reached! $${this.stats.totalProfit.toFixed(2)}`);
          this.stopTrading();
        } else if (this.stats.totalProfit <= -this.settings.stopLoss) {
          this.stats.status = 'SL_HIT';
          this.onUpdate(this.stats, `Stop Loss Reached! $${this.stats.totalProfit.toFixed(2)}`);
          this.stopTrading();
        }
      }
    }
  }

  private executeTrade() {
    if (!this.ws || !this.currentProposalId) {
      this.requestProposal();
    } else {
      this.buyProposal(this.currentProposalId);
    }
  }

  private requestProposal() {
    if (!this.ws) return;
    const { symbol, tradeType, barrier } = this.settings;
    const stake = this.stats.currentStake;

    let contractType = 'DIGITMATCH';
    if (tradeType === 'DIFFERS') contractType = 'DIGITDIFF';
    if (tradeType === 'OVER') contractType = 'DIGITOVER';
    if (tradeType === 'UNDER') contractType = 'DIGITUNDER';
    if (tradeType === 'EVEN') contractType = 'DIGITEVEN';
    if (tradeType === 'ODD') contractType = 'DIGITODD';

    const proposalReq: Record<string, unknown> = {
      proposal: 1,
      amount: stake,
      basis: 'stake',
      currency: 'USD',
      symbol: symbol,
      contract_type: contractType,
      duration: 1,
      duration_unit: 't',
    };

    if (!['EVEN', 'ODD'].includes(tradeType)) {
      proposalReq.barrier = barrier;
    }

    this.ws.send(JSON.stringify(proposalReq));
  }

  private buyProposal(proposalId: string) {
    if (!this.ws) return;
    this.ws.send(
      JSON.stringify({
        buy: proposalId,
        price: this.stats.currentStake,
      })
    );
  }
}
