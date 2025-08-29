import type { User, Transaction, Dispute, AuditLog } from '../types';
import { TransactionStatus, DisputeStatus, AuditLogAction, DeliveryStatus, NotificationEventType, KycStatus } from '../types';

export const defaultNotificationPreferences: User['notificationPreferences'] = {
    [NotificationEventType.FundsReleased]: { inApp: true, email: true, sms: true },
    [NotificationEventType.TransactionUpdate]: { inApp: true, email: true, sms: true },
    [NotificationEventType.NewMessage]: { inApp: true, email: true, sms: true },
    [NotificationEventType.DisputeRaised]: { inApp: true, email: true, sms: true },
    [NotificationEventType.KycUpdate]: { inApp: true, email: true, sms: false },
};


// Mock Users
export const initialUsers: User[] = [
  { id: 'user-1', name: 'Alice Johnson', phone: '+254712345678', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/user1/40/40', role: 'user', username: 'alice', password: 'password123', isBlacklisted: false, notificationPreferences: defaultNotificationPreferences, kycStatus: KycStatus.Verified },
  { id: 'user-2', name: 'Bob Williams', phone: '+254787654321', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/user2/40/40', role: 'user', username: 'bob', password: 'password123', isBlacklisted: false, notificationPreferences: defaultNotificationPreferences, kycStatus: KycStatus.PendingReview },
  { id: 'user-3', name: 'Charlie Brown', phone: '+254722222222', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/user3/40/40', role: 'user', username: 'charlie', password: 'password123', isBlacklisted: false, notificationPreferences: defaultNotificationPreferences, kycStatus: KycStatus.NotSubmitted },
  { id: 'user-4', name: 'Diana Prince', phone: '+254733333333', email: 'diana@example.com', avatarUrl: 'https://picsum.photos/seed/user4/40/40', role: 'admin', username: 'admin', password: 'admin', isBlacklisted: false, notificationPreferences: defaultNotificationPreferences, kycStatus: KycStatus.Verified },
];

// Mock Transactions
export const transactions: Transaction[] = [
  {
    id: 'txn-001',
    buyer: initialUsers[0],
    seller: initialUsers[1],
    amount: 5000,
    fee: 250,
    totalAmountCharged: 5250,
    product: 'Handmade Leather Wallet',
    status: TransactionStatus.Disputed,
    createdAt: '2023-10-26T10:00:00Z',
    updatedAt: '2023-10-28T11:00:00Z',
    buyerConfirmed: true,
    sellerConfirmed: false,
    terms: 'Item must be as described. Delivery within 3 days.',
    deliveryStatus: DeliveryStatus.Shipped,
    messages: [
      { senderId: 'user-2', text: 'Hey, I have packaged your wallet and will ship it tomorrow morning.', timestamp: '2023-10-26T12:00:00Z' },
      { senderId: 'user-1', text: 'Great, thanks for the update!', timestamp: '2023-10-26T12:05:00Z' },
    ],
    currency: 'KES',
    isFlagged: true,
  },
  {
    id: 'txn-002',
    buyer: initialUsers[2],
    seller: initialUsers[0], // Charlie buying from Alice
    amount: 12500,
    fee: 625,
    totalAmountCharged: 13125,
    product: 'Vintage Camera Lens',
    status: TransactionStatus.Completed,
    createdAt: '2023-10-25T14:30:00Z',
    updatedAt: '2023-10-27T15:00:00Z',
    buyerConfirmed: true,
    sellerConfirmed: true,
    terms: 'Lens to be free of scratches and fungus. Well-packaged.',
    deliveryStatus: DeliveryStatus.Delivered,
    messages: [],
    currency: 'KES',
    rating: 5,
    review: 'Excellent product, exactly as described. Fast shipping!'
  },
  {
    id: 'txn-003',
    buyer: initialUsers[1], // Bob buying from Alice
    seller: initialUsers[0],
    amount: 800,
    fee: 40,
    totalAmountCharged: 840,
    product: 'Graphic Design Services',
    status: TransactionStatus.Pending,
    createdAt: '2023-10-28T09:00:00Z',
    updatedAt: '2023-10-28T09:00:00Z',
    buyerConfirmed: false,
    sellerConfirmed: false,
    terms: 'Initial logo concepts to be delivered by Friday.',
    deliveryStatus: DeliveryStatus.AwaitingShipment,
    messages: [],
    currency: 'KES',
  },
  {
    id: 'txn-004',
    buyer: initialUsers[0], // Alice buying from Charlie
    seller: initialUsers[2],
    amount: 250,
    fee: 12.5,
    totalAmountCharged: 262.5,
    product: 'Refurbished Smartphone',
    status: TransactionStatus.Canceled,
    createdAt: '2023-10-24T18:00:00Z',
    updatedAt: '2023-10-25T10:00:00Z',
    buyerConfirmed: false,
    sellerConfirmed: false,
    terms: 'Phone must have at least 90% battery health.',
    deliveryStatus: DeliveryStatus.AwaitingShipment,
    messages: [],
    currency: 'USD',
  },
   {
    id: 'txn-005',
    buyer: initialUsers[0], // Alice buying from Admin (Diana)
    seller: initialUsers[3],
    amount: 2200,
    fee: 110,
    totalAmountCharged: 2310,
    product: 'Custom T-Shirt Printing',
    status: TransactionStatus.Disputed,
    createdAt: '2023-10-27T12:00:00Z',
    updatedAt: '2023-10-29T14:00:00Z',
    buyerConfirmed: true,
    sellerConfirmed: false,
    terms: '10 medium t-shirts with the supplied logo on the front.',
    deliveryStatus: DeliveryStatus.Delivered,
    messages: [],
    currency: 'KES',
  },
  {
    id: 'txn-006',
    buyer: initialUsers[2], // Charlie buying from Bob
    seller: initialUsers[1],
    amount: 75000,
    fee: 3750,
    totalAmountCharged: 78750,
    product: 'Laptop Repair Service',
    status: TransactionStatus.Pending,
    createdAt: '2023-10-29T11:45:00Z',
    updatedAt: '2023-10-29T11:45:00Z',
    buyerConfirmed: true,
    sellerConfirmed: false,
    terms: 'Repair of motherboard and screen replacement.',
    deliveryStatus: DeliveryStatus.AwaitingShipment,
    messages: [],
    currency: 'KES',
  },
  {
    id: 'txn-007',
    buyer: initialUsers[0], // Alice buying from Bob
    seller: initialUsers[1],
    amount: 1500,
    fee: 75,
    totalAmountCharged: 1575,
    product: 'Antique Wooden Chair',
    status: TransactionStatus.Released,
    createdAt: '2023-10-20T10:00:00Z',
    updatedAt: '2023-10-22T11:00:00Z',
    buyerConfirmed: true,
    sellerConfirmed: true,
    terms: 'As-is condition, buyer to arrange pickup.',
    deliveryStatus: DeliveryStatus.Delivered,
    messages: [],
    currency: 'KES',
  },
  {
    id: 'txn-008',
    buyer: initialUsers[1], // Bob buying from Charlie
    seller: initialUsers[2],
    amount: 9500,
    fee: 475,
    totalAmountCharged: 9975,
    product: 'Smart Home Hub',
    status: TransactionStatus.Refunded,
    createdAt: '2023-10-19T10:00:00Z',
    updatedAt: '2023-10-21T11:00:00Z',
    buyerConfirmed: true,
    sellerConfirmed: true,
    terms: 'Must be compatible with all major smart device brands.',
    deliveryStatus: DeliveryStatus.Delivered,
    messages: [],
    currency: 'KES',
  }
];

// Mock Disputes
export const disputes: Dispute[] = [
  {
    id: 'disp-001',
    transaction: transactions[0],
    reason: 'Product received was not as described. The leather quality is poor and the stitching is uneven.',
    messages: [
      { senderId: 'user-1', text: 'The wallet I received is not the one from the pictures.', timestamp: '2023-10-28T11:05:00Z' },
      { senderId: 'user-2', text: 'I assure you it is the same wallet. All my products are high quality.', timestamp: '2023-10-28T11:15:00Z' },
    ],
    createdAt: '2023-10-28T11:00:00Z',
    status: DisputeStatus.Open,
  },
  {
    id: 'disp-002',
    transaction: transactions[4],
    reason: 'The print on the t-shirts is blurry and the colors are faded. Not what was agreed upon.',
    messages: [
      { senderId: 'user-1', text: 'This is not acceptable quality for the price I paid.', timestamp: '2023-10-29T14:02:00Z' },
    ],
    createdAt: '2023-10-29T14:00:00Z',
    status: DisputeStatus.Open,
  },
];


// Mock Audit Logs
export const auditLogs: AuditLog[] = [
    {
        id: 'log-1',
        timestamp: '2023-10-29T14:02:00Z',
        actor: initialUsers[0],
        action: AuditLogAction.DisputeRaised,
        targetId: 'disp-002',
        details: 'Alice Johnson raised a dispute for transaction txn-005.',
    },
    {
        id: 'log-2',
        timestamp: '2023-10-29T11:45:00Z',
        actor: initialUsers[2],
        action: AuditLogAction.TransactionCreated,
        targetId: 'txn-006',
        details: 'Charlie Brown created a transaction for "Laptop Repair Service".',
    },
    {
        id: 'log-3',
        timestamp: '2023-10-29T09:30:00Z',
        actor: initialUsers[1],
        action: AuditLogAction.UserLogin,
        targetId: 'user-2',
        details: 'Bob Williams logged in.',
    },
];