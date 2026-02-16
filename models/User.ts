export enum Role {
	admin = 'admin',
	responsable = 'responsable',
}

export interface UserProps {
	id_user?: number
	nom: string
	prenom: string
	role: Role
	email: string
	login: string
	password: string
}

export class User {
	id_user?: number
	nom: string
	prenom: string
	role: Role
	email: string
	login: string
	password: string

	constructor(props: UserProps) {
		this.id_user = props.id_user
		this.nom = props.nom
		this.prenom = props.prenom
		this.role = props.role
		this.email = props.email
		this.login = props.login
		this.password = props.password
	}

	// Domain actions (thin wrappers, implemented in services)
	envoyerDemande() {}
	consulter() {}
	ajouterBureaux() {}
	supprimerBureau() {}
	modifierBureau() {}
	ajouterPaiment() {}
	supprimerPaiment() {}
	modifierPaiment() {}
}
