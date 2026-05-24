import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issue.service";

// CREATE ISSUE
const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req?.user?.id;
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      reporter_id,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });

  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// GET ALL ISSUES
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueService.getAllIssuesFromDB({
      sort: sort as string,
      type: type as string,
      status: status as string,
    });

    if (result.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "No issues found!",
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully!",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// GET SINGLE ISSUE
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);

    if (result.rows.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!",
        data: {},
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

//UPDATE ISSUE
const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const loggedInUser = req.user;
    const issueResult = await issueService.getSingleIssueFromDB(id as string);

    if (issueResult.rows.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!",
      });
      return;
    }

    const issue = issueResult.rows[0];
    const isMaintainer = loggedInUser?.role === "maintainer";
    const isOwner = issue.reporter_id === Number(loggedInUser?.id);
    const isOpen = issue.status === "open";

    if (!isMaintainer) {
      if (!isOwner) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You can update only your own issues!",
        });
        return;
      }

      if (!isOpen) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Only open issues can be updated!",
        });
        return;
      }
    }

    const result = await issueService.updateIssueFromDB(req.body, id as string);

    if (result.rows.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!",
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};


// DELETE ISSUE
const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const loggedInUser = req.user;
    const isMaintainer = loggedInUser?.role === "maintainer";

    if (!isMaintainer) {
      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Only maintainers can delete issues!",
      });
      return;
    }

    const result = await issueService.deleteIssueFromDB(id as string);

    if (result.rowCount === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!",
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully!",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};


//EXPORT CONTROLLER
export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
