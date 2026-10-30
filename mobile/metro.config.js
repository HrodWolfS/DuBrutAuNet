// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Moteur de calcul partagé avec le site (../shared), hors du dossier mobile/
config.watchFolders = [path.resolve(__dirname, '../shared')];

module.exports = config;
