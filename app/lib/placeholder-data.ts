import type { Shipment, Tracking } from "./definitions"
import { TimelineStatuses } from "./definitions"

const SHIPMENTS: Shipment[] = [
    {
        id: 'SHIPAA001',
        origin: 'CABA, Buenos Aires, Argentina',
        destination: 'Zelarrayán 233, Bahía Blanca, Buenos Aires, Argentina',
        originDatetime: new Date('2024-01-01T10:00:00Z'),
        destinationDatetime: new Date('2024-01-02T18:00:00Z'),
        sellerId: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
        buyerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
    },
    {
        id: 'SHIPAA002',
        origin: 'Rosario, Santa Fe, Argentina',
        destination: 'CABA, Buenos Aires, Argentina',
        originDatetime: new Date('2024-01-01T10:00:00Z'),
        destinationDatetime: new Date('2024-01-02T18:00:00Z'),
        sellerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyerId: 'user_3DdtO3tGpGtvz1VoG5rJbLAWPAG',
    },
    {
        id: 'SHIPAA003',
        origin: 'Avenida Colón 80, Bahía Blanca, Buenos Aires, Argentina',
        destination: 'Dr. Arturo Sampay 1030, Bahía Blanca, Buenos Aires, Argentina',
        originDatetime: new Date('2024-01-01T10:00:00Z'),
        destinationDatetime: new Date('2024-01-02T18:00:00Z'),
        sellerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyerId: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
    }
]

const SHIPMENT_TRACKINGS: Tracking[] = [
    // SHIPAA001 - En tránsito
    {
        shipmentId: 'SHIPAA001',
        status: TimelineStatuses.CONFIRMED,
        datetime: new Date('2024-01-01T10:00:00Z'),
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
        completed: true,
        current: false        
    },
    {
        shipmentId: 'SHIPAA001',
        status: TimelineStatuses.PREPARING,
        datetime: new Date('2024-01-01T14:15:00Z'),
        currentCity: 'Centro de Distribución - Palermo',
        nextCity: 'Centro de Distribución - Palermo',
        completed: true,
        current: false 
        
    },
    {
        shipmentId: 'SHIPAA001',
        status: TimelineStatuses.IN_TRANSIT,
        datetime: new Date('2024-01-02T08:45:00Z'),
        currentCity: 'Centro Logístico - Bahía Blanca',
        nextCity: 'Tu zona',
        completed: true,
        current: false 
        
    },
    {
        shipmentId: 'SHIPAA001',
        status: TimelineStatuses.OUT_FOR_DELIVERY,
        datetime: new Date('2024-01-02T11:10:00Z'),
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Domicilio de entrega',
        completed: false,
        current: true 
        
    },
    // SHIPAA002 - Entregado
    {
        shipmentId: 'SHIPAA002',
        status: TimelineStatuses.CONFIRMED,
        datetime: new Date('2023-12-25T09:30:00Z'),
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
        completed: true,
        current: false        
    },
    {
        shipmentId: 'SHIPAA002',
        status: TimelineStatuses.PREPARING,
        datetime: new Date('2023-12-25T13:00:00Z'),
        currentCity: 'Centro de Distribución - Rosario',
        nextCity: 'Centro de Distribución - Rosario',
        completed: true,
        current: false 
        
    },
    {
        shipmentId: 'SHIPAA002',
        status: TimelineStatuses.OUT_FOR_DELIVERY,
        datetime: new Date('2023-12-26T07:30:00Z'),
        currentCity: 'Centro Logístico - CABA',
        nextCity: 'Tu zona',
        completed: true,
        current: false 
    },
    {
        shipmentId: 'SHIPAA002',
        status: TimelineStatuses.DELIVERED,
        datetime: new Date('2023-12-26T14:20:00Z'),
        currentCity: 'Tu dirección',
        nextCity: 'Entrega finalizada',
        completed: false,
        current: true 
    },
    // SHIAA003 - Preparado
    {
        shipmentId: 'SHIPAA003',
        status: TimelineStatuses.CONFIRMED,
        datetime: new Date('2024-01-03T11:00:00Z'),
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
        completed: true,
        current: false        
    },
    {
        shipmentId: 'SHIPAA003',
        status: TimelineStatuses.PREPARING,
        datetime: new Date('2024-01-03T15:30:00Z'),
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Centro de Distribución - Bahía Blanca',
        completed: false,
        current: true 
    }
]

export { SHIPMENTS, SHIPMENT_TRACKINGS }