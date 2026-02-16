import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import UserService from './UserService'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export const AuthService = {
  hashPassword: async (password: string) => {
    return bcrypt.hash(password, 10)
  },

  comparePassword: async (password: string, hash: string) => {
    return bcrypt.compare(password, hash)
  },

  generateToken: (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  },

  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return null
    }
  },

  login: async (login: string, password: string) => {
    const user = await UserService.findByLogin(login)
    if (!user) return null
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return null
    const token = AuthService.generateToken({ id_user: user.id_user, role: user.role })
    // remove password before returning
    const { password: _pw, ...safe } = user as any
    return { token, user: safe }
  },

  requireAuth: async (request: Request, roles?: string[]) => {
    // Prefer secure cookie, fallback to Authorization header for API clients
    const cookieHeader = request.headers.get('cookie') || ''
    const tokenFromCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('token='))
      ?.split('=')[1]

    const authHeader = request.headers.get('authorization') || ''
    const tokenHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token = tokenFromCookie || tokenHeader

    if (!token) return null
    const payload = AuthService.verifyToken(token)
    if (!payload || typeof payload === 'string') return null
    const user = await UserService.findById((payload as any).id_user)
    if (!user) return null
    if (roles && roles.length && !roles.includes(user.role)) return null
    return user
  },
}

export default AuthService
