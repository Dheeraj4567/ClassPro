'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiOutlineClockCircle } from "react-icons/ai";
import { FiPercent } from "react-icons/fi";
import { BsFillPersonCheckFill } from "react-icons/bs";

export default function NavBar() {
    const [currentView, setCurrentView] = useState('timetable');
    const views = [
        { id: 'timetable', label: <AiOutlineClockCircle /> },
        { id: 'attendance', label: <BsFillPersonCheckFill /> },
        { id: 'marks', label: <FiPercent /> }
    ];

    useEffect(() => {
        // Function to handle both hash changes and scrolling
        const updateCurrentView = () => {
            // Get current hash or use default
            const hash = window.location.hash.slice(1);
            if (hash) {
                setCurrentView(hash);
                return;
            }
            
            // If no hash is present, determine current section by scroll position
            const sections = views.map(view => 
                document.getElementById(view.id)
            ).filter(Boolean);
            
            if (sections.length === 0) return;
            
            // Get current scroll position
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            
            // Find the current section in view
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (!section) continue;
                
                const sectionTop = section.offsetTop;
                if (scrollPosition >= sectionTop) {
                    setCurrentView(section.id);
                    break;
                }
            }
            
            // If we're at the very top, select the first section
            if (window.scrollY < 100) {
                setCurrentView(sections[0]?.id || 'timetable');
            }
        };

        // Initial update
        updateCurrentView();

        // Listen for hash changes
        window.addEventListener('hashchange', updateCurrentView);
        
        // Listen for scroll events - using throttling to improve performance
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateCurrentView, 50);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('hashchange', updateCurrentView);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [views]);

    return (
        <nav className="sticky bottom-2 z-50 w-full flex items-center justify-center">
            <div className="flex items-center justify-center p-1 rounded-full bg-light-background-light dark:bg-dark-background-darker gap-2">
                {views.map((view) => (
                    <Link
                        href={`#${view.id}`}
                        onClick={() => {
                            setCurrentView(view.id);
                        }}
                        key={view.id}
                        className={`px-3 py-2 text-2xl rounded-full font-semibold transition-all duration-150 ${currentView === view.id ? 'bg-light-accent dark:bg-dark-accent text-light-background-light dark:text-dark-background-dark' : 'hover:bg-light-background-normal dark:hover:bg-dark-background-normal'}`}
                    >
                        {view.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}