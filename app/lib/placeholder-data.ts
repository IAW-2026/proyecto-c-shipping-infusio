const SHIPMENTS = [
    {
        id: 'SHIPAA001',
        origin: 'CABA, Buenos Aires, Argentina',
        destination: 'Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    },
    {
        id: 'SHIPAA002',
        origin: 'Rosario, Santa Fe, Argentina',
        destination: 'CABA, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    },
    {
        id: 'SHIAA003',
        origin: 'Avenida Colón 80, Bahía Blanca, Buenos Aires, Argentina',
        destination: 'Dr. Arturo Sampay 1030, Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    }
]

const SHIPMENT_TRACKINGS = [
    {
        id: 'SHIPAA001',
        shipment_id: 'SHIPAA001',
        status: 'preparado',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'CABA, Buenos Aires, Argentina'
    },
    {
        id: 'SHIPAA002',
        shipment_id: 'SHIPAA002',
        status: 'en tránsito',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'Bahía Blanca, Buenos Aires, Argentina'
    },
    {
        id: 'SHIAA003',
        shipment_id: 'SHIAA003',
        status: 'entregado',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'Río Turbio, Santa Cruz, Argentina'
    }
]

export { SHIPMENTS, SHIPMENT_TRACKINGS }