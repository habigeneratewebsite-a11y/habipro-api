export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Ini adalah "suntikan" CSS agar tampilan langsung rapi di HP */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50">{children}</body>
    </html>
  )
}
