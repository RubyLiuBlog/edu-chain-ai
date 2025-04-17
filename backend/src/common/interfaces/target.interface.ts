export interface Target {
  id: string;
  goal: string;
  days: number;
  hash: string;
  createdBy: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}
