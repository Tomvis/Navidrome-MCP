/**
 * Navidrome MCP Server - Tool allowlist (Tomvis fork)
 * Copyright (C) 2025
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/** Env-only, like the timeouts: a deployment knob, not a user setting. */
export const TOOL_ALLOWLIST_ENV = 'NAVIDROME_TOOL_ALLOWLIST';

/**
 * Tool names from `NAVIDROME_TOOL_ALLOWLIST` (comma-separated), or null when unset or blank,
 * which keeps every registered tool.
 */
export function readToolAllowlist(env: NodeJS.ProcessEnv = process.env): string[] | null {
  const raw = env[TOOL_ALLOWLIST_ENV];
  if (raw === undefined) return null;
  const names = raw.split(',').map((s) => s.trim()).filter((s) => s !== '');
  return names.length > 0 ? names : null;
}
