#!/usr/bin/env tsx
/**
 * ai-tell-lint — flags the tells that make copy read as AI-written (Slice 5)
 *
 * Two classes:
 *   1. the em-dash (—) — AI overuses it; in human copy a comma/period/rephrase
 *      almost always reads better.
 *   2. AI-tell phrases — "delve", "in today's fast-paced", "seamless", "elevate
 *      your", "testament to", etc.
 *
 * Mechanical hygiene only — it can't make copy good, just less obviously generic.
 * Wire it on pre-commit (see tooling/hooks/pre-commit). Exits non-zero on a hit.
 *
 *   tsx tooling/ai-tell-lint.ts <files...>     # lint specific files
 *   tsx tooling/ai-tell-lint.ts                # lint staged files (git)
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

interface Rule {
  re: RegExp;
  label: string;
  hint: string;
}

const RULES: Rule[] = [
  { re: /—/g, label: 'em-dash (—)', hint: 'use a comma, period, or rephrase' },
  // high-signal AI-tell phrases (word-ish boundaries, case-insensitive)
  { re: /\bdelv(e|ing)\b/gi, label: '"delve"', hint: 'say "look at" / "go into"' },
  { re: /\bin today's (fast-paced|digital age|world)\b/gi, label: 'filler opener', hint: 'cut it; start with the point' },
  { re: /\b(ever-evolving|ever-changing)\b/gi, label: '"ever-evolving"', hint: 'be specific or cut' },
  { re: /\bit'?s worth noting\b/gi, label: '"it\'s worth noting"', hint: 'just note it' },
  { re: /\bin (conclusion|summary)\b/gi, label: 'wrap-up filler', hint: 'cut it' },
  { re: /\b(a )?testament to\b/gi, label: '"testament to"', hint: 'show, don\'t assert' },
  { re: /\b(rich )?tapestry\b/gi, label: '"tapestry"', hint: 'drop the metaphor' },
  { re: /\bnavigat(e|ing) the (complexities|landscape|world)\b/gi, label: '"navigating the…"', hint: 'be concrete' },
  { re: /\belevate your\b/gi, label: '"elevate your"', hint: 'say what it actually does' },
  { re: /\bunlock (the|your) (potential|power)\b/gi, label: '"unlock the potential"', hint: 'be specific' },
  { re: /\bunleash\b/gi, label: '"unleash"', hint: 'overused; rephrase' },
  { re: /\bin the (realm|world) of\b/gi, label: '"in the realm of"', hint: 'cut it' },
  { re: /\bseamless(ly)?\b/gi, label: '"seamless"', hint: 'overclaimed; cut or prove it' },
  { re: /\bcutting[- ]edge\b/gi, label: '"cutting-edge"', hint: 'name the actual capability' },
  { re: /\bstate[- ]of[- ]the[- ]art\b/gi, label: '"state-of-the-art"', hint: 'be specific' },
  { re: /\bgame[- ]changer\b/gi, label: '"game-changer"', hint: 'cut the hype' },
  { re: /\blook no further\b/gi, label: '"look no further"', hint: 'cut it' },
  { re: /\b(boasts|boasting)\b/gi, label: '"boasts"', hint: 'say "has" / "offers"' },
  { re: /\bembark on (a )?(journey)?\b/gi, label: '"embark on a journey"', hint: 'cut the cliché' },
  { re: /\bplethora\b/gi, label: '"plethora"', hint: 'say "many" / a number' },
  { re: /\bmyriad\b/gi, label: '"myriad"', hint: 'say "many" / a number' },
  { re: /\bnestled\b/gi, label: '"nestled"', hint: 'real-estate cliché; rephrase' },
  { re: /\btreasure trove\b/gi, label: '"treasure trove"', hint: 'drop it' },
  { re: /\bharness the power\b/gi, label: '"harness the power"', hint: 'say what it does' },
  { re: /\bwhen it comes to\b/gi, label: '"when it comes to"', hint: 'usually cuttable' },
];

interface Finding {
  file: string;
  line: number;
  col: number;
  label: string;
  hint: string;
  text: string;
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

/** Files where line comments, block comments, and JSDoc lines are code comments, not copy. */
const COMMENT_AWARE = /\.(tsx?|jsx?|css)$/i;

/**
 * Strip comment text from a line so the rules only see real content: JSX
 * text, string literals, CSS values. Tracks whether a multi-line block
 * comment (CSS header comments, JSDoc) is still open across calls. Returns
 * null for a line that's entirely comment. Deliberately simple (line-based,
 * not a parser) — mechanical hygiene only, matching this tool's own stated
 * scope. A trailing `//` preceded by an odd number of quote chars is assumed
 * to be inside a string, not a comment, and left alone.
 */
function stripComments(line: string, inBlockComment: boolean): [string | null, boolean] {
  let out = line;
  if (inBlockComment) {
    const end = out.indexOf('*/');
    if (end === -1) return [null, true]; // still inside the block, nothing to check
    out = out.slice(end + 2);
    inBlockComment = false;
  }
  out = out.replace(/\/\*.*?\*\//g, ''); // any complete single-line block comments
  const openIdx = out.indexOf('/*');
  if (openIdx !== -1) {
    out = out.slice(0, openIdx);
    inBlockComment = true; // an unterminated block comment starts here
  }
  const t = out.trim();
  if (t.startsWith('//') || t.startsWith('*') || t === '') return [inBlockComment ? '' : null, inBlockComment];
  const idx = out.indexOf('//');
  if (idx !== -1) {
    const before = out.slice(0, idx);
    const oddQuotes = [/'/g, /"/g, /`/g].some((re) => ((before.match(re) || []).length) % 2 === 1);
    if (!oddQuotes) out = out.slice(0, idx);
  }
  return [out, inBlockComment];
}

function lintFile(file: string): Finding[] {
  const findings: Finding[] = [];
  const commentAware = COMMENT_AWARE.test(file);
  const rawLines = readFileSync(file, 'utf8').split(/\r?\n/);
  let inBlockComment = false;
  rawLines.forEach((rawLine, i) => {
    let line: string | null = rawLine;
    if (commentAware) {
      [line, inBlockComment] = stripComments(rawLine, inBlockComment);
    }
    if (!line) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.re.exec(line)) !== null) {
        findings.push({
          file,
          line: i + 1,
          col: m.index + 1,
          label: rule.label,
          hint: rule.hint,
          text: line.trim().slice(0, 80),
        });
        if (!rule.re.global) break;
      }
    }
  });
  return findings;
}

function stagedFiles(): string[] {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

const TEXTY = /\.(tsx?|jsx?|mdx?|md|html?|json|txt|css)$/i;

/**
 * Internal method/process docs and automation scripts — never shipped as site
 * copy, so the AI-tell house style (which uses em-dashes deliberately,
 * throughout this codebase's own comments and docs) doesn't apply. Excluded
 * only from the automatic staged-commit lint; still lintable by passing the
 * path explicitly (`ai-tell-lint.ts docs/conventions.md`). Also covers this
 * file itself, which inherently contains its own pattern strings as literal
 * data and would otherwise always self-trip.
 */
const INTERNAL_DOC =
  /(^|\/)(docs\/|tooling\/|README\.md$|CLAUDE\.md$|CLAUDE\.md\.template$|BACKLOG\.md$|CHANGELOG\.md$|SETUP\.md$|\.claude\/|elements\/.*\.md$)/i;

function main() {
  let files = process.argv.slice(2);
  let fromStaged = false;
  if (files.length === 0) {
    files = stagedFiles();
    fromStaged = true;
    if (files.length === 0) {
      console.log(c.dim('ai-tell-lint: no files given and nothing staged — pass file paths to lint.'));
      return;
    }
  }

  const targets = files
    .filter((f) => existsSync(f) && statSync(f).isFile() && TEXTY.test(f))
    .filter((f) => !fromStaged || !INTERNAL_DOC.test(f));
  const findings = targets.flatMap(lintFile);

  if (findings.length === 0) {
    console.log(c.green(`✓ ai-tell-lint: clean (${targets.length} file${targets.length === 1 ? '' : 's'}${fromStaged ? ', staged' : ''})`));
    return;
  }

  for (const f of findings) {
    console.log(`${c.red(`${f.file}:${f.line}:${f.col}`)}  ${c.yellow(f.label)} ${c.dim('→ ' + f.hint)}`);
    console.log(c.dim(`    ${f.text}`));
  }
  console.log('');
  console.log(c.red(`✗ ${findings.length} AI-tell${findings.length === 1 ? '' : 's'} found — clean these before committing.`));
  process.exit(1);
}

main();
