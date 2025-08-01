-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partnumber VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_new BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  datasheet_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(partnumber, series)
);

-- Product parameters table
CREATE TABLE product_parameters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  parameter_name VARCHAR(255) NOT NULL,
  parameter_value TEXT NOT NULL,
  parameter_type VARCHAR(50) CHECK (parameter_type IN ('text', 'number', 'boolean', 'select')) DEFAULT 'text',
  display_order INTEGER DEFAULT 0,
  is_filterable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User inquiries table
CREATE TABLE inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for better performance
CREATE INDEX idx_products_partnumber ON products(partnumber);
CREATE INDEX idx_products_series ON products(series);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_product_parameters_product_id ON product_parameters(product_id);
CREATE INDEX idx_product_parameters_name ON product_parameters(parameter_name);
CREATE INDEX idx_product_parameters_filterable ON product_parameters(is_filterable);
CREATE INDEX idx_inquiries_product_id ON inquiries(product_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Full-text search index for products
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', partnumber || ' ' || series || ' ' || name || ' ' || COALESCE(description, '')));

-- Update trigger for products updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, and parameters
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read access on product_parameters" ON product_parameters FOR SELECT USING (TRUE);

-- Public insert access for inquiries and newsletter subscriptions
CREATE POLICY "Allow public insert on inquiries" ON inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public insert on newsletter_subscriptions" ON newsletter_subscriptions FOR INSERT WITH CHECK (TRUE);

-- Admin-only access for CUD operations on main tables
CREATE POLICY "Allow authenticated users full access on categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access on products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access on product_parameters" ON product_parameters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users read access on inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users update access on inquiries" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');

-- Sample data for development
INSERT INTO categories (name, slug, description) VALUES 
('전자부품', 'electronics', '다양한 전자 부품 및 모듈'),
('센서', 'sensors', '온도, 압력, 광학 센서류'),
('액추에이터', 'actuators', '모터, 서보, 솔레노이드'),
('커넥터', 'connectors', '전기 연결용 커넥터류'),
('케이블', 'cables', '신호 및 전원 케이블');

-- Sample products (you can expand this based on actual product data)
INSERT INTO products (partnumber, series, name, description, category_id, is_new) 
SELECT 
  'VRX-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
  'SERIES-' || (RANDOM() * 10)::INT,
  'Sample Product ' || ROW_NUMBER() OVER(),
  'This is a sample product description for development purposes.',
  (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1),
  RANDOM() < 0.1
FROM generate_series(1, 50);

-- Sample parameters for products
INSERT INTO product_parameters (product_id, parameter_name, parameter_value, parameter_type, display_order, is_filterable)
SELECT 
  p.id,
  'Voltage',
  (RANDOM() * 24 + 1)::INT || 'V',
  'text',
  1,
  TRUE
FROM products p;

INSERT INTO product_parameters (product_id, parameter_name, parameter_value, parameter_type, display_order, is_filterable)
SELECT 
  p.id,
  'Operating Temperature',
  '-40°C to +85°C',
  'text',
  2,
  TRUE
FROM products p;