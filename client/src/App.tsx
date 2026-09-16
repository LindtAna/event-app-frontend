import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import RootLayout from "./layouts/RootLayout"
import EventDetails from "./pages/events/EventDetails"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}