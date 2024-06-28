# Projet_9-Front-End-Billed

## Développement SaaS RH - Débuggage et Tests

## Authors

Jérémy LEMAIGNENT
https://jeremy.lemaignent.com/

## Description du Projet

Ce projet consite à débugger et à tester une application SaaS RH. Créer des tests unitaires et des tests d'intégration en JavaScript puis effectuer des tests end-to-end manuels.

La mission est de corriger les bugs d’un système RH et de finaliser les tests.

## Contexte

Vous êtes développeur front-end chez Billed, une entreprise produisant des solutions SaaS pour les équipes RH. Suite au départ de Garance, une collègue de la feature team “note de frais”, vous êtes désigné pour compléter et tester cette fonctionnalité clé avant son lancement imminent.

## Technologies

-   HTML5
-   CSS3
-   JavaScript
-   Jest

## Objectifs

-   **Écrire des tests unitaires avec JavaScript** : Assurez la validité et la fiabilité des différentes composantes de l'application.
-   **Rédiger un plan de test end-to-end manuel** : Garantir le bon fonctionnement du parcours employé de l'application.
-   **Écrire des tests d'intégration avec JavaScript** : Vérifiez l'interaction entre les différentes parties de l'application.
-   **Débugger une application web avec le Chrome Debugger** : Détectez et résolvez les problèmes de manière efficace.

## Instructions

1. **Installation** : Installez le back-end et le front-end depuis les repos spécifiés.
2. **Débogage** : Utilisez Chrome Debugger pour corriger les bugs identifiés.
3. **Tests Unitaires** : Rédigez et implémentez des tests unitaires en JavaScript.
4. **Tests d'Intégration** : Écrivez des tests d'intégration pour vérifier l'interaction des différentes parties.
5. **Plan de Test End-to-End** : Élaborer un plan de test manuel pour assurer le bon fonctionnement global.

## L'architecture du projet :

Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.

Le projet backend se trouve ici: https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

## Organiser son espace de travail :

Pour une bonne organization, vous pouvez créer un dossier bill-app dans lequel vous allez cloner le projet backend et par la suite, le projet frontend:

Clonez le projet backend dans le dossier bill-app :

```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

```
bill-app/
   - Billed-app-FR-Back
```

Clonez le projet frontend dans le dossier bill-app :

```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
```

```
bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## Comment lancer l'application en local ?

### étape 1 - Lancer le backend :

Suivez les indications dans le README du projet backend.

### étape 2 - Lancer le frontend :

Allez au repo cloné :

```
$ cd Billed-app-FR-Front
```

Installez les packages npm (décrits dans `package.json`) :

```
$ npm install
```

Installez live-server pour lancer un serveur local :

```
$ npm install -g live-server
```

Lancez l'application :

```
$ live-server
```

Puis allez à l'adresse : `http://127.0.0.1:8080/`

## Comment lancer tous les tests en local avec Jest ?

```
$  npm run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```
$  npm install -g jest
   yarn global add jest

$  npm i -g jest-cli
   yarn global add jest-cli

$  npx jest src/__tests__/Bills.test.js
$  npm run test
$  npm run coveragef

```

## Comment voir la couverture de test ?

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs :

Vous pouvez vous connecter en utilisant les comptes:

### administrateur :

```
utilisateur : admin@test.tld
mot de passe : admin
```

### employé :

```
utilisateur : employee@test.tld
mot de passe : employee
```
