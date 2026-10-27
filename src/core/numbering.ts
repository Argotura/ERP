// ============================================================
// ARGOTURO ERP — Centralized Document Sequence Numbering
// ============================================================

export type SequenceType =
  | 'QUO'
  | 'SO'
  | 'DO'
  | 'INV'
  | 'PAY_IN'
  | 'RET_SO'
  | 'PR'
  | 'PO'
  | 'GR'
  | 'BILL'
  | 'PAY_OUT'
  | 'RET_PO'
  | 'MO'
  | 'TRF'
  | 'ADJ'
  | 'SC'
  | 'JE'
  | 'EXP'
  | 'LR'
  | 'PAY'
  | 'LED';

const SEQUENCE_PREFIXES: Record<SequenceType, string> = {
  QUO: 'QUO',
  SO: 'SO',
  DO: 'DO',
  INV: 'INV',
  PAY_IN: 'CP',
  RET_SO: 'SRT',
  PR: 'PR',
  PO: 'PO',
  GR: 'GR',
  BILL: 'BILL',
  PAY_OUT: 'SP',
  RET_PO: 'PRT',
  MO: 'MO',
  TRF: 'TRF',
  ADJ: 'ADJ',
  SC: 'SC',
  JE: 'JE',
  EXP: 'EXP',
  LR: 'LR',
  PAY: 'PAY',
  LED: 'LED',
};

export function generateDocNumber(type: SequenceType, existingNumbers: string[]): string {
  const prefix = SEQUENCE_PREFIXES[type];
  const currentYear = new Date().getFullYear();

  // Find the highest existing sequence number for this prefix and year
  const pattern = new RegExp(`^${prefix}-${currentYear}-(\\d+)$`);
  let maxSeq = 0;

  for (const num of existingNumbers) {
    const match = num.match(pattern);
    if (match) {
      const seqVal = parseInt(match[1], 10);
      if (!isNaN(seqVal) && seqVal > maxSeq) {
        maxSeq = seqVal;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(5, '0');
  return `${prefix}-${currentYear}-${padded}`;
}

