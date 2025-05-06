'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineClockCircle } from "react-icons/ai";
import { FiPercent } from "react-icons/fi";
import { BsFillPersonCheckFill } from "react-icons/bs";

export default function NavBar() {
    const [currentView, setCurrentView] = useState('timetable');
    const scrollingRef = useRef(false);
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
            if (hash && views.some(view => view.id === hash)) {
                setCurrentView(hash);
                return;
            }
            
            // If no hash is present, determine current section by scroll position
            const sections = views
                .map(view => ({ id: view.id, element: document.getElementById(view.id) }))
                .filter(item => item.element !== null);
            
            if (sections.length === 0) return;
            
            // Get current scroll position with offset to trigger earlier
            const scrollPosition = window.scrollY + window.innerHeight / 4;
            
            // Find the section currently in view
            let currentSection = sections[0].id;
            
            for (const section of sections) {
                if (!section.element) continue;
                
                const rect = section.element.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                
                // If we've scrolled past the top of this section
                if (scrollPosition >= sectionTop) {
                    currentSection = section.id;
                } else {
                    break;
                }
            }
            
            setCurrentView(currentSection);
        };

        // Initial update when component mounts
        setTimeout(updateCurrentView, 100);

        // Listen for hash changes
        window.addEventListener('hashchange', updateCurrentView);
        
        // Improved scroll event handler with requestAnimationFrame for better performance
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateCurrentView();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Also update view on window resize
        window.addEventListener('resize', updateCurrentView);
        
        return () => {
            window.removeEventListener('hashchange', updateCurrentView);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateCurrentView);
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
                            // Set flag to avoid conflicts between manual navigation and scroll detection
                            scrollingRef.current = true;
                            setTimeout(() => { scrollingRef.current = false; }, 100);
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