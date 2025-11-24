export interface UsuarioPerfilDTO {
  uuid?: string;
  name: string;
  email: string;
  photo?: string;
  photoType?: string;
}

export interface UsuarioRequestDTO {
  name: string;
  email: string;
  pass: string;
}
