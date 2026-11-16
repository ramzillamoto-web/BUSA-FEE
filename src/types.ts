export interface PaymentItem {
  id: number;
  monthNum: string;
  dueDate: string;
  dueDateISO: string;
  amount: number;
  method: string;
  status: 'Pending' | 'Paid';
  referenceNo: string;
  paidAt: string | null;
  notes: string;
  receiptProof?: string;
}

export interface AgreementMeta {
  title: string;
  subtitle: string;
  dateGenerated: string;
  payer: string;
  receiver: string;
  receiverMayaNumber: string;
  receiverMayaName: string;
  monthlyPayment: number;
  duration: string;
  totalAmount: number;
  currency: string;
  currencySymbol: string;
  payerSigned: boolean;
  receiverSigned: boolean;
  payerSignDate: string;
  receiverSignDate: string;
}
