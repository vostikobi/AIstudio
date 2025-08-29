import React from 'react';
import type { AuditLog } from '../../types';
import AuditLogIcon from '../icons/AuditLogIcon';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
}

const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
      <div className="flex items-center mb-4">
        <AuditLogIcon className="w-6 h-6 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-700 ml-2">Admin Audit Log</h3>
      </div>
      <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-4">
        {auditLogs.map(log => (
          <div key={log.id} className="flex items-start">
            <img src={log.actor.avatarUrl} alt={log.actor.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
            <div className="ml-3 flex-1">
                <p className="text-sm text-gray-800">
                    <span className="font-semibold">{log.actor.name}</span> {log.details}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(log.timestamp)}
                </p>
            </div>
          </div>
        ))}
        {auditLogs.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>No audit trail activity yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogView;