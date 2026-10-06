import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart';
import { Medicine } from '../models/Medicine';
import { IUser } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    let cart = await Cart.findOne({ userId: user._id }).populate({
      path: 'items.medicineId',
      select: 'name genericName brand price discountPrice stock images requiresPrescription status packSize strength slug sku',
    });

    if (!cart) {
      cart = await Cart.create({ userId: user._id, items: [] });
    }

    // Filter out deleted/inactive medicines if any, and compute totals
    const validItems = cart.items.filter((item: any) => item.medicineId != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let hasPrescriptionRequiredItems = false;

    validItems.forEach((item: any) => {
      const med = item.medicineId;
      const unitPrice = med.discountPrice || med.price;
      const originalPrice = med.price;
      subtotal += originalPrice * item.quantity;
      totalDiscount += (originalPrice - unitPrice) * item.quantity;
      if (med.requiresPrescription) {
        hasPrescriptionRequiredItems = true;
      }
    });

    const deliveryFee = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
    const estimatedTax = Number(((subtotal - totalDiscount) * 0.05).toFixed(2));
    const total = Number(((subtotal - totalDiscount) + deliveryFee + estimatedTax).toFixed(2));

    sendSuccess(res, {
      cart,
      summary: {
        itemCount: validItems.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(totalDiscount.toFixed(2)),
        deliveryFee,
        tax: estimatedTax,
        total,
        hasPrescriptionRequiredItems,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { medicineId, quantity = 1 } = req.body;

    if (!medicineId) {
      sendError(res, 'Medicine identifier is required.', 400);
      return;
    }

    // 1. Resilient Lookup: by ObjectId, or slug, or sku, or case-insensitive search
    let medicine = null;
    if (mongoose.Types.ObjectId.isValid(medicineId)) {
      medicine = await Medicine.findById(medicineId);
    }
    if (!medicine) {
      medicine = await Medicine.findOne({
        $or: [
          { slug: medicineId },
          { sku: medicineId },
          { name: new RegExp(`^${medicineId.replace(/[-_]/g, ' ')}$`, 'i') },
        ],
      });
    }

    if (!medicine || medicine.status === 'INACTIVE') {
      sendError(res, 'Medicine is unavailable.', 404);
      return;
    }

    if (medicine.stock < quantity) {
      sendError(res, `Only ${medicine.stock} units available in stock.`, 400);
      return;
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    const medObjectIdStr = medicine._id.toString();
    const itemIndex = cart.items.findIndex(
      (item) => item.medicineId && item.medicineId.toString() === medObjectIdStr
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (medicine.stock < newQty) {
        sendError(res, `Cannot add more. Maximum available stock is ${medicine.stock}.`, 400);
        return;
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = medicine.price;
      cart.items[itemIndex].discountPrice = medicine.discountPrice;
    } else {
      cart.items.push({
        medicineId: medicine._id,
        quantity,
        price: medicine.price,
        discountPrice: medicine.discountPrice,
      });
    }

    await cart.save();
    getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { medicineId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      sendError(res, 'Cart not found', 404);
      return;
    }

    // Resolve medicineId if needed
    let targetId = medicineId;
    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      const med = await Medicine.findOne({
        $or: [{ slug: medicineId }, { sku: medicineId }],
      });
      if (med) targetId = med._id.toString();
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.medicineId && item.medicineId.toString() === targetId
    );
    if (itemIndex === -1) {
      sendError(res, 'Item not found in cart', 404);
      return;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const medicine = await Medicine.findById(cart.items[itemIndex].medicineId);
      if (medicine && medicine.stock < quantity) {
        sendError(res, `Only ${medicine.stock} units available in stock.`, 400);
        return;
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { medicineId } = req.params;

    const cart = await Cart.findOne({ userId: user._id });
    if (cart) {
      let targetId = medicineId;
      if (!mongoose.Types.ObjectId.isValid(medicineId)) {
        const med = await Medicine.findOne({
          $or: [{ slug: medicineId }, { sku: medicineId }],
        });
        if (med) targetId = med._id.toString();
      }
      cart.items = cart.items.filter(
        (item) => item.medicineId && item.medicineId.toString() !== targetId
      );
      await cart.save();
    }

    getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });
    sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    next(error);
  }
}
