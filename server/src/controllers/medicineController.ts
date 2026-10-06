import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Medicine } from '../models/Medicine';
import { Category } from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function getMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      category,
      brand,
      requiresPrescription,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      status = 'ACTIVE',
    } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { manufacturer: searchRegex },
      ];
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(String(category))) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: String(category).toLowerCase() });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    if (brand) {
      query.brand = new RegExp(`^${String(brand)}$`, 'i');
    }

    if (requiresPrescription !== undefined) {
      query.requiresPrescription = String(requiresPrescription) === 'true';
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'name_asc') sortOptions = { name: 1 };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Medicine.countDocuments(query),
    ]);

    sendSuccess(res, {
      medicines,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMedicineById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    let medicine;

    if (mongoose.Types.ObjectId.isValid(id)) {
      medicine = await Medicine.findById(id).populate('category', 'name slug description');
    } else {
      medicine = await Medicine.findOne({ slug: id.toLowerCase() }).populate('category', 'name slug description');
    }

    if (!medicine) {
      sendError(res, 'Medicine not found', 404);
      return;
    }

    sendSuccess(res, medicine);
  } catch (error) {
    next(error);
  }
}

export async function getRelatedMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      sendError(res, 'Medicine not found', 404);
      return;
    }

    const related = await Medicine.find({
      category: medicine.category,
      _id: { $ne: medicine._id },
      status: 'ACTIVE',
    })
      .limit(4)
      .populate('category', 'name slug');

    sendSuccess(res, related);
  } catch (error) {
    next(error);
  }
}

export async function getFilterMetadata(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [brands, dosageForms] = await Promise.all([
      Medicine.distinct('brand', { status: 'ACTIVE' }),
      Medicine.distinct('dosageForm', { status: 'ACTIVE' }),
    ]);

    sendSuccess(res, { brands: brands.filter(Boolean), dosageForms: dosageForms.filter(Boolean) });
  } catch (error) {
    next(error);
  }
}

export async function createMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      genericName,
      brand,
      description,
      shortDescription,
      category,
      images,
      price,
      discountPrice,
      stock,
      sku,
      manufacturer,
      dosageForm,
      strength,
      packSize,
      requiresPrescription,
      directions,
      warnings,
      ingredients,
    } = req.body;

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Normalize images: accept array of strings, single string, or image field
    let finalImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      finalImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    } else if (typeof images === 'string' && images.trim().length > 0) {
      finalImages = [images.trim()];
    } else if (typeof req.body.image === 'string' && req.body.image.trim().length > 0) {
      finalImages = [req.body.image.trim()];
    }

    const medicine = await Medicine.create({
      name,
      slug,
      genericName,
      brand,
      description,
      shortDescription: shortDescription || description.slice(0, 120),
      category,
      images: finalImages,
      price,
      discountPrice,
      stock,
      sku: sku || `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      manufacturer,
      dosageForm,
      strength,
      packSize,
      requiresPrescription: Boolean(requiresPrescription),
      directions,
      warnings,
      ingredients: ingredients || [],
      status: stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
    });

    await Category.findByIdAndUpdate(category, { $inc: { itemCount: 1 } });

    await logAudit({
      req,
      action: 'MEDICINE_CREATED',
      resourceType: 'Medicine',
      resourceId: medicine._id.toString(),
      metadata: { name, sku, imagesCount: finalImages.length },
    });

    sendSuccess(res, medicine, 'Medicine registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function uploadMedicineImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'No image file uploaded. Please upload a valid image file (JPG, PNG, or WebP).', 400);
      return;
    }

    const file = req.file;
    const imageUrl = `/uploads/${file.filename}`;

    await logAudit({
      req,
      action: 'MEDICINE_IMAGE_UPLOADED',
      resourceType: 'MedicineImage',
      resourceId: file.filename,
      metadata: {
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: imageUrl,
      },
    });

    sendSuccess(
      res,
      {
        url: imageUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
      'Medicine image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updateMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.body.image && !req.body.images) {
      updateData.images = [req.body.image];
    } else if (Array.isArray(req.body.images)) {
      updateData.images = req.body.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
    }

    const medicine = await Medicine.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (!medicine) {
      sendError(res, 'Medicine not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'MEDICINE_UPDATED',
      resourceType: 'Medicine',
      resourceId: medicine._id.toString(),
    });

    sendSuccess(res, medicine, 'Medicine updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    // Soft delete/deactivate
    const medicine = await Medicine.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!medicine) {
      sendError(res, 'Medicine not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'MEDICINE_DEACTIVATED',
      resourceType: 'Medicine',
      resourceId: medicine._id.toString(),
    });

    sendSuccess(res, null, 'Medicine deactivated successfully');
  } catch (error) {
    next(error);
  }
}
