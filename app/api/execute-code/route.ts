import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { randomUUID } from 'crypto';export const maxDuration = 30;

interface TestCase {
  input: string;
  expectedOutput?: string;
  output?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string | null;
  error: string | null;
  time: number;
}

function safeStringify(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Normalize a value for comparison:
 * - trim whitespace
 * - strip surrounding quotes if present
 * - normalize JSON formatting
 */
function normalizeForComparison(val: string): string {
  let s = val.trim();
  // Remove surrounding double-quotes: "\"hello\"" -> hello
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    try {
      const parsed = JSON.parse(s);
      if (typeof parsed === 'string') {
        s = parsed;
      }
    } catch { /* keep as-is */ }
  }
  // Try to normalize JSON structures for consistent comparison
  try {
    const parsed = JSON.parse(s);
    s = JSON.stringify(parsed);
  } catch { /* not valid JSON, keep as-is */ }
  return s.trim();
}

function runTestCase(code: string, tc: TestCase): TestResult {
  const rawExpected = String(tc.expectedOutput ?? tc.output ?? '').trim();
  const inputStr = String(tc.input ?? '').trim();

  const start = Date.now();
  try {
    // Collect console.log output as a fallback for function detection
    const logs: string[] = [];
    const sandbox: Record<string, unknown> = {
      console: {
        log: (...args: unknown[]) => { logs.push(args.map(safeStringify).join(' ')); },
        error: () => {},
        warn: () => {},
      },
      Math, JSON, Array, Object, String, Number, Boolean, Set, Map,
      parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, undefined,
      setTimeout: () => {}, clearTimeout: () => {},
    };
    vm.createContext(sandbox);

    // Evaluate the user's code in the sandbox
    vm.runInContext(code, sandbox, { timeout: 5000 });

    // Find user-defined functions (exclude built-ins)
    const builtins = new Set([
      'console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'Set', 'Map', 'parseInt', 'parseFloat', 'isNaN',
      'isFinite', 'Infinity', 'NaN', 'undefined', 'setTimeout', 'clearTimeout',
    ]);
    const userFunctions = Object.keys(sandbox).filter(
      (k) => typeof sandbox[k] === 'function' && !builtins.has(k)
    );

    if (userFunctions.length === 0) {
      // If user just logged something, maybe they printed the answer
      if (logs.length > 0) {
        const actual = logs.join('\n').trim();
        const passed = normalizeForComparison(actual) === normalizeForComparison(rawExpected);
        return { passed, input: inputStr, expected: rawExpected, actual, error: null, time: Date.now() - start };
      }
      return {
        passed: false, input: inputStr, expected: rawExpected, actual: null,
        error: 'No function found in your code. Define a function like: function solution(nums) { ... }',
        time: Date.now() - start,
      };
    }

    // Prefer a function named "solution", "solve", "main", or the first found
    const fnName =
      userFunctions.find((n) => n === 'solution') ??
      userFunctions.find((n) => n === 'solve') ??
      userFunctions.find((n) => n === 'main') ??
      userFunctions[0];

    const fn = sandbox[fnName] as (...args: unknown[]) => unknown;

    // Parse the input into function arguments
    let args: unknown[];
    try {
      // If input looks like multiple args separated by newlines, parse each
      if (inputStr.includes('\n')) {
        args = inputStr.split('\n').map((line) => {
          const trimmed = line.trim();
          try { return JSON.parse(trimmed); } catch { return trimmed; }
        });
      } else {
        // Try parsing as JSON first
        try {
          const parsed = JSON.parse(inputStr);
          // If it's an array and the function seems to expect spread args, spread it
          // Otherwise pass the whole thing as one arg
          args = [parsed];
        } catch {
          // Try wrapping in brackets for comma-separated values
          try {
            const parsed = JSON.parse(`[${inputStr}]`);
            args = parsed;
          } catch {
            args = [inputStr];
          }
        }
      }
    } catch {
      args = [inputStr];
    }

    // Check if it's a class sequence like LRUCache
    const isClassSequence = Array.isArray(args[0]) && Array.isArray(args[1]) && 
                            args[0].length === args[1].length &&
                            typeof args[0][0] === 'string' &&
                            (typeof sandbox[args[0][0]] === 'function' || typeof sandbox[args[0][0]] === 'object');
    
    let resultVal: any;
    if (isClassSequence) {
        const commands = args[0] as string[];
        const params = args[1] as any[][];
        const classResults: any[] = [];
        let instance: any = null;

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const p = params[i];
            if (i === 0) {
                const cls = sandbox[cmd] as any;
                try { instance = new cls(...p); } catch { instance = cls(...p); }
                classResults.push(null);
            } else {
                const res = instance[cmd].apply(instance, p);
                classResults.push(res === undefined ? null : res);
            }
        }
        resultVal = classResults;
    } else {
        // Call the function
        const callSandbox: Record<string, unknown> = { ...sandbox, __args: args, __fn: fn, __result: undefined };
        vm.createContext(callSandbox);
        vm.runInContext('__result = __fn(...__args);', callSandbox, { timeout: 5000 });
        resultVal = callSandbox.__result;
    }

    const actual = safeStringify(resultVal).trim();

    // Flexible comparison: normalize both sides
    const normalizedActual = normalizeForComparison(actual);
    const normalizedExpected = normalizeForComparison(rawExpected);
    const passed = normalizedActual === normalizedExpected;

    return { passed, input: inputStr, expected: rawExpected, actual, error: null, time: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false, input: inputStr, expected: rawExpected, actual: null,
      error: msg.includes('timed out') ? 'Time Limit Exceeded (5s)' : msg,
      time: Date.now() - start,
    };
  }
}

function runPythonTestCase(code: string, tc: TestCase): TestResult {
  const rawExpected = String(tc.expectedOutput ?? tc.output ?? '').trim();
  const inputStr = String(tc.input ?? '').trim();
  const start = Date.now();

  const runnerCode = `
import sys, json, time
from typing import List, Dict, Optional, Tuple, Set, Any, Union
from collections import defaultdict, OrderedDict, Counter, deque

# User code
${code}

input_str = sys.argv[1]

try:
    args = json.loads(input_str)
    if isinstance(args, list) and len(args) == 2 and isinstance(args[0], list) and isinstance(args[1], list):
        commands, params = args
        if len(commands) > 0 and commands[0] in globals():
            cls = globals()[commands[0]]
            instance = None
            results = []
            for cmd, p in zip(commands, params):
                if not instance:
                    instance = cls(*p)
                    results.append(None)
                else:
                    method = getattr(instance, cmd)
                    res = method(*p)
                    results.append(res)
            print(json.dumps(results))
            sys.exit(0)
except Exception:
    pass

try:
    parsed_input = eval(input_str)
    if isinstance(parsed_input, tuple):
        args = list(parsed_input)
    else:
        args = [parsed_input]
except Exception:
    try:
        args = json.loads("[" + input_str + "]")
    except Exception:
        args = [input_str]

func = None
for name in ['solution', 'solve', 'main', 'twoSum', 'isPalindrome', 'lengthOfLongestSubstring', 'isValid', 'maxSubArray', 'merge']:
    if name in globals() and callable(globals()[name]):
        func = globals()[name]
        break

if not func and 'Solution' in globals():
    sol = globals()['Solution']()
    methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
    if methods:
        target_method = methods[0]
        for m in methods:
            if m in ['twoSum', 'isPalindrome', 'lengthOfLongestSubstring', 'isValid', 'maxSubArray', 'merge', 'solve']:
                target_method = m
                break
        res = getattr(sol, target_method)(*args)
        print(json.dumps(res))
        sys.exit(0)

if not func:
    _skip = {'json', 'sys', 'time', 'List', 'Dict', 'Optional', 'Tuple', 'Set', 'Any', 'Union',
             'defaultdict', 'OrderedDict', 'Counter', 'deque', 'list', 'dict', 'set', 'tuple',
             'int', 'str', 'float', 'bool', 'type', 'print', 'len', 'range', 'enumerate',
             'zip', 'map', 'filter', 'sorted', 'reversed', 'min', 'max', 'sum', 'abs', 'round',
             'isinstance', 'issubclass', 'hasattr', 'getattr', 'setattr', 'super', 'property',
             'staticmethod', 'classmethod', 'object', 'eval', 'exec', 'open', 'input', 'hash',
             'id', 'iter', 'next', 'repr', 'format', 'chr', 'ord', 'hex', 'oct', 'bin', 'pow',
             'divmod', 'all', 'any', 'callable', 'dir', 'vars', 'globals', 'locals', 'breakpoint',
             'Solution'}
    for k, v in list(globals().items()):
        if callable(v) and not k.startswith('_') and k not in _skip:
            func = v
            break

if func:
    res = func(*args)
    print(json.dumps(res))
else:
    print("Error: No function found", file=sys.stderr)
    sys.exit(1)
`;

  try {
    const tmpFile = path.join(os.tmpdir(), `runner_${randomUUID()}.py`);
    fs.writeFileSync(tmpFile, runnerCode);
    const output = execSync(`python "${tmpFile}" ${JSON.stringify(inputStr)}`, { encoding: 'utf-8', timeout: 5000 });
    try { fs.unlinkSync(tmpFile); } catch (e) {}
    
    const actual = output.trim();
    const passed = normalizeForComparison(actual) === normalizeForComparison(rawExpected);
    return { passed, input: inputStr, expected: rawExpected, actual, error: null, time: Date.now() - start };
  } catch (err: any) {
    let errorMsg = err.stderr ? err.stderr.toString() : err.message;
    if (errorMsg.includes('timed out') || err.code === 'ETIMEDOUT') {
        errorMsg = 'Time Limit Exceeded (5s)';
    }
    return {
      passed: false, input: inputStr, expected: rawExpected, actual: null,
      error: errorMsg,
      time: Date.now() - start,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases: rawTestCases } = body as {
      code: string;
      language: string;
      testCases: TestCase[];
    };

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    if (!rawTestCases || !Array.isArray(rawTestCases) || rawTestCases.length === 0) {
      return NextResponse.json({ error: 'testCases are required' }, { status: 400 });
    }

    if (language && !['javascript', 'typescript', 'js', 'ts', 'python', 'python3', 'py'].includes(language)) {
      return NextResponse.json(
        { error: `Language "${language}" is not supported for execution. Only JavaScript/TypeScript and Python are supported.` },
        { status: 400 }
      );
    }

    // Normalize test cases — handle all possible field names from DB
    const testCases: TestCase[] = rawTestCases.map((tc: any) => ({
      input: String(tc.input ?? ''),
      expectedOutput: String(tc.expectedOutput ?? tc.output ?? tc.expected ?? ''),
    }));

    console.log('[execute-code] Running', testCases.length, 'test cases');
    console.log('[execute-code] First test case:', JSON.stringify(testCases[0]));

    const isPython = ['python', 'python3', 'py'].includes(language || '');
    const results: TestResult[] = testCases.map((tc) => isPython ? runPythonTestCase(code, tc) : runTestCase(code, tc));

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);

    // Simple complexity heuristic based on code structure
    const nestedLoops = (code.match(/for\s*\(|while\s*\(/g) || []).length;
    let timeComplexity = 'O(n)';
    if (nestedLoops >= 3) timeComplexity = 'O(n³)';
    else if (nestedLoops === 2) timeComplexity = 'O(n²)';
    else if (code.includes('.sort(')) timeComplexity = 'O(n log n)';
    else if (nestedLoops === 0 && !code.includes('while')) timeComplexity = 'O(1)';

    const usesExtraSpace =
      code.includes('new Map') || code.includes('new Set') ||
      code.includes('new Array') || code.includes('{}') || code.includes('[]');
    const spaceComplexity = usesExtraSpace ? 'O(n)' : 'O(1)';

    console.log('[execute-code] Results:', passedCount, '/', totalCount, 'passed');

    return NextResponse.json({
      success: true,
      allPassed,
      passedCount,
      failedCount: totalCount - passedCount,
      totalCount,
      results,
      totalTime,
      timeComplexity,
      spaceComplexity,
    });
  } catch (err) {
    console.error('[execute-code] Fatal error:', err);
    return NextResponse.json(
      { error: 'Execution failed', message: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
