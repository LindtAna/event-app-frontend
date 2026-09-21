import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '../ui/input'

import search from '@/assets/icons/search.svg'

const Search = ({ placeholder = 'Event suchen...' }: { placeholder?: string }) => {
    const [searchParams, setSearchParams] = useSearchParams()


    const initialQuery = searchParams.get('query') || ''
    const [query, setQuery] = useState(initialQuery)

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {

            if (query) {
                searchParams.set('query', query)
            } else {
                searchParams.delete('query')
            }

            // die URL aktualisieren; `replace: true` ->den Browserverlauf nicht zuzumüllen
            setSearchParams(searchParams, { replace: true })
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