export interface Cliente {
  uuid: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface ClienteRequestDTO {
  uuid?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}
