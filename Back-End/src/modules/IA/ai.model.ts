import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
// Using pure JS tensorflow layer since tfjs-node C++ bindings are not needed for a lightweight backend.

@Injectable()
export class AiModel implements OnModuleInit {
  private readonly logger = new Logger('NeuralNetwork');
  private model!: tf.Sequential;
  private isTrained = false;

  async onModuleInit() {
    this.logger.log('Initializing Deep Learning Model (TensorFlow)...');
    await this.initAndTrainModel();
  }

  private async initAndTrainModel() {
    // 1. Build the Architecture
    this.model = tf.sequential();
    
    // Hidden Layer
    this.model.add(tf.layers.dense({
      inputShape: [3], // 3 inputs: [unpaidRatio, lateRatio, debtRatio]
      units: 16,
      activation: 'relu',
    }));
    
    // Output Layer
    this.model.add(tf.layers.dense({
      units: 1, // 1 output: [riskScore]
      activation: 'sigmoid', // Forces value between 0 and 1
    }));

    // Compiler
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

    // Train
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

  // Exposed prediction logic
  async predictScore(unpaidRatio: number, lateRatio: number, debtRatio: number): Promise<number> {
    if (!this.isTrained) {
      this.logger.warn('Warning: Model is still training. Returning median score.');
      return 0.5; // Neutral
    }

    // Convert input array to 2D Tensor
    const inputTensor = tf.tensor2d([[unpaidRatio, lateRatio, debtRatio]]);
    
    // Perform inference
    const predictionTensor = this.model.predict(inputTensor) as tf.Tensor;
    
    // Extract actual numeric array value
    const scoreData = await predictionTensor.data();
    
    // Cleanup memory
    inputTensor.dispose();
    predictionTensor.dispose();

    return scoreData[0];
  }

  // Synthetic Data generator pretending to be historical invoices
  private generateSyntheticData(samples: number) {
    const inputs: number[][] = [];
    const labels: number[] = [];

    for (let i = 0; i < samples; i++) {
        const unpaid = Math.random();
        const late = Math.random();
        const debt = Math.random();

        // Create a realistic target variable based on implicit business reality
        // A client with high unpaid and high debt should be closer to 1
        let rawScore = (0.5 * unpaid) + (0.3 * late) + (0.2 * debt);
        
        // Add artificial randomness so it's not a perfect linear regression
        rawScore += (Math.random() - 0.5) * 0.1;
        
        const finalScore = Math.max(0, Math.min(1, rawScore));

        inputs.push([unpaid, late, debt]);
        labels.push(finalScore);
    }

    return { inputs, labels };
  }
}
