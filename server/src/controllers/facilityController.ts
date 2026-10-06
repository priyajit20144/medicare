import { Request, Response, NextFunction } from 'express';
import { Facility } from '../models/Facility';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function getFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, city, search } = req.query;
    const query: any = { isActive: true };

    if (type) {
      query.type = type;
    }
    if (city) {
      query.city = new RegExp(`^${String(city)}$`, 'i');
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { address: searchRegex }];
    }

    const facilities = await Facility.find(query).populate('checkupPackages', 'name price discountPrice duration testCount');
    sendSuccess(res, facilities);
  } catch (error) {
    next(error);
  }
}

export async function getFacilityById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    let facility;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      facility = await Facility.findById(id).populate('checkupPackages');
    } else {
      facility = await Facility.findOne({ slug: id.toLowerCase() }).populate('checkupPackages');
    }

    if (!facility) {
      sendError(res, 'Facility not found', 404);
      return;
    }

    sendSuccess(res, facility);
  } catch (error) {
    next(error);
  }
}

export async function createFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, type, description, address, city, state, postalCode, phone, email, services, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const facility = await Facility.create({
      name,
      slug,
      type,
      description,
      address,
      city,
      state,
      postalCode,
      phone,
      email,
      services: services || [],
      image,
    });

    await logAudit({
      req,
      action: 'FACILITY_CREATED',
      resourceType: 'Facility',
      resourceId: facility._id.toString(),
    });

    sendSuccess(res, facility, 'Healthcare facility added successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const facility = await Facility.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!facility) {
      sendError(res, 'Facility not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'FACILITY_UPDATED',
      resourceType: 'Facility',
      resourceId: facility._id.toString(),
    });

    sendSuccess(res, facility, 'Facility updated successfully');
  } catch (error) {
    next(error);
  }
}
