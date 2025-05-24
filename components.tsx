

import React, { useState, useEffect, useCallback, ReactNode, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EducationalModule, VideoLesson, UserProfile, WeatherData, WeatherAdvisory, MarketPrice, CropTask, PestDisease, GroundingChunkWeb, FarmType, SoilNutrientInfo, LivestockAilment, LivestockCareInfo, YieldRecord } from './types';
import { NAV_LINKS, DISTRICTS_NEPAL, FARM_TYPES, MOCK_CROP_TASKS, ASK_EXPERT_PLACEHOLDER, ASK_EXPERT_LOADING_MESSAGE, ASK_EXPERT_SUCCESS_MESSAGE, GENERIC_ERROR_MESSAGE, MOCK_PEST_DISEASES, MOCK_SOIL_NUTRIENT_INFO, MOCK_LIVESTOCK_AILMENTS, MOCK_LIVESTOCK_CARE_INFO } from './constants';
import { fetchWeatherForecast, fetchWeatherAdvisories, fetchMarketPrices, diagnoseCropIssue, getGeminiTextResponse, streamGeminiTextResponse, addYieldRecord as saveYieldRecord, getYieldRecords as loadYieldRecords, deleteYieldRecord as removeYieldRecord, updateYieldRecord as editYieldRecord } from './services';

// --- Icon Components (Inline SVGs for simplicity) ---
interface IconProps { className?: string; }
export const HomeIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
export const TractorIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 4h15M2 9l3.36-2.4A2 2 0 0 1 6.83 6h0a2 2 0 0 1 1.79.89L10 9H2Zm0 0v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9H2Z"/><path d="M11 13v7"/><path d="M15 13v7"/><path d="M10 6V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1"/><path d="M18 9h2.83a2 2 0 0 1 1.47.64L23 11"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>;
export const BugIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h-4a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4.5"/><path d="m15 12-3-3-3 3"/><path d="M12 9V3"/><path d="m19 15-1.5 1.5"/><path d="M16 18h6"/><path d="m22 12-1.5-1.5"/></svg>;
export const SproutIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-3.6-2.8.1-4.2.8-4.9 1z"/></svg>;
export const CowIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18.5 5S16.23 3.48 13.5 3.05C11.23 2.7 8.5 4.58 8.5 4.58"/><path d="M8.5 4.58S6.77 5.23 5.5 6.5C4.23 7.77 4 9.5 4 9.5"/><path d="M4 9.5S4.77 16.23 7.5 17.5c2.73 1.27 5.5 0 5.5 0"/><path d="M13 17.5s2.77.27 4.5-1.5c1.73-1.77 2-3.5 2-3.5"/><path d="m18 10-1.5 1.5"/><path d="M19.5 4.5S17.23 3 14.5 3C11.77 3 9.5 4.5 9.5 4.5"/><path d="M13 13.5c0 2.48-1.57 4.5-3.5 4.5S6 15.98 6 13.5c0-1.73.8-3.24 2-4"/><path d="M10 10c1.1 0 2-.9 2-2s-.9-2-2-2"/></svg>;
export const BookOpenIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
export const DollarSignIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
export const MessageSquareIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
export const SettingsIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .25 1.72v.44a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-.25-1.72V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
export const MenuIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>;
export const XIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
export const SunIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
export const CloudRainIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>;
export const CloudIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>;
export const UploadCloudIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
export const CheckCircleIcon: React.FC<IconProps> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
export const AlertTriangleIcon: React.FC<IconProps> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
export const InfoIcon: React.FC<IconProps> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
export const ExternalLinkIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
export const PlusCircleIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
export const Trash2Icon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
export const Edit3Icon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
export const LeafIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 20A7 7 0 0 1 4 13V6a2 2 0 0 1 2-2h4l3 3h5v4.5A7.5 7.5 0 0 1 11 20z"></path><path d="M11 20A7 7 0 0 0 4 13"></path></svg>;
export const PillIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>;
export const ThermometerIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>;
export const DropletIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>;
export const WindIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>;
export const SunriseIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h20"/><path d="M18 22H6"/><path d="M16 18a4 4 0 0 0-8 0"/><path d="m19.07 10.93-1.41 1.41"/></svg>;
export const SunsetIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h20"/><path d="M18 22H6"/><path d="M16 18a4 4 0 0 0-8 0"/><path d="m19.07 10.93-1.41 1.41"/></svg>;


const ICON_MAP: { [key: string]: React.FC<IconProps> } = {
  Home: HomeIcon,
  Tractor: TractorIcon,
  Bug: BugIcon,
  Sprout: SproutIcon,
  Cow: CowIcon,
  BookOpen: BookOpenIcon,
  DollarSign: DollarSignIcon,
  MessageSquare: MessageSquareIcon,
  Settings: SettingsIcon,
  Sun: SunIcon,
  CloudRain: CloudRainIcon,
  Cloud: CloudIcon,
  UploadCloud: UploadCloudIcon,
  Leaf: LeafIcon,
  Pill: PillIcon,
  PlusCircle: PlusCircleIcon,
  Trash2: Trash2Icon,
  Edit3: Edit3Icon,
  Thermometer: ThermometerIcon,
  Droplet: DropletIcon,
  Wind: WindIcon,
  Sunrise: SunriseIcon,
  Sunset: SunsetIcon,
};

// --- Basic UI Components ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400",
    ghost: "bg-transparent hover:bg-green-100 text-green-700 focus:ring-green-500"
  };
  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  id?: string; 
  icon?: ReactNode;
}
export const Card: React.FC<CardProps> = ({ children, className = '', title, id, icon }) => (
  <div id={id} className={`bg-white shadow-lg rounded-xl p-4 md:p-6 ${className}`}>
    {title && (
      <div className="flex items-center mb-3">
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className="text-xl font-semibold text-green-800">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-2xl font-bold text-green-700">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="बन्द गर्नुहोस्">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{size?: string}> = ({ size = "w-12 h-12" }) => (
  <div role="status" aria-label="लोड हुँदैछ" className="flex justify-center items-center">
    <div className={`animate-spin rounded-full ${size} border-t-4 border-b-4 border-green-500`}></div>
  </div>
);

// --- Navigation Components ---
export const Navbar: React.FC<{ onMenuToggle: () => void, appName: string }> = ({ onMenuToggle, appName }) => (
  <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-40">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">{appName}</h1>
      <button onClick={onMenuToggle} className="md:hidden p-2" aria-label="मेनु खोल्नुहोस्">
        <MenuIcon className="w-6 h-6" />
      </button>
      <nav className="hidden md:flex space-x-1 lg:space-x-2" aria-label="मुख्य नेभिगेसन">
        {NAV_LINKS.slice(0,6).map(link => ( // Show more links on wider screens
          <Link key={link.path} to={link.path} className="hover:bg-green-600 px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium transition-colors">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <div className={`fixed inset-0 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} tabIndex={-1}></div>
    <nav className="relative bg-green-50 w-64 h-full p-4 shadow-xl" aria-label="साइडबार नेभिगेसन">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-green-700" aria-label="मेनु बन्द गर्नुहोस्">
        <XIcon className="w-6 h-6" />
      </button>
      <div className="mt-10">
        {NAV_LINKS.map(link => {
          const IconComponent = ICON_MAP[link.icon];
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className="flex items-center px-3 py-3 text-lg text-green-800 hover:bg-green-200 rounded-md transition-colors"
            >
              {IconComponent && <IconComponent className="w-6 h-6 mr-3 text-green-600" />}
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  </div>
);


// --- Feature Specific Components ---

// Onboarding Component
export const OnboardingWizard: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({ language: 'ne' as any, primaryCrops: [] }); 
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 2 && (!profile.location?.district || !profile.location?.municipality)) {
        setError("कृपया जिल्ला र नगरपालिका छान्नुहोस्।");
        return;
    }
    if (step === 3 && !profile.farmType) {
        setError("कृपया फार्मको प्रकार छान्नुहोस्।");
        return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use reverse geocoding here to get district/municipality from lat/lon
          // For this mock, we'll use a placeholder
          setProfile(p => ({ ...p, location: { district: "काठमाडौं (स्वचालित)", municipality: "नगरपालिका (स्वचालित)", coordinates: { lat: position.coords.latitude, lon: position.coords.longitude } } }));
          setError(null);
        },
        (err) => {
          setError("स्थान पत्ता लगाउन सकिएन: " + err.message);
        }
      );
    } else {
      setError(" तपाईंको ब्राउजरले जियोलोकेसन समर्थन गर्दैन।");
    }
  };

  const handleFarmTypeSelect = (type: FarmType) => {
    setProfile(p => ({ ...p, farmType: type }));
    setError(null);
  };
  
  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setProfile(p => ({
      ...p,
      primaryCrops: checked ? [...p.primaryCrops, value] : p.primaryCrops.filter(crop => crop !== value)
    }));
  };

  if (step === 1) {
    return (
      <Modal isOpen={true} onClose={() => {}} title="स्वागत छ!">
        <p className="mb-4 text-gray-700">स्मार्ट कृषि नेपालमा तपाईंलाई स्वागत छ। तपाईंको अनुभवलाई निजीकृत गर्न केही जानकारी आवश्यक छ।</p>
        <Button onClick={handleNext} className="w-full">सुरु गरौं</Button>
      </Modal>
    );
  }

  if (step === 2) { // Location
    return (
      <Modal isOpen={true} onClose={() => setStep(1)} title="तपाईंको स्थान">
        <div className="space-y-4">
          <Button onClick={handleLocationDetect} variant="secondary" className="w-full">मेरो स्थान पत्ता लगाउनुहोस्</Button>
          <p className="text-center text-sm text-gray-500">वा म्यानुअल रूपमा छान्नुहोस्:</p>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">जिल्ला:</label>
            <select
              id="district"
              value={profile.location?.district || ''}
              onChange={e => setProfile(p => ({ ...p, location: { ...p.location, district: e.target.value, municipality: p.location?.municipality || '' } }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="">जिल्ला छान्नुहोस्</option>
              {DISTRICTS_NEPAL.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700">नगरपालिका/गाउँपालिका:</label>
            <input
              type="text"
              id="municipality"
              placeholder="उदाहरण: काठमाडौं महानगरपालिका"
              value={profile.location?.municipality || ''}
              onChange={e => setProfile(p => ({ ...p, location: { ...p.location, municipality: e.target.value, district: p.location?.district || '' } }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
          <Button onClick={handleNext} className="w-full" disabled={!profile.location?.district || !profile.location?.municipality}>अर्को</Button>
        </div>
      </Modal>
    );
  }

  if (step === 3) { // Farm Type
    return (
      <Modal isOpen={true} onClose={() => setStep(2)} title="फार्मको प्रकार">
        <p className="mb-4 text-gray-700">तपाईंको मुख्य फार्मको प्रकार के हो?</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
            {FARM_TYPES.map(type => (
                <button
                    key={type}
                    onClick={() => handleFarmTypeSelect(type as FarmType)} 
                    className={`p-4 border rounded-lg text-center transition-colors ${profile.farmType === type ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                    {type}
                </button>
            ))}
        </div>
        {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
        <Button onClick={handleNext} className="w-full" disabled={!profile.farmType}>अर्को</Button>
      </Modal>
    );
  }
  
  if (step === 4) { // Primary Crops
    const commonCrops = ["धान", "मकै", "गहुँ", "कोदो", "फापर", "आलु", "गोलभेडा", "काउली", "बन्दा", "सिमी"];
    return (
      <Modal isOpen={true} onClose={() => setStep(3)} title="मुख्य बालीहरू">
        <p className="mb-4 text-gray-700">तपाईंले मुख्य रूपमा कुन बालीहरू लगाउनुहुन्छ? (धेरै छनोट गर्न सक्नुहुन्छ)</p>
        <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto p-1 border rounded-md">
          {commonCrops.map(crop => (
            <label key={crop} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded-md">
              <input
                type="checkbox"
                value={crop}
                checked={profile.primaryCrops.includes(crop)}
                onChange={handleCropChange}
                className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span>{crop}</span>
            </label>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="अन्य बाली (अल्पविरामले छुट्याउनुहोस्)"
          aria-label="अन्य बालीहरू"
          className="mt-1 mb-4 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          onBlur={(e) => {
             const otherCrops = e.target.value.split(',').map(c => c.trim()).filter(c => c);
             setProfile(p => ({...p, primaryCrops: Array.from(new Set([...p.primaryCrops, ...otherCrops])) }));
          }}
        />
        <Button onClick={() => onComplete(profile)} className="w-full">सम्पन्न</Button>
      </Modal>
    );
  }

  return null;
};

// Function to get OpenWeatherMap icon URL
// FIX: Export the function to make it accessible in App.tsx
export const getWeatherIconUrl = (iconCode: string | undefined) => {
  if (!iconCode) return "https://openweathermap.org/img/wn/01d@2x.png"; // Default icon
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Weather Widget
export const WeatherWidget: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const [weather, setWeather] = useState<WeatherData[] | null>(null);
  const [advisories, setAdvisories] = useState<WeatherAdvisory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      if (!userProfile?.location?.district) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [forecastData, advisoryData] = await Promise.all([
          fetchWeatherForecast(userProfile.location.district, userProfile.location.coordinates),
          fetchWeatherAdvisories(userProfile.location.district)
        ]);
        setWeather(forecastData);
        setAdvisories(advisoryData);
      } catch (err) {
        setError("मौसमको जानकारी ल्याउन सकिएन।");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWeatherData();
  }, [userProfile?.location?.district, userProfile?.location?.coordinates]);

  if (loading && userProfile?.location?.district) return <Card className="animate-pulse"><div className="h-48 bg-gray-200 rounded"></div></Card>;
  if (error) return <Card><p className="text-red-500" role="alert">{error}</p></Card>;
  if (!userProfile?.location?.district) return <Card><p className="text-gray-500">मौसम जानकारीको लागि कृपया आफ्नो स्थान सेटिङमा गएर अध्यावधिक गर्नुहोस्।</p></Card>;
  if (!weather || weather.length === 0) return <Card><p>कुनै मौसम जानकारी उपलब्ध छैन।</p></Card>;
  

  const todayWeather = weather[0];

  return (
    <Card title={`आजको मौसम (${userProfile?.location?.district || ''})`} className="bg-blue-50 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-4xl font-bold text-blue-700">{todayWeather.temp}°C</p>
          <p className="text-lg text-blue-600">{todayWeather.description}</p>
           {todayWeather.temp_min && todayWeather.temp_max && (
            <p className="text-xs text-gray-500">न्यूनतम: {todayWeather.temp_min}°C / अधिकतम: {todayWeather.temp_max}°C</p>
          )}
        </div>
        <img src={getWeatherIconUrl(todayWeather.icon)} alt={todayWeather.description} className="w-16 h-16" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
        <p className="flex items-center"><DropletIcon className="w-4 h-4 mr-1 text-blue-500"/> वर्षा: {todayWeather.precipitation} mm</p>
        <p className="flex items-center"><span className="text-xl mr-1">💧</span> आर्द्रता: {todayWeather.humidity}%</p>
        <p className="flex items-center"><WindIcon className="w-4 h-4 mr-1 text-gray-500"/> हावा: {todayWeather.windSpeed} km/h</p>
        {todayWeather.sunrise && <p className="flex items-center"><SunriseIcon className="w-4 h-4 mr-1 text-yellow-500"/> सूर्योदय: {new Date(todayWeather.sunrise * 1000).toLocaleTimeString('ne-NP', {hour: '2-digit', minute:'2-digit'})}</p>}
        {todayWeather.sunset && <p className="flex items-center"><SunsetIcon className="w-4 h-4 mr-1 text-orange-500"/> सूर्यास्त: {new Date(todayWeather.sunset * 1000).toLocaleTimeString('ne-NP', {hour: '2-digit', minute:'2-digit'})}</p>}
      </div>
      {advisories && advisories.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-800">कृषि सल्लाह:</h4>
          {advisories.map(adv => {
            const Icon = adv.type === 'warning' ? AlertTriangleIcon : adv.type === 'critical' ? AlertTriangleIcon : InfoIcon;
            const color = adv.type === 'warning' ? 'text-yellow-700 bg-yellow-50 border-yellow-300' : adv.type === 'critical' ? 'text-red-700 bg-red-50 border-red-300' : 'text-blue-700 bg-blue-50 border-blue-300';
            return (
                 <div key={adv.id} className={`p-2 border rounded-md flex items-start ${color}`}>
                    <Icon className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${adv.type === 'warning' ? 'text-yellow-500' : adv.type === 'critical' ? 'text-red-500' : 'text-blue-500'}`} />
                    <p className="text-sm">{adv.message}</p>
                </div>
            );
          })}
        </div>
      )}
       <Link to="/my-farm#weather-details" className="mt-4 inline-block text-sm text-green-600 hover:text-green-800 font-semibold">
        विस्तृत पूर्वानुमान हेर्नुहोस् &rarr;
      </Link>
    </Card>
  );
};

// Task Reminder Widget
export const TaskReminderWidget: React.FC = () => {
  const [tasks, setTasks] = useState<CropTask[]>(MOCK_CROP_TASKS); // Load from storage or API

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
    // Here, you'd also update this in local storage or backend
  };
  
  const upcomingTasks = tasks.filter(t => !t.isCompleted).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0,3);

  if(upcomingTasks.length === 0) {
    return (
      <Card title="कार्य रिमाइन्डरहरू">
        <div className="flex flex-col items-center justify-center text-gray-500 py-4">
          <CheckCircleIcon className="w-12 h-12 mb-2 text-green-500"/>
          <p>सबै कार्यहरू सम्पन्न भए!</p>
          <p className="text-sm">कुनै आगामी कार्यहरू छैनन्।</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="कार्य रिमाइन्डरहरू" className="bg-yellow-50 border border-yellow-200">
      <ul className="space-y-3">
        {upcomingTasks.map(task => (
          <li key={task.id} className={`p-3 rounded-lg shadow-sm flex items-center justify-between ${task.isCompleted ? 'bg-green-100' : 'bg-white'}`}>
            <div>
              <p className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-yellow-800'}`}>{task.taskName}</p>
              <p className="text-sm text-gray-600">{task.cropName} ({task.plotName}) - {new Date(task.dueDate).toLocaleDateString('ne-NP', { day: 'numeric', month: 'long' })}</p>
            </div>
            <button
              onClick={() => toggleTaskCompletion(task.id)}
              className={`p-1.5 rounded-full transition-colors ${task.isCompleted ? 'bg-green-500 hover:bg-green-600' : 'border border-gray-300 hover:bg-gray-100'}`}
              aria-label={task.isCompleted ? "कार्य अपूर्ण मार्क गर्नुहोस्" : "कार्य सम्पन्न मार्क गर्नुहोस्"}
            >
              {task.isCompleted ? <XIcon className="w-4 h-4 text-white" /> : <CheckCircleIcon className="w-5 h-5 text-gray-400 hover:text-green-500" />}
            </button>
          </li>
        ))}
      </ul>
      <Link to="/my-farm#crop-calendar" className="mt-4 inline-block text-sm text-green-600 hover:text-green-800 font-semibold">
        सबै कार्यहरू हेर्नुहोस् &rarr;
      </Link>
    </Card>
  );
};

// Educational Module Card
export const EducationalModuleCard: React.FC<{ module: EducationalModule }> = ({ module }) => (
  <Card className="hover:shadow-xl transition-shadow duration-300 bg-green-50">
    <Link to={`/education/${module.id}`} className="block">
      <BookOpenIcon className="w-12 h-12 text-green-600 mb-3" />
      <h3 className="text-xl font-semibold text-green-800 mb-2">{module.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{module.lessons.length} पाठहरू</p>
      <p className="text-sm text-green-600 hover:underline">थप जान्नुहोस् &rarr;</p>
    </Link>
  </Card>
);

// Video Lesson Display
export const VideoLessonDisplay: React.FC<{ lesson: VideoLesson }> = ({ lesson }) => {
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1];
        }
      }
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      // Fallback for simple regex if URL parsing fails (e.g. for non-standard URLs)
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      if (match && match[1]) videoId = match[1];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-green-700">{lesson.title}</h2>
      
      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden">
        {embedUrl ? (
          <iframe 
              className="w-full h-full"
              src={embedUrl}
              title={lesson.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen>
          </iframe>
        ) : (
          <p className="p-4 text-center">भिडियो लोड गर्न सकिएन। <br/> {lesson.videoUrl ? `(${lesson.videoUrl})` : `(${lesson.youtubeLinkPlaceholder || 'उदाहरण भिडियो'})`}<br/>भिडियो छिट्टै थपिनेछ वा लिङ्क जाँच गर्नुहोस्।</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">मुख्य बुँदाहरू:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {lesson.textSummary.map((point, index) => <li key={index}>{point}</li>)}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">थप जानकारी:</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.furtherReading}</p>
      </div>
    </div>
  );
};

// Pest/Disease Diagnosis Tool
export const PestDiagnosisTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDiagnosis(null); 
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      setError("कृपया एउटा तस्विर अपलोड गर्नुहोस्।");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    try {
      // Simulate network if needed, or directly call
      if (!navigator.onLine) {
          setError("तपाईं अफलाइन हुनुहुन्छ। यो सुविधाको लागि इन्टरनेट आवश्यक छ।");
          setIsLoading(false);
          return;
      }
      const result = await diagnoseCropIssue(imageFile, description);
      setDiagnosis(result);
    } catch (err) {
      setError("रोग/किरा पत्ता लगाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="बालीको समस्या निदान गर्नुहोस्" className="max-w-2xl mx-auto" icon={<BugIcon className="w-6 h-6 text-green-700"/>}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="cropImage" className="block text-lg font-medium text-gray-700 mb-2">प्रभावित बालीको तस्विर अपलोड गर्नुहोस्:</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="बालीको पूर्वावलोकन" className="mx-auto h-48 w-auto rounded-md object-contain" />
              ) : (
                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="cropImage"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>फाइल छान्नुहोस्</span>
                  <input id="cropImage" name="cropImage" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
                <p className="pl-1">वा यहाँ तान्नुहोस्</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF १०MB सम्म</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">थप विवरण (ऐच्छिक):</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="जस्तै: पात पहेँलो भएको, फलमा दाग देखिएको, आदि।"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">{error}</p>}

        <Button type="submit" className="w-full flex items-center justify-center" disabled={isLoading || !imageFile}>
          {isLoading && <LoadingSpinner size="w-5 h-5 mr-2" />}
          {isLoading ? "विश्लेषण हुँदैछ..." : "निदान गर्नुहोस्"}
        </Button>
      </form>

      {diagnosis && !isLoading && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-lg font-semibold text-green-700 mb-2">सम्भावित निदान (AI सुझाव):</h4>
          <p className="text-gray-700 whitespace-pre-line">{diagnosis}</p>
          <p className="mt-3 text-sm text-gray-500">यो एक प्रारम्भिक सुझाव हो। थप जानकारीको लागि विज्ञसँग परामर्श गर्नुहोस् वा विस्तृत रोग/किरा सूची हेर्नुहोस्।</p>
          <Link to="/ask-expert" className="mt-2 inline-block text-sm text-green-600 hover:text-green-800 font-semibold">
            विज्ञलाई सोध्नुहोस् &rarr;
          </Link>
        </div>
      )}
      <div className="mt-4 text-center">
        <Link to="/pest-disease#database" className="text-sm text-green-600 hover:underline">
          विस्तृत रोग तथा किराहरूको सूची हेर्नुहोस्
        </Link>
      </div>
    </Card>
  );
};

// Market Prices Display
export const MarketPriceDisplay: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const [prices, setPrices] = useState<MarketPrice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string>("");

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prioritize user's profile district if no explicit filter is set
        const districtToFetch = filterDistrict || userProfile?.location?.district || "सबै जिल्ला";
        const marketPrices = await fetchMarketPrices(districtToFetch);
        setPrices(marketPrices);
      } catch (err) {
        setError("बजार मूल्य ल्याउन सकिएन।");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPrices();
  }, [filterDistrict, userProfile?.location?.district]);
  
  useEffect(() => { // Set initial filter to user's district if available and no filter is active
    if (userProfile?.location?.district && !filterDistrict) {
      setFilterDistrict(userProfile.location.district);
    }
  }, [userProfile?.location?.district, filterDistrict]);


  if (loading) return <Card className="animate-pulse"><div className="h-48 bg-gray-200 rounded"></div></Card>;
  if (error) return <Card><p className="text-red-500" role="alert">{error}</p></Card>;
  
  return (
    <Card title="आजको बजार मूल्य" className="overflow-x-auto" icon={<DollarSignIcon className="w-6 h-6 text-green-700"/>}>
        <div className="mb-4">
            <label htmlFor="districtFilter" className="text-sm font-medium text-gray-700 mr-2">बजार क्षेत्र फिल्टर गर्नुहोस्:</label>
            <select
                id="districtFilter"
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
                className="py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
                <option value="सबै जिल्ला">सबै जिल्ला/मुख्य बजार</option>
                {DISTRICTS_NEPAL.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">नोट: यहाँ देखाइएको मूल्य सूचक मात्र हो। वास्तविक बजारमा थोरै फरक हुन सक्छ।</p>
        </div>

      {!prices || prices.length === 0 ? (
        <p>कुनै बजार मूल्य उपलब्ध छैन {filterDistrict !== "सबै जिल्ला" ? ` ${filterDistrict} को लागि` : 'चयनित क्षेत्रको लागि'}।</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">वस्तु</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">बजार</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मूल्य (रु.)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">एकाइ</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मिति</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prices.map(price => (
              <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{price.commodity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{price.market}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{price.price.toLocaleString('ne-NP')}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{price.unit}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(price.date).toLocaleDateString('ne-NP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <h4 className="text-md font-semibold text-yellow-700 mb-1">ऐतिहासिक मूल्य प्रवृत्ति</h4>
        <p className="text-sm text-yellow-600">यो सुविधा छिट्टै थपिनेछ। यहाँ तपाईंले विभिन्न वस्तुहरूको मूल्यमा आएको उतारचढाव ग्राफको माध्यमबाट हेर्न सक्नुहुनेछ, जसले तपाईंलाई बिक्रीको निर्णय लिन मद्दत गर्नेछ।</p>
      </div>
    </Card>
  );
};

// Ask an Expert Component
export const AskExpertComponent: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [sources, setSources] = useState<GroundingChunkWeb[]>([]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("कृपया आफ्नो प्रश्न लेख्नुहोस्।");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setStreamingResponse("");
    setSources([]);

    try {
      const geminiResponse = await getGeminiTextResponse(query, useSearch);
      setResponse(geminiResponse.text);
      if (useSearch && geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const webChunks = geminiResponse.candidates[0].groundingMetadata.groundingChunks
          .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title) //Ensure URI and Title exist
          .map(chunk => chunk.web as GroundingChunkWeb);
        setSources(webChunks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR_MESSAGE);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStreamSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
        setError("कृपया आफ्नो प्रश्न लेख्नुहोस्।");
        return;
    }
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setResponse(null);
    setStreamingResponse("");
    setSources([]); 

    streamGeminiTextResponse(
        query,
        (chunk) => setStreamingResponse(prev => prev + chunk),
        () => {
            setIsLoading(false);
            setIsStreaming(false);
        },
        (err) => {
            setError(err.message);
            setIsLoading(false);
            setIsStreaming(false);
        }
    );
  };


  return (
    <Card title="विज्ञलाई सोध्नुहोस् (AI सहायक)" className="max-w-2xl mx-auto" icon={<MessageSquareIcon className="w-6 h-6 text-green-700"/>}>
      <p className="mb-4 text-sm text-gray-600">
        तपाईंको कृषि सम्बन्धी कुनै पनि प्रश्नहरू छन् भने यहाँ सोध्न सक्नुहुन्छ। हाम्रो AI प्रणालीले तपाईंलाई विज्ञ सल्लाह प्रदान गर्ने प्रयास गर्नेछ।
        जटिल प्रश्नहरूको लागि, स्थानीय कृषि विज्ञसँग सम्पर्क गर्न सल्लाह दिइन्छ। यो AI द्वारा उत्पन्न प्रतिक्रिया हो र पूर्णतया सही नहुन सक्छ।
      </p>
      <form onSubmit={isStreaming ? handleStreamSubmit : handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="expertQuery" className="sr-only">प्रश्न</label>
          <textarea
            id="expertQuery"
            name="expertQuery"
            rows={5}
            className="mt-1 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder={ASK_EXPERT_PLACEHOLDER}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            aria-required="true"
          />
        </div>
         <div className="flex items-center space-x-4">
            <label htmlFor="useSearch" className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input
                    type="checkbox"
                    id="useSearch"
                    checked={useSearch}
                    onChange={(e) => {
                        setUseSearch(e.target.checked);
                        if (e.target.checked && isStreaming) setIsStreaming(false); // Cannot stream with search
                    }}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                    disabled={isLoading}
                />
                नवीनतम जानकारीको लागि Google Search प्रयोग गर्नुहोस् (स्ट्रिमिङ असक्षम पार्नेछ)
            </label>
         </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">{error}</p>}
        
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <Button type="submit" className="w-full flex items-center justify-center" disabled={isLoading || (useSearch && isStreaming) }>
              {isLoading && !isStreaming && <LoadingSpinner size="w-5 h-5 mr-2" />}
              {isLoading && !isStreaming ? ASK_EXPERT_LOADING_MESSAGE : "प्रश्न पठाउनुहोस्"}
            </Button>
            <Button 
              type="button" 
              onClick={handleStreamSubmit} 
              variant="secondary" 
              className="w-full flex items-center justify-center" 
              disabled={isLoading || useSearch} // Disable streaming if search is active
            >
              {isLoading && isStreaming && <LoadingSpinner size="w-5 h-5 mr-2" />}
              {isLoading && isStreaming ? "प्रतिक्रिया स्ट्रिम गर्दै..." : "स्ट्रिमिङ प्रतिक्रिया"}
            </Button>
        </div>
      </form>

      {(response || streamingResponse) && !isLoading && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md" aria-live="polite">
          <h4 className="text-lg font-semibold text-green-700 mb-2">AI प्रतिक्रिया:</h4>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {response || streamingResponse}
          </div>
          {sources.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-600 mb-1">सन्दर्भ स्रोतहरू (Google Search बाट):</h5>
              <ul className="list-disc list-inside space-y-1">
                {sources.map((source, index) => (
                  <li key={index} className="text-xs">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {source.title || source.uri} <ExternalLinkIcon className="inline w-3 h-3 ml-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};


// General settings component
export const SettingsComponent: React.FC<{ userProfile: UserProfile | null; onUpdateProfile: (profile: UserProfile) => void; }> = ({ userProfile, onUpdateProfile }) => {
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(userProfile);
    const [isSaved, setIsSaved] = useState(false);


    useEffect(() => {
        setLocalProfile(userProfile);
    }, [userProfile]);

    const handleChange = (field: keyof UserProfile | `location.${'district'|'municipality'}`, value: any) => {
        setIsSaved(false);
        setLocalProfile(prev => {
            if (!prev) return null;
            if (field.startsWith('location.')) {
                const locField = field.split('.')[1] as 'district' | 'municipality';
                return {
                    ...prev,
                    location: {
                        ...(prev.location || { district: '', municipality: ''}), 
                        [locField]: value,
                        district: locField === 'municipality' ? (prev.location?.district || '') : (locField === 'district' ? value : (prev.location?.district || '')),
                        municipality: locField === 'district' ? (prev.location?.municipality || '') : (locField === 'municipality' ? value : (prev.location?.municipality || '')),
                    }
                };
            }
            return { ...prev, [field]: value };
        });
    };
    
    const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSaved(false);
        const { value, checked } = e.target;
        setLocalProfile(p => {
            if (!p) return null;
            return {
                ...p,
                primaryCrops: checked ? [...p.primaryCrops, value] : p.primaryCrops.filter(crop => crop !== value)
            };
        });
    };


    const handleSave = () => {
        if (localProfile) {
            onUpdateProfile(localProfile);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
        }
    };

    if (!localProfile) return <LoadingSpinner />;

    const commonCrops = ["धान", "मकै", "गहुँ", "कोदो", "फापर", "आलु", "गोलभेडा", "काउली", "बन्दा", "सिमी", "तोरी", "मसुरो", "राजमा", "भटमास"];


    return (
        <Card title="सेटिङहरू" className="max-w-2xl mx-auto" icon={<SettingsIcon className="w-6 h-6 text-green-700"/>}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="settingsDistrict" className="block text-sm font-medium text-gray-700">जिल्ला:</label>
                    <select
                        id="settingsDistrict"
                        value={localProfile.location?.district || ''}
                        onChange={e => handleChange('location.district', e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                        <option value="">जिल्ला छान्नुहोस्</option>
                        {DISTRICTS_NEPAL.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="settingsMunicipality" className="block text-sm font-medium text-gray-700">नगरपालिका/गाउँपालिका:</label>
                    <input
                        type="text"
                        id="settingsMunicipality"
                        placeholder="उदाहरण: काठमाडौं महानगरपालिका"
                        value={localProfile.location?.municipality || ''}
                        onChange={e => handleChange('location.municipality', e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="settingsFarmType" className="block text-sm font-medium text-gray-700">फार्मको प्रकार:</label>
                    <select
                        id="settingsFarmType"
                        value={localProfile.farmType || ''}
                        onChange={e => handleChange('farmType', e.target.value as FarmType)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                        <option value="">फार्मको प्रकार छान्नुहोस्</option>
                        {FARM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">मुख्य बालीहरू:</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {commonCrops.map(crop => (
                            <label key={crop} className="flex items-center space-x-2 p-1 hover:bg-gray-50 cursor-pointer rounded-md">
                                <input
                                    type="checkbox"
                                    value={crop}
                                    checked={localProfile.primaryCrops.includes(crop)}
                                    onChange={handleCropChange}
                                    className="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                <span className="text-sm">{crop}</span>
                            </label>
                        ))}
                    </div>
                     <input 
                        type="text" 
                        aria-label="अन्य बालीहरू (सेटिङ)"
                        placeholder="अन्य बाली (अल्पविरामले छुट्याउनुहोस्)"
                        className="mt-2 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        defaultValue={localProfile.primaryCrops.filter(c => !commonCrops.includes(c)).join(', ')}
                        onBlur={(e) => {
                            setIsSaved(false);
                            const otherCrops = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                            setLocalProfile(p => {
                                if (!p) return null;
                                const currentCommonCrops = p.primaryCrops.filter(c => commonCrops.includes(c));
                                return {...p, primaryCrops: Array.from(new Set([...currentCommonCrops, ...otherCrops])) };
                            });
                        }}
                    />
                </div>
                <Button onClick={handleSave} className="w-full">परिवर्तनहरू सुरक्षित गर्नुहोस्</Button>
                {isSaved && <p className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md text-center">सेटिङहरू सफलतापूर्वक सुरक्षित गरियो!</p>}
            </div>
        </Card>
    );
};

// Component to display Pest/Disease Database
export const PestDiseaseDatabaseDisplay: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPestDisease, setSelectedPestDisease] = useState<PestDisease | null>(null);

  const filteredPestsDiseases = MOCK_PEST_DISEASES.filter(pd =>
    pd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pd.affectedCrops.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card title="रोग तथा किराहरूको सूची" id="database" icon={<BugIcon className="w-6 h-6 text-green-700"/>}>
      <input
        type="text"
        placeholder="रोग/किरा वा बालीको नाम खोज्नुहोस्..."
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredPestsDiseases.length === 0 && <p>कुनै मिल्दो रोग वा किरा फेला परेन।</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
        {filteredPestsDiseases.map(pd => (
          <div key={pd.id} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow bg-white" onClick={() => setSelectedPestDisease(pd)}>
            <h4 className="text-lg font-semibold text-green-700">{pd.name} ({pd.type === 'pest' ? 'किरा' : 'रोग'})</h4>
            <p className="text-sm text-gray-600">प्रभावित बाली: {pd.affectedCrops.join(', ')}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{pd.description}</p>
            <span className="text-xs text-green-600 hover:underline">विस्तृत हेर्नुहोस्</span>
          </div>
        ))}
      </div>

      {selectedPestDisease && (
        <Modal isOpen={!!selectedPestDisease} onClose={() => setSelectedPestDisease(null)} title={selectedPestDisease.name} size="lg">
          <div className="space-y-3">
            <p><strong>वैज्ञानिक नाम:</strong> {selectedPestDisease.scientificName || 'N/A'}</p>
            <p><strong>प्रकार:</strong> {selectedPestDisease.type === 'pest' ? 'किरा' : 'रोग'}</p>
            <p><strong>प्रभावित बाली:</strong> {selectedPestDisease.affectedCrops.join(', ')}</p>
            <div>
              <h5 className="font-semibold mt-2">विवरण:</h5>
              <p className="text-sm whitespace-pre-line">{selectedPestDisease.description}</p>
            </div>
            <div>
              <h5 className="font-semibold mt-2">लक्षणहरू:</h5>
              <ul className="list-disc list-inside text-sm">
                {selectedPestDisease.symptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {selectedPestDisease.images && selectedPestDisease.images.length > 0 && (
                <div>
                    <h5 className="font-semibold mt-2">तस्विरहरू (उदाहरण):</h5>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {selectedPestDisease.images.map((img, i) => <img key={i} src={img} alt={`${selectedPestDisease.name} लक्षण ${i+1}`} className="rounded-md object-cover aspect-video" />)}
                    </div>
                </div>
            )}
            <div>
              <h5 className="font-semibold mt-2">रोकथामका उपायहरू:</h5>
              <ul className="list-disc list-inside text-sm">
                {selectedPestDisease.prevention.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mt-2">जैविक नियन्त्रण:</h5>
              <ul className="list-disc list-inside text-sm">
                {selectedPestDisease.organicControl.map((oc, i) => <li key={i}>{oc}</li>)}
              </ul>
            </div>
            {selectedPestDisease.chemicalControl && selectedPestDisease.chemicalControl.length > 0 && (
              <div>
                <h5 className="font-semibold mt-2">रासायनिक नियन्त्रण (अन्तिम उपाय, विज्ञको सल्लाहमा):</h5>
                {selectedPestDisease.chemicalControl.map((cc, i) => (
                  <div key={i} className="p-2 border rounded-md mt-1 bg-red-50 text-sm">
                    <p><strong>रसायन:</strong> {cc.chemicalName}</p>
                    <p><strong>मात्रा:</strong> {cc.dosage}</p>
                    <p><strong>विधि:</strong> {cc.method}</p>
                    <p><strong>सुरक्षा:</strong> {cc.safety}</p>
                    <p><strong>PHI (बाली काट्नु अघिको अवधि):</strong> {cc.phi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Card>
  );
};

// Component to display Soil & Nutrient Information
export const SoilNutrientInfoDisplay: React.FC = () => {
  const [selectedInfo, setSelectedInfo] = useState<SoilNutrientInfo | null>(null);

  return (
    <div className="space-y-6">
      {MOCK_SOIL_NUTRIENT_INFO.map(info => (
        <Card key={info.id} title={info.title} icon={<SproutIcon className="w-6 h-6 text-green-700"/>}>
          <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{info.content.substring(0, 200)}...</p>
          {info.visualAid && <img src={info.visualAid} alt={info.title} className="my-2 rounded-lg shadow-sm aspect-[16/7] object-cover w-full"/>}
          {info.details && info.category === 'nutrientDeficiency' && (
            <div className="mt-2 space-y-1">
              {info.details.map(def => (
                <div key={def.nutrient} className="p-2 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-md">
                  <strong className="text-yellow-700">{def.nutrient} को कमी:</strong> <span className="text-xs">{def.generalSymptoms?.substring(0,100)}...</span>
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedInfo(info)} className="mt-2">विस्तृत हेर्नुहोस्</Button>
        </Card>
      ))}

      {selectedInfo && (
        <Modal isOpen={!!selectedInfo} onClose={() => setSelectedInfo(null)} title={selectedInfo.title} size="lg">
          <div className="space-y-3">
            {selectedInfo.visualAid && <img src={selectedInfo.visualAid} alt={selectedInfo.title} className="mb-3 rounded-lg shadow aspect-video object-cover w-full"/>}
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedInfo.content}</p>
            {selectedInfo.details && selectedInfo.category === 'nutrientDeficiency' && (
               <div>
                <h5 className="font-semibold mt-3 mb-1">बाली अनुसार विस्तृत लक्षण:</h5>
                 {selectedInfo.details.map(def => (
                   <div key={def.nutrient} className="mb-2 p-2 border rounded-md bg-gray-50">
                     <strong className="text-green-700">{def.nutrient} को कमी:</strong>
                     <p className="text-sm text-gray-600 mt-1"><em>सामान्य लक्षण:</em> {def.generalSymptoms}</p>
                     {def.cropSymptoms && def.cropSymptoms.length > 0 && (
                       <ul className="list-disc list-inside text-sm ml-4 mt-1">
                         {def.cropSymptoms.map(cs => <li key={cs.crop}><strong>{cs.crop}:</strong> {cs.symptom}</li>)}
                       </ul>
                     )}
                     {def.visualAid && <img src={def.visualAid} alt={`${def.nutrient} deficiency`} className="my-2 rounded aspect-auto object-contain max-h-32"/>}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Component to display Livestock Ailments
export const LivestockAilmentDisplay: React.FC = () => {
  const [selectedAilment, setSelectedAilment] = useState<LivestockAilment | null>(null);
  return (
    <Card title="साझा पशुपन्छी रोगहरू" icon={<PillIcon className="w-6 h-6 text-green-700"/>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_LIVESTOCK_AILMENTS.map(ailment => (
          <div key={ailment.id} className="p-3 border rounded-lg bg-red-50 hover:shadow-md cursor-pointer" onClick={() => setSelectedAilment(ailment)}>
            <h4 className="font-semibold text-red-700">{ailment.name}</h4>
            <p className="text-xs text-gray-600">प्रभावित: {ailment.animalTypes.join(', ')}</p>
            <p className="text-xs text-red-600 mt-1">लक्षण: {ailment.symptoms[0].substring(0,50)}...</p>
          </div>
        ))}
      </div>
      {selectedAilment && (
        <Modal isOpen={!!selectedAilment} onClose={() => setSelectedAilment(null)} title={selectedAilment.name} size="lg">
          <div className="space-y-2">
            <p><strong>प्रभावित पशुपन्छी:</strong> {selectedAilment.animalTypes.join(', ')}</p>
            <div><h5 className="font-semibold">लक्षणहरू:</h5><ul className="list-disc list-inside text-sm">{selectedAilment.symptoms.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
            <div><h5 className="font-semibold">रोकथाम:</h5><ul className="list-disc list-inside text-sm">{selectedAilment.prevention.map((p,i) => <li key={i}>{p}</li>)}</ul></div>
            {selectedAilment.firstAid && <div><h5 className="font-semibold">प्राथमिक उपचार:</h5><ul className="list-disc list-inside text-sm">{selectedAilment.firstAid.map((fa,i) => <li key={i}>{fa}</li>)}</ul></div>}
            {selectedAilment.treatmentNotes && <p><strong>उपचार सम्बन्धी नोट:</strong> <span className="text-sm">{selectedAilment.treatmentNotes}</span></p>}
            <p className="text-xs text-red-500 mt-2">नोट: यो सामान्य जानकारी मात्र हो। पशु चिकित्सकको सल्लाह लिनुहोस्।</p>
          </div>
        </Modal>
      )}
    </Card>
  );
};

// Component to display Livestock Care Information
export const LivestockCareDisplay: React.FC = () => {
  const [selectedCareInfo, setSelectedCareInfo] = useState<LivestockCareInfo | null>(null);
  return (
    <div className="space-y-4">
      {MOCK_LIVESTOCK_CARE_INFO.map(info => (
         <Card key={info.id} title={info.title} icon={<LeafIcon className="w-6 h-6 text-green-700"/>}>
          <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{info.content.substring(0,200)}...</p>
          <Button variant="ghost" size="sm" onClick={() => setSelectedCareInfo(info)}>विस्तृत हेर्नुहोस्</Button>
        </Card>
      ))}
      {selectedCareInfo && (
        <Modal isOpen={!!selectedCareInfo} onClose={() => setSelectedCareInfo(null)} title={selectedCareInfo.title} size="lg">
           <div className="space-y-3">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedCareInfo.content}</p>
            {selectedCareInfo.schedule && selectedCareInfo.topic === 'vaccination' && (
              <div>
                <h5 className="font-semibold mt-2">उदाहरण खोप तालिका:</h5>
                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                  {selectedCareInfo.schedule.map((item, i) => (
                    <li key={i}><strong>{item.vaccine}</strong>: {item.age} ({item.notes})</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-1">कृपया स्थानीय पशु चिकित्सकसँग परामर्श गरी आफ्नो क्षेत्र सुहाउँदो तालिका बनाउनुहोस्।</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Yield Tracking Component
export const YieldTracker: React.FC = () => {
  const [records, setRecords] = useState<YieldRecord[]>(loadYieldRecords());
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<YieldRecord | null>(null);
  const [formState, setFormState] = useState<Omit<YieldRecord, 'id'>>({
    cropName: '', plotName: '', harvestDate: new Date().toISOString().split('T')[0], quantity: 0, unit: 'किलोग्राम'
  });

  const commonCrops = ["धान", "मकै", "गहुँ", "आलु", "गोलभेडा", "अन्य"];
  const commonUnits = ["किलोग्राम", "क्विन्टल", "गोटा", "मुरी", "पाथी", "लिस्नु"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: name === 'quantity' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formState.cropName || formState.quantity <= 0) {
      alert("कृपया बालीको नाम र मात्रा सही भर्नुहोस्।");
      return;
    }
    if (editingRecord) {
      const updatedRecords = editYieldRecord({ ...editingRecord, ...formState });
      setRecords(updatedRecords);
    } else {
      const newRecord = saveYieldRecord(formState);
      setRecords(prev => [newRecord, ...prev]);
    }
    setShowModal(false);
    setEditingRecord(null);
    setFormState({ cropName: '', plotName: '', harvestDate: new Date().toISOString().split('T')[0], quantity: 0, unit: 'किलोग्राम' });
  };

  const handleEdit = (record: YieldRecord) => {
    setEditingRecord(record);
    setFormState({ ...record });
    setShowModal(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm("के तपाईं यो रेकर्ड साँच्चै मेटाउन चाहनुहुन्छ?")) {
      const updatedRecords = removeYieldRecord(recordId);
      setRecords(updatedRecords);
    }
  };
  
  const openAddNewModal = () => {
    setEditingRecord(null);
    setFormState({ cropName: '', plotName: '', harvestDate: new Date().toISOString().split('T')[0], quantity: 0, unit: 'किलोग्राम' });
    setShowModal(true);
  };


  return (
    <Card title="उत्पादन ट्र्याकिङ" icon={<TractorIcon className="w-5 h-5 text-green-700"/>}>
      <Button onClick={openAddNewModal} className="mb-4 flex items-center" size="md">
        <PlusCircleIcon className="w-5 h-5 mr-2"/> नयाँ उत्पादन रेकर्ड थप्नुहोस्
      </Button>
      {records.length === 0 ? (
        <p>अहिलेसम्म कुनै उत्पादन रेकर्ड गरिएको छैन।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">बाली</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">मात्रा</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">एकाइ</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">मिति</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">कार्य</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map(rec => (
                <tr key={rec.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{rec.cropName} {rec.plotName && `(${rec.plotName})`}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{rec.quantity}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{rec.unit}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(rec.harvestDate).toLocaleDateString('ne-NP')}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(rec)} aria-label="सम्पादन गर्नुहोस्"><Edit3Icon className="w-4 h-4"/></Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(rec.id)} aria-label="मेटाउनुहोस्"><Trash2Icon className="w-4 h-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRecord ? "उत्पादन रेकर्ड सम्पादन गर्नुहोस्" : "नयाँ उत्पादन रेकर्ड"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cropName" className="block text-sm font-medium text-gray-700">बालीको नाम:</label>
            <select id="cropName" name="cropName" value={formState.cropName} onChange={handleInputChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
              <option value="">बाली छान्नुहोस्</option>
              {commonCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formState.cropName === 'अन्य' && <input type="text" name="cropName" onChange={handleInputChange} placeholder="बालीको नाम लेख्नुहोस्" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" />}
          </div>
          <div>
            <label htmlFor="plotName" className="block text-sm font-medium text-gray-700">प्लटको नाम (ऐच्छिक):</label>
            <input type="text" id="plotName" name="plotName" value={formState.plotName || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">कटानी मिति:</label>
            <input type="date" id="harvestDate" name="harvestDate" value={formState.harvestDate} onChange={handleInputChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">मात्रा:</label>
            <input type="number" id="quantity" name="quantity" value={formState.quantity} onChange={handleInputChange} required min="0.01" step="0.01" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">एकाइ:</label>
             <select id="unit" name="unit" value={formState.unit} onChange={handleInputChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
              {commonUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full">{editingRecord ? 'अद्यावधिक गर्नुहोस्' : 'सुरक्षित गर्नुहोस्'}</Button>
        </form>
      </Modal>
    </Card>
  );
};