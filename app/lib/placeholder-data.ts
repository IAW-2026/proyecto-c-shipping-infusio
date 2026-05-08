const SHIPMENTS = [
    {
        id: '410544b2-4001-4271-9855-fec4b6a6442a',
        origin: 'CABA, Buenos Aires, Argentina',
        destination: 'Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    },
    {
        id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
        origin: 'Rosario, Santa Fe, Argentina',
        destination: 'CABA, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    },
    {
        id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        origin: 'Bahía Blanca, Buenos Aires, Argentina',
        destination: 'Bahía Blanca, Buenos Aires, Argentina',
        origin_datetime: '2024-01-01T10:00:00Z',
        destination_datetime: '2024-01-02T18:00:00Z',
    }
]

const SHIPMENT_TRACKINGS = [
    {
        id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
        shipment_id: '410544b2-4001-4271-9855-fec4b6a6442a',
        status: 'preparado',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'CABA, Buenos Aires, Argentina'
    },
    {
        id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
        shipment_id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
        status: 'en tránsito',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'Bahía Blanca, Buenos Aires, Argentina'
    },
    {
        id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
        shipment_id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        status: 'entregado',
        datetime: '2024-01-01T10:00:00Z',
        current_city: 'Bahía Blanca, Buenos Aires, Argentina',
        next_city: 'Río Turbio, Santa Cruz, Argentina'
    }
]

export { SHIPMENTS, SHIPMENT_TRACKINGS }