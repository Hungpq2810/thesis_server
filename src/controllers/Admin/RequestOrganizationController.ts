import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import {
  GeneralResponse,
  commonResponse,
} from '../../utilities/CommonResponse';
import {
  OrganizationRequest,
  OrganizationRequestAttributes,
} from '../../models/organization_request';
import { Users } from '../../models/users';
import { Organization } from '../../models/organization';
dotenv.config();

export const listRequestOrganization = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const requestOrganizations = await OrganizationRequest.findAll();
    if (requestOrganizations.length > 0) {
      const response: GeneralResponse<{
        requestOrganizations: OrganizationRequestAttributes[];
      }> = {
        status: 200,
        data: { requestOrganizations },
        message: 'Get list request organizations successfully',
      };
      commonResponse(req, res, response);
    } else {
      const response: GeneralResponse<{}> = {
        status: 200,
        data: [],
        message: 'Get list request organizations successfully',
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
export const updateRequestOrganization = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const organizationId = req.body.organization_id as number;
    const checkStatus = req.body.status as number;
    if (checkStatus === 0) {
      const body = { status: 0, updated_at: new Date() };
      const organizationRequestRecord = await OrganizationRequest.findOne({
        where: { organization_id: organizationId },
      });
      if (organizationRequestRecord) {
        const result = await organizationRequestRecord.update(body);
        const accountUser = await Users.findByPk(
          organizationRequestRecord.user_id,
        );
        if (result && accountUser) {
          const resultTwo = await accountUser.update({
            role_id: 2,
            organization_id: organizationRequestRecord.organization_id,
            updated_at: new Date(),
          });
          if (resultTwo) {
            const response: GeneralResponse<{}> = {
              status: 200,
              data: null,
              message: 'Update successfully',
            };
            commonResponse(req, res, response);
          }
        }
      }
    } else if (checkStatus === 2) {
      const body = { status: 2, updated_at: new Date() };
      const organizationRequestRecord =
        await OrganizationRequest.findByPk(organizationId);
      const organization = await Organization.findByPk(organizationId);
      if (organizationRequestRecord && organization) {
        const result = await organizationRequestRecord.update(body);
        await organization.update({ status: 1 });
        if (result) {
          const response: GeneralResponse<{}> = {
            status: 200,
            data: null,
            message: 'Update successfully',
          };
          commonResponse(req, res, response);
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
