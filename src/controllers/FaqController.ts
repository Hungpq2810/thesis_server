import { Request, Response } from 'express';
import { GeneralResponse, commonResponse } from '../utilities/CommonResponse';
import { FAQ, FAQAttributes } from '../models/faq';
export const listFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.findAll();
    const response: GeneralResponse<{ faqs: FAQAttributes[] }> = {
      status: 200,
      data: { faqs },
      message: 'Get list of faqs successfully',
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
