import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import { Feedback, FeedbackAttributes } from '../../models/feedback';
dotenv.config();

export const listFeedBack = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const feedbacks = await Feedback.findAll();
    if (feedbacks.length > 0) {
      const response: GeneralResponse<{
        feedbacks: FeedbackAttributes[];
      }> = {
        status: 200,
        data: { feedbacks },
        message: 'Get list feedback successfully',
      };
      commonResponse(req, res, response);
    } else {
      const response: GeneralResponse<{}> = {
        status: 200,
        data: [],
        message: 'Get list feedback successfully',
      };
      commonResponse(req, res, response);
    }
  } catch (error: any) {
    console.error(error);
    const response: GeneralResponse<{}> = {
      status: 400,
      data: null,
      message: error.message,
    };
    commonResponse(req, res, response);
  }
};
