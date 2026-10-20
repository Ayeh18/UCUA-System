-- Sample reference data for local development only. Replace with the real lists in production.

INSERT INTO locations (location) VALUES
    ('Main Gate'),
    ('Admin Building'),
    ('Warehouse A'),
    ('Warehouse B'),
    ('Jetty 1'),
    ('Jetty 2'),
    ('Open Yard'),
    ('Workshop')
ON CONFLICT (location) DO NOTHING;

INSERT INTO company (company_name) VALUES
    ('TBSB'),
    ('Contractor A'),
    ('Contractor B'),
    ('Others')
ON CONFLICT (company_name) DO NOTHING;
