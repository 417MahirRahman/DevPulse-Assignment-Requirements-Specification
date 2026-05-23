import { pool } from "../../database";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type } = payload;
  
  const validStatus = ["contributor", "maintainer"];
  const status =
      payload.status && validStatus.includes(payload.status)
        ? payload.status
        : "open";

  const result = await pool.query(
    `
     INSERT INTO issues(title,description,type,status) VALUES($1,$2,$3,$4,) 
     RETURNING *
    `,
    [title, description, type, status],
  );

  return result;
};

const getAllIssuesFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM issues  
        `);
  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1  
        `,
    [id],
  );
  return result;
};

const updateIssueFromDB = async (payload: IIssue, id: string) => {
  const { title, description, status } = payload;

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
    [title, description, status, id],
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
