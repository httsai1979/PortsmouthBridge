import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MetaData = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'Portsmouth Bridge | Your Community Partner';
        let description = 'Connecting Portsmouth community with essential resources, food banks, and support hubs. Helping neighbors help each other.';

        if (path === '/') {
            title = 'Portsmouth Bridge | Home';
        } else if (path.startsWith('/list')) {
            title = 'Resource Directory | Portsmouth Bridge';
            description = 'Browse the comprehensive directory of support services, food pantries, and community hubs in Portsmouth.';
        } else if (path.startsWith('/map')) {
            title = 'Map Explorer | Portsmouth Bridge';
            description = 'Find local support and community resources near you on our interactive map of Portsmouth.';
        } else if (path === '/loop') {
            title = 'Community Loop | Portsmouth Bridge';
            description = 'The Pompey Loop: A community-led exchange for skills and items. Dignity preserved, no money needed.';
        } else if (path === '/connect') {
            title = 'Connect Tool | Portsmouth Bridge';
            description = 'Our smart eligibility calculator helps you find unclaimed benefits and support schemes in Portsmouth.';
        } else if (path === '/faq') {
            title = 'Help & Guide | Portsmouth Bridge';
            description = 'Learn how to use Portsmouth Bridge and find answers to common questions about community support.';
        } else if (path === '/planner') {
            title = 'My Journey | Portsmouth Bridge';
            description = 'Your personalized schedule and collection of saved community resources in Portsmouth.';
        } else if (path.startsWith('/partner')) {
            title = 'Partner Portal | Agency Dashboard';
            description = 'Secure dashboard for Portsmouth agencies to manage resources and view community analytics.';
        }

        document.title = title;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'description';
            newMeta.content = description;
            document.head.appendChild(newMeta);
        }

        // Handle scroll to top on route change
        window.scrollTo(0, 0);

    }, [location]);

    return null; // This component doesn't render anything
};

export default MetaData;
