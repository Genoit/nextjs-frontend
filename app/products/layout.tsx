'use client';

import React from 'react';
import { AppShell } from '../../components/AppShell';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell active="/products">{children}</AppShell>;
}
