export interface Order {
  id: number;
  uuid: string;
  clientUUID: string;
  device: string;
  description: string;
  serviceUUIDs: string[];
  status: string;
  extras: number;
  discount: number;
  total: number;
}

export interface OrderRequestDTO {
  clientUUID: string;
  device: string;
  description: string;
  serviceUUIDs: string[];
  status: string;
  extras: number;
  discount: number;
}
