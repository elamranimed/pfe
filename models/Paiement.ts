export interface PaiementProps {
	id_paiement?: number
	montant: number
	date?: Date
	note?: string | null
	bureauId?: number | null
	userId?: number | null
}

export class Paiement {
	id_paiement?: number
	montant: number
	date: Date
	note?: string | null
	bureauId?: number | null
	userId?: number | null

	constructor(props: PaiementProps) {
		this.id_paiement = props.id_paiement
		this.montant = props.montant
		this.date = props.date ?? new Date()
		this.note = props.note ?? null
		this.bureauId = props.bureauId ?? null
		this.userId = props.userId ?? null
	}
}
