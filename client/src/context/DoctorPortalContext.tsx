import React, { createContext, useContext, useState } from 'react';

export interface DoctorPortalNotification {
  id: string;
  type: 'message' | 'prescription' | 'reminder' | 'system';
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  avatar?: string;
}

export interface DoctorPortalContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  doctorStatus: 'Online' | 'In Consultation' | 'Away';
  setDoctorStatus: (status: 'Online' | 'In Consultation' | 'Away') => void;
  activeSidebarTab: string;
  setActiveSidebarTab: (tab: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  notifications: DoctorPortalNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;

  // Active Modals State
  activeModal: 'video-visit' | 'prescription' | 'patient-ehr' | 'reschedule' | 'availability' | 'messages' | null;
  activeAppointmentData: any | null;
  activePatientData: any | null;
  openVideoVisit: (appointment: any) => void;
  openPrescriptionWriter: (appointmentOrPatient?: any) => void;
  openPatientEHR: (patient: any) => void;
  openReschedule: (appointment: any) => void;
  openAvailability: () => void;
  openMessages: () => void;
  closeModal: () => void;
}

const DEFAULT_NOTIFICATIONS: DoctorPortalNotification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'New message from Sarah Jenkins',
    subtitle: '“Thank you for the consultation notes and morning exercise plan...”',
    time: '10:15 AM',
    unread: true,
  },
  {
    id: 'n2',
    type: 'prescription',
    title: 'Prescription #PR-1023 needs review',
    subtitle: 'Clinical pharmacist requested clarification on dosage interval.',
    time: '9:42 AM',
    unread: true,
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Appointment reminder',
    subtitle: 'James Wilson scheduled for In-person Visit at 11:30 AM.',
    time: '8:00 AM',
    unread: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'System update',
    subtitle: 'New high-resolution ECG viewer features are now enabled.',
    time: 'Yesterday',
    unread: false,
  },
];

const DoctorPortalContext = createContext<DoctorPortalContextType | undefined>(undefined);

export const DoctorPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorStatus, setDoctorStatus] = useState<'Online' | 'In Consultation' | 'Away'>('Online');
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<DoctorPortalNotification[]>(DEFAULT_NOTIFICATIONS);

  // Modals
  const [activeModal, setActiveModal] = useState<'video-visit' | 'prescription' | 'patient-ehr' | 'reschedule' | 'availability' | 'messages' | null>(null);
  const [activeAppointmentData, setActiveAppointmentData] = useState<any | null>(null);
  const [activePatientData, setActivePatientData] = useState<any | null>(null);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;
  const unreadMessagesCount = 2;

  const openVideoVisit = (appointment: any) => {
    setActiveAppointmentData(appointment);
    setActiveModal('video-visit');
  };

  const openPrescriptionWriter = (appointmentOrPatient?: any) => {
    setActiveAppointmentData(appointmentOrPatient || null);
    setActiveModal('prescription');
  };

  const openPatientEHR = (patient: any) => {
    setActivePatientData(patient);
    setActiveModal('patient-ehr');
  };

  const openReschedule = (appointment: any) => {
    setActiveAppointmentData(appointment);
    setActiveModal('reschedule');
  };

  const openAvailability = () => {
    setActiveModal('availability');
  };

  const openMessages = () => {
    setActiveModal('messages');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveAppointmentData(null);
    setActivePatientData(null);
  };

  return (
    <DoctorPortalContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        doctorStatus,
        setDoctorStatus,
        activeSidebarTab,
        setActiveSidebarTab,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotificationsCount,
        unreadMessagesCount,
        activeModal,
        activeAppointmentData,
        activePatientData,
        openVideoVisit,
        openPrescriptionWriter,
        openPatientEHR,
        openReschedule,
        openAvailability,
        openMessages,
        closeModal,
      }}
    >
      {children}
    </DoctorPortalContext.Provider>
  );
};

export const useDoctorPortal = () => {
  const context = useContext(DoctorPortalContext);
  if (!context) {
    throw new Error('useDoctorPortal must be used within a DoctorPortalProvider');
  }
  return context;
};
