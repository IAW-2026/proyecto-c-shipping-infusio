import type { Shipment, ShipmentTracking } from "./definitions"

const SHIPMENTS: Shipment[] = [
    {
        id: 'SHIPAA001',
        origin: 'CABA, Buenos Aires, Argentina',
        destination: 'Zelarrayán 233, Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
        seller_id: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
        buyer_id: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
    },
    {
        id: 'SHIPAA002',
        origin: 'Rosario, Santa Fe, Argentina',
        destination: 'CABA, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
        seller_id: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyer_id: 'user_3DdtO3tGpGtvz1VoG5rJbLAWPAG',
    },
    {
        id: 'SHIPAA003',
        origin: 'Avenida Colón 80, Bahía Blanca, Buenos Aires, Argentina',
        destination: 'Dr. Arturo Sampay 1030, Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
        seller_id: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyer_id: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
    }
]

const SHIPMENT_TRACKINGS: ShipmentTracking[] = [
    // SHIPAA001 - En tránsito
    {
        id: 'TRACK001',
        shipment_id: 'SHIPAA001',
        status: 'Pedido confirmado',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Tienda Online Infusio',
        next_city: 'Centro de Distribución',
        
    },
    {
        id: 'TRACK002',
        shipment_id: 'SHIPAA001',
        status: 'Preparando tu pedido',
        datetime: '2024-01-01T14:15:00Z',
        current_city: 'Centro de Distribución - Palermo',
        next_city: 'Centro de Distribución - Palermo',
        
    },
    {
        id: 'TRACK003',
        shipment_id: 'SHIPAA001',
        status: 'Enviado',
        datetime: '2024-01-01T18:00:00Z',
        current_city: 'Centro de Distribución - Palermo',
        next_city: 'Centro Logístico - Bahía Blanca',
        
    },
    {
        id: 'TRACK004',
        shipment_id: 'SHIPAA001',
        status: 'En tránsito hacia tu ciudad',
        datetime: '2024-01-02T08:45:00Z',
        current_city: 'Centro Logístico - Bahía Blanca',
        next_city: 'Tu zona',
        
    },
    {
        id: 'TRACK005',
        shipment_id: 'SHIPAA001',
        status: 'En reparto',
        datetime: '2024-01-02T11:10:00Z',
        current_city: 'Centro de Distribución - Bahía Blanca',
        next_city: 'Domicilio de entrega',
        
    },
    // SHIPAA002 - Entregado
    {
        id: 'TRACK006',
        shipment_id: 'SHIPAA002',
        status: 'Pedido confirmado',
        datetime: '2023-12-25T09:30:00Z',
        current_city: 'Tienda Online Infusio',
        next_city: 'Centro de Distribución',
        
    },
    {
        id: 'TRACK007',
        shipment_id: 'SHIPAA002',
        status: 'Preparando tu pedido',
        datetime: '2023-12-25T13:00:00Z',
        current_city: 'Centro de Distribución - Rosario',
        next_city: 'Centro de Distribución - Rosario',
        
    },
    {
        id: 'TRACK008',
        shipment_id: 'SHIPAA002',
        status: 'Enviado',
        datetime: '2023-12-25T16:45:00Z',
        current_city: 'Centro de Distribución - Rosario',
        next_city: 'Centro Logístico - CABA',
        
    },
    {
        id: 'TRACK009',
        shipment_id: 'SHIPAA002',
        status: 'En reparto',
        datetime: '2023-12-26T07:30:00Z',
        current_city: 'Centro Logístico - CABA',
        next_city: 'Tu zona',
        
    },
    {
        id: 'TRACK010',
        shipment_id: 'SHIPAA002',
        status: 'Entregado',
        datetime: '2023-12-26T14:20:00Z',
        current_city: 'Tu dirección',
        next_city: 'Entrega finalizada',
        
    },
    // SHIAA003 - Preparado
    {
        id: 'TRACK011',
        shipment_id: 'SHIPAA003',
        status: 'Pedido confirmado',
        datetime: '2024-01-03T11:00:00Z',
        current_city: 'Tienda Online Infusio',
        next_city: 'Centro de Distribución',
        
    },
    {
        id: 'TRACK012',
        shipment_id: 'SHIPAA003',
        status: 'Preparando tu pedido',
        datetime: '2024-01-03T15:30:00Z',
        current_city: 'Centro de Distribución - Bahía Blanca',
        next_city: 'Centro de Distribución - Bahía Blanca',
        
    }
]

export { SHIPMENTS, SHIPMENT_TRACKINGS }