import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Medicine } from '../models/Medicine';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getAdminCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, image, iconName } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      iconName: iconName || 'Pill',
    });

    await logAudit({
      req,
      action: 'CATEGORY_CREATED',
      resourceType: 'Category',
      resourceId: category._id.toString(),
    });

    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, image, iconName, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (iconName !== undefined) category.iconName = iconName;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    await logAudit({
      req,
      action: 'CATEGORY_UPDATED',
      resourceType: 'Category',
      resourceId: category._id.toString(),
    });

    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const medicineCount = await Medicine.countDocuments({ category: id });
    if (medicineCount > 0) {
      // Soft-delete category if medicines are attached
      await Category.findByIdAndUpdate(id, { isActive: false });
      sendSuccess(res, null, `Category deactivated because it contains ${medicineCount} medicines.`);
      return;
    }

    await Category.findByIdAndDelete(id);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
}
