export type SalesPosition = 'gdkd' | 'gdvung' | 'tp' | 'pp' | 'ctv';
export type SalesTier = 'f1' | 'f2' | 'f3';

export interface SalesSubordinate {
  id: string;
  tier: SalesTier;
  name: string;
  revenue: number;
}

export interface SalesFixedCost {
  id: string;
  label: string;
  amount: number;
}

export type SalesServiceCostType = 'amount' | 'percent';

export interface SalesServiceCost {
  id: string;
  label: string;
  type: SalesServiceCostType;
  value: number;
  recurring: boolean;
  endMonth?: string;
}

export interface SalesMonth {
  id: string;
  yearMonth: string;
  position: SalesPosition;
  hasBaseSalary: boolean;
  retailRevenueA: number;
  retailRevenueB: number;
  retailRevenueARecurring?: boolean;
  retailRevenueAEndMonth?: string;
  retailRevenueBRecurring?: boolean;
  retailRevenueBEndMonth?: string;
  subordinates: SalesSubordinate[];
  serviceCosts: SalesServiceCost[];
  fixedCosts: SalesFixedCost[];
  notes?: string;
  retailRevenue?: number;
  serviceCostPct?: number;
}

export interface SalesMember {
  id: string;
  position: SalesPosition;
  name?: string;
  parentId?: string;
  count: number;
  createdAt?: number;
}
