export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cluster: string;
}

export type RideStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PoolStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'TESLAPAY';

export interface RideRequest {
  id: string;
  passengerId: string;
  poolId: string | null;
  pickupZoneId: string;
  destinationZoneId: string;
  seatsRequested: number;
  status: RideStatus;
  straightLineMeters: number;
  roadDistanceMeters: number;
  estimatedFarePoysha: number;
  finalFarePoysha: number | null;
  paymentMethod: PaymentMethod;
  requestedAt: string;
  matchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  pickupZone?: { id: string; name: string; cluster?: string };
  destinationZone?: { id: string; name: string; cluster?: string };
}

export interface Pool {
  id: string;
  teslaId: string;
  status: PoolStatus;
  seatsOccupied: number;
  version: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ActivePoolPassenger {
  rideRequestId: string;
  passengerId: string;
  passengerName: string;
  passengerEmail?: string;
  seats: number;
  status: RideStatus;
  pickupZone: { id: string; name: string; cluster: string };
  destinationZone: { id: string; name: string; cluster: string };
  estimatedFarePoysha: number;      // original (no discount)
  perSeatFarePoysha: number;        // per-seat base fare
  subtotalPoysha: number;           // per-seat × seats
  discountPoysha: number;           // 20% of subtotal if pooled
  projectedFarePoysha: number;      // subtotal − discount
}

export interface ActivePool {
  id: string;
  status: PoolStatus;
  seatsOccupied: number;
  capacity: number;
  version: number;
  isPooled: boolean;
  discountPercent: number;
  projectedTotalPoysha: number;
  startedAt: string | null;
  completedAt: string | null;
  passengers: ActivePoolPassenger[];
}

export interface DriverRequestItem {
  id: string;
  passenger: { id: string; name: string };
  pickupZone: { id: string; name: string; cluster: string };
  destinationZone: { id: string; name: string; cluster: string };
  seatsRequested: number;
  roadDistanceMeters: number;
  estimatedFarePoysha: number;
  status: RideStatus;
  requestedAt: string;
  canJoinActivePool: boolean;
  activePoolId: string | null;
}

export interface DriverRequestsResponse {
  tesla: { id: string; label: string; capacity: number; isOnline: boolean };
  activePoolId: string | null;
  seatsOccupied: number;
  requests: DriverRequestItem[];
}

export interface RideTimelineEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: { id: string; name: string; role: string };
  changedAt: string;
}

export interface RideHistory {
  rideRequestId: string;
  currentStatus: RideStatus;
  pickupZone: string;
  destinationZone: string;
  seatsRequested: number;
  roadDistanceMeters: number;
  estimatedFarePoysha: number;
  finalFarePoysha: number | null;
  requestedAt: string;
  matchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  timeline: RideTimelineEntry[];
}