import { useState, useEffect } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/types"

const NEW_CATEGORY_PREFIX = "new:"
const CREATE_CATEGORY_VALUE = "__create_category__"

type DropdownProps = {
  value?: string;
  token: string | null;
  onChangeHandler?: (value: string) => void
}

const Dropdown = ({ value, onChangeHandler, token }: DropdownProps) => {

  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [loadError, setLoadError] = useState("")

  // Steuerungs-States für unabhängige öffnen/schließen
  // von Select-Dropdown und Erstellungs-Dialog 
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Lädt beim Start alle Kategorien vom Go-Backend
  // Bewahrt temporäre Kategorien bei zeitgleichen Aktionen
  useEffect(() => {
  let cancelled = false;

  if (!token) {
    setCategories([]);
    setLoadError("");

    return () => {
      cancelled = true;
    };
  }

  const loadCategories = async () => {
    try {
      const data = await apiFetch<Category[]>("/categories", {
        token,
      });

      if (!cancelled) {
        setCategories((current) => {
          const temporaryCategories = current.filter((category) =>
            category.id.startsWith(NEW_CATEGORY_PREFIX)
          );

          const merged = [...data];

          for (const temporary of temporaryCategories) {
            const alreadyExists = merged.some(
              (category) =>
                category.name.toLowerCase() ===
                temporary.name.toLowerCase()
            );

            if (!alreadyExists) {
              merged.push(temporary);
            }
          }

          return merged;
        });

        setLoadError("");
      }
    } catch (error) {
      if (!cancelled) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Kategorien konnten nicht geladen werden."
        );
      }
    }
  };

  void loadCategories();

  return () => {
    cancelled = true;
  };
}, [token]);

// Fängt die Auswahl im Dropdown ab
// Öffnet den Dialog oder
// übergibt den Wert an React Hook Form
  const handleSelectValueChange = (nextValue: string) => {
    if (nextValue === CREATE_CATEGORY_VALUE) {
      // Zuerst das Select-Dropdown schließen
      // danach den Dialog für neue Kategorien öffnen
      setIsSelectOpen(false)
      setIsDialogOpen(true)
      return
    }
// Reguläre Kategorie ausgewählt
    onChangeHandler?.(nextValue)
  }

  // Erstellt eine temporäre Kategorie im Frontend
  //  Event geschpeichert => neue Kategorie wird ans Backend übertragen
  const handleAddCategory = () => {
    const name = newCategory.trim()

    if (!name) return

    // Prüfen, ob die Kategorie bereits existiert (Case-insensitive)
    const existingCategory = categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    )

    if (existingCategory) {
      onChangeHandler?.(existingCategory.id)
      setNewCategory("")
      setIsDialogOpen(false)
      return
    }
    // Temporäre ID mit Präfix generieren
    // damit das Backend erkennt, dass es eine neue Kategorie ist
    const temporaryId = `${NEW_CATEGORY_PREFIX}${name}`

    setCategories((current) => [
      ...current,
      {
        id: temporaryId,
        name,
      },
    ])

    // Aktualisiert das React-Hook-Form-Feld
    onChangeHandler?.(temporaryId)

    setNewCategory("")
    setIsDialogOpen(false)
  }


  return (
    <>
      <Select
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
        value={value ?? ""}
        onValueChange={handleSelectValueChange}
      >
        <SelectTrigger className="select-field w-full">
          <SelectValue placeholder="Kategorie auswählen" />
        </SelectTrigger>

        <SelectContent>
          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="select-item"
            >
              {category.name}
            </SelectItem>
          ))}

          <SelectSeparator />

          <SelectItem
            value={CREATE_CATEGORY_VALUE}
            className="cursor-pointer text-primary-500 focus:text-primary-500"
          >
            + Neue Kategorie erstellen
          </SelectItem>
        </SelectContent>
      </Select>

      {loadError && (
        <p className="text-sm text-red-600" role="alert">
          {loadError}
        </p>
      )}

{/* Dialogfenster zum Eingeben und Hinzufügen einer neuen Kategorie */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Neue Kategorie erstellen
            </AlertDialogTitle>

            <AlertDialogDescription>
              Gib den Namen für die neue Kategorie ein:
            </AlertDialogDescription>

            <Input
              type="text"
              placeholder="Kategoriename"
              aria-label="Kategoriename"
              className="input-field mt-3 text-grey-500"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              maxLength={100}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleAddCategory()
                }
              }}
            />
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewCategory("")}>
              Abbrechen
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                if (!newCategory.trim()) {
                  event.preventDefault()
                  return
                }

                handleAddCategory()
              }}
            >
              Hinzufügen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Dropdown