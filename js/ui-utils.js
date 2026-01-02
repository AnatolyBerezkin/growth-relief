// ui-utils.js - UI utility functions

window.UIUtils = {
    // Show notification
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: notificationSlideIn 0.3s ease;
        `;
        
        // Add animation style
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes notificationFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'notificationFadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },
    
    // Show loading overlay
    showLoading: function(message = 'Processing...') {
        this.hideLoading();
        
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                ">
                    <div class="spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4a90e2;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <div style="color: #333; font-size: 16px;">${message}</div>
                </div>
            </div>
        `;
        
        // Add spinner animation style
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loading);
    },
    
    // Hide loading overlay
    hideLoading: function() {
        const loading = document.getElementById('loadingOverlay');
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    },
    
    // Get element value with fallback
    getElementValue: function(elementId, defaultValue = '') {
        const element = document.getElementById(elementId);
        return element ? element.value : defaultValue;
    },
    
    // Get element number value with fallback
    getElementNumberValue: function(elementId, defaultValue = 0) {
        const element = document.getElementById(elementId);
        return element ? Number(element.value) : defaultValue;
    },
    
    // Check if checkbox is checked
    isChecked: function(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        return checkbox ? checkbox.checked : false;
    },
    
    // Update button state
    updateButtonState: function(buttonId, enabled, text = null) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
            if (text !== null) {
                button.textContent = text;
            }
        }
    },
    
    // Toggle element visibility
    toggleElementVisibility: function(elementId, visible) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    },
    
    // Bind event handler with error handling
    bindEvent: function(elementId, eventType, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, handler);
            return true;
        }
        console.warn(`Element ${elementId} not found for event binding`);
        return false;
    }
};