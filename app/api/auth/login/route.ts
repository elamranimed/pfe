import { NextResponse } from 'next/server'
import AuthService from '../../../../services/AuthService'

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json()
    if (!login || !password) return NextResponse.json({ error: 'login & password required' }, { status: 400 })
    const result = await AuthService.login(login, password)
    if (!result) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const response = NextResponse.json(result)
    
    response.cookies.set('token', result.token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
