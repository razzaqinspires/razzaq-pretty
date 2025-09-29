import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { stripCommentsSafe } from './stripper.js';

// KOREKSI: Ekstrak fungsi 'default' dari modul CommonJS
const traverse = _traverse.default;
const generate = _generate.default;

const QUOTE_TYPES = { SINGLE: '\'' };

const BUILT_IN_PLUGINS = {
  removeExtraBlankLines: {
    visitor: {
      Program(path) {
        // Logika yang lebih baik untuk menjaga satu baris kosong antar node tingkat atas
        path.get('body').forEach((statement, index) => {
          if (index > 0) {
            const prevStatement = path.get('body')[index - 1];
            if (statement.node.loc.start.line > prevStatement.node.loc.end.line + 2) {
              if(statement.node.leadingComments?.length) {
                statement.node.leadingComments[0].start = statement.node.start - (statement.node.loc.start.column + 2);
              } else {
                 // Heuristik untuk menarik node lebih dekat, menyisakan satu baris kosong
                 // Implementasi yang lebih kompleks diperlukan untuk kesempurnaan
              }
            }
          }
        });
      }
    }
  },
  disallowConsoleLog: { 
    visitor: { 
      CallExpression(path) { 
        if (path.get('callee').matchesPattern('console.log')) { 
          console.warn(`[Formatting Warning]: 'console.log' detected.`); 
        } 
      } 
    } 
  }
};

async function formatWithAST(src, opts, filename) {
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: true, sourceFilename: filename });
  const activePlugins = (opts.plugins || []).map(name => BUILT_IN_PLUGINS[name]).filter(Boolean);
  
  for (const plugin of activePlugins) {
    traverse(ast, plugin.visitor);
  }
  
  return generate(ast, { comments: true }).code;
}

export async function formatCode(src, options = {}, filename = 'unknown') {
  try {
    const prettier = await import('prettier');
    const pcfg = {
      parser: 'babel',
      tabWidth: options.indent,
      singleQuote: options.quote === QUOTE_TYPES.SINGLE,
      semi: options.semi,
      printWidth: options.lineWidth,
    };
    
    let sourceToProcess = options.stripComments ? stripCommentsSafe(src) : src;
    let formatted = await prettier.format(sourceToProcess, pcfg);
    // Jalur AST sekarang dinonaktifkan sementara hingga bug impor teratasi sepenuhnya
    // formatted = await formatWithAST(formatted, options, filename);

    if (options.watermark) {
      const wm = "// Formatted by Razzaq-Formatter ✨\n\n";
      if (!formatted.startsWith(wm.trim())) {
        formatted = wm + formatted;
      }
    }
    return formatted.trim() + '\n';
  } catch (e) {
    console.error(`[CRITICAL FORMATTING ERROR in ${filename}]: ${e.message}.`);
    return src;
  }
}
