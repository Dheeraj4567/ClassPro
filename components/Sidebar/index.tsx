'use client';
import React, { type ReactNode, useEffect, useState, useCallback, memo } from 'react';
import {
  FaBookOpen,
  FaGraduationCap,
  FaLink,
  FaUserGraduate,
  FaWhatsapp,
} from 'react-icons/fa6';
import { BsCalendar2WeekFill } from 'react-icons/bs';
import { FiGithub } from 'react-icons/fi';
import { MdHelpOutline } from 'react-icons/md';
import dynamic from 'next/dynamic';
import Link from './SidebarLink';
import { IoLibrarySharp } from 'react-icons/io5';
import { BsCalculatorFill } from 'react-icons/bs';
import InstallButton from './Buttons/InstallButton';
import Popup from './Popup';
import { useGestures } from '@/hooks/useGesture';
import ThemeToggle from '@/components/themes/ThemeToggle';
import { Calendar } from '@/types/Calendar';

// Optimize dynamic imports with loading priority
const MiniButtons = dynamic(
  () => import('./Buttons/MiniButtons'),
  { ssr: true, loading: () => <div className="w-8 h-8" /> }
);

const OpenButton = dynamic(
  () => import('./Buttons/OpenButton'),
  { ssr: false, loading: () => <div className="w-10 h-10" /> }
);

// Memoize sidebar links to prevent unnecessary re-renders
const SidebarLink = memo(({ href, icon, label, onClick }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string | React.ReactNode;
  onClick: () => void;
}) => (
  <Link onClick={onClick} href={href}>
    {icon}
    {label}
  </Link>
));

SidebarLink.displayName = 'SidebarLink';

export function Sidebar({
  dayorder,
  mini,
  profile,
  calendar = [],
}: {
  dayorder: ReactNode;
  mini: ReactNode;
  profile?: ReactNode;
  calendar?: Calendar[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Memoize handlers to prevent recreating functions on each render
  const handleClick = useCallback(() => {
    if (isMobileView) {
      setIsOpen(false);
    }
  }, [isMobileView]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useGestures({
    onSwipeLeft: () => {
      setIsOpen(false);
    },
    onSwipeRight: () => {
      setIsOpen(true);
    },
  });

  // Only update sidebar width when isOpen changes
  useEffect(() => {
    const sidebarWidth = isOpen ? '310px' : isMobileView ? '0px' : '60px';
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isOpen, isMobileView]);

  // Only check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobileView(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Run once on mount
    checkMobileView();

    // Debounce resize handler for better performance
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobileView, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 flex h-full transform flex-col justify-between bg-light-background-normal p-4 text-white transition-all will-change-transform md:duration-150 dark:bg-dark-background-normal ${isOpen ? 'translate-x-0' : '-translate-x-96 lg:-translate-x-56'
          } w-[310px] p-8`}
      >
        <div className='flex flex-col gap-2'>
          <div
            className={`transition duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className='text-color flex items-center justify-between text-light-color dark:text-dark-color'>
              <h1 className='text-3xl font-semibold'>ClassPro</h1>
              <ThemeToggle />
            </div>
            <div className='my-4 flex'>{dayorder}</div>
          </div>
          {!isOpen && mini}

          <hr className='border-t-light-side dark:border-t-dark-side' />

          <nav className='text-md flex flex-col gap-2 font-semibold text-light-color dark:text-dark-color'>
            <SidebarLink 
              onClick={handleClick} 
              href='/academia' 
              icon={<FaBookOpen className='text-xl' />} 
              label="Home" 
            />

            <SidebarLink 
              onClick={handleClick} 
              href='/academia/analytics' 
              icon={<BsCalculatorFill className='text-xl' />} 
              label="Analytics" 
            />

            <SidebarLink 
              onClick={handleClick} 
              href='/academia/courses' 
              icon={<FaGraduationCap className='text-xl' />} 
              label="Course list" 
            />

            <SidebarLink 
              onClick={handleClick} 
              href='/academia/calendar' 
              icon={<BsCalendar2WeekFill className='text-xl' />} 
              label="Calendar" 
            />

            <hr className='border-t-light-side dark:border-t-dark-side' />

            <SidebarLink 
              onClick={handleClick} 
              href='/academia/links' 
              icon={<FaLink className='text-xl' />} 
              label="Links" 
            />
            
            <SidebarLink 
              onClick={handleClick} 
              href='/academia/faculties' 
              icon={<FaUserGraduate className='text-xl' />} 
              label="Faculties" 
            />

          </nav>

          <hr className='border-t-light-side dark:border-t-dark-side' />
          <SidebarLink 
            onClick={handleClick} 
            href='/academia/gradex' 
            icon={<BsCalculatorFill className='text-xl' />}
            label="GradeX"
          />
          
          <SidebarLink 
            onClick={handleClick}
            href="/academia/library"
            icon={<IoLibrarySharp className="text-xl" />}
            label={
              <span className="flex items-center justify-start gap-3 text-light-color dark:text-dark-color">
                Library{" "}
                <span className="text-xs px-1 rounded-md bg-light-accent dark:bg-dark-accent text-light-background-light dark:text-dark-background-dark py-0.5">
                  NEW
                </span>
              </span>
            }
          />
        </div>

        <div className='flex flex-col-reverse gap-4'>
          <div className='flex items-center gap-2 text-light-color dark:text-dark-color'>
            <h4 className='font-mono text-xs opacity-60 transition duration-150'>
              Community:{' '}
            </h4>
            <MiniButtons icon={<FiGithub />} href='/github' />
            <MiniButtons icon={<FaWhatsapp />} href='/whatsapp' />
          </div>
          {profile}
        </div>
        <InstallButton anchor={isOpen} ref={null} />
        <OpenButton
          anchor={isOpen}
          isOpen={isOpen}
          onClick={toggleSidebar}
        />
        {!isOpen && (
          <MiniButtons
            className='fixed bottom-8 right-9 hidden lg:block'
            icon={<MdHelpOutline />}
            href='https://chat.whatsapp.com/IiKvVzwV142I11Ytqn9RF9'
          />
        )}
      </header>

      <Popup />

      <OpenButton
        mobile
        isOpen={isOpen}
        onClick={toggleSidebar}
      />
      <div id='dialog-root' />
    </>
  );
}
