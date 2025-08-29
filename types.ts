export enum TransactionStatus {
  AwaitingSellerAcceptance = 'Awaiting Seller Acceptance',
  Pending = 'Pending',
  Completed = 'Completed',
  Disputed = 'Disputed',
  Canceled = 'Canceled',
  Released = 'Released',
  Refunded = 'Refunded',
  Rejected = 'Rejected',
}

export enum DisputeStatus {
    Open = 'Open',
    Resolved = 'Resolved',
}

export enum DeliveryStatus {
    AwaitingShipment = 'Awaiting Shipment',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
}

export enum NotificationEventType {
    FundsReleased = 'Funds Released',
    TransactionUpdate = 'Transaction Update',
    NewMessage = 'New Message',
    DisputeRaised = 'Dispute Raised',
    KycUpdate = 'KYC Update',
}

export enum KycStatus {
    NotSubmitted = 'Not Submitted',
    PendingReview = 'Pending Review',
    Verified = 'Verified',
    Rejected = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'user';
  username: string;
  password?: string;
  isBlacklisted: boolean;
  kycStatus: KycStatus;
  notificationPreferences: {
      [key in NotificationEventType]: {
          inApp: boolean;
          email: boolean;
          sms: boolean;
      };
  };
}

export interface PlatformSettings {
    bankName: string;
    accountName: string;
    accountNumber: string;
}

export interface Transaction {
  id: string;
  buyer: User;
  seller: User;
  amount: number;
  fee: number;
  totalAmountCharged: number;
  product: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  terms: string;
  deliveryStatus: DeliveryStatus;
  messages: {
    senderId: string;
    text: string;
    timestamp: string;
  }[];
  currency: 'KES' | 'USD';
  rating?: number;
  review?: string;
  isFlagged?: boolean;
}

export interface Dispute {
  id:string;
  transaction: Transaction;
  reason: string;
  messages: {
    senderId: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  status: DisputeStatus;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    timestamp: string;
}

export enum AuditLogAction {
    UserLogin = 'User Login',
    UserSignUp = 'User Sign Up',
    TransactionCreated = 'Transaction Created',
    TransactionAccepted = 'Transaction Accepted',
    TransactionRejected = 'Transaction Rejected',
    DisputeRaised = 'Dispute Raised',
    DisputeResolved = 'Dispute Resolved',
    UserBlacklisted = 'User Blacklisted',
    UserUnblacklisted = 'User Unblacklisted',
    AdminAdded = 'Admin Added',
    FundsWithdrawn = 'Funds Withdrawn',
    SettingsUpdated = 'Settings Updated',
    FraudDetected = 'Fraud Detected',
    FlagDismissed = 'Flag Dismissed',
    TransactionCanceledByAdmin = 'Transaction Canceled by Admin',
    KycSubmitted = 'KYC Submitted',
    KycApproved = 'KYC Approved',
    KycRejected = 'KYC Rejected',
}

export interface AuditLog {
    id: string;
    timestamp: string;
    actor: User;
    action: AuditLogAction;
    targetId?: string;
    details: string;
}


export type Page = 'dashboard' | 'transactions' | 'disputes' | 'users' | 'profile' | 'settings' | 'kycSubmissions';
export type UserPage = 'transactions' | 'profile' | 'analytics' | 'notifications' | 'verification';