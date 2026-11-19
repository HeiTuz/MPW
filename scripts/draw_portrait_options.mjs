#!/usr/bin/env node
// Internal authoring helper. Read one JSON request from stdin; emit choices only.
import { randomInt } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const axisName = /^[a-z][a-z0-9_-]*$/;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isAxisMap = value => isRecord(value) && Object.entries(value).every(([axis, text]) =>
  axisName.test(axis) && typeof text === 'string' && text.trim() !== '');

export function drawPortraitOptions(request, pickIndex = randomInt) {
  if (!isRecord(request)) throw new TypeError('request must be an object');
  const { axes, fixed = {}, options, count = 1 } = request;
  if (!Array.isArray(axes) || axes.length === 0 || new Set(axes).size !== axes.length ||
      !axes.every(axis => typeof axis === 'string' && axisName.test(axis))) {
    throw new TypeError('axes must be distinct non-empty axis names');
  }
  if (!isAxisMap(fixed)) throw new TypeError('fixed must map axis names to non-empty text');
  if (!Array.isArray(options)) throw new TypeError('options must be an array');
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('count must be a positive integer');

  const locked = axes.filter(axis => Object.hasOwn(fixed, axis));
  if (locked.length) return { status: 'locked_axes', axes: locked };

  const eligible = new Map();
  for (const option of options) {
    if (!isRecord(option)) throw new TypeError('each option must be an object');
    const { changes, requires = {} } = option;
    if (!isAxisMap(changes) || !isAxisMap(requires)) {
      throw new TypeError('changes and requires must map axis names to non-empty text');
    }
    if (Object.keys(changes).length !== axes.length || axes.some(axis => !Object.hasOwn(changes, axis))) continue;
    if (Object.entries(requires).some(([axis, text]) => !Object.hasOwn(fixed, axis) || fixed[axis] !== text)) continue;

    const values = axes.map(axis => changes[axis].trim());
    eligible.set(JSON.stringify(values), Object.fromEntries(axes.map((axis, index) => [axis, values[index]])));
  }

  const pool = [...eligible.values()];
  if (pool.length === 0) return { status: 'no_eligible_options', requested: count, available: 0 };
  if (count > pool.length) return { status: 'insufficient_options', requested: count, available: pool.length };

  const choices = [];
  for (let index = 0; index < count; index++) {
    const selected = pickIndex(pool.length);
    if (!Number.isInteger(selected) || selected < 0 || selected >= pool.length) {
      throw new RangeError('random index out of range');
    }
    choices.push(pool[selected]);
    pool[selected] = pool.at(-1);
    pool.pop();
  }
  return { status: 'selected', choices };
}

// Installs can sit behind symlinks; compare real paths so the CLI still runs.
function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) {
  try {
    const result = drawPortraitOptions(JSON.parse(readFileSync(0, 'utf8')));
    console.log(JSON.stringify(result));
    if (result.status !== 'selected') process.exitCode = 1;
  } catch (error) {
    console.error(`draw_portrait_options: ${error.message}`);
    process.exitCode = 2;
  }
}
