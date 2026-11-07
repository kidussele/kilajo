export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          base_currency: string
          theme_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          base_currency?: string
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          base_currency?: string
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      trading_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          broker: string
          platform: string
          account_type: string
          currency: string
          initial_balance: number
          current_balance: number
          is_prop_firm: boolean
          prop_firm_name: string | null
          is_active: boolean
          connection_status: 'manual' | 'connected' | 'sync_failed' | 'disconnected'
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          broker: string
          platform?: string
          account_type?: string
          currency?: string
          initial_balance: number
          current_balance: number
          is_prop_firm?: boolean
          prop_firm_name?: string | null
          is_active?: boolean
          connection_status?: 'manual' | 'connected' | 'sync_failed' | 'disconnected'
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          broker?: string
          platform?: string
          account_type?: string
          currency?: string
          initial_balance?: number
          current_balance?: number
          is_prop_firm?: boolean
          prop_firm_name?: string | null
          is_active?: boolean
          connection_status?: 'manual' | 'connected' | 'sync_failed' | 'disconnected'
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          account_id: string
          strategy_id: string | null
          symbol: string
          direction: 'BUY' | 'SELL'
          quantity: number
          entry_price: number
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          entry_time: string
          exit_time: string | null
          status: 'OPEN' | 'CLOSED' | 'CANCELLED'
          gross_pnl: number
          commission: number
          swap: number
          fees: number
          net_pnl: number
          pnl_percentage: number | null
          risk_amount: number | null
          r_multiple: number | null
          session: string | null
          emotion_before: string | null
          emotion_during: string | null
          emotion_after: string | null
          discipline_rating: number | null
          mistakes: string[] | null
          notes: string | null
          source: string
          source_ticket: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          strategy_id?: string | null
          symbol: string
          direction: 'BUY' | 'SELL'
          quantity: number
          entry_price: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          entry_time: string
          exit_time?: string | null
          status?: 'OPEN' | 'CLOSED' | 'CANCELLED'
          gross_pnl?: number
          commission?: number
          swap?: number
          fees?: number
          net_pnl?: number
          pnl_percentage?: number | null
          risk_amount?: number | null
          r_multiple?: number | null
          session?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          emotion_after?: string | null
          discipline_rating?: number | null
          mistakes?: string[] | null
          notes?: string | null
          source?: string
          source_ticket?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          strategy_id?: string | null
          symbol?: string
          direction?: 'BUY' | 'SELL'
          quantity?: number
          entry_price?: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          entry_time?: string
          exit_time?: string | null
          status?: 'OPEN' | 'CLOSED' | 'CANCELLED'
          gross_pnl?: number
          commission?: number
          swap?: number
          fees?: number
          net_pnl?: number
          pnl_percentage?: number | null
          risk_amount?: number | null
          r_multiple?: number | null
          session?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          emotion_after?: string | null
          discipline_rating?: number | null
          mistakes?: string[] | null
          notes?: string | null
          source?: string
          source_ticket?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prop_firm_rules: {
        Row: {
          id: string
          account_id: string
          firm_name: string
          challenge_type: string
          phase: number
          initial_balance: number
          profit_target_pct: number
          daily_loss_limit_pct: number
          max_loss_limit_pct: number
          min_trading_days: number
          max_calendar_days: number | null
          start_date: string
          end_date: string | null
          status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'DISQUALIFIED'
          breach_reason: string | null
          created_at: string
          updated_at: string
        }
      }
      strategies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          timeframe: string | null
          entry_conditions: string | null
          exit_conditions: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      psychology_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_score: number | null
          discipline_score: number | null
          stress_level: number | null
          sleep_hours: number | null
          market_prep_done: boolean
          rule_violations: string[] | null
          lessons_learned: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          type: 'PROFIT' | 'WIN_RATE' | 'DISCIPLINE' | 'RISK' | 'MAX_LOSS'
          target_value: number
          current_value: number
          period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
          start_date: string
          end_date: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

