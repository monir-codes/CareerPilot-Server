import { Request, Response } from 'express';
import { CareerPath } from '../models/CareerPath.model';
import { sendSuccess } from '../utils/response';

export class CareerPathController {
  static async getAll(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      let query: any = { isDeleted: false };
      
      if (category && category !== 'All Categories') {
        query.category = category;
      }
      
      if (search) {
        query.$text = { $search: search as string };
      }

      const careers = await CareerPath.find(query);
      sendSuccess(res, careers, 'Careers fetched successfully', 200);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch careers' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const career = await CareerPath.findOne({ _id: req.params.id, isDeleted: false });
      if (!career) return res.status(404).json({ success: false, message: 'Career not found' });
      
      sendSuccess(res, career, 'Career fetched successfully', 200);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Invalid ID or failed to fetch' });
    }
  }
}
