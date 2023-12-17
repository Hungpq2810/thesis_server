import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { GeneralResponse, commonResponse } from '../utilities/CommonResponse';
import { Organization, OrganizationAttributes } from '../models/organization';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const listOrganization = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const organizations = await Organization.findAll({ where: { status: 0 } });
    if (organizations.length > 0) {
      const response: GeneralResponse<{
        organizations: OrganizationAttributes[];
      }> = {
        status: 200,
        data: { organizations },
        message: 'Lấy danh sách tổ chức thành công',
      };
      commonResponse(req, res, response);
    } else {
      const response: GeneralResponse<{}> = {
        status: 200,
        data: [],
        message: 'Không có tổ chức nào',
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
export const createOrganization = async (
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
    if (userId) {
      const body = {
        name: req.body.name as string,
        description: req.body.description as string,
        location: req.body.location as string,
        creator: userId as number,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = await Organization.create(body);
      if (result) {
        const response: GeneralResponse<{}> = {
          status: 200,
          data: null,
          message: 'Tạo tổ chức thành công',
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
