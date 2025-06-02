export interface TIncome {
  category: string[]
  income_name: string
  invoice_number: string
  date: string
  amount: number
  description?: string
  image?: string
  receipt_number: string
  income_source: string
  service_type?: string
  customer?: string
  job_card?: string
  invoice?: string
  vehicle?: string
  department?: string
  payment_method?: string
  payment_status?: string
  reference_number?: string
  tax_applied?: boolean
  tax_rate?: number
  tax_amount?: number
  total_amount?: number
  document_notes?: string
  document:string;
}

