import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <html lang="tr">
      <head>
        <title>Admin Girişi — Venti-Ate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <LoginForm />
      </body>
    </html>
  )
}
