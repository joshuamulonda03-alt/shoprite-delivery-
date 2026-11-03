import { notFound } from 'next/navigation'
import ShopriteApp from '@/components/shop/ShopriteApp'
import { getShopCatalogue, getShopProduct } from '@/lib/shop-catalogue'

export async function generateStaticParams() {
  const data = await getShopCatalogue()
  return data.products.map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, product] = await Promise.all([getShopCatalogue(), getShopProduct(slug)])
  if (!product) notFound()
  return <ShopriteApp data={data} initialProduct={product} />
}
