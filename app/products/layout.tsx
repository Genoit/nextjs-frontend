'use client';

import React from 'react';
import { DashShell } from '../../components/dashboard/DashShell';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <DashShell>{children}</DashShell>;
}
