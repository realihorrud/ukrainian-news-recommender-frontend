import { Show } from '@clerk/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Browse from './pages/Browse'
import Feed from './pages/Feed'
import Landing from './pages/Landing'
import Stats from './pages/Stats'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Navigate to="/" replace />
      </Show>
    </>
  )
}

function Home() {
  return (
    <>
      <Show when="signed-in">
        <Navigate to="/feed" replace />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
