import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import { Users } from '../../models/users';
import {
  ActivityApply,
  ActivityApplyAttributes,
} from '../../models/activity_apply';
import { Activities } from '../../models/activities';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const listApplyVolunteers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const decodedToken = jwt.verify(
      token,
      secretKey,
    ) as jwt.JwtPayload;
    const organizerId = decodedToken.id;
    const organizer = await Users.findOne({
      where: {
        id: organizerId,
        role_id: 2,
      },
    });
    console.log(organizer);

    if (organizer) {
      const activityExits = await Activities.findAll({
        where: { creator: organizer.organization_id },
      });
      console.log('Find activity');

      console.log(activityExits);

      const activityIds = activityExits.map(
        (activity) => activity.id,
      );
      const appliedVolunteers = await ActivityApply.findAll({
        where: { activity_id: activityIds },
      });
      if (appliedVolunteers.length > 0) {
        const response: GeneralResponse<{
          appliedVolunteers: ActivityApplyAttributes[];
        }> = {
          status: 200,
          data: { appliedVolunteers },
          message: 'Get list applied volunteers successfully',
        };
        commonResponse(req, res, response);
      } else {
        const response: GeneralResponse<{}> = {
          status: 200,
          data: [],
          message: 'Get list applied volunteers successfully',
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

export const updateApplyVolunteer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const decodedToken = jwt.verify(
      token,
      secretKey,
    ) as jwt.JwtPayload;
    const organizerId = decodedToken.id;
    const organizer = await Users.findOne({
      where: {
        id: organizerId,
        role_id: 2,
      },
    });
    if (organizer) {
      const volunteerId = req.body.user_id as number;
      const activityId = req.body.activity_id as number;
      const checkStatus = req.body.status as number;

      const body = {
        status: checkStatus,
        updated_at: new Date(),
      };

      const volunteerApplyRecord = await ActivityApply.findOne({
        where: {
          user_id: volunteerId,
          activity_id: activityId,
        },
      });

      if (volunteerApplyRecord) {
        const result = await volunteerApplyRecord.update(body);
        const activity = await Activities.findByPk(
          volunteerApplyRecord.activity_id,
        );
        if (result && activity) {
          const resultTwo = await activity.update({
            // num_of_volunteers: activity.num_of_volunteers + 1,
            updated_at: new Date(),
          });
          if (resultTwo) {
            const response: GeneralResponse<{}> = {
              status: 200,
              data: null,
              message: 'Thay đổi trạng thái thành công',
            };
            commonResponse(req, res, response);
          }
        }
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
