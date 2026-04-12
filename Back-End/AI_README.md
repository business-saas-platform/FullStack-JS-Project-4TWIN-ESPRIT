# 🧠 Module IA (Machine Learning) - Analyse des Risques Clients

Ce document présente l'architecture de notre modèle d'intelligence artificielle intégré nativement au sein de notre environnement **NestJS**.

## 🚀 1. Pourquoi TensorFlow.js ? (L'alternative au Python)
Historiquement, les modèles de Machine Learning exigent un écosystème Python complexe (fichiers `requirements.txt`, scripts `Flask/FastAPI`). 
Pour ce projet SaaS, nous avons pris l’excellente décision d'utiliser **TensorFlow.js (`@tensorflow/tfjs`)**, la librairie officielle de Google pour le JavaScript. 

Cette approche "Server-Side ML" permet de :
- Ne pas construire de second serveur (API unique).
- Avoir un modèle **100% natif Node.js**, entraîné et invoqué directement depuis le cœur de notre logique applicative NestJS.
- Gérer l'entraînement en mémoire directement sans DevOps complexe.

*Les "requirements" habituels de Python ont donc été remplacés de façon moderne avec notre gestionnaire NPM (`package.json > dependencies`).*

## 🧬 2. L'Architecture du Réseau de Neurones
Notre réseau (`ai.model.ts`) repose sur une architecture profonde séquentielle (`tf.sequential`) qui gère la prédiction via la résolution de régressions non linéaires :

- **Réseau (Deep Learning Layer)** :
  - **Couche d'entrée** (Input Shape) : Extraction de nos 3 caractéristiques (Features) financières essentielles de chaque client :
    1. Taux d'impayés (`unpaidRatio`).
    2. Taux de retard de paiement (`lateRatio`).
    3. Taux d'endettement d'affaire (`debtRatio`).
  - **Couche Cachée (Hidden Layer)** : Composée de `16 Unités` (neurones) employant la fonction d'activation **ReLu** (`Rectified Linear Unit`).
  - **Couche de Sortie (Output Layer)** : Employant la fonction d'activation **Sigmoïde**, garantissant que le réseau crachera obligatoirement une valeur encadrée entre `[0, 1]` afin de représenter notre "Score de Risque de Faillite/Défaut".

- **Compilation** :
  - L'Optimiseur `Adam` est sollicité avec un learning-rate ciblé pour empêcher un ajustement trop lent.
  - La fonction de perte est `Mean Squared Error` (MSE) combinée avec la métrique `Mean Absolute Error` (MAE).

## 🔄 3. L'Auto-Entraînement Dynamique (Training Loop)
Vu notre étape de développement (et l'absence momentanée d'une Data Warehouse historique massive de vrais comportements clients à risques), le backend intègre un algorithme de génération de données synthétiques financières (`generateSyntheticData()`).

**Fonctionnement de l'entrainement (On-the-fly) :**
A chaque démarrage du serveur NestJS (`OnModuleInit`), l'IA accomplit un effort d'entraînement local de quelques secondes (`Model.fit`):
1. Elle génère 1000 scénarios financiers client artificiels.
2. Elle exécute **50 Epochs (Générations)** intensives.
3. Le score "Loss" affiché sur la console indique son amélioration d'apprentissage progressive.

## 🤝 4. Explainable AI (XAI)
Pour l'aspect "Intelligence Fonctionnelle" UX/Dashboard pour nos utilisateurs :
- Une fois que TensorFlow a craché la probabilité brute `model.predictScore()` (le Score de Risque entre 0% et 100%), l'API réintègre un jugement sémantique humain (Déterminisme conditionnel : `LOW`, `MEDIUM`, `HIGH`) incluant une raison textuelle (_"Frequent late payments"_).
- Cette pratique appartient au domaine de la *"Explainable AI (IA Explicable)"* visant à vulgariser une décision purement mathématique (la boîte noire TensorFlow) en une recommandation claire et actionnable pour nos gestionnaires clients SaaS.
