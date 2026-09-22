import { useState, useEffect, startTransition } from "react"
import { dummyCategories } from "@/constants/dummy-data"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input"

// TODO: Später Kategorien vom Go-Backend laden (GET /api/v1/categories)
// TODO: Später neue Kategorie im Go-Backend speichern (POST /api/v1/categories)

export type Category = {
  id: string
  name: string
}

type DropdownProps = {
  value?: string
  onChangeHandler?: (value: string) => void
}

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  // Hauptkategorien
  const [categories, setCategories] = useState<Category[]>(dummyCategories)
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    const createdCategory: Category = {
      id: Date.now().toString(),
      name: newCategory.trim()
    };

    // Temporär lokal hinzufügen (Später API-Call ans Go-Backend)
    setCategories((prevState) => [...prevState, createdCategory]);
    setNewCategory('');
  }

  useEffect(() => {
    // TODO: Später Kategorien per fetch/axios vom Go-Backend abrufen
  }, [])

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Kategorie auswählen" className="input-field"  />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 && categories.map((category) => (
          <SelectItem key={category.id} value={category.id} className="select-item">
            {category.name}
          </SelectItem>
        ))}

        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-lg py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">
            + Neue Kategorie hinzufügen
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Neue Kategorie erstellen</AlertDialogTitle>
              <AlertDialogDescription>
                Gib den Namen für die neue Kategorie ein:
                <Input 
                  type="text" 
                  placeholder="Kategoriename" 
                  className="input-field mt-3 text-grey-500" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)} 
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => startTransition(handleAddCategory)}>
                Hinzufügen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  )
}

export default Dropdown