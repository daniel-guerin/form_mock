import React from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow w-full">
        <RegistrationForm />
      </main>
      <footer className="bg-ga-dark text-gray-400 py-8 px-4 text-center text-sm mb-20 md:mb-0">
        <div className="max-w-3xl mx-auto">
          <p className="font-semibold text-white mb-2">Galvanizers Association</p>
          <p>CPD Certificate Registration Portal</p>
        </div>
      </footer>
    </div>
  );
}

export default App;