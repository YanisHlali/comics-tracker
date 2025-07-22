#!/usr/bin/env node

/**
 * Script de nettoyage pour identifier le code inutile
 * Usage: node scripts/cleanup.js analyze
 */

const fs = require('fs');
const path = require('path');

class CodeCleanupAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.unused = [];
  }

  async analyze() {
    console.log('🔍 Analyse du code inutile...\n');

    // 1. Identifier les imports non utilisés
    await this.findUnusedImports();

    // 2. Identifier les exports non utilisés
    await this.findUnusedExports();

    // 3. Identifier les hooks dupliqués
    await this.findDuplicateHooks();

    // 4. Identifier les composants non utilisés
    await this.findUnusedComponents();

    // 5. Identifier le code commenté
    await this.findCommentedCode();

    // 6. Générer le rapport
    this.generateReport();
  }

  // Fonction helper pour parcourir les fichiers
  async getFiles(pattern) {
    const files = [];
    const baseDir = pattern.split('*')[0];
    const extensions = pattern.includes('{') ? 
      pattern.match(/\{([^}]+)\}/)[1].split(',') : 
      [pattern.split('.').pop()];

    const walkDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walkDir(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(item).slice(1);
            if (extensions.includes(ext)) {
              files.push(path.relative(this.projectRoot, fullPath).replace(/\\/g, '/'));
            }
          }
        }
      } catch (error) {
        // Ignorer les erreurs d'accès
      }
    };

    const startDir = path.join(this.projectRoot, baseDir);
    if (fs.existsSync(startDir)) {
      walkDir(startDir);
    }
    
    return files;
  }

  async findUnusedImports() {
    const files = await this.getFiles('src/**/*.{ts,tsx}');
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Détection des imports
          const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from/);
          if (importMatch) {
            const imports = importMatch[1] ? 
              importMatch[1].split(',').map(i => i.trim()) : 
              [importMatch[2]];
            
            imports.forEach(imp => {
              if (imp) {
                const cleanName = imp.split(' as ')[0].trim();
                // Compter les utilisations (approximatif)
                const regex = new RegExp(`\\b${cleanName}\\b`, 'g');
                const matches = content.match(regex) || [];
                
                if (matches.length === 1) { // Seulement dans l'import
                  this.unused.push({
                    file,
                    line: index + 1,
                    type: 'import',
                    name: cleanName,
                    reason: 'Import non utilisé'
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }

  async findUnusedExports() {
    const exports = new Map();
    const imports = new Set();
    
    const files = await this.getFiles('src/**/*.{ts,tsx}');
    
    // Collecter tous les exports
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const exportMatch = line.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/);
          if (exportMatch) {
            exports.set(exportMatch[1], { file, line: index + 1 });
          }
        });
      } catch (error) {
        // Ignorer
      }
    }
    
    // Collecter tous les imports
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        
        // Imports nommés
        const namedImports = content.matchAll(/import\s+.*?{([^}]+)}.*?from/g);
        for (const match of namedImports) {
          const items = match[1].split(',').map(i => i.trim().split(' as ')[0]);
          items.forEach(item => imports.add(item));
        }
        
        // Imports par défaut
        const defaultImports = content.matchAll(/import\s+(\w+)\s+from/g);
        for (const match of defaultImports) {
          imports.add(match[1]);
        }
      } catch (error) {
        // Ignorer
      }
    }
    
    // Identifier les exports non importés
    exports.forEach((info, name) => {
      if (!imports.has(name) && 
          !name.endsWith('Page') && 
          !name.endsWith('Props') &&
          !name.startsWith('default')) {
        this.unused.push({
          file: info.file,
          line: info.line,
          type: 'export',
          name,
          reason: 'Export non utilisé dans le projet'
        });
      }
    });
  }

  async findDuplicateHooks() {
    const hooks = [];
    const files = await this.getFiles('src/hooks/*.{ts,tsx}');
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        const hookName = path.basename(file).replace(/\.(ts|tsx)$/, '');
        
        // Extraire les retours du hook
        const returnMatch = content.match(/return\s*{([^}]+)}/);
        const returns = returnMatch ? returnMatch[1].trim() : '';
        
        hooks.push({
          name: hookName,
          file,
          returns,
          content
        });
      } catch (error) {
        // Ignorer
      }
    }
    
    // Comparer les hooks pour trouver des similitudes
    for (let i = 0; i < hooks.length; i++) {
      for (let j = i + 1; j < hooks.length; j++) {
        const hook1 = hooks[i];
        const hook2 = hooks[j];
        
        // Vérifier si les retours sont similaires
        if (hook1.returns && hook2.returns) {
          const returns1 = hook1.returns.split(',').map(r => r.trim().split(':')[0]);
          const returns2 = hook2.returns.split(',').map(r => r.trim().split(':')[0]);
          
          const commonReturns = returns1.filter(r => returns2.includes(r));
          
          if (commonReturns.length > 2 && commonReturns.length >= returns1.length * 0.7) {
            this.unused.push({
              file: hook2.file,
              line: 1,
              type: 'hook',
              name: hook2.name,
              reason: `Similaire à ${hook1.name} (${commonReturns.length} retours communs)`
            });
          }
        }
      }
    }
  }

  async findUnusedComponents() {
    const components = new Map();
    const usages = new Set();
    
    const componentFiles = await this.getFiles('src/components/**/*.{tsx,jsx}');
    
    // Collecter tous les composants
    for (const file of componentFiles) {
      const componentName = path.basename(file).replace(/\.(tsx|jsx)$/, '');
      if (componentName !== 'index') {
        components.set(componentName, file);
      }
    }
    
    // Chercher les utilisations
    const allFiles = await this.getFiles('src/**/*.{ts,tsx,js,jsx}');
    
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        
        components.forEach((_, name) => {
          // Vérifier différents patterns d'utilisation
          if (content.includes(`<${name}`) || 
              content.includes(`${name}>`) || 
              content.includes(`import ${name}`) ||
              content.includes(`import { ${name}`) ||
              content.includes(`import { ${name},`) ||
              content.includes(`, ${name}`) ||
              content.includes(`, ${name},`) ||
              content.includes(`, ${name} }`) ||
              content.includes(`${name} from`)) {
            usages.add(name);
          }
        });
      } catch (error) {
        // Ignorer
      }
    }
    
    // Identifier les composants non utilisés
    components.forEach((file, name) => {
      if (!usages.has(name)) {
        this.unused.push({
          file,
          line: 1,
          type: 'component',
          name,
          reason: 'Composant non référencé dans le projet'
        });
      }
    });
  }

  async findCommentedCode() {
    const files = await this.getFiles('src/**/*.{ts,tsx,js,jsx}');
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf-8');
        const lines = content.split('\n');
        
        let inBlockComment = false;
        let blockStartLine = 0;
        let commentedLines = [];
        
        lines.forEach((line, index) => {
          // Début de commentaire multi-ligne
          if (line.includes('/*') && !line.includes('*/')) {
            inBlockComment = true;
            blockStartLine = index + 1;
            commentedLines = [line];
          } else if (inBlockComment) {
            commentedLines.push(line);
            
            // Fin de commentaire multi-ligne
            if (line.includes('*/')) {
              inBlockComment = false;
              
              const commentedCode = commentedLines.join('\n');
              if (this.looksLikeCode(commentedCode)) {
                this.unused.push({
                  file,
                  line: blockStartLine,
                  type: 'commented',
                  name: `Bloc (${commentedLines.length} lignes)`,
                  reason: 'Code commenté détecté'
                });
              }
            }
          } else if (line.trim().startsWith('//')) {
            // Commentaire sur une ligne
            const uncommented = line.replace(/^[\s]*\/\//, '');
            if (this.looksLikeCode(uncommented)) {
              this.unused.push({
                file,
                line: index + 1,
                type: 'commented',
                name: 'Ligne',
                reason: 'Code commenté détecté'
              });
            }
          }
        });
      } catch (error) {
        // Ignorer
      }
    }
  }

  looksLikeCode(text) {
    const codePatterns = [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /function\s+\w+/,
      /if\s*\(/,
      /for\s*\(/,
      /while\s*\(/,
      /return\s+/,
      /import\s+/,
      /export\s+/,
      /\.\w+\(/,
      /=>\s*{/,
      /catch\s*\(/,
      /try\s*{/,
      /class\s+\w+/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }

  generateReport() {
    console.log(`\n📊 Rapport d'analyse du code inutile`);
    console.log(`${'='.repeat(50)}\n`);
    
    const byType = {};
    this.unused.forEach(item => {
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type].push(item);
    });
    
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`\n${this.getTypeEmoji(type)} ${this.getTypeLabel(type)} (${items.length})`);
      console.log(`${'-'.repeat(40)}`);
      
      // Afficher jusqu'à 10 éléments
      items.slice(0, 10).forEach(item => {
        console.log(`  📄 ${item.file}:${item.line}`);
        console.log(`     ${item.name} - ${item.reason}`);
      });
      
      if (items.length > 10) {
        console.log(`  ... et ${items.length - 10} autres`);
      }
    });
    
    console.log(`\n\n📈 Résumé`);
    console.log(`${'-'.repeat(40)}`);
    console.log(`Total d'éléments inutiles: ${this.unused.length}`);
    console.log(`Fichiers impactés: ${new Set(this.unused.map(i => i.file)).size}`);
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.unused, null, 2));
    console.log(`\n💾 Rapport détaillé sauvegardé dans: cleanup-report.json`);
    
    // Top des fichiers à nettoyer
    const fileCount = {};
    this.unused.forEach(item => {
      fileCount[item.file] = (fileCount[item.file] || 0) + 1;
    });
    
    const topFiles = Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topFiles.length > 0) {
      console.log(`\n🎯 Top 5 des fichiers à nettoyer:`);
      console.log(`${'-'.repeat(40)}`);
      topFiles.forEach(([file, count]) => {
        console.log(`  ${file}: ${count} éléments`);
      });
    }
  }
  
  getTypeEmoji(type) {
    const emojis = {
      import: '📦',
      export: '📤',
      hook: '🪝',
      component: '🧩',
      commented: '💬'
    };
    return emojis[type] || '📄';
  }
  
  getTypeLabel(type) {
    const labels = {
      import: 'Imports non utilisés',
      export: 'Exports non utilisés',
      hook: 'Hooks potentiellement dupliqués',
      component: 'Composants non utilisés',
      commented: 'Code commenté'
    };
    return labels[type] || type;
  }
}

// Exécution
async function main() {
  const projectRoot = process.cwd();
  console.log(`📁 Analyse du projet: ${projectRoot}\n`);
  
  const analyzer = new CodeCleanupAnalyzer(projectRoot);
  
  try {
    await analyzer.analyze();
    console.log('\n✅ Analyse terminée avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur pendant l\'analyse:', error);
    process.exit(1);
  }
}

// Lancer l'analyse
if (require.main === module) {
  main();
}