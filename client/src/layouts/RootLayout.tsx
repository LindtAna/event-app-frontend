
import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { useTranslation } from 'react-i18next'

import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"

export default function RootLayout() {

  const { t } = useTranslation('common')

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
              {t('page.loading')}
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
