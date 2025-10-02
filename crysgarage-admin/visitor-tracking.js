// CrysGarage Visitor Tracking Script
// Add this script to your main website to track visitors

(function() {
    'use strict';
    
    // Configuration
    const TRACKING_ENDPOINT = 'https://crysgarage.studio/admin/api/v1/visitors/track';
    const SESSION_KEY = 'crysgarage_session';
    
    // Get or create session ID
    function getSessionId() {
        let sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    }
    
    // Track visitor
    function trackVisitor() {
        try {
            // Basic visitor information
            const visitorData = {
                session_id: getSessionId(),
                user_agent: navigator.userAgent,
                language: navigator.language,
                screen_resolution: screen.width + 'x' + screen.height,
                referrer: document.referrer,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
            };
            
            // Send tracking data
            fetch(TRACKING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(visitorData)
            }).catch(error => {
                console.log('Visitor tracking failed:', error);
            });
            
        } catch (error) {
            console.log('Visitor tracking error:', error);
        }
    }
    
    // Track page view
    function trackPageView() {
        trackVisitor();
    }
    
    // Track when user leaves
    function trackExit() {
        trackVisitor();
    }
    
    // Initialize tracking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            trackPageView();
        }
    });
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', trackExit);
    
    // Track clicks (optional - for engagement metrics)
    document.addEventListener('click', function(event) {
        // Only track significant clicks (not every single click)
        if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
            trackVisitor();
        }
    });
    
})();
