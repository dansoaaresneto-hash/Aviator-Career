import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md my-8">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <LoginForm onSuccess={onClose} onOpenSupabaseConfig={() => setShowConfig(true)} />

        <SupabaseConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
      </div>
    </div>
  );
};
