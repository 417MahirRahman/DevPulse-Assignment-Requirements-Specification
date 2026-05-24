export interface IIssue {
  title: string;
  description: string;
  type: string;
  status: string;
  reporter_id: number;
}

export interface QueryResult {
  sort?: string;
  type?: string;
  status?: string;
}
