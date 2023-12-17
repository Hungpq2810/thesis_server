import { Request, Response } from 'express';
import { GeneralResponse, commonResponse } from '../utilities/CommonResponse';
import { SkillAttributes, Skills } from '../models/skills';
export const listSkills = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const skills = await Skills.findAll();
    const response: GeneralResponse<{ skills: SkillAttributes[] }> = {
      status: 200,
      data: { skills },
      message: 'Lấy danh sách kỹ năng thành công',
    };
    commonResponse(req, res, response);
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
