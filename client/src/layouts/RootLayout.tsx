
import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"

export default function RootLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div
              className="flex h-full items-center justify-center"
              role="status"
              aria-live="polite"
            >
              Seite wird geladen...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
