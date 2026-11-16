import { describe, it, expect } from 'vitest'

import {
  localizedPath,
  stripLanguagePrefix,
} from './languages'

import { localizeTo } from './navigation'

describe('Language navigation', () => {
  it('adds a language prefix to an existing route', () => {
    expect(
      localizedPath('/events/123', 'de'),
    ).toBe('/de/events/123')
  })

  it('replaces an existing language prefix', () => {
    expect(
      localizedPath('/de/events/123', 'en'),
    ).toBe('/en/events/123')
  })

  it('handles the application root', () => {
    expect(
      localizedPath('/', 'ru'),
    ).toBe('/ru/')
  })

  it('removes only a supported language prefix', () => {
    expect(
      stripLanguagePrefix('/de/events/123'),
    ).toBe('/events/123')

    expect(
      stripLanguagePrefix('/events/123'),
    ).toBe('/events/123')
  })

  it('preserves query parameters and hash', () => {
    expect(
      localizeTo(
        '/register?type=member#form',
        'en',
      ),
    ).toBe('/en/register?type=member#form')
  })

  it('localizes a URL object without losing search and hash', () => {
    expect(
      localizeTo(
        {
          pathname: '/events/123',
          search: '?query=workshop',
          hash: '#details',
        },
        'ru',
      ),
    ).toEqual({
      pathname: '/ru/events/123',
      search: '?query=workshop',
      hash: '#details',
    })
  })
})