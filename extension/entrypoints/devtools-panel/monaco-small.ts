/**
 * Subset of the full monaco features/languages
 * to reduce bundle size
 *
 * Note:
 * list of all features can be found here:
 * node_modules/monaco-editor/esm/metadata.js
 */

// Core API without built-ins
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Only JSON is supported (plaintext is included by default)
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

// Subset of features ( see node_modules/monaco-editor/esm/metadata.js for full list)
import 'monaco-editor/esm/vs/editor/browser/coreCommands';
import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor';
import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations';
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations';
import 'monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization';
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter';
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions';
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu';

// plus the stylesheet
// import "monaco-editor/min/vs/editor/editor.main.css";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    return label === 'json' ? new jsonWorker() : new editorWorker();
    ``;
  },
};

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true, // still underline mistakes
  allowComments: false, // allow // and /* */ in JSON
  enableSchemaRequest: false, // ← key flag: never hit the network
  schemas: [], // you can push local schemas here later
});

export { monaco };
