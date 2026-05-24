import './globals.css';

export const metadata = {
  title: 'Despensa San Ignacio — Creador de Publicaciones',
  description: 'Generador de publicaciones para redes sociales de Despensa San Ignacio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
