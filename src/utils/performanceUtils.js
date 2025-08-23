/**
 * Performance utilities for measuring and debugging component renders
 */

// Environment check to only enable logging in development
const isDev = process.env.NODE_ENV === 'development';

/**
 * Utility for logging component renders
 * @param {string} componentName - Name of the component
 * @param {Object} props - Component props
 * @param {Object} options - Additional options
 * @param {boolean} options.showProps - Whether to show props in the log
 * @param {boolean} options.showDeps - Whether to show dependencies in the log
 * @param {Array} options.deps - Dependencies to track
 */
export const logRender = (componentName, props = {}, options = {}) => {
  if (!isDev) return;
  
  // Check if performance logging is enabled via localStorage
  const isLoggingEnabled = localStorage.getItem('enableRenderLogging') === 'true';
  if (!isLoggingEnabled) return;

  const { showProps = false, showDeps = false, deps = [] } = options;
  
  console.group(`%c🔄 Render: ${componentName}`, 'color: #6200ee; font-weight: bold;');
  
  if (showProps) {
    console.log('%cProps:', 'color: #0288d1;', props);
  }
  
  if (showDeps && deps.length > 0) {
    console.log('%cDependencies:', 'color: #00796b;', deps);
  }
  
  console.groupEnd();
};

/**
 * HOC to wrap a component with render logging
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Logging options
 * @returns {React.Component} - Wrapped component with render logging
 */
export const withRenderLogging = (Component, options = {}) => {
  if (!isDev) return Component;
  
  const WrappedComponent = (props) => {
    logRender(Component.displayName || Component.name, props, options);
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithRenderLogging(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Performance measurement utility
 * @param {string} label - Label for the measurement
 * @param {Function} callback - Function to measure
 * @returns {*} - Result of the callback
 */
export const measurePerformance = (label, callback) => {
  if (!isDev) return callback();
  
  const isPerformanceMeasurementEnabled = 
    localStorage.getItem('enablePerformanceMeasurement') === 'true';
  
  if (!isPerformanceMeasurementEnabled) return callback();
  
  console.time(`⏱️ ${label}`);
  const result = callback();
  console.timeEnd(`⏱️ ${label}`);
  return result;
};

/**
 * Toggle performance logging in localStorage
 * @param {boolean} enable - Whether to enable logging
 */
export const toggleRenderLogging = (enable) => {
  if (enable) {
    localStorage.setItem('enableRenderLogging', 'true');
    console.log('%c🔄 Render logging enabled', 'color: #6200ee; font-weight: bold;');
  } else {
    localStorage.setItem('enableRenderLogging', 'false');
    console.log('%c🔄 Render logging disabled', 'color: #6200ee; font-weight: bold;');
  }
};

/**
 * Toggle performance measurement in localStorage
 * @param {boolean} enable - Whether to enable measurement
 */
export const togglePerformanceMeasurement = (enable) => {
  if (enable) {
    localStorage.setItem('enablePerformanceMeasurement', 'true');
    console.log('%c⏱️ Performance measurement enabled', 'color: #6200ee; font-weight: bold;');
  } else {
    localStorage.setItem('enablePerformanceMeasurement', 'false');
    console.log('%c⏱️ Performance measurement disabled', 'color: #6200ee; font-weight: bold;');
  }
};
