
import { lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import { AuthProvider } from "./hooks/AuthProvider"

// Pages are loaded on demand when their routes are visited.
const Home = lazy(() => import("./pages/Home"))
const EventDetails = lazy(() => import("./pages/events/EventDetails"))
const CreateEvent = lazy(() => import("./pages/events/CreateEvent"))
const UpdateEvent = lazy(() => import("./pages/events/UpdateEvent"))
const Profile = lazy(() => import("./pages/profile/Profile"))
const UpdateProfile = lazy(() => import("./pages/profile/UpdateProfile"))
const Register = lazy(() => import("./pages/profile/Register"))
const InvitationPage = lazy(() => import("./pages/invitations/InvitationPage"))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/events/:id/update" element={<UpdateEvent />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/update" element={<UpdateProfile />} />
            <Route path="/invitations" element={<InvitationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
