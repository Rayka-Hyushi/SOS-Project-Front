export interface Order {
  uuid: string;
  clientUUID: string;
  device: string;
  openDate: string;
  closeDate?: string;
  description: string;
  serviceUUIDs: string[];
  status: string;
  extras: number;
  discount: number;
  total: number;
}

export interface OrderRequestDTO {
  uuid?: string;
  clientUUID: string;
  device: string;
  description: string;
  serviceUUIDs: string[];
  status: string;
  extras: number;
  discount: number;
}
