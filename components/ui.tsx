import React, { useEffect, useState } from 'react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', isLoading, ...props }) => {
  const baseClasses = "px-6 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center space-x-2";
  const variantClasses = {
    primary: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-lg focus:ring-[var(--md-sys-color-primary)]',
    secondary: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-opacity-80 focus:ring-[var(--md-sys-color-secondary)]',
    tertiary: 'bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-low)]',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
      <span>{children}</span>
    </button>
  );
};

// Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-[var(--md-sys-color-surface-container-low)] rounded-3xl p-6 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="relative">
      <input
        id={id}
        className={`peer w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline)] rounded-lg px-4 py-3 text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] transition-colors ${className}`}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-[var(--md-sys-color-on-surface-variant)] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[var(--md-sys-color-surface-container-high)] px-2 peer-focus:px-2 peer-focus:text-[var(--md-sys-color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3"
      >
        {label}
      </label>
    </div>
  );
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setShow(true);
    } else {
        const timer = setTimeout(() => setShow(false), 300); // Match duration of animation
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div className={`bg-[var(--md-sys-color-surface-container-high)] rounded-3xl shadow-xl w-full max-w-md p-6 relative transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">{title}</h2>
            <button onClick={onClose} className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Spinner
export const Spinner: React.FC = () => {
    return (
        <div className="border-4 border-t-4 border-[var(--md-sys-color-surface-variant)] border-t-[var(--md-sys-color-primary)] rounded-full w-12 h-12 animate-spin"></div>
    );
};
