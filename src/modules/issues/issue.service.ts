import { pool } from "../../database";
import type { IIssue, QueryResult } from "./issue.interface";

// CREATE ISSUE
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

// GET ALL ISSUES
const getAllIssuesFromDB = async (query: QueryResult) => {
  const { sort, type, status } = query;

  let whereClause = "";
  const values: string[] = [];

  if (type) {
    whereClause = "WHERE type = $1";
    values.push(type);
  } else if (status) {
    whereClause = "WHERE status = $1";
    values.push(status);
  }
  const orderClause =
    sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";


  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values,
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  const issuesWithReporter = [];

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];

    const reporterResult = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id=$1`,
      [issue.reporter_id],
    );

    const { reporter_id, ...issueWithoutReporterId } = issue;

    issuesWithReporter.push({
      ...issueWithoutReporterId,
      reporter: reporterResult.rows[0] || null,
    });
  }

  return issuesWithReporter;
};

// GET SINGLE ISSUE
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

// UPDATE ISSUE
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

// DELETE ISSUE
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
