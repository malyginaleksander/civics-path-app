import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.civicspath.app',
  appName: 'US Citizenship Test Prep',
  webDir: 'dist',
  server: {
    url: 'https://31ceac8a-28a1-47e4-921d-cc766db32df5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
