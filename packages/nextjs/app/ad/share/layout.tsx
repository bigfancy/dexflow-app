export const metadata = {
  title: 'Advertisement',
  description: 'Advertisement Content',
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
