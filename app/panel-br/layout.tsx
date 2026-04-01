import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel',
  description: '',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
