import axiosInstance from '../axiosConfig';

class ServiceWorkflowEngine {
    constructor() {
        this.workflowSteps = {
            'pending': {
                order: 1,
                name: 'Pending',
                description: 'Service request received and pending review',
                nextSteps: ['in_progress', 'cancelled'],
                requiredFields: ['customerId', 'services']
            },
            'in_progress': {
                order: 2,
                name: 'In Progress',
                description: 'Service is being worked on',
                nextSteps: ['completed', 'on_hold', 'cancelled'],
                requiredFields: ['assignedTechnician']
            },
            'on_hold': {
                order: 3,
                name: 'On Hold',
                description: 'Service temporarily paused',
                nextSteps: ['in_progress', 'cancelled'],
                requiredFields: ['holdReason']
            },
            'completed': {
                order: 4,
                name: 'Completed',
                description: 'Service has been completed',
                nextSteps: [],
                requiredFields: ['completionNotes']
            },
            'cancelled': {
                order: 5,
                name: 'Cancelled',
                description: 'Service has been cancelled',
                nextSteps: [],
                requiredFields: ['cancellationReason']
            }
        };
    }

    // Get all available workflow steps
    getWorkflowSteps() {
        return this.workflowSteps;
    }

    // Get workflow step by status
    getWorkflowStep(status) {
        return this.workflowSteps[status] || null;
    }

    // Get next available steps from current status
    getNextSteps(currentStatus) {
        const step = this.getWorkflowStep(currentStatus);
        if (!step) return [];

        return step.nextSteps.map(nextStepId => ({
            id: nextStepId,
            ...this.workflowSteps[nextStepId]
        }));
    }

    // Validate if transition is allowed
    validateTransition(currentStatus, newStatus) {
        const currentStep = this.getWorkflowStep(currentStatus);
        if (!currentStep) return false;

        return currentStep.nextSteps.includes(newStatus);
    }

    // Progress a service request to next step
    async progressWorkflow(serviceRequestId, newStatus, additionalData = {}) {
        try {
            const response = await axiosInstance.patch(`/orders/${serviceRequestId}/status`, {
                status: newStatus,
                ...additionalData,
                updatedAt: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error progressing workflow:', error);
            throw new Error(error.response?.data?.message || 'Failed to update workflow status');
        }
    }

    // Get workflow history for a service request
    async getWorkflowHistory(serviceRequestId) {
        try {
            const response = await axiosInstance.get(`/orders/${serviceRequestId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching workflow history:', error);
            return [];
        }
    }
}

// Create a named instance
const serviceWorkflowEngine = new ServiceWorkflowEngine();

// Export the named instance
export default serviceWorkflowEngine;