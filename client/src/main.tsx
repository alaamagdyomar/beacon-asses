import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainPage from './pages/MainPage'
import GamePage from './pages/GamePage'
import './app.css'

const router = createBrowserRouter([
  { path: '/', element: <MainPage /> },
  { path: '/game', element: <GamePage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
