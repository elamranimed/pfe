import { NextResponse } from 'next/server'
import PaiementService from '../../../services/PaiementService'
import AuthService from '../../../services/AuthService'

export async function GET(request: Request) {
  try {
    const user = await AuthService.requireAuth(request, ['admin', 'responsable'])
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const items = await PaiementService.findAll()
    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await AuthService.requireAuth(request, ['admin'])
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    const item = await PaiementService.create(data)
    return NextResponse.json(item, { status: 201 })
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
    const updated = await PaiementService.update(Number(id), data)
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
    const deleted = await PaiementService.delete(Number(id))
    return NextResponse.json(deleted)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
