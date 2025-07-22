#!/usr/bin/env node

/**
 * Script pour nettoyer automatiquement les imports non utilisés
 * Usage: node scripts/clean-imports.js
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

// Filtrer uniquement les imports non utilisés
const unusedImports = report.filter(item => item.type === 'import');

console.log(`🧹 Nettoyage de ${unusedImports.length} imports non utilisés...\n`);

// Grouper par fichier
const importsByFile = {};
unusedImports.forEach(item => {
  if (!importsByFile[item.file]) {
    importsByFile[item.file] = [];
  }
  importsByFile[item.file].push(item);
});

// Nettoyer chaque fichier
Object.entries(importsByFile).forEach(([file, imports]) => {
  try {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Trier par ligne décroissante pour éviter les décalages
    imports.sort((a, b) => b.line - a.line);
    
    imports.forEach(item => {
      const lineIndex = item.line - 1;
      const line = lines[lineIndex];
      
      if (line) {
        // Cas 1: Import nommé dans des accolades
        if (line.includes('{') && line.includes('}')) {
          // Supprimer l'import spécifique
          let newLine = line;
          
          // Remplacer l'import avec gestion des virgules
          const beforeRegex = new RegExp(`${item.name}\\s*,\\s*`, 'g');
          const afterRegex = new RegExp(`,\\s*${item.name}`, 'g');
          const onlyRegex = new RegExp(`${item.name}`, 'g');
          
          if (beforeRegex.test(line)) {
            newLine = line.replace(beforeRegex, '');
          } else if (afterRegex.test(line)) {
            newLine = line.replace(afterRegex, '');
          } else {
            newLine = line.replace(onlyRegex, '');
          }
          
          // Nettoyer les espaces et virgules en trop
          newLine = newLine.replace(/{\s*,/, '{');
          newLine = newLine.replace(/,\s*}/, '}');
          newLine = newLine.replace(/{\s*}/, '{}');
          
          // Si l'import est vide, supprimer la ligne entière
          if (newLine.includes('import {} from') || newLine.includes('import{}from')) {
            lines.splice(lineIndex, 1);
            console.log(`  ✓ Supprimé ligne d'import vide dans ${file}:${item.line}`);
          } else {
            lines[lineIndex] = newLine;
            console.log(`  ✓ Supprimé '${item.name}' de ${file}:${item.line}`);
          }
        }
        // Cas 2: Import par défaut
        else if (line.includes(`import ${item.name} from`)) {
          lines.splice(lineIndex, 1);
          console.log(`  ✓ Supprimé import par défaut '${item.name}' dans ${file}:${item.line}`);
        }
      }
    });
    
    // Sauvegarder le fichier
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✅ ${file} nettoyé (${imports.length} imports supprimés)\n`);
    
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${file}:`, error.message);
  }
});

console.log('✨ Nettoyage des imports terminé !');

// Afficher les commandes recommandées
console.log('\n📝 Prochaines étapes recommandées:');
console.log('1. Vérifier les modifications: git diff');
console.log('2. Exécuter les tests: npm test');
console.log('3. Vérifier le build: npm run build');
console.log('4. Commiter les changements: git add -A && git commit -m "fix: remove unused imports"');