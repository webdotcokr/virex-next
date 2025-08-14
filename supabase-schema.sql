-- Create a markdown document for the database structure

SELECT '# Database Structure Documentation

## Overview

This document describes the database structure for the product catalog system. The database is designed with a specialized table structure where each product category has its own dedicated table (e.g., products_cis, products_line, products_area) to accommodate different column requirements.

## Core Design Pattern

The database follows a specialized structure where:

1. Different product types are stored in separate tables (products_cis, products_line, products_tdi, etc.)
2. Each product table has its own unique set of technical specifications as columns
3. Configuration tables manage display settings, filter options, and column visibility

## Product Tables

The system uses separate tables for different product categories:

| Product Table | Description |
|---------------|-------------|
| products_cis | Contact Image Sensor products |
| products_line | Line scan camera products |
| products_area | Area scan camera products |
| products_tdi | TDI (Time Delay Integration) camera products |
| products_invisible | Invisible/specialized camera products |
| products_scientific | Scientific camera products |
| products_large_format_lens | Large format lens products |
| products_telecentric | Telecentric lens products |
| products_fa_lens | Factory automation lens products |
| products_3d_laser_profiler | 3D laser profiler products |
| products_3d_stereo_camera | 3D stereo camera products |
| products_light | Lighting products |
| products_controller | Controller products |
| products_frame_grabber | Frame grabber products |
| products_gige_lan_card | GigE LAN card products |
| products_usb_card | USB card products |
| products_software | Software products |
| products_cable | Cable products |
| products_accessory | Accessory products |

### Common Product Table Structure

Each product table has a similar base structure with these common fields:

```sql
id                 BIGINT PRIMARY KEY
part_number        TEXT UNIQUE NOT NULL
series_id          BIGINT      -- Reference to the series table
is_active          BOOLEAN DEFAULT true
is_new             BOOLEAN DEFAULT false
image_url          TEXT
created_at         TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at         TIMESTAMP WITH TIME ZONE DEFAULT now()
maker              TEXT
```

Additionally, each product table contains specialized technical specification columns specific to that product category (e.g., resolution, mega_pixel, focal_length).

## Configuration Tables

### Category-Related Configuration

| Table | Purpose |
|-------|---------|
| categories | Product categories hierarchy |
| filter_configs | Filter configuration for product search/filtering |
| filter_options | Available options for checkbox-type filters |
| filter_slider_configs | Configuration for slider-type filters |
| table_column_configs | Column visibility and display settings for product tables |

### Display and Parameter Configuration

| Table | Purpose |
|-------|---------|
| parameter_labels | Multilingual labels for product parameters |
| category_display_config | Display order and visibility for parameters by category |
| filter_config | Filter configuration settings by category |

## Series Table

The `series` table contains information about product series which group related products:

```sql
id                 BIGINT PRIMARY KEY
series_name        TEXT UNIQUE NOT NULL
intro_text         TEXT
short_text         TEXT
youtube_url        TEXT
feature_image_url  TEXT
-- additional feature and descriptive fields
```

## Configuration System

### Filter System

1. `filter_configs` defines available filters for each category
2. `filter_options` provides options for checkbox filters
3. `filter_slider_configs` provides range settings for slider filters
4. `filter_config` controls which filters are enabled and their display order

### Column Display System

1. `table_column_configs` defines which columns to display for each category
2. `category_display_config` controls parameter display order and visibility
3. `parameter_labels` provides multilingual labels for parameters

## Administrative Tools

The database includes tables for website content management:

- `news` for news articles
- `downloads` and `download_categories` for downloadable content
- `newsletter_subscriptions` for managing newsletter subscribers
- `inquiries` for customer inquiries

## Authentication and User Management

The system uses Supabase authentication with:

- `auth.users` for authentication data
- `member_profiles` linked to auth.users for additional user information
- `tbl_member_level` for user role management

## File Management

The `files` table manages uploaded files with:

```sql
id          BIGINT PRIMARY KEY
file_name   TEXT NOT NULL
file_path   TEXT NOT NULL
file_size   BIGINT
mime_type   TEXT
created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
```

## Design Rationale

This database design was chosen to accommodate:

1. Products with vastly different technical specifications
2. Flexible admin configuration of display and search options
3. Multilingual parameter labels and descriptions
4. Efficient querying of product data by category

The use of separate product tables allows for:
- Custom columns per product type without excessive NULL values
- Targeted indexing strategies
- Category-specific validation rules
- Easier maintainability for category-specific queries

## Working with the Database

When developing features:

1. Identify the product category being worked with
2. Query the appropriate products_* table
3. Use configuration tables to determine display settings
4. Respect the is_active and is_visible flags when displaying data
5. Use parameter_labels for displaying localized field names

For administrator interfaces:
1. Provide access to configuration tables for controlling display options
2. Allow management of filter settings through filter_* tables
3. Support order management and visibility toggling for parameters
' AS documentation;