import React from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus, DeliveryStatus } from '../../types';
import CheckIcon from '../icons/CheckIcon';

interface TransactionWorkflowProps {
  transaction: Transaction;
}

const WorkflowStep: React.FC<{
  label: string;
  status: 'completed' | 'active' | 'upcoming';
  isLast?: boolean;
}> = ({ label, status, isLast = false }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500',
          icon: <CheckIcon className="w-3 h-3 text-white" />,
          text: 'text-gray-700',
          line: 'bg-green-500',
        };
      case 'active':
        return {
          circle: 'bg-blue-500 ring-4 ring-blue-200',
          icon: <div className="w-2 h-2 bg-white rounded-full"></div>,
          text: 'text-blue-600 font-semibold',
          line: 'bg-gray-200',
        };
      case 'upcoming':
      default:
        return {
          circle: 'bg-gray-300',
          icon: null,
          text: 'text-gray-500',
          line: 'bg-gray-200',
        };
    }
  };

  const classes = getStatusClasses();

  return (
    <div className="flex-1 flex items-center">
      {/* Circle and Icon */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${classes.circle}`}>
        {classes.icon}
      </div>
      {/* Label */}
      <div className={`ml-2 text-xs ${classes.text}`}>
        {label}
      </div>
      {/* Connecting Line */}
      {!isLast && <div className={`flex-1 h-1 mx-2 ${classes.line}`}></div>}
    </div>
  );
};

const TransactionWorkflow: React.FC<TransactionWorkflowProps> = ({ transaction }) => {
    const { status, deliveryStatus } = transaction;

    if ([TransactionStatus.Canceled, TransactionStatus.Rejected, TransactionStatus.Refunded, TransactionStatus.Disputed].includes(status)) {
        let message = 'This transaction is currently under review.';
        let bgColor = 'bg-red-50';
        let textColor = 'text-red-700';

        if(status === TransactionStatus.Canceled || status === TransactionStatus.Rejected) {
             message = 'This transaction has been canceled or rejected.';
             bgColor = 'bg-gray-50';
             textColor = 'text-gray-700';
        } else if (status === TransactionStatus.Refunded) {
             message = 'The funds for this transaction have been refunded.';
             bgColor = 'bg-blue-50';
             textColor = 'text-blue-700';
        }

        return (
            <div className={`p-3 rounded-md text-center text-xs font-medium ${bgColor} ${textColor}`}>
               {message}
            </div>
        );
    }
    
    const steps = ['Created', 'In Escrow', 'Delivered', 'Completed'];
    let completedSteps = -1; // index of last completed step

    if (status !== TransactionStatus.AwaitingSellerAcceptance) {
        completedSteps = 0; // Created is done
    }
    if ([TransactionStatus.Pending, TransactionStatus.Disputed, TransactionStatus.Released, TransactionStatus.Completed].includes(status)) {
        completedSteps = 1; // In Escrow is done
    }
    if (deliveryStatus === DeliveryStatus.Delivered || [TransactionStatus.Released, TransactionStatus.Completed].includes(status)) {
        completedSteps = 2; // Delivered is done
    }
    if ([TransactionStatus.Released, TransactionStatus.Completed].includes(status)) {
        completedSteps = 3; // Completed is done
    }

    const getStepStatus = (index: number): 'completed' | 'active' | 'upcoming' => {
        if (index <= completedSteps) return 'completed';
        if (index === completedSteps + 1) return 'active';
        return 'upcoming';
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
            <h4 className="text-xs font-semibold text-gray-800 mb-2">Transaction Timeline</h4>
            <div className="flex items-center">
                {steps.map((label, index) => (
                    <WorkflowStep
                        key={label}
                        label={label}
                        status={getStepStatus(index)}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionWorkflow;