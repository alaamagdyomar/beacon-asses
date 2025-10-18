import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import MainPage from '@features/MainPage';
import GamePage from '@features/GamePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/game', element: <GamePage /> },
    ],
  },
]);
