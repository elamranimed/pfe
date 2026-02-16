import { NextResponse } from 'next/server'
import UserService from '../../../services/UserService'
import AuthService from '../../../services/AuthService'

export async function GET(request: Request) {
  try {
    const currentUser = await AuthService.requireAuth(request, ['admin'])
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const users = await UserService.findAll()
    return NextResponse.json(users)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await AuthService.requireAuth(request, ['admin'])
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    const newUser = await UserService.create(data)
    return NextResponse.json(newUser, { status: 201 })
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
    const updated = await UserService.update(Number(id), data)
    return NextResponse.json(updated)
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
    const deleted = await UserService.delete(Number(id))
    return NextResponse.json(deleted)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
