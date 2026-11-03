# Shoprite Zambia development catalogue

The original storefront, navigation, logo and shopping flow were ported from the
pre-Payload Git revision. No retailer authorisation is implied.

## Sources of truth

- Payload `products`: SKU, name, brand, manufacturer, category, eligible demo
  branches, package size, image relationship, unit price in ZMW, description,
  availability, source references and separate verification flags.
- Payload `categories` and `branches`: independently manageable departments and
  demonstration locations. Delivery fees are estimates.
- Payload `media`: upload storage, used by product image relationships.
- Payload `orders`: private demonstration orders with server-calculated line
  snapshots, totals, delivery fees and a staff-controlled fulfilment status.
- Browser storage: cart and private receipt capabilities only. Original v1 cart
  and order keys are left untouched. Compatible old cart items map through
  `legacyId`; old foreign milk and mixed-bundle items are not silently replaced.
  Valid original browser-only orders remain visible in a read-only archive and
  are not silently submitted to a retailer or copied into the database.

The frontend has no product-array fallback. Missing catalogue data gets an empty
state. `/admin` is the existing Figma/Payload editor panel, not a public customer
account screen. Public customer signup is not implemented by this migration.

## Provenance and honest presentation

The initial import contains 65 demonstration products in 15 departments, covering
all ten requested Zambian supermarket departments and preserving additional
browse departments from the original app.

Manufacturer references were checked during implementation:

- https://www.tradekings.co.zm/foods/
- https://www.tradekings.co.zm/laundry-care/
- https://www.tradekings.co.zm/product/boom-sparkle-plus/
- https://www.tradekings.co.zm/personal-care/
- https://www.tradekings.co.zm/confectionery/
- https://www.tradekings.co.zm/beverages/
- https://www.dairygold.co.zm/
- https://www.bigtreebrands.com/

These sources support product/brand identity, **not Shoprite prices, stock,
retail distribution, image reuse rights, or every sample package size**. Boom
Sparkle Plus Lemon 750 ml is specifically documented by its manufacturer.
Other unverified sample sizes remain explicitly labelled.

All initial prices are **estimated**, not official Shoprite prices. Initial
branch availability is **unverified**. Generic supermarket goods are not assigned
invented brand names. Branded retail photographs are intentionally absent until
reuse permission and an exact variant/size match can be confirmed. Publicly
viewable manufacturer imagery is not treated as a reuse licence.

Five licensed Unsplash photographs identify loose tomatoes, bananas, apples,
potatoes and carrots; they make no packaged-weight claim. Credits are stored
with the catalogue records. All previous unrelated/mismatched grocery and
foreign-brand photographs were removed. The original Unsplash trolley hero is
preserved as a local marketing asset (Zoshua Colah / Unsplash).

## Editing

Authorised editors can use `/admin` to edit products, categories, branches,
orders and media. To attach product imagery, first upload it to Media, confirm
reuse rights, and set an exact package match with a verified size, or explicitly
classify a licensed loose-produce photograph. Source-verified prices and stock
require source references and verification dates.

## Rendering lifecycle

`/` and `/products/[slug]` use cached Payload reads and prerendered HTML.
`shop-catalogue` tags all public list/detail reads. Product hooks invalidate the
list and previous/current slug keys; category, branch and media writes
invalidate all catalogue reads. Admin edits use these hooks in Next's runtime.
New product slugs can be generated on first request; missing/inactive products
return the standard not-found page.

Development bypasses page-data caches so CLI imports appear immediately.
The Payload CLI runs outside Next's cache context: after CLI imports or content
maintenance, **Publish again** to rebuild production snapshots. Code/version
history does not roll back Payload records.

## Checkout limitations

Only non-commercial demonstration checkout is enabled. The server validates
quantities, eligible demo products and branch, address and Zambian phone format,
then recalculates all amounts from database records. Workflow and total fields
are server-owned. There is no live payment, stock reservation, delivery-zone
verification, driver dispatch, SMS or email integration.

Guest order reads require a private 256-bit receipt stored by the browser.
Collection reads, edits and deletes remain staff-only except for that narrowly
scoped server-side receipt lookup. Possession of the receipt grants order
access; clearing browser storage loses it. Do not use real personal details in
this development service.
