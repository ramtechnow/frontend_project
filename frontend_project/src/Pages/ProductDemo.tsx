import { ProductImageCard } from "src/Components/ui/product-image-card";
import type { ProductImage } from "src/Components/ui/product-image-card";

export default function ProductDemo() {
  const images: ProductImage[] = [
    {
      src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/v1.png",
      alt: "Front view",
    },
    {
      src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/v2.png",
      alt: "Back view",
    },
    {
      src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/v3.png",
      alt: "Side angle",
    },
    {
      src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/v4.png",
      alt: "Detail patch",
    },
    {
      src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/v1.png",
      alt: "Other view",
    }
  ];

  return (
    <main style={{ padding: "40px 0" }}>
      <div className="container mx-auto max-w-5xl px-4">
        <ProductImageCard title="Product Details" images={images} initialIndex={0} />
      </div>
    </main>
  );
}
