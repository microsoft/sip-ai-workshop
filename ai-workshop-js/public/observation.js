/**
 * ObservationTracker - Records user interactions for AI analysis
 * This module helps AI understand how users interact with the visualization
 */
export class ObservationTracker {
    constructor() {
        this.observations = [];
        this.sessionStart = Date.now();
        this.actionCounts = {};
        
        console.log('[ObservationTracker] Initialized at', new Date().toISOString());
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Track window focus/blur
        window.addEventListener('focus', () => this.logAction('windowFocus'));
        window.addEventListener('blur', () => this.logAction('windowBlur'));
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            this.logAction('visibilityChange', { 
                hidden: document.hidden 
            });
        });
        
        // AI Enhancement Hook: Add more event listeners here
    }
    
    logAction(action, details = {}) {
        const observation = {
            action,
            timestamp: Date.now(),
            timeSinceStart: Date.now() - this.sessionStart,
            details,
            context: this.getContext()
        };
        
        this.observations.push(observation);
        
        // Update action counts
        this.actionCounts[action] = (this.actionCounts[action] || 0) + 1;
        
        // Log for debugging
        console.log(`[Observation] ${action}:`, details);
        
        // AI Enhancement Hook: Add real-time analysis here
        this.checkPatterns();
    }
    
    getContext() {
        return {
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
    
    checkPatterns() {
        // Check for rapid actions
        const recentActions = this.getRecentActions(5000); // Last 5 seconds
        if (recentActions.length > 10) {
            console.log('[AI Insight] High activity detected:', recentActions.length, 'actions in 5s');
        }
        
        // Check for repeated actions
        const lastAction = this.observations[this.observations.length - 1];
        const similarActions = this.observations.filter(
            obs => obs.action === lastAction.action && 
            obs.timestamp > Date.now() - 2000
        );
        
        if (similarActions.length > 3) {
            console.log('[AI Insight] Repeated action detected:', lastAction.action);
        }
        
        // AI Enhancement Hook: Add more pattern detection here
    }
    
    getRecentActions(timeWindow = 10000) {
        const cutoff = Date.now() - timeWindow;
        return this.observations.filter(obs => obs.timestamp > cutoff);
    }
    
    getSummary() {
        const sessionDuration = Date.now() - this.sessionStart;
        const summary = {
            sessionDuration: Math.round(sessionDuration / 1000) + 's',
            totalActions: this.observations.length,
            actionCounts: this.actionCounts,
            averageActionInterval: this.getAverageActionInterval(),
            mostFrequentAction: this.getMostFrequentAction(),
            interactionPatterns: this.getInteractionPatterns()
        };
        
        console.log('[ObservationTracker] Session Summary:', summary);
        return summary;
    }
    
    getAverageActionInterval() {
        if (this.observations.length < 2) return 0;
        
        let totalInterval = 0;
        for (let i = 1; i < this.observations.length; i++) {
            totalInterval += this.observations[i].timestamp - this.observations[i-1].timestamp;
        }
        
        return Math.round(totalInterval / (this.observations.length - 1));
    }
    
    getMostFrequentAction() {
        let maxCount = 0;
        let mostFrequent = null;
        
        for (const [action, count] of Object.entries(this.actionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequent = action;
            }
        }
        
        return { action: mostFrequent, count: maxCount };
    }
    
    getInteractionPatterns() {
        const patterns = {
            exploratoryUser: false,
            focusedUser: false,
            troubleshootingUser: false
        };
        
        // Exploratory user: many different actions
        if (Object.keys(this.actionCounts).length > 5) {
            patterns.exploratoryUser = true;
        }
        
        // Focused user: repeated similar actions
        const mostFrequent = this.getMostFrequentAction();
        if (mostFrequent.count > this.observations.length * 0.3) {
            patterns.focusedUser = true;
        }
        
        // Troubleshooting user: analyze, then quick re-analyze
        const analyzeActions = this.observations.filter(obs => obs.action === 'analyze');
        if (analyzeActions.length > 2) {
            const intervals = [];
            for (let i = 1; i < analyzeActions.length; i++) {
                intervals.push(analyzeActions[i].timestamp - analyzeActions[i-1].timestamp);
            }
            if (intervals.some(interval => interval < 5000)) {
                patterns.troubleshootingUser = true;
            }
        }
        
        return patterns;
    }
    
    // AI Enhancement Hook: Add methods for specific insights
    trackFeatureUsage(feature) {
        this.logAction('featureUsed', { feature });
    }
    
    trackError(error, context) {
        this.logAction('error', { 
            message: error.message, 
            stack: error.stack,
            context 
        });
    }
    
    exportObservations() {
        return {
            observations: this.observations,
            summary: this.getSummary(),
            exportTime: new Date().toISOString()
        };
    }
}

// AI Enhancement Hook: Add visualization-specific tracking
export function trackGraphInteraction(type, nodeData) {
    console.log(`[GraphInteraction] ${type}:`, nodeData);
}

// Make available globally for debugging
window.ObservationTracker = ObservationTracker;