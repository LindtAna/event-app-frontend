import { useSearchParams } from 'react-router-dom'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { dummyCategories } from '@/constants/dummy-data'

const CategoryFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // Aktuelle Kategorie aus der URL abrufen
    const currentCategory = searchParams.get('category') || ''

    const onSelectCategory = (category: string) => {
        setSearchParams((prev) => {
            if (category && category !== 'All') {
                prev.set('category', category)
                // Gegenseitiger Ausschluss: Bei Auswahl einer Kategorie wird die Textsuche geleert
                prev.delete('query')
            } else {
                prev.delete('category')
            }
            return prev
        }, { replace: true })
    }

    return (
        <Select value={currentCategory || undefined} onValueChange={onSelectCategory}>
            <div className="flex-center w-full overflow-hidden rounded-lg bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-primary-500/40">
                <SelectTrigger className="select-field">
                    <SelectValue placeholder="Kategorie wählen..." />
                </SelectTrigger>
            </div>
            <SelectContent className="bg-white">
                <SelectItem value="All" className="select-item p-regular-14">
                    Alle Kategorien
                </SelectItem>

                {dummyCategories.map((category) => (
                    <SelectItem
                        value={category.name}
                        key={category.id}
                        className="select-item p-regular-14"
                    >
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default CategoryFilter