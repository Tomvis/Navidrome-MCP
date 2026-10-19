/**
 * Unit Tests for the NAVIDROME_TOOL_ALLOWLIST env (Tomvis fork)
 */

import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import type { NavidromeClient } from '../../../src/client/navidrome-client.js';
import type { Config } from '../../../src/config.js';
import { buildToolRegistry } from '../../../src/tools/handlers/registry.js';
import { readToolAllowlist, TOOL_ALLOWLIST_ENV } from '../../../src/config/tool-allowlist.js';
import { makeTestConfig } from '../../helpers/test-config.js';

describe('readToolAllowlist', () => {
  it('returns null when unset or blank', () => {
    expect(readToolAllowlist({})).toBeNull();
    expect(readToolAllowlist({ [TOOL_ALLOWLIST_ENV]: ' , ' })).toBeNull();
  });

  it('splits and trims a comma-separated list', () => {
    expect(readToolAllowlist({ [TOOL_ALLOWLIST_ENV]: ' search_all, get_album ,,set_rating' }))
      .toEqual(['search_all', 'get_album', 'set_rating']);
  });
});

describe('buildToolRegistry with an allowlist', () => {
  let client: NavidromeClient;
  let config: Config;

  beforeAll(async () => {
    config = makeTestConfig({
      features: { lastfm: false, radioBrowser: false, lyrics: false, playback: false },
    });
    const { createMockClient } = await import('../../factories/mock-client.js');
    client = createMockClient() as any;
  });

  afterEach(() => {
    delete process.env[TOOL_ALLOWLIST_ENV];
  });

  it('keeps every tool when the env is unset', () => {
    const all = buildToolRegistry(client, config).getAllTools();
    expect(all.length).toBeGreaterThan(30);
  });

  it('keeps only the listed tools, and calls to dropped tools are unknown', async () => {
    process.env[TOOL_ALLOWLIST_ENV] = 'search_all,set_rating';
    const registry = buildToolRegistry(client, config);
    expect(registry.getAllTools().map((t) => t.name).sort()).toEqual(['search_all', 'set_rating']);
    expect(registry.hasTool('delete_playlist')).toBe(false);
    await expect(registry.handleToolCall('delete_playlist', {})).rejects.toThrow();
  });

  it('throws on a name that is not registered', () => {
    // search_lyrics is LRCLIB-gated, so it is unregistered with lyrics off.
    process.env[TOOL_ALLOWLIST_ENV] = 'search_all,search_lyrics,no_such_tool';
    expect(() => buildToolRegistry(client, config)).toThrow(/search_lyrics, no_such_tool/);
  });
});
