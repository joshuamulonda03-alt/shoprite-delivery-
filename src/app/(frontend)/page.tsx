import ShopriteApp from '@/components/shop/ShopriteApp'
import { getShopCatalogue } from '@/lib/shop-catalogue'

export default async function HomePage() {
  const data = await getShopCatalogue()
  return <ShopriteApp data={data} />
}
