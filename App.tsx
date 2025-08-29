

import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout';
import DashboardView from './components/dashboard/DashboardView';
import TransactionsView from './components/transactions/TransactionsView';
import DisputesView from './components/disputes/DisputesView';
import UsersView from './components/users/UsersView';
import ProfileView from './components/profile/ProfileView';
import UserProfileView from './components/profile/UserProfileView';
import SettingsView from './components/settings/SettingsView';
import KYCQueueView from './components/kyc/KYCQueueView';
// FIX: Import UserView component to resolve 'Cannot find name' errors.
import UserView from './components/userview/UserView';
import { TransactionStatus, AuditLogAction, DeliveryStatus, NotificationEventType, KycStatus } from './types';
import type { Page, Transaction, Dispute, User, Notification, AuditLog, UserPage, PlatformSettings } from './types';
import { transactions as mockTransactions, disputes as mockDisputes, initialUsers, auditLogs as mockAuditLogs, defaultNotificationPreferences } from './data/mockData';
import Notifications from './components/layout/Notifications';

type AuthView = 'userLogin' | 'adminLogin' | 'signup';

// --- Reusable Auth Form Component ---
const AuthForm: React.FC<{
    title: string;
    description: string;
    fields: { id: string; label: string; type: string; placeholder?: string }[];
    submitText: string;
    error: string;
    onSubmit: (formData: Record<string, string>) => void;
    children?: React.ReactNode;
}> = ({ title, description, fields, submitText, error, onSubmit, children }) => {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-blue-600">Escrow<span className="text-gray-700">App</span></h1>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map(field => (
                    <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            type={field.type}
                            onChange={handleChange}
                            required
                            placeholder={field.placeholder}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                ))}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {submitText}
                </button>
            </form>
            <div className="text-center text-sm">
                {children}
            </div>
        </div>
    );
};

// --- Combined Auth Component ---
const AuthComponent: React.FC<{
    onLogin: (user: User) => void;
    onSignUp: (formData: Record<string, string>) => void;
    users: User[];
}> = ({ onLogin, onSignUp, users }) => {
    const [authView, setAuthView] = useState<AuthView>('userLogin');
    const [error, setError] = useState('');

    const handleLoginSubmit = (formData: Record<string, string>) => {
        const user = users.find(u => u.username === formData.username && u.password === formData.password && u.role === (authView === 'adminLogin' ? 'admin' : 'user'));
         if (user) {
            if (user.isBlacklisted) {
                setError('This account has been suspended.');
                return;
            }
            setError('');
            onLogin(user);
        } else {
            setError(authView === 'adminLogin' ? 'Invalid admin credentials.' : 'Invalid username or password.');
        }
    };
    
    const handleSignUpSubmit = (formData: Record<string, string>) => {
        if (users.some(u => u.username === formData.username)) {
            setError('Username is already taken.');
            return;
        }
        const blacklistedUser = users.find(u => u.phone === formData.phone && u.isBlacklisted);
        if (blacklistedUser) {
            setError('This phone number is associated with a suspended account and cannot be used.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        onSignUp(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            {authView === 'userLogin' && (
                <AuthForm
                    title="User Login"
                    description="Securely log in to your account"
                    fields={[
                        { id: 'username', label: 'Username', type: 'text' },
                        { id: 'password', label: 'Password', type: 'password' }
                    ]}
                    submitText="Login"
                    error={error}
                    onSubmit={handleLoginSubmit}
                >
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button onClick={() => { setAuthView('signup'); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">Sign up</button>
                    </p>
                    <p className="text-gray-600 mt-2">
                        <button onClick={() => { setAuthView('adminLogin'); setError(''); }} className="font-medium text-gray-500 hover:text-gray-700">Login as Admin</button>
                    </p>
                </AuthForm>
            )}
            {authView === 'adminLogin' && (
                 <AuthForm
                    title="Admin Login"
                    description="Access the administrator dashboard"
                    fields={[
                        { id: 'username', label: 'Admin Username', type: 'text' },
                        { id: 'password', label: 'Admin Password', type: 'password' }
                    ]}
                    submitText="Login as Admin"
                    error={error}
                    onSubmit={handleLoginSubmit}
                >
                    <p className="text-gray-600">
                       Not an admin?{' '}
                        <button onClick={() => { setAuthView('userLogin'); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">Login as User</button>
                    </p>
                </AuthForm>
            )}
            {authView === 'signup' && (
                <AuthForm
                    title="Create Account"
                    description="Join our secure escrow platform"
                    fields={[
                        { id: 'name', label: 'Full Name', type: 'text' },
                        { id: 'username', label: 'Username', type: 'text' },
                        { id: 'email', label: 'Email', type: 'email' },
                        { id: 'phone', label: 'Phone Number', type: 'tel' },
                        { id: 'password', label: 'Password', type: 'password' },
                        { id: 'confirmPassword', label: 'Confirm Password', type: 'password' }
                    ]}
                    submitText="Sign Up"
                    error={error}
                    onSubmit={handleSignUpSubmit}
                >
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button onClick={() => { setAuthView('userLogin'); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">Log in</button>
                    </p>
                </AuthForm>
            )}
        </div>
    );
};


// --- User Layout Component ---
const UserLayout: React.FC<{ 
    user: User; 
    onLogout: () => void; 
    children: React.ReactNode;
    notifications: Notification[];
    onMarkAsRead: () => void;
    onProfileClick: () => void;
    onLogoClick: () => void;
}> = ({ user, onLogout, children, notifications, onMarkAsRead, onProfileClick, onLogoClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <button onClick={onLogoClick} className="text-2xl font-bold text-blue-600">Escrow<span className="text-gray-700">App</span></button>
                    <div className="flex items-center space-x-4">
                        <Notifications notifications={notifications} onMarkAsRead={onMarkAsRead} />
                        <button onClick={onProfileClick} className="flex items-center space-x-3 text-right p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors">
                             <div className="hidden sm:block">
                                 <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                 <p className="text-xs text-gray-500">View Profile</p>
                             </div>
                            <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                        </button>
                        <button onClick={onLogout} className="text-sm font-medium text-gray-600 hover:text-blue-600">Logout</button>
                    </div>
                </div>
            </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
        </main>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  
  // Admin-specific state
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    bankName: 'Equity Bank',
    accountName: 'EscrowApp Holdings Inc.',
    accountNumber: '1234567890123',
  });

  const calculatePlatformBalance = useCallback((transactions: Transaction[], auditLogs: AuditLog[]): number => {
    const feesEarned = transactions
      .filter(t => 
        t.status === TransactionStatus.Completed || 
        t.status === TransactionStatus.Released ||
        t.status === TransactionStatus.Refunded // Fee is retained on refund
      )
      .reduce((sum, t) => sum + t.fee, 0);

    const totalWithdrawn = auditLogs
      .filter(log => log.action === AuditLogAction.FundsWithdrawn && log.details.startsWith('Withdrew'))
      .reduce((sum, log) => {
        const amountMatch = log.details.match(/Withdrew (?:KES|USD) ([\d,]+\.\d{2})/);
        if (amountMatch && amountMatch[1]) {
          return sum + parseFloat(amountMatch[1].replace(/,/g, ''));
        }
        return sum;
      }, 0);
      
    return feesEarned - totalWithdrawn;
  }, []);

  const [platformBalance, setPlatformBalance] = useState<number>(() => calculatePlatformBalance(mockTransactions, mockAuditLogs));
  
  // User-specific page navigation state
  const [activeUserPage, setActiveUserPage] = useState<UserPage>('transactions');
  
  const addAuditLog = useCallback((actor: User, action: AuditLogAction, targetId: string | undefined, details: string) => {
    const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        actor,
        action,
        targetId,
        details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

 const addNotification = useCallback((userId: string, eventType: NotificationEventType, message: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.notificationPreferences) return;

    const prefs = user.notificationPreferences[eventType];
    if (!prefs) return;

    // In-App Notification
    if (prefs.inApp) {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            userId,
            message,
            read: false,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    }

    // Simulate Email
    if (prefs.email) {
        console.log(`Simulating EMAIL to ${user.email}: "${message}"`);
    }

    // Simulate SMS
    if (prefs.sms) {
        console.log(`Simulating SMS to ${user.phone}: "${message}"`);
    }
  }, [users]);

  // Effect to automatically release funds when both parties have confirmed
  useEffect(() => {
    const transactionsToUpdate: Transaction[] = [];
  
    transactions.forEach((t) => {
        if (t.status === TransactionStatus.Pending && t.buyerConfirmed && t.sellerConfirmed) {
            transactionsToUpdate.push(t);
        }
    });

    if (transactionsToUpdate.length > 0) {
        setTransactions(currentTransactions => {
            const updatedTransactions = [...currentTransactions];
            transactionsToUpdate.forEach((transaction) => {
                const index = updatedTransactions.findIndex(t => t.id === transaction.id);
                if (index !== -1) {
                    updatedTransactions[index] = { ...transaction, status: TransactionStatus.Released, updatedAt: new Date().toISOString() };
                    
                    addNotification(transaction.buyer.id, NotificationEventType.FundsReleased, `Funds for "${transaction.product}" have now been released to the seller.`);
                    addNotification(transaction.seller.id, NotificationEventType.FundsReleased, `Funds for "${transaction.product}" have been released to your account.`);
                }
            });
            return updatedTransactions;
        });
    }
  }, [transactions, addNotification]);

  // Recalculate balance when transactions or audit logs change
  useEffect(() => {
    setPlatformBalance(calculatePlatformBalance(transactions, auditLogs));
  }, [transactions, auditLogs, calculatePlatformBalance]);


  const handleLogout = () => {
    setCurrentUser(null);
    setActiveUserPage('transactions'); // Reset user view on logout
  };
  
 const handleLogin = (user: User) => {
    setCurrentUser(user);
    addAuditLog(user, AuditLogAction.UserLogin, user.id, `${user.name} logged in.`);
 };


 const handleSignUp = (formData: Record<string, string>) => {
    const { confirmPassword, ...newUserData } = formData;
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        role: 'user',
        avatarUrl: `https://picsum.photos/seed/user${users.length + 1}/40/40`,
        isBlacklisted: false,
        kycStatus: KycStatus.NotSubmitted,
        notificationPreferences: defaultNotificationPreferences,
        ...newUserData,
        name: newUserData.name || '',
        username: newUserData.username || '',
        email: newUserData.email || '',
        phone: newUserData.phone || '',
        password: newUserData.password || '',
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser); // Auto-login
    addAuditLog(newUser, AuditLogAction.UserSignUp, newUser.id, `${newUser.name} created a new account.`);
  };


  const handleMarkNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => 
        prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  }
  
  const handleUpdateDeliveryStatus = (transactionId: string, newStatus: DeliveryStatus) => {
    let transactionToNotify: Transaction | undefined;
    setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const updatedTransaction = { ...t, deliveryStatus: newStatus, updatedAt: new Date().toISOString() };
            transactionToNotify = updatedTransaction;
            return updatedTransaction;
        }
        return t;
    }));
    if (transactionToNotify) {
        addNotification(transactionToNotify.buyer.id, NotificationEventType.TransactionUpdate, `Delivery status for "${transactionToNotify.product}" is now: ${newStatus}.`);
        addNotification(transactionToNotify.seller.id, NotificationEventType.TransactionUpdate, `Delivery status for "${transactionToNotify.product}" updated to: ${newStatus}.`);
    }
};

const handleAddTransactionMessage = (transactionId: string, sender: User, text: string) => {
    const newMessage = {
        senderId: sender.id,
        text,
        timestamp: new Date().toISOString()
    };
    let transactionToNotify: Transaction | undefined;
    setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const updatedTransaction = { ...t, messages: [...t.messages, newMessage] };
            transactionToNotify = updatedTransaction;
            return updatedTransaction;
        }
        return t;
    }));
     if (transactionToNotify) {
        const recipientId = sender.id === transactionToNotify.buyer.id ? transactionToNotify.seller.id : transactionToNotify.buyer.id;
        addNotification(recipientId, NotificationEventType.NewMessage, `New message from ${sender.name} for "${transactionToNotify.product}".`);
    }
};

const handleSellerResponse = (transactionId: string, response: 'accepted' | 'rejected') => {
    let transactionToNotify: Transaction | undefined;
    const newStatus = response === 'accepted' ? TransactionStatus.Pending : TransactionStatus.Rejected;
    setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const updatedTransaction = { ...t, status: newStatus, updatedAt: new Date().toISOString() };
            transactionToNotify = updatedTransaction;
            return updatedTransaction;
        }
        return t;
    }));
    if (transactionToNotify) {
        const message = response === 'accepted'
            ? `Seller ${transactionToNotify.seller.name} has accepted your transaction for "${transactionToNotify.product}".`
            : `Seller ${transactionToNotify.seller.name} has rejected your transaction for "${transactionToNotify.product}".`;
        addNotification(transactionToNotify.buyer.id, NotificationEventType.TransactionUpdate, message);

        const action = response === 'accepted' ? AuditLogAction.TransactionAccepted : AuditLogAction.TransactionRejected;
        const details = response === 'accepted'
            ? `${transactionToNotify.seller.name} accepted transaction for "${transactionToNotify.product}".`
            : `${transactionToNotify.seller.name} rejected transaction for "${transactionToNotify.product}".`;
        addAuditLog(transactionToNotify.seller, action, transactionToNotify.id, details);
    }
};

const handleUpdateAvatar = (userId: string, newAvatarUrl: string) => {
    setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, avatarUrl: newAvatarUrl } : u)
    );
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(prevUser => prevUser ? { ...prevUser, avatarUrl: newAvatarUrl } : null);
    }
};

const handleWithdrawFunds = (amount: number, adminUser: User) => {
    if (amount > platformBalance) {
        console.error("Attempted to withdraw more than available balance.");
        return;
    }
    setPlatformBalance(prev => prev - amount);
    addAuditLog(
        adminUser,
        AuditLogAction.FundsWithdrawn,
        undefined,
        `Withdrew KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to account ${platformSettings.accountNumber}.`
    );
};

const handleUpdateSettings = (newSettings: PlatformSettings, adminUser: User) => {
    setPlatformSettings(newSettings);
    addAuditLog(
        adminUser,
        AuditLogAction.SettingsUpdated,
        undefined,
        'Updated platform withdrawal settings.'
    );
};

const handleUpdateNotificationPreferences = (userId: string, newPreferences: User['notificationPreferences']) => {
    setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, notificationPreferences: newPreferences } : u)
    );
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(prevUser => prevUser ? { ...prevUser, notificationPreferences: newPreferences } : null);
    }
};

const handleLeaveReview = (transactionId: string, rating: number, review: string) => {
    setTransactions(prev => prev.map(t => 
        t.id === transactionId ? {...t, rating, review} : t
    ));
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        addNotification(transaction.seller.id, NotificationEventType.TransactionUpdate, `You received a new ${rating}-star review from ${transaction.buyer.name}.`);
    }
};

const handleKycSubmit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: KycStatus.PendingReview } : u));
    addAuditLog(user, AuditLogAction.KycSubmitted, userId, `${user.name} submitted their KYC for review.`);
    // Notify admin
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
        addNotification(adminUser.id, NotificationEventType.KycUpdate, `New KYC submission from ${user.name} is awaiting review.`);
    }
};

const handleKycDecision = (userId: string, decision: 'approved' | 'rejected', adminUser: User) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = decision === 'approved' ? KycStatus.Verified : KycStatus.Rejected;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: newStatus } : u));
    
    const action = decision === 'approved' ? AuditLogAction.KycApproved : AuditLogAction.KycRejected;
    addAuditLog(adminUser, action, userId, `${adminUser.name} ${decision} KYC for ${user.name}.`);
    
    const message = decision === 'approved' ? 'Your KYC submission has been approved. You are now a verified user.' : 'Your KYC submission has been rejected. Please review our requirements and try again.';
    addNotification(userId, NotificationEventType.KycUpdate, message);
};

const handleDismissFlag = (transactionId: string, adminUser: User) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, isFlagged: false } : t));
    const transaction = transactions.find(t => t.id === transactionId);
    if(transaction) {
        addAuditLog(adminUser, AuditLogAction.FlagDismissed, transactionId, `${adminUser.name} dismissed the flag for transaction ${transactionId}.`);
    }
};

const handleAdminCancelTransaction = (transactionId: string, adminUser: User) => {
    let transactionToNotify: Transaction | undefined;
    setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const updated = { ...t, status: TransactionStatus.Canceled, isFlagged: false, updatedAt: new Date().toISOString() };
            transactionToNotify = updated;
            return updated;
        }
        return t;
    }));
    if (transactionToNotify) {
        const message = `Transaction for "${transactionToNotify.product}" was canceled by an administrator following a review.`;
        addNotification(transactionToNotify.buyer.id, NotificationEventType.TransactionUpdate, `${message} Your principal has been refunded.`);
        addNotification(transactionToNotify.seller.id, NotificationEventType.TransactionUpdate, message);
        addAuditLog(adminUser, AuditLogAction.TransactionCanceledByAdmin, transactionId, `${adminUser.name} canceled flagged transaction ${transactionId}.`);
    }
};


  if (!currentUser) {
    return <AuthComponent onLogin={handleLogin} onSignUp={handleSignUp} users={users} />;
  }
  
  // Filter data for the current user
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const userTransactions = transactions.filter(t => t.buyer.id === currentUser.id || t.seller.id === currentUser.id);
  
  // ADMIN VIEW
  if (currentUser.role === 'admin') {
    const adminNotifications = notifications.filter(n => n.userId === currentUser.id || n.message.toLowerCase().includes('admin'));
    const renderContent = () => {
      switch (activePage) {
        case 'dashboard':
          return <DashboardView 
                    transactions={transactions} 
                    disputes={disputes} 
                    auditLogs={auditLogs} 
                    platformBalance={platformBalance}
                    platformSettings={platformSettings}
                    onWithdraw={(amount) => handleWithdrawFunds(amount, currentUser)}
                    onDismissFlag={(txnId) => handleDismissFlag(txnId, currentUser)}
                    onCancelTransaction={(txnId) => handleAdminCancelTransaction(txnId, currentUser)}
                 />;
        case 'transactions':
          return <TransactionsView 
                    transactions={transactions} 
                    title="All Transactions" 
                    onDismissFlag={(txnId) => handleDismissFlag(txnId, currentUser)}
                    onCancelTransaction={(txnId) => handleAdminCancelTransaction(txnId, currentUser)}
                 />;
        case 'disputes':
          return <DisputesView disputes={disputes} setDisputes={setDisputes} transactions={transactions} setTransactions={setTransactions} addNotification={addNotification} addAuditLog={addAuditLog} adminUser={currentUser} />;
        case 'users':
            return <UsersView users={users} setUsers={setUsers} currentUser={currentUser} addAuditLog={addAuditLog} />;
        case 'kycSubmissions':
            return <KYCQueueView users={users} onReview={(userId, decision) => handleKycDecision(userId, decision, currentUser)} />;
        case 'profile':
            return <ProfileView user={currentUser} setUsers={setUsers} setCurrentUser={setCurrentUser} onUpdateAvatar={handleUpdateAvatar} />;
        case 'settings':
            return <SettingsView settings={platformSettings} onSave={(newSettings) => handleUpdateSettings(newSettings, currentUser)} />;
        default:
          return <DashboardView 
                    transactions={transactions} 
                    disputes={disputes} 
                    auditLogs={auditLogs} 
                    platformBalance={platformBalance}
                    platformSettings={platformSettings}
                    onWithdraw={(amount) => handleWithdrawFunds(amount, currentUser)}
                    onDismissFlag={(txnId) => handleDismissFlag(txnId, currentUser)}
                    onCancelTransaction={(txnId) => handleAdminCancelTransaction(txnId, currentUser)}
                />;
      }
    };

    return (
      <Layout 
        user={currentUser}
        onLogout={handleLogout}
        activePage={activePage} 
        setActivePage={setActivePage}
        notifications={adminNotifications}
        onMarkAsRead={handleMarkNotificationsAsRead}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {renderContent()}
      </Layout>
    );
  }

  // REGULAR USER VIEW
  return (
    <UserLayout 
        user={currentUser} 
        onLogout={handleLogout}
        notifications={userNotifications}
        onMarkAsRead={handleMarkNotificationsAsRead}
        onProfileClick={() => setActiveUserPage('profile')}
        onLogoClick={() => setActiveUserPage('transactions')}
    >
      {activeUserPage === 'transactions' && (
        <UserView 
            currentUser={currentUser}
            allUsers={users}
            transactions={userTransactions} 
            setTransactions={setTransactions} 
            disputes={disputes}
            setDisputes={setDisputes}
            addNotification={addNotification}
            addAuditLog={addAuditLog}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onAddTransactionMessage={handleAddTransactionMessage}
            onSellerResponse={handleSellerResponse}
            onLeaveReview={handleLeaveReview}
        />
      )}
      {activeUserPage === 'profile' && (
        <UserProfileView
            user={currentUser}
            users={users}
            setUsers={setUsers}
            setCurrentUser={setCurrentUser}
            onUpdateAvatar={handleUpdateAvatar}
            onUpdateNotificationPreferences={(prefs) => handleUpdateNotificationPreferences(currentUser.id, prefs)}
            onKycSubmit={() => handleKycSubmit(currentUser.id)}
        />
      )}
       {activeUserPage === 'analytics' && (
        <UserView 
             currentUser={currentUser}
            allUsers={users}
            transactions={userTransactions} 
            setTransactions={setTransactions} 
            disputes={disputes}
            setDisputes={setDisputes}
            addNotification={addNotification}
            addAuditLog={addAuditLog}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onAddTransactionMessage={handleAddTransactionMessage}
            onSellerResponse={handleSellerResponse}
            onLeaveReview={handleLeaveReview}
            initialView='analytics'
        />
      )}
    </UserLayout>
  );
};

export default App;