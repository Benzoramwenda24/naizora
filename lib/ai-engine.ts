// lib/ai-engine.ts

export type TradeCategory = 'MATCHES' | 'DIFFERS' | 'OVER' | 'UNDER' | 'EVEN' | 'ODD';

export interface AISettings {
  symbol: string;
  stake: number;
  tradeType: TradeCategory;
  barrier: number; // e.g., digit target or prediction threshold
  
  // Optional Entry Digit Condition
  useEntryCondition: boolean;
  entryDigit: number;

  // Martingale & Risk Management
  martingaleMultiplier: number;
  takeProfit: number;
  stopLoss: number;

  // Optional Recovery Settings (Different trade type on loss)
  useRecovery: boolean;
  recoveryTradeType: TradeCategory;
  recoveryBarrier: number;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  totalProfit: number;
  currentStake: number;
  isRecovering: boolean;
  status: 'IDLE' | 'ANALYZING' | 'TRADING' | 'STOPPED' | 'TP_HIT' | 'SL_HIT';
}

export class AITradingEngine {
  private settings: AISettings;
  private stats: TradeStats;
  private isRunning: boolean = false;
  private ws: WebSocket | null = null;
  private onUpdate: (stats: TradeStats, logMessage: string) => void;

  constructor(settings: AISettings, onUpdate: (stats: TradeStats, logMessage: string) => void) {
    this.settings = settings;
    this.stats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalProfit: 0,
      currentStake: settings.stake,
      isRecovering: false,
      status: 'IDLE',
    };
    this.onUpdate = onUpdate;
  }

  public startTrading(wsInstance: WebSocket) {
    this.ws = wsInstance;
    this.isRunning = true;
    this.stats.status = 'ANALYZING';
    this.stats.currentStake = this.settings.stake;
    this.stats.isRecovering = false;
    this.onUpdate(this.stats, "AI Engine started. Subscribing to live market ticks...");
    this.subscribeTicks();
  }

  public stopTrading() {
    this.isRunning = false;
    this.stats.status = 'STOPPED';
    this.onUpdate(this.stats, "AI Trading halted by user.");
  }

  private subscribeTicks() {
    if (!this.ws || !this.isRunning) return;

    const request = JSON.stringify({
      ticks: this.settings.symbol,
      subscribe: 1,
    });
    this.ws.send(request);

    const handleMessage = (event: MessageEvent) => {
      if (!this.isRunning) {
        this.ws?.removeEventListener('message', handleMessage);
        return;
      }

      const data = JSON.parse(event.data);

      if (data.msg_type === 'tick') {
        const lastQuote = data.tick.quote.toString();
        const lastDigit = parseInt(lastQuote.slice(-1), 10);
        this.evaluateConditions(lastDigit);
      }
    };

    this.ws.addEventListener('message', handleMessage);
  }

  private evaluateConditions(lastDigit: number) {
    if (this.stats.status === 'TRADING') return;

    // If Entry Condition is enabled, check if digit matches target before trading
    if (this.settings.useEntryCondition) {
      if (lastDigit === this.settings.entryDigit) {
        this.onUpdate(
          this.stats,
          `Trigger met! Last digit ${lastDigit} matches entry target. Executing trade...`
        );
        this.executeContract();
      } else {
        this.onUpdate(this.stats, `Analyzing... Current digit: ${lastDigit} (Waiting for entry digit ${this.settings.entryDigit})`);
      }
    } else {
      // If disabled, execute immediately on incoming ticks
      this.onUpdate(this.stats, `Live tick received: ${lastDigit}. Executing instant trade...`);
      this.executeContract();
    }
  }

  private executeContract() {
    if (!this.isRunning || !this.ws) return;
    this.stats.status = 'TRADING';

    // Determine if we use primary strategy or recovery strategy
    const activeType = this.stats.isRecovering ? this.settings.recoveryTradeType : this.settings.tradeType;
    const activeBarrier = this.stats.isRecovering ? this.settings.recoveryBarrier : this.settings.barrier;

    let contractType = 'DIGITMATCH';
    let barrierValue = activeBarrier.toString();

    switch (activeType) {
      case 'MATCHES': contractType = 'DIGITMATCH'; break;
      case 'DIFFERS': contractType = 'DIGITDIFF'; break;
      case 'OVER': contractType = 'DIGITOVER'; break;
      case 'UNDER': contractType = 'DIGITUNDER'; break;
      case 'EVEN': contractType = 'DIGITEVEN'; barrierValue = ''; break;
      case 'ODD': contractType = 'DIGITODD'; barrierValue = ''; break;
    }

    const proposalReq: Record<string, any> = {
      amount: this.stats.currentStake,
      basis: 'stake',
      contract_type: contractType,
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol: this.settings.symbol,
      passthrough: { ai_generated: true },
    };

    if (barrierValue !== '') {
      proposalReq.barrier = barrierValue;
    }

    this.ws.send(JSON.stringify({ buy: 1, price: this.stats.currentStake, parameters: proposalReq }));
  }

  public handleContractResult(isWin: boolean, profitAmount: number) {
    if (!this.isRunning) return;
    this.stats.totalTrades += 1;

    if (isWin) {
      this.stats.wins += 1;
      this.stats.totalProfit += profitAmount;
      this.stats.currentStake = this.settings.stake;
      this.stats.isRecovering = false; // Reset recovery state on win
      this.onUpdate(this.stats, `WIN! Profit: +$${profitAmount.toFixed(2)}. Stake & strategy reset.`);
    } else {
      this.stats.losses += 1;
      this.stats.totalProfit -= this.stats.currentStake;
      
      // Apply Martingale & Activate Recovery Strategy if enabled
      const newStake = this.stats.currentStake * this.settings.martingaleMultiplier;
      this.stats.currentStake = parseFloat(newStake.toFixed(2));
      
      if (this.settings.useRecovery) {
        this.stats.isRecovering = true;
        this.onUpdate(this.stats, `LOSS! Switching to Recovery Strategy (${this.settings.recoveryTradeType}) with stake $${this.stats.currentStake}`);
      } else {
        this.onUpdate(this.stats, `LOSS! Martingale applied: New Stake = $${this.stats.currentStake}`);
      }
    }

    // Check Take Profit & Stop Loss
    if (this.stats.totalProfit >= this.settings.takeProfit) {
      this.stats.status = 'TP_HIT';
      this.isRunning = false;
      this.onUpdate(this.stats, `🎯 Take Profit Reached! Total Profit: +$${this.stats.totalProfit.toFixed(2)}`);
      return;
    }

    if (Math.abs(this.stats.totalProfit) >= this.settings.stopLoss && this.stats.totalProfit < 0) {
      this.stats.status = 'SL_HIT';
      this.isRunning = false;
      this.onUpdate(this.stats, `🛑 Stop Loss Hit! Total Loss: -$${Math.abs(this.stats.totalProfit).toFixed(2)}`);
      return;
    }

    this.stats.status = 'ANALYZING';
  }
}
