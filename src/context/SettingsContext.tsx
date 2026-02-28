import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  site_name: string;
  logo_url: string;
  footer_text: string;
}

const defaultSettings: Settings = {
  site_name: 'Khanza Repaint',
  logo_url: '',
  footer_text: "Premium automotive painting and detailing services. We bring your car's true colors back to life with precision and passion.",
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
