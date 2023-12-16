import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import { Feedback, FeedbackAttributes } from '../../models/feedback';
import { Users } from '../../models/users';
import { Activities } from '../../models/activities';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const listFeedBackByOrganizer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const decodedToken = jwt.verify(token, secretKey) as jwt.JwtPayload;
    const organizerId = decodedToken.id;
    const organizer = await Users.findOne({
      where: { id: organizerId, role_id: 2 },
    });
    if (organizer) {
      const activities = await Activities.findAll({
        where: { creator: organizer.organization_id },
      });
      const activityIds = activities.map((activity) => activity.id);
      const feedbacks = await Feedback.findAll({
        where: { activity_id: activityIds },
      });
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
