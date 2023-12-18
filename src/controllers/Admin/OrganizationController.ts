import { Request, Response } from 'express';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import { Organization } from '../../models/organization';
import { Users } from '../../models/users';

export const deleteOrganization = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);
    const user = await Users.findOne({
      where: { organization_id: id },
    });
    if (organization) {
      await organization.destroy();
      if (user) {
        const body = {
          organization_id: null,
        };
        await user.update(body);
      }
      const response: GeneralResponse<{}> = {
        status: 200,
        data: null,
        message: `Xóa thành công tổ chức "${organization.name}"`,
      };
      commonResponse(req, res, response);
    } else {
      const response: GeneralResponse<{}> = {
        status: 200,
        data: [],
        message: 'Không tìm thấy tổ chức',
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
