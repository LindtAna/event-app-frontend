import { Outlet } from "react-router-dom"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"

export default function RootLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}