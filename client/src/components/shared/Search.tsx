import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '../ui/input'

import search from '@/assets/icons/search.svg'

const Search = ({ placeholder = 'Event suchen...' }: { placeholder?: string }) => {
    const [searchParams, setSearchParams] = useSearchParams()


    const queryParam = searchParams.get('query') || ''
    const [query, setQuery] = useState(queryParam)

    //lokalen State des Eingabefelds mit der URL synchronisieren
    // Falls eine Kategorie auswählе wird, wird der Query-Parameter aus der URL entfernt
    useEffect(() => {
        setQuery(queryParam)
    }, [queryParam])

    useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchParams((prev) => {
        if (query === prev.get('query') || (!query && !prev.has('query'))) {
          return prev
        }
        if (query) {
          prev.set('query', query)
          // Gegenseitiger Ausschluss: beim Texteingeben den Kategorienfilter zurücksetzen
          prev.delete('category')
        } else {
          prev.delete('query')
        }
        return prev
      }, { replace: true })
    }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query, searchParams, setSearchParams])

    return (
        <div className="flex-center min-h-[54px] w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center px-4 py-2 border border-primary-500/40">
            <img
                src={search}
                alt="Search"
                width={24}
                height={24}
                className="mr-3"
            />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-3 p-regular-16 border-0 bg-primary-50 bg-dotted-pattern bg-cover bg-center outline-offset-0 placeholder:text-grey-500 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
    )
}

export default Search