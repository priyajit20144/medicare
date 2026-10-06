import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { Medicine } from '../models/Medicine';
import { Prescription } from '../models/Prescription';
import { Notification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { paymentService } from '../services/paymentService';
import { emailService } from '../services/emailService';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { shippingAddress, prescriptionId, paymentMethod = 'mock', notes, items } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      sendError(res, 'Please provide a valid delivery address with full name, address, and city.', 400);
      return;
    }

    let cart = await Cart.findOne({ userId: user._id }).populate('items.medicineId');

    // Resilient fallback: If database cart was desynchronized or empty, populate from client items
    if ((!cart || cart.items.length === 0) && Array.isArray(items) && items.length > 0) {
      if (!cart) cart = new Cart({ userId: user._id, items: [] });
      for (const itm of items) {
        let medicine = null;
        const medIdStr = itm.medicineId || itm._id || itm.id || itm.slug;
        if (medIdStr && mongoose.Types.ObjectId.isValid(medIdStr)) {
          medicine = await Medicine.findById(medIdStr);
        }
        if (!medicine && medIdStr) {
          medicine = await Medicine.findOne({
            $or: [{ slug: medIdStr }, { sku: medIdStr }],
          });
        }
        if (medicine) {
          cart.items.push({
            medicineId: medicine._id,
            quantity: Number(itm.quantity) || 1,
            price: medicine.price,
            discountPrice: medicine.discountPrice,
          });
        }
      }
      await cart.save();
      cart = await Cart.findOne({ userId: user._id }).populate('items.medicineId');
    }

    if (!cart || cart.items.length === 0) {
      sendError(res, 'Your cart is empty. Please add items before checking out.', 400);
      return;
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let prescriptionRequired = false;
    const orderItems: any[] = [];

    // Verify stock and prepare items
    for (const item of cart.items as any[]) {
      const med = item.medicineId;
      if (!med) continue;

      if (med.stock < item.quantity) {
        sendError(res, `Medicine "${med.name}" has only ${med.stock} units left in stock.`, 400);
        return;
      }

      if (med.requiresPrescription) {
        prescriptionRequired = true;
      }

      const unitPrice = med.discountPrice || med.price;
      subtotal += med.price * item.quantity;
      totalDiscount += (med.price - unitPrice) * item.quantity;

      orderItems.push({
        medicineId: med._id,
        name: med.name,
        sku: med.sku,
        image: med.images?.[0] || '',
        quantity: item.quantity,
        price: med.price,
        discountPrice: med.discountPrice,
        requiresPrescription: med.requiresPrescription,
      });
    }

    // Prescription validation: If any item requires a prescription, ensure user attached an APPROVED or valid prescription
    let prescriptionStatus: 'NOT_REQUIRED' | 'ATTACHED' | 'VERIFIED' = 'NOT_REQUIRED';
    if (prescriptionRequired) {
      if (!prescriptionId) {
        sendError(
          res,
          'Your order contains prescription medication. Please attach an approved prescription to proceed.',
          400
        );
        return;
      }

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        userId: user._id,
      });

      if (!prescription) {
        sendError(res, 'Selected prescription record not found or does not belong to your account.', 404);
        return;
      }

      if (prescription.status === 'APPROVED') {
        prescriptionStatus = 'VERIFIED';
      } else {
        prescriptionStatus = 'ATTACHED';
      }
    }

    const deliveryFee = subtotal > 50 ? 0 : 5.99;
    const tax = Number(((subtotal - totalDiscount) * 0.05).toFixed(2));
    const total = Number(((subtotal - totalDiscount) + deliveryFee + tax).toFixed(2));

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Process payment through abstraction layer
    const paymentResult = await paymentService.createPayment({
      amount: total,
      description: `Medicare Order ${orderNumber}`,
      customer: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });

    // Determine initial order status
    let initialStatus: OrderStatus = 'PROCESSING';
    if (prescriptionRequired && prescriptionStatus !== 'VERIFIED') {
      initialStatus = 'PHARMACY_REVIEW';
    }

    const order = await Order.create({
      orderNumber,
      userId: user._id,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(totalDiscount.toFixed(2)),
      tax,
      deliveryFee,
      total,
      shippingAddress,
      payment: {
        provider: paymentResult.provider,
        status: paymentResult.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentResult.transactionId,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : undefined,
      },
      status: initialStatus,
      prescriptionId: prescriptionId || undefined,
      prescriptionStatus,
      trackingNumber: `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      notes,
    });

    // Decrement stock safely
    for (const item of orderItems) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create confirmation notification
    await Notification.create({
      userId: user._id,
      type: 'ORDER',
      title: 'Order Placed Successfully! 📦',
      message: `Your order #${orderNumber} for $${total} has been confirmed. Tracking ID: ${order.trackingNumber}`,
      link: `/user/orders/${order._id}`,
    });

    await logAudit({
      req,
      action: 'ORDER_CREATED',
      resourceType: 'Order',
      resourceId: order._id.toString(),
      metadata: { orderNumber, total, itemCount: orderItems.length },
    });

    // Send order confirmation email
    emailService.sendOrderConfirmation(
      user.email,
      orderNumber,
      total,
      orderItems.length,
      shippingAddress ? `${shippingAddress.street}, ${shippingAddress.city}` : undefined
    ).catch(() => {});

    sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId: user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    sendSuccess(res, {
      orders,
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

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const order = await Order.findById(id).populate('prescriptionId');
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    // Strict ownership validation
    const isOwner = order.userId.toString() === user._id.toString();
    const isStaff = ['ADMIN', 'PHARMACIST'].includes(user.role);

    if (!isOwner && !isStaff) {
      sendError(res, 'Access denied. You do not have permission to view this order.', 403);
      return;
    }

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    if (order.userId.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      sendError(res, 'Access denied.', 403);
      return;
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      sendError(res, `Cannot cancel order in '${order.status}' status.`, 400);
      return;
    }

    order.status = 'CANCELLED';
    await order.save();

    // Restock items
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: item.quantity },
      });
    }

    await logAudit({
      req,
      action: 'ORDER_CANCELLED',
      resourceType: 'Order',
      resourceId: order._id.toString(),
    });

    // Dispatch cancellation email
    User.findById(order.userId).then((u) => {
      if (u) emailService.sendOrderStatusEmail(u.email, order.orderNumber, 'CANCELLED').catch(() => {});
    }).catch(() => {});

    sendSuccess(res, order, 'Order cancelled successfully. Restocked items.');
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ orderNumber: searchRegex }, { 'shippingAddress.fullName': searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).populate('userId', 'fullName email phone').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    sendSuccess(res, {
      orders,
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

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

    await Notification.create({
      userId: order.userId,
      type: 'ORDER',
      title: `Order Status: ${status.replace(/_/g, ' ')}`,
      message: `Your order #${order.orderNumber} is now marked as ${status.replace(/_/g, ' ')}.`,
      link: `/user/orders/${order._id}`,
    });

    await logAudit({
      req,
      action: 'ORDER_STATUS_UPDATED',
      resourceType: 'Order',
      resourceId: order._id.toString(),
      metadata: { newStatus: status, trackingNumber },
    });

    // Send order status update email
    User.findById(order.userId).then((u) => {
      if (u) emailService.sendOrderStatusEmail(u.email, order.orderNumber, status, order.trackingNumber).catch(() => {});
    }).catch(() => {});

    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}
