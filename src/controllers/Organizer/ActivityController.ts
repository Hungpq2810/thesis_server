import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import { Users } from '../../models/users';
import { Activities } from '../../models/activities';
import { SkillActivities } from '../../models/skill_activities';
dotenv.config();
const secretKey = process.env.SECRETKEY as string;

export const createActivity = async (
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
    console.log(organizerId);

    const organizer = await Users.findOne({
      where: { id: organizerId, role_id: 2 },
    });
    console.log(organizer);
    if (organizer) {
      const body = {
        creator: organizerId as number,
        name: req.body.name as string,
        description: req.body.description as string,
        location: req.body.location as string,
        num_of_volunteers: 0,
        image: req.body.image as string,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = await Activities.create(body);
      if (result) {
        const skillsActivity = req.body.skills;
        try {
          const skillActivitiesPromises = skillsActivity.map(
            async (skill: number) => {
              const bodySkillActivities = {
                activity_id: result.id,
                skill_id: skill,
                created_at: new Date(),
                updated_at: new Date(),
              };
              return await SkillActivities.create(
                bodySkillActivities,
              );
            },
          );
          await Promise.all(skillActivitiesPromises);
        } catch (error) {
          console.error(error);
        }
        const response: GeneralResponse<{}> = {
          status: 200,
          data: result,
          message: 'Tạo thành công sự kiện',
        };
        commonResponse(req, res, response);
      }
    }
  } catch (error) {}
};
export const updateActivity = async (
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
      where: { id: organizerId, role_id: 2 },
    });

    if (organizer) {
      const activityId = req.params.id;
      const activity = await Activities.findByPk(activityId);
      const newSkills = req.body.skills;
      if (activity && activity.creator === organizerId) {
        const updatedActivity = {
          name: req.body.name as string,
          description: req.body.description as string,
          location: req.body.location as string,
          updated_at: new Date(),
          status: req.body.status,
        };

        await Activities.update(updatedActivity, {
          where: { id: activityId },
        });

        const existingSkillActivities = await SkillActivities.findAll(
          {
            where: {
              activity_id: activityId,
            },
          },
        );
        const existingSkills = existingSkillActivities.map(
          (skillActivity) => skillActivity.skill_id,
        );
        const skillsToDelete = existingSkills.filter(
          (skill: number) => !newSkills.includes(skill),
        );
        await SkillActivities.destroy({
          where: {
            activity_id: activityId,
            skill_id: skillsToDelete,
          },
        });
        const skillActivitiesToAdd = newSkills
          .filter((skill: number) => !existingSkills.includes(skill))
          .map((skill: number) => ({
            activity_id: activityId,
            skill_id: skill,
            created_at: new Date(),
            updated_at: new Date(),
          }));
        await SkillActivities.bulkCreate(skillActivitiesToAdd);
        const response: GeneralResponse<{}> = {
          status: 200,
          data: null,
          message: 'Cập nhật thành công',
        };
        commonResponse(req, res, response);
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }
  } catch (error) {
    console.error(error);
    const response: GeneralResponse<{}> = {
      status: 400,
      data: null,
      message: 'Xảy ra lỗi khi cập nhật',
    };
    commonResponse(req, res, response);
  }
};
export const deleteActivity = async (
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
      where: { id: organizerId, role_id: 2 },
    });

    if (organizer) {
      const activityId = req.params.id;
      const activity = await Activities.findByPk(activityId);

      if (activity && activity.creator === organizerId) {
        await Activities.destroy({
          where: { id: activityId },
        });

        const response: GeneralResponse<{}> = {
          status: 200,
          data: null,
          message: 'Xóa hoạt động thành công',
        };
        commonResponse(req, res, response);
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }
  } catch (error) {
    console.error(error);
    const response: GeneralResponse<{}> = {
      status: 400,
      data: null,
      message: 'Xảy ra lỗi khi xóa hoạt động',
    };
    commonResponse(req, res, response);
  }
};
