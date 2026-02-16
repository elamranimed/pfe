export enum TypeEnum {
	individuel = 'individuel',
	centre = 'centre',
}

export enum Statut {
	actif = 'actif',
	inactif = 'inactif',
}

export interface BureauProps {
	id_bureau?: number
	nom: string
	etage: number
	telephone?: string
	email?: string
	type: TypeEnum
	statut: Statut
	cotisation: number
}

export class Bureau {
	id_bureau?: number
	nom: string
	etage: number
	telephone?: string
	email?: string
	type: TypeEnum
	statut: Statut
	cotisation: number

	constructor(props: BureauProps) {
		this.id_bureau = props.id_bureau
		this.nom = props.nom
		this.etage = props.etage
		this.telephone = props.telephone
		this.email = props.email
		this.type = props.type
		this.statut = props.statut
		this.cotisation = props.cotisation
	}
}
