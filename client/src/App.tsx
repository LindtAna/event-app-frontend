import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import RootLayout from "./layouts/RootLayout"
import EventDetails from "./pages/events/EventDetails"
import CreateEvent from "./pages/events/CreateEvent"
import UpdateEvent from "./pages/events/UpdateEvent"
import Profile from "./pages/profile/Profile"
import UpdateProfile from "./pages/profile/UpdateProfile"


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/create" element={<CreateEvent/>} />
        <Route path="/events/:id/update" element={<UpdateEvent/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/update" element={<UpdateProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}