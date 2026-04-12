"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModel = void 0;
const common_1 = require("@nestjs/common");
const tf = require("@tensorflow/tfjs");
let AiModel = class AiModel {
    constructor() {
        this.logger = new common_1.Logger('NeuralNetwork');
        this.isTrained = false;
    }
    async onModuleInit() {
        this.logger.log('Initializing Deep Learning Model (TensorFlow)...');
        await this.initAndTrainModel();
    }
    async initAndTrainModel() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({
            inputShape: [3],
            units: 16,
            activation: 'relu',
        }));
        this.model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
        }));
        this.model.compile({
            optimizer: tf.train.adam(0.05),
            loss: 'meanSquaredError',
            metrics: ['mae'],
        });
        this.logger.log('Generating Synthetic Business Financial Dataset (1000 samples)...');
        const { inputs, labels } = this.generateSyntheticData(1000);
        const xs = tf.tensor2d(inputs);
        const ys = tf.tensor2d(labels, [labels.length, 1]);
        this.logger.log('Training Model. This will iterate over 50 Epochs...');
        await this.model.fit(xs, ys, {
            epochs: 50,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if ((epoch + 1) % 10 === 0) {
                        this.logger.log(`Epoch ${epoch + 1}/50 - Training Error (Loss): ${(logs?.loss || 0).toFixed(4)}`);
                    }
                }
            }
        });
        xs.dispose();
        ys.dispose();
        this.isTrained = true;
        this.logger.log('🚀 Training Complete! Artificial Intelligence is ready to predict client risk.');
    }
    async predictScore(unpaidRatio, lateRatio, debtRatio) {
        if (!this.isTrained) {
            this.logger.warn('Warning: Model is still training. Returning median score.');
            return 0.5;
        }
        const inputTensor = tf.tensor2d([[unpaidRatio, lateRatio, debtRatio]]);
        const predictionTensor = this.model.predict(inputTensor);
        const scoreData = await predictionTensor.data();
        inputTensor.dispose();
        predictionTensor.dispose();
        return scoreData[0];
    }
    generateSyntheticData(samples) {
        const inputs = [];
        const labels = [];
        for (let i = 0; i < samples; i++) {
            const unpaid = Math.random();
            const late = Math.random();
            const debt = Math.random();
            let rawScore = (0.5 * unpaid) + (0.3 * late) + (0.2 * debt);
            rawScore += (Math.random() - 0.5) * 0.1;
            const finalScore = Math.max(0, Math.min(1, rawScore));
            inputs.push([unpaid, late, debt]);
            labels.push(finalScore);
        }
        return { inputs, labels };
    }
};
exports.AiModel = AiModel;
exports.AiModel = AiModel = __decorate([
    (0, common_1.Injectable)()
], AiModel);
//# sourceMappingURL=ai.model.js.map