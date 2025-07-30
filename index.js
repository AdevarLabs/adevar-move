#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

function findMoveFiles(dir) {
  const moveFiles = [];
  
  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.move')) {
        moveFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return moveFiles;
}

function countLinesOfCode(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let totalLines = 0;
  let inBlockComment = false;
  let testsStarted = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') continue;
    
    // Check if we've hit the first test section - exclude everything after this point
    if (!testsStarted && line.includes('#[test]')) {
      testsStarted = true;
      continue;
    }
    
    // For test_only, check if it's followed by a function (not an import)
    if (!testsStarted && line.includes('#[test_only]')) {
      // Look ahead to see what follows
      let nextNonEmptyLine = '';
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine !== '' && !nextLine.startsWith('//') && !nextLine.includes('#[')) {
          nextNonEmptyLine = nextLine;
          break;
        }
      }
      
      // If it's followed by a function (not a use statement), start excluding
      if (!nextNonEmptyLine.startsWith('use ')) {
        testsStarted = true;
        continue;
      }
    }
    
    // If tests have started, skip all remaining lines
    if (testsStarted) continue;
    
    // Handle block comments
    if (line.includes('/*')) {
      inBlockComment = true;
      line = line.substring(0, line.indexOf('/*'));
    }
    
    if (inBlockComment) {
      if (line.includes('*/')) {
        inBlockComment = false;
        line = line.substring(line.indexOf('*/') + 2);
      } else {
        continue;
      }
    }
    
    // Skip single line comments
    if (line.startsWith('//')) continue;
    
    // If we get here, it's a valid line of code
    if (line !== '') {
      totalLines++;
    }
  }
  
  return totalLines;
}

function analyzeProject(targetPath) {
  const moveFiles = findMoveFiles(targetPath);
  
  if (moveFiles.length === 0) {
    console.log('No Move files found in the specified directory.');
    return;
  }
  
  let totalLOC = 0;
  const fileStats = [];
  
  for (const file of moveFiles) {
    const loc = countLinesOfCode(file);
    const relativePath = path.relative(targetPath, file);
    
    fileStats.push({ path: relativePath, loc });
    totalLOC += loc;
  }
  
  console.log('\n📊 Move Project Audit Scope Analysis\n');
  
  // Table header
  console.log('┌─────────────────────────────────────────────────────────────────────┬─────────────┐');
  console.log('│ File                                                                    │ Lines of Code │');
  console.log('├─────────────────────────────────────────────────────────────────────┼─────────────┤');
  
  // File rows
  for (const file of fileStats) {
    const fileName = file.path.length > 67 ? '...' + file.path.slice(-64) : file.path;
    console.log(`│ ${fileName.padEnd(67)} │ ${file.loc.toString().padStart(11)} │`);
  }
  
  // Table footer with total
  console.log('├─────────────────────────────────────────────────────────────────────┼─────────────┤');
  console.log(`│ ${'TOTAL'.padEnd(67)} │ ${totalLOC.toString().padStart(11)} │`);
  console.log('└─────────────────────────────────────────────────────────────────────┴─────────────┘');
  
  console.log(`\nSummary: ${moveFiles.length} files, ${totalLOC} total lines of code`);
  
  return { files: fileStats, totalLOC, totalFiles: moveFiles.length };
}

program
  .name('adevar-move')
  .description('CLI tool to scope Move projects for auditing')
  .argument('[path]', 'path to analyze (defaults to current directory)', '.')
  .action((targetPath) => {
    const resolvedPath = path.resolve(targetPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: Path "${targetPath}" does not exist.`);
      process.exit(1);
    }
    
    if (!fs.statSync(resolvedPath).isDirectory()) {
      console.error(`Error: Path "${targetPath}" is not a directory.`);
      process.exit(1);
    }
    
    analyzeProject(resolvedPath);
  });

program.parse();