'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FiPercent } from "react-icons/fi";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { FaChartBar } from "react-icons/fa";
import { TbReport } from "react-icons/tb";

export default function AnalyticsNavBar() {
    const [currentView, setCurrentView] = useState('summary');
    const views = [
        { id: 'summary', label: <TbReport />, title: 'Summary' },
        { id: 'marks', label: <FiPercent />, title: 'Marks' },
        { id: 'attendance', label: <BsFillPersonCheckFill />, title: 'Attendance' },
        { id: 'performance', label: <FaChartBar />, title: 'Performance' }
    ];

    useEffect(() => {
        const getCurrentView = () => {
            return window.location.hash.slice(1) || 'summary';
        };

        setCurrentView(getCurrentView());

        const handleHashChange = () => {
            setCurrentView(getCurrentView());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
                        title={view.title}
                        className={`px-3 py-2 text-2xl rounded-full font-semibold transition-all duration-150 ${currentView === view.id ? 'bg-light-accent dark:bg-dark-accent text-light-background-light dark:text-dark-background-dark' : 'hover:bg-light-background-normal dark:hover:bg-dark-background-normal'}`}
                    >
                        {view.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}