import { Request, Response } from "express";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import {
  GeneralResponse,
  commonResponse,
} from "../../utilities/CommonResponse";
import { Users } from "../../models/users";
import { VolunteerRequest } from "../../models/volunteer_request";
import { volunteerRequestMapper } from "../../mapper/VolunteerRequestMapper";
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const getVolunteer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const decodedToken = jwt.verify(token, secretKey) as jwt.JwtPayload;
    const userId = decodedToken.id;
    const user = await Users.findByPk(userId);
    if (user) {
      if (!user.organization_id && user.role_id !== 2) {
        const response: GeneralResponse<{}> = {
          status: 400,
          data: null,
          message: "Bạn đã là tổ chức",
        };
        commonResponse(req, res, response);
      } else {
        const volunteerRequest = await VolunteerRequest.findAll({
          where: {
            organization_id: user.id,
          },
        });
        const volunteerRequestMapped = await volunteerRequestMapper(
          volunteerRequest
        );
        const response: GeneralResponse<{}> = {
          status: 200,
          data: volunteerRequestMapped,
          message: "Lấy danh sách tnv thành công",
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
