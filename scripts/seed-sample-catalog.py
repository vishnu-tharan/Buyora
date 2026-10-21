"""Add an optional, repeatable sample catalog to a named local Docker project."""
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def sql_for(catalog):
    sql = ["BEGIN;", "SELECT pg_advisory_xact_lock(71420261012);"]
    sql.append("INSERT INTO brands(name,slug,description,created_by) VALUES ('Buyora collection','buyora-sample-collection','Local sample collection with illustrative prices.','local-catalog') ON CONFLICT DO NOTHING;")
    for index, category in enumerate(catalog['categories']):
        sql.append("INSERT INTO categories(name,slug,image_url,image_alt,sort_order,created_by) VALUES (" + ",".join(map(literal, [category['name'], category['slug'], category['image'], category['name'], -80 + index, 'local-catalog'])) + ") ON CONFLICT(slug) DO NOTHING;")
        sql.append("UPDATE categories SET image_url=" + literal(category['image']) + ",image_alt=" + literal(category['name']) + " WHERE slug=" + literal(category['slug']) + " AND (image_url IS NULL OR image_url='');")
    for product in catalog['products']:
        slug = literal(product['slug'])
        description = product['summary'] + '\n\nSample catalog item. Photographs, prices and availability illustrate the local store experience; replace them with verified product information before sale.'
        specs = json.dumps({'Collection': 'Sample catalog', 'Currency': 'Sri Lankan rupee (LKR)'})
        sql.append("INSERT INTO products(name,slug,short_description,description,category_id,brand_id,status,featured,new_arrival,tags,specifications,created_by) SELECT " + ",".join(map(literal, [product['name'], product['slug'], product['summary'], description])) + ",c.id,b.id,'ACTIVE'," + literal(product['featured']) + "," + literal(product['newArrival']) + ",ARRAY['sample-catalog']," + literal(specs) + "::jsonb,'local-catalog' FROM categories c CROSS JOIN brands b WHERE c.slug=" + literal(product['category']) + " AND b.slug='buyora-sample-collection' ON CONFLICT(slug) DO NOTHING;")
        sql.append("INSERT INTO product_images(product_id,url,storage_key,alt_text,is_primary) SELECT id," + literal(product['image']) + "," + literal('sample-catalog/' + product['slug']) + "," + literal(product['name']) + ",TRUE FROM products WHERE slug=" + slug + " AND 'sample-catalog'=ANY(tags) AND NOT EXISTS(SELECT 1 FROM product_images WHERE product_id=products.id);")
        choices = [(None, None)]
        if product['options']:
            if len(product['options']) != 1:
                raise ValueError('Sample variants support one option per product.')
            name, values = next(iter(product['options'].items()))
            choices = [(name, value) for value in values]
        for index, (attribute, value) in enumerate(choices):
            sku = literal('SAMPLE-' + product['slug'].removeprefix('sample-').upper() + '-' + str(index + 1))
            sql.append("DO $$ BEGIN IF EXISTS (SELECT 1 FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.sku=" + sku + " AND (p.slug<>" + slug + " OR NOT COALESCE('sample-catalog'=ANY(p.tags),FALSE))) THEN RAISE EXCEPTION 'Sample SKU belongs to another product'; END IF; END $$;")
            sql.append("INSERT INTO product_variants(product_id,sku,price,compare_at_price,sort_order) SELECT id," + sku + "," + literal(product['price']) + "," + literal(product['compareAtPrice']) + "," + str(index) + " FROM products WHERE slug=" + slug + " AND 'sample-catalog'=ANY(tags) ON CONFLICT(sku) DO NOTHING;")
            if attribute:
                sql.append("INSERT INTO variant_attributes(variant_id,attribute_definition_id,value) SELECT v.id,d.id," + literal(value) + " FROM product_variants v CROSS JOIN attribute_definitions d WHERE v.sku=" + sku + " AND d.name=" + literal(attribute) + " ON CONFLICT(variant_id,attribute_definition_id) DO NOTHING;")
            sql.append("WITH added AS (INSERT INTO inventory_items(variant_id,stock_quantity) SELECT id," + literal(product['stock']) + " FROM product_variants WHERE sku=" + sku + " ON CONFLICT(variant_id) DO NOTHING RETURNING variant_id,stock_quantity) INSERT INTO inventory_transactions(variant_id,type,quantity,reference_id,notes,created_by) SELECT variant_id,'RESTOCK',stock_quantity,'sample-catalog','Initial sample quantity','local-catalog' FROM added;")
    sql.append("COMMIT;")
    return '\n'.join(sql)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', default='buyora-docker-check')
    parser.add_argument('--apply', action='store_true', help='Insert the sample data; existing prices, stock and orders are retained.')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,62}', args.project):
        parser.error('Invalid Docker project name.')
    catalog = json.loads((ROOT / 'scripts/sample-catalog.json').read_text(encoding='utf-8'))
    if catalog['currency'] != 'LKR' or any(p['price'] < 0 for p in catalog['products']):
        raise ValueError('Invalid sample prices.')
    for product in catalog['products']:
        if not (ROOT / 'BuyoraFrontend/public' / product['image'].lstrip('/')).is_file():
            raise ValueError('Missing product photograph: ' + product['image'])
    print(f"{len(catalog['products'])} sample products across {len(catalog['categories'])} categories; LKR {min(p['price'] for p in catalog['products']):,} to {max(p['price'] for p in catalog['products']):,}.")
    if not args.apply:
        print('Preview only. Use --apply against a backed-up local project to insert data.')
        return
    command = ['docker', 'compose', '-p', args.project, 'exec', '-T', 'postgres', 'sh', '-c', 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"']
    result = subprocess.run(command, input=sql_for(catalog), cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    # Evict catalog caches only; customer sessions, carts and rate-limit keys stay intact.
    for cache in ['categories', 'brands', 'products']:
        prefix = ['docker', 'compose', '-p', args.project, 'exec', '-T', 'redis', 'redis-cli']
        keys = subprocess.run(prefix + ['--scan', '--pattern', cache + '::*'], cwd=ROOT, text=True, capture_output=True, check=True).stdout.splitlines()
        if keys:
            subprocess.run(prefix + ['DEL'] + keys, cwd=ROOT, capture_output=True, check=True)
    print('Sample catalog inserted transactionally. Existing variant prices and inventory are retained on repeat runs.')


if __name__ == '__main__':
    main()
