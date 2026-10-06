import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { IUser } from '../models/User';
import { sendSuccess } from '../utils/response';

export async function getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

    sendSuccess(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { isRead: true },
      { new: true }
    );

    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
