import { NextResponse } from 'next/server'
import UserService from '../../../services/UserService'
import AuthService from '../../../services/AuthService'

const safeUser = (user: any) => {
  const { password: _password, ...withoutPassword } = user
  return withoutPassword
}

export async function GET(request: Request) {
  try {
    const currentUser = await AuthService.requireAuth(request, ['admin'])
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const users = await UserService.findAll()
    return NextResponse.json(users.filter((user) => user.role === 'responsable').map(safeUser))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await AuthService.requireAuth(request, ['admin'])
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    if (!data.nom || !data.prenom || !data.email || !data.login || !data.password) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être renseignés' }, { status: 400 })
    }
    const newUser = await UserService.create({
      ...data,
      role: 'responsable',
      password: await AuthService.hashPassword(data.password),
    })
    return NextResponse.json(safeUser(newUser), { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await AuthService.requireAuth(request, ['admin'])
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, data } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const updateData = { ...data }
    if (!updateData.password) delete updateData.password
    else updateData.password = await AuthService.hashPassword(updateData.password)
    delete updateData.role
    const updated = await UserService.update(Number(id), updateData)
    return NextResponse.json(safeUser(updated))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await AuthService.requireAuth(request, ['admin'])
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const target = await UserService.findById(Number(id))
    if (!target || target.role !== 'responsable') {
      return NextResponse.json({ error: 'Responsable introuvable' }, { status: 404 })
    }
    const deleted = await UserService.delete(Number(id))
    return NextResponse.json(safeUser(deleted))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
