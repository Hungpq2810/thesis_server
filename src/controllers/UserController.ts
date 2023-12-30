import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {
  GeneralResponse,
  commonResponse,
} from '../utilities/CommonResponse';
import { UserAttributes, Users } from '../models/users';
import { SkillUsers } from '../models/skill_users';
import {
  VolunteerRequest,
  VolunteerRequestAttributes,
} from "../models/volunteer_request";
import { Organization, OrganizationAttributes } from '../models/organization';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const updateProfile = async (
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
    const userId = decodedToken.id;
    const user = await Users.findByPk(userId);
    if (!user) {
      const response: GeneralResponse<{}> = {
        status: 400,
        data: null,
        message: 'Không tìm thấy user',
      };
      commonResponse(req, res, response);
      return;
    } else {
      if (Array.isArray(req.body.skills) && user.role_id === 1) {
        const skills = req.body.skills.map((skillId: string) => ({
          skill_id: skillId,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        }));
         // Tìm kiếm tất cả các cặp skill-user hiện có của user
  const existingSkills = await SkillUsers.findAll({
    where: { user_id: userId },
  });

  // Xóa các cặp skill-user không có trong input mới
  const deletedSkills = existingSkills.filter((skill) => !skills.includes(skill.skill_id));
  for (const skill of deletedSkills) {
    await SkillUsers.destroy({
      where: { skill_id: skill.skill_id, user_id: userId },
    });
  }

  // Thêm hoặc cập nhật các cặp skill-user mới
  for (const skill of skills) {
    const existingSkill = existingSkills.find((s) => s.skill_id === skill.skill_id);

    if (existingSkill) {
      // Nếu cặp skill-user đã tồn tại, chỉ cần cập nhật thời gian updated_at
      await existingSkill.update({ updated_at: new Date() });
    } else {
      // Nếu cặp skill-user chưa tồn tại, tạo mới
      await SkillUsers.create(skill);
    }
  }
      }
      const body = req.body;
      delete body.role_id;
      // delete body.organization_id;
      const result = await user.update(body);
      const response: GeneralResponse<UserAttributes> = {
        status: 200,
        data: result.toJSON() as UserAttributes,
        message: 'Cập nhật thành công',
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

export const detailUser = async (
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
    const userId = decodedToken.id;
    const user = await Users.findByPk(userId);
    if (!user) {
      const response: GeneralResponse<{}> = {
        status: 400,
        data: null,
        message: 'Không tìm thấy người dùng',
      };
      commonResponse(req, res, response);
      return;
    }

    const userSkills = await SkillUsers.findAll({
      where: { user_id: userId },
    });
    const userOrganizerRequest = await VolunteerRequest.findOne({
      where: { user_id: userId },
    });
    const userOrganization = userOrganizerRequest
      ? await Organization.findOne({
          where: { id: userOrganizerRequest.organization_id },
        })
      : null;

    const response: GeneralResponse<{
      user: UserAttributes;
      skills: SkillUsers[];
      belongsOrganizer: {
        request: VolunteerRequestAttributes | null;
        organization: OrganizationAttributes | null;
      };
    }> = {
      status: 200,
      data: {
        user: user.toJSON() as UserAttributes,
        skills: userSkills,
        belongsOrganizer: {
          request: userOrganizerRequest,
          organization: userOrganization,
        },
      },
      message: 'Lấy thông tin người dùng thành công',
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
