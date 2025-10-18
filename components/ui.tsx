import React, { useEffect, useState } from 'react';
import './ui.css';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', isLoading, ...props }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={isLoading} {...props}>
      {isLoading && <div className="spinner"></div>}
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
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="input-container">
      <input
        id={id}
        className={`input-field ${className}`}
        placeholder={props.placeholder || " "}
        {...props}
      />
      {label && <label htmlFor={id} className="input-label">
        {label}
      </label>}
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
        const timer = setTimeout(() => setShow(false), 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;
  
  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button onClick={onClose} className="modal-close-btn">
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
        <div className="spinner-animation"></div>
    );
};