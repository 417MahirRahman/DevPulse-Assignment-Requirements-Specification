import { pool } from "../../database";
import type { IIssue, QueryResult } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
     INSERT INTO issues(title, description, type, status, reporter_id)
     VALUES($1,$2,$3,COALESCE($4, 'open'),$5)
     RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );

  return result.rows[0];
};

const getAllIssuesFromDB = async (query: QueryResult) => {
  const { sort, type, status } = query;

  const conditions: string[] = [];
  const values: string[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  let whereClause = "";

  if (conditions.length > 0) {
    whereClause = "WHERE " + conditions[0];

    for (let i = 1; i < conditions.length; i++) {
      whereClause += " AND " + conditions[i];
    }
  }

  const orderClause =
    sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values,
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [] as string[];
  }

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  const reportersResult = await pool.query(
    `SELECT id, name, email, role FROM users WHERE id = ANY($1)`,
    [reporterIds],
  );

  const reporterMap: Record<number, any> = {};
  for (const reporter of reportersResult.rows) {
    reporterMap[reporter.id] = reporter;
  }

  const issuesWithReporter = issues.map((issue) => {
    const { reporter_id, ...issueWithoutReporterId } = issue;

    return {
      ...issueWithoutReporterId,
      reporter: reporterMap[reporter_id] || null, 
    };
  });

  return issuesWithReporter;
};

const getSingleIssueFromDB = async (id: string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id=$1`, [
    id,
  ]);

  if (issueResult.rows.length === 0) return issueResult;
  const issue = issueResult.rows[0];

  const reporterResult = await pool.query(
    `SELECT id, name, email, role FROM users WHERE id=$1`,
    [issue.reporter_id],
  );

  issueResult.rows[0] = {
    ...issue,
    reporter: reporterResult.rows[0] || null,
  };

  return issueResult;
};

const updateIssueFromDB = async (payload: IIssue, id: string) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status) 
    WHERE id=$5 RETURNING *
    `,
    [title, description, type, status, id],
  );

  return result;
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1  
      `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
};
