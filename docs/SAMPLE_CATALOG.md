# Sample product catalog

The optional local catalog contains 24 photographed products in 8 categories. Prices are illustrative Sri Lankan rupee amounts, ranging from **LKR 200** to **LKR 329,000**. Product photos and quantities are examples rather than verified stock or supplier listings.

| Category | Sample items |
|---|---|
| Electronics | Studio over-ear headphones, Bookshelf speaker, Wireless earbuds, Premium slim laptop, Premium smartphone, Creative camera kit, Slim wireless keyboard |
| Fashion | Red sport sneakers, Everyday white T-shirt, Classic red handbag |
| Accessories | Everyday smart watch, Classic black sunglasses, Everyday commuter backpack |
| Home & Living | Adjustable desk lamp, Upholstered accent chair, Warm glow candle, Small potted plant |
| Kitchen & Dining | Everyday ceramic mug, Reusable water bottle |
| Beauty & Care | Daily skincare essentials, Signature fragrance |
| Books & Stationery | Reading collection, Pocket notebook & pen |
| Sports & Fitness | Strength training barbell |

## Load the local catalog

Back up the existing local database first. From the project root:

```powershell
python scripts/seed-sample-catalog.py
python scripts/seed-sample-catalog.py --project buyora-docker-check --apply
```

The first command previews the import. The second inserts records in a transaction. Running it again retains existing sample variant prices and stock instead of duplicating them. Existing users, orders, products and inventory remain in place. Initial sample stock is recorded in the inventory ledger; only catalog cache keys are cleared.

Set `STOREFRONT_DEMO_CATALOG=true` in the private root `.env` to show the sample-price notice, then rebuild:

```powershell
docker compose -p buyora-docker-check up -d --build --wait
```

This import is optional and is not a Flyway migration. It never runs automatically on production startup. Before selling actual products, replace the sample product information, photos, prices and stock with verified business data and disable the sample notice.

## Photographs

Original photographs are stored under `BuyoraFrontend/public/products`. [Source records](product-photo-sources.json) retain every download URL. Photographs come from Unsplash; see the [Unsplash License](https://unsplash.com/license).

## Shopping experience

The red theme uses shared colors across the storefront, checkout, account and admin controls. Home category tabs, budget collections, selected offers, wishlist, product comparison and visible purchase controls connect to the real catalog. Exact minimum/maximum LKR inputs support low-cost items as well as premium products. No ratings or sales counts were invented.
