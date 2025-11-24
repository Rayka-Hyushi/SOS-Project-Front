export interface Service {
  uuid: number;
  service: string;
  description: string;
  value: number;
}

export interface ServiceRequestDTO {
  uuid?: string;
  service: string;
  description: string;
  value: number;
}
