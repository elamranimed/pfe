export enum Objet {
  creation = 'creation',
  reclamation = 'reclamation',
}

export enum TypeEnum {
  individuel = 'individuel',
  centre = 'centre',
}

export enum Statut {
  actif = 'actif',
  inactif = 'inactif',
}

export enum Role {
  admin = 'admin',
  responsable = 'responsable',
}

export type DateString = string | Date
