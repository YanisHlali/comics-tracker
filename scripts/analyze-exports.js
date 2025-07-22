#!/usr/bin/env node

/**
 * Script pour analyser en détail les exports non utilisés
 * Usage: node scripts/analyze-exports.js
 */

const fs = require('fs');
const path = require('path');

// Charger le rapport
const reportPath = path.join(process.cwd(), 'cleanup-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('❌ Aucun rapport trouvé. Exécutez d\'abord: npm run cleanup:analyze');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Filtrer uniquement les exports non utilisés
const unusedExports = report.filter(item => item.type === 'export');

console.log(`📊 Analyse des ${unusedExports.length} exports non utilisés\n`);

// Grouper par fichier
const exportsByFile = {};
unusedExports.forEach(item => {
  if (!exportsByFile[item.file]) {
    exportsByFile[item.file] = [];
  }
  exportsByFile[item.file].push(item);
});

// Analyser par catégorie
const categories = {
  types: [],
  interfaces: [],
  functions: [],
  constants: [],
  classes: []
};

// Classer les exports
unusedExports.forEach(item => {
  const filePath = path.join(process.cwd(), item.file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const line = lines[item.line - 1] || '';
    
    if (line.includes('export type')) {
      categories.types.push(item);
    } else if (line.includes('export interface')) {
      categories.interfaces.push(item);
    } else if (line.includes('export function') || line.includes('export const') && line.includes('=>')) {
      categories.functions.push(item);
    } else if (line.includes('export const')) {
      categories.constants.push(item);
    } else if (line.includes('export class')) {
      categories.classes.push(item);
    }
  } catch (error) {
    // Ignorer les erreurs
  }
});

// Afficher le rapport par catégorie
console.log('📝 Répartition par catégorie:');
console.log('━'.repeat(50));
console.log(`Types non utilisés: ${categories.types.length}`);
console.log(`Interfaces non utilisées: ${categories.interfaces.length}`);
console.log(`Fonctions non utilisées: ${categories.functions.length}`);
console.log(`Constantes non utilisées: ${categories.constants.length}`);
console.log(`Classes non utilisées: ${categories.classes.length}`);

// Top des fichiers
console.log('\n🎯 Fichiers avec le plus d\'exports non utilisés:');
console.log('━'.repeat(50));
const sortedFiles = Object.entries(exportsByFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

sortedFiles.forEach(([file, exports]) => {
  console.log(`\n📄 ${file} (${exports.length} exports)`);
  exports.slice(0, 5).forEach(exp => {
    console.log(`   - ${exp.name} (ligne ${exp.line})`);
  });
  if (exports.length > 5) {
    console.log(`   ... et ${exports.length - 5} autres`);
  }
});

// Recommandations spécifiques
console.log('\n💡 Recommandations:');
console.log('━'.repeat(50));

// Pour types/index.ts
if (exportsByFile['src/types/index.ts']?.length > 20) {
  console.log('\n⚠️  src/types/index.ts contient beaucoup d\'exports non utilisés');
  console.log('   Recommandation: Séparer en plusieurs fichiers par domaine');
  console.log('   - types/components.ts (pour les props de composants)');
  console.log('   - types/api.ts (pour les types d\'API)');
  console.log('   - types/domain.ts (pour les entités métier)');
}

// Pour les interfaces de props
const propsInterfaces = categories.interfaces.filter(i => i.name.includes('Props'));
if (propsInterfaces.length > 0) {
  console.log('\n⚠️  Interfaces Props non utilisées détectées');
  console.log('   Ces interfaces peuvent être conservées si elles sont');
  console.log('   utilisées inline dans les composants (non détectées par l\'analyse)');
}

// Générer un fichier de suggestions
const suggestions = {
  safeToDelete: [],
  checkManually: [],
  keepForNow: []
};

unusedExports.forEach(item => {
  if (item.name.includes('Props') || item.name.includes('Type') || item.name.includes('Interface')) {
    suggestions.checkManually.push(item);
  } else if (categories.functions.includes(item) || categories.constants.includes(item)) {
    suggestions.safeToDelete.push(item);
  } else {
    suggestions.keepForNow.push(item);
  }
});

// Sauvegarder les suggestions
const suggestionsPath = path.join(process.cwd(), 'cleanup-suggestions.json');
fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

console.log('\n📋 Actions suggérées:');
console.log(`   - ${suggestions.safeToDelete.length} exports peuvent être supprimés en toute sécurité`);
console.log(`   - ${suggestions.checkManually.length} exports nécessitent une vérification manuelle`);
console.log(`   - ${suggestions.keepForNow.length} exports à conserver pour le moment`);
console.log('\n💾 Suggestions détaillées sauvegardées dans: cleanup-suggestions.json');