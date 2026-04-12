import * as tf from "@tensorflow/tfjs";

export class AiModel {
  private model!: tf.Sequential;

  async init() {
    this.model = tf.sequential();

    this.model.add(
      tf.layers.dense({ units: 8, activation: "relu", inputShape: [4] })
    );

    this.model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    this.model.compile({
      optimizer: "adam",
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    // 🎯 TRAINING DATA (fake but realistic)
    const xs = tf.tensor2d([
      [1, 0, 0.1, 100],
      [5, 2, 0.5, 500],
      [10, 5, 0.8, 1500],
      [3, 0, 0.2, 200],
      [8, 4, 0.7, 1200],
    ]);

    const ys = tf.tensor2d([
      [0],
      [0],
      [1],
      [0],
      [1],
    ]);

    await this.model.fit(xs, ys, {
      epochs: 100,
    });
  }

  predict(features: number[]) {
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    return prediction.dataSync()[0];
  }
}