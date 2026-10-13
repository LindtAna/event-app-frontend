import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { apiFetch } from '@/lib/api'
import type { Category } from '@/types'

const ALL_CATEGORIES_VALUE = 'All'

const CategoryFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState("")

    // Lädt alle verfügbaren Kategorien beim ersten Rendern vom Go-Backend
    useEffect(() => {
        let cancelled = false

        const fetchCategories = async () => {
            try {
                const data = await apiFetch<Category[]>('/categories')

                if (!cancelled) {
                    setCategories(data)
                    setLoadError('')
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Kategorien konnten nicht geladen werden.')
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }
        void fetchCategories()
        return () => {
            cancelled = true
        }
    }, [])

    // Aktuelle Kategorie aus den URL-Suchparametern abrufen
    const currentCategory = searchParams.get('category') || ''

    // Ältere URLs mit Kategorienamen auf die neue ID-basierte Auswahl umstellen
    useEffect(() => {
        if (!currentCategory || categories.length === 0) return

        const existsById = categories.some(
            (category) => category.id === currentCategory
        )

        if (existsById) return

        const matchingCategory = categories.find(
            (category) => category.name.toLowerCase() === currentCategory.toLowerCase()
        )
        if (!matchingCategory) return

        setSearchParams((prev) => {
            prev.set('category', matchingCategory.id)
            return prev
        }, { replace: true })
    }, [categories, currentCategory, setSearchParams])

    // Aktualisiert die URL-Parameter bei Auswahl einer Kategorie im Dropdown
    const onSelectCategory = (categoryId: string) => {
        setSearchParams((prev) => {
            if (categoryId && categoryId !== ALL_CATEGORIES_VALUE) {
                prev.set('category', categoryId)
                // Textsuche zurücksetzen(Filter ausschließen sich gegenseitig)
                prev.delete('query')
            } else {
                prev.delete('category')
            }
            return prev
        }, { replace: true })
    }

    return (
        <>
            <Select
                value={currentCategory || ALL_CATEGORIES_VALUE}
                onValueChange={onSelectCategory} >
                <div className="flex-center w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-primary-500/40">
                    <SelectTrigger className="select-field">
                        <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                </div>

                <SelectContent className="bg-white">
                    <SelectItem
                        value={ALL_CATEGORIES_VALUE}
                        className="select-item p-regular-14">
                        Alle Kategorien
                    </SelectItem>

                    {isLoading && (
                        <SelectItem value="__loading__" disabled>
                            Kategorien werden geladen...
                        </SelectItem>
                    )}

                    {categories.map((category) => (
                        <SelectItem
                            value={category.id}
                            key={category.id}
                            className="select-item p-regular-14"
                        >{category.name}
                        </SelectItem>))}
                </SelectContent>
            </Select>

            {/* Fehlermeldung, falls das Laden der Kategorien fehlgeschlagen ist */}
            {loadError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                    {loadError}
                </p>
            )}
        </>
    )
}

export default CategoryFilter