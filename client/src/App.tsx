import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import RootLayout from "./layouts/RootLayout"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}