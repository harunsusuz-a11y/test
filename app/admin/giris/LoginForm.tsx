'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, status')
      .eq('id', data.user.id)
      .single()

    if (!profile || !['admin','super_admin'].includes(profile.user_type) || profile.status !== 'active') {
      await supabase.auth.signOut()
      setError('Bu hesabın admin yetkisi yok.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div style={{
      width: 380, background: '#0f0f12', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: 'linear-gradient(135deg, #c8a26b 0%, #a07840 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#000',
          margin: '0 auto 12px',
          boxShadow: '0 0 0 1px rgba(200,162,107,0.3), 0 4px 16px rgba(200,162,107,0.2)',
        }}>V</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#f2f2f3' }}>Venti-Ate Admin</div>
        <div style={{ fontSize: 12, color: '#6b6b76', marginTop: 3 }}>Yönetim Paneli</div>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6b76', marginBottom: 5, letterSpacing: '0.02em' }}>E-POSTA</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@ventiateprotein.com"
            style={{
              width: '100%', background: '#151518', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 7, color: '#f2f2f3', fontFamily: 'Inter, sans-serif',
              fontSize: 13, padding: '9px 12px', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#c8a26b'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6b76', marginBottom: 5, letterSpacing: '0.02em' }}>ŞİFRE</label>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', background: '#151518', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 7, color: '#f2f2f3', fontFamily: 'Inter, sans-serif',
              fontSize: 13, padding: '9px 12px', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#c8a26b'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 7, padding: '9px 12px', marginBottom: 14,
            fontSize: 12, color: '#f87171',
          }}>{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', background: loading ? 'rgba(200,162,107,0.5)' : '#c8a26b',
            border: 'none', borderRadius: 7, color: '#000',
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            padding: '10px', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s', letterSpacing: '0.01em',
          }}
        >
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 11, color: '#44444d', textAlign: 'center' }}>
        Yalnızca yetkili kullanıcılar giriş yapabilir.
      </div>
    </div>
  )
}
