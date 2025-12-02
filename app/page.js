'use client';

import { AppProvider } from '../context/AppContext.js';
import MainLayout from '../components/layout/MainLayout.js';

export default function Home() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
