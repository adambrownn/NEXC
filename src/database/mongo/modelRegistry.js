const mongoose = require('mongoose');

// Model registry to prevent duplicate model registration
class ModelRegistry {
    constructor() {
        this.models = new Map();
        this.schemas = new Map();
        this.isInitialized = false;
    }

    /**
     * Register a schema before connection
     * @param {string} modelName - Name of the model
     * @param {mongoose.Schema} schema - Mongoose schema for the model
     */
    registerSchema(modelName, schema) {
        if (this.schemas.has(modelName)) {
            console.warn(`Schema ${modelName} is already registered`);
            return;
        }
        console.log(`[ModelRegistry] Registering schema for ${modelName}`);
        this.schemas.set(modelName, schema);
    }

    /**
     * Register a model directly
     * @param {string} modelName - Name of the model
     * @param {mongoose.Model} model - Mongoose model
     */
    registerModel(modelName, model) {
        if (this.models.has(modelName)) {
            console.warn(`Model ${modelName} is already registered`);
            return this.models.get(modelName);
        }
        console.log(`[ModelRegistry] Registering model ${modelName}`);
        this.models.set(modelName, model);
        return model;
    }

    /**
     * Get a registered model
     * @param {string} modelName - Name of the model to get
     * @returns {mongoose.Model} The mongoose model
     */
    getModel(modelName) {
        if (this.models.has(modelName)) {
            return this.models.get(modelName);
        }

        // If model doesn't exist but we have the schema, create it
        if (this.schemas.has(modelName)) {
            try {
                const model = mongoose.model(modelName, this.schemas.get(modelName));
                this.models.set(modelName, model);
                return model;
            } catch (error) {
                if (error.name === 'OverwriteModelError') {
                    // If model exists in mongoose but not in our registry
                    const model = mongoose.model(modelName);
                    this.models.set(modelName, model);
                    return model;
                }
                throw error;
            }
        }

        throw new Error(`Model ${modelName} not found in registry`);
    }

    /**
     * Initialize all registered schemas as models
     * Should be called after MongoDB connection is established
     */
    initializeModels() {
        if (this.isInitialized) {
            console.warn('[ModelRegistry] Models are already initialized');
            return;
        }

        if (mongoose.connection.readyState !== 1) {
            throw new Error('[ModelRegistry] Cannot initialize models: MongoDB is not connected');
        }

        console.log('[ModelRegistry] Initializing models...');
        this.schemas.forEach((schema, modelName) => {
            try {
                // Check if model already exists
                if (mongoose.models[modelName]) {
                    console.log(`[ModelRegistry] Model ${modelName} already exists`);
                    this.models.set(modelName, mongoose.models[modelName]);
                } else {
                    console.log(`[ModelRegistry] Creating model ${modelName}`);
                    const model = mongoose.model(modelName, schema);
                    this.models.set(modelName, model);
                }
            } catch (error) {
                console.error(`[ModelRegistry] Error creating model ${modelName}:`, error);
                if (error.name === 'OverwriteModelError') {
                    // If model exists in mongoose but not in our registry
                    this.models.set(modelName, mongoose.model(modelName));
                } else {
                    throw error;
                }
            }
        });

        this.isInitialized = true;
        console.log('[ModelRegistry] Models initialized successfully');
    }

    /**
     * Check if models are initialized
     * @returns {boolean}
     */
    areModelsInitialized() {
        return this.isInitialized;
    }
}

// Export a singleton instance
module.exports = new ModelRegistry();
