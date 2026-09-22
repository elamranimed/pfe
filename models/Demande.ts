import { Objet } from './types'

export interface DemandeProps {
	id_demande?: number
	objet: Objet
	created_at?: Date
	created_by: string
	sujet?: string | null
	bureauId?: number | null
	userId?: number | null
}

export class Demande {
	id_demande?: number
	objet: Objet
	created_at: Date
	created_by: string
	sujet?: string | null
	bureauId?: number | null
	userId?: number | null

	constructor(props: DemandeProps) {
		this.id_demande = props.id_demande
		this.objet = props.objet
		this.created_at = props.created_at ?? new Date()
		this.created_by = props.created_by
		this.sujet = props.sujet ?? null
		this.bureauId = props.bureauId ?? null
		this.userId = props.userId ?? null
	}
}
