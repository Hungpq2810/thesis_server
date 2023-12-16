import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { GeneralResponse, commonResponse } from '../utilities/CommonResponse';
import { Users } from '../models/users';
import { ActivityApply } from '../models/activity_apply';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const applyVolunteer = async (
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
    const userId = decodedToken.id;
    const user = await Users.findByPk(userId);
    if (user) {
      if (user.organization_id && user.role_id === 2) {
        const response: GeneralResponse<{}> = {
          status: 400,
          data: null,
          message: "Have an organization or you're an organization",
        };
        commonResponse(req, res, response);
      } else {
        const checkRequestTime = await ActivityApply.findAll({
          where: {
            user_id: userId,
            status: 0,
          },
        });
        if (checkRequestTime.length > 0) {
          const response: GeneralResponse<{}> = {
            status: 400,
            data: null,
            message: 'Applied',
          };
          commonResponse(req, res, response);
        } else {
          const body = {
            user_id: Number(userId) as number,
            activity_id: Number(req.body.activity_id) as number,
            status: 0,
            created_at: new Date(),
            updated_at: new Date(),
          };
          const result = await ActivityApply.create(body);
          if (result) {
            const response: GeneralResponse<{}> = {
              status: 200,
              data: null,
              message: 'Apply successfull',
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
