import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbhOjpXJb88Dan3-tWS9rkBUOX0ND_6kI",
  authDomain: "ecommerce-website-dfd55.firebaseapp.com",
  projectId: "ecommerce-website-dfd55",
  storageBucket: "ecommerce-website-dfd55.firebasestorage.app",
  messagingSenderId: "128549464864",
  appId: "1:128549464864:web:f6d80c86bf13ccdd30c545",
  measurementId: "G-L194PK372N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching products from local backend...");
  const res = await fetch("http://localhost:4000/allproducts");
  const products = await res.json();
  console.log(`Fetched ${products.length} products from backend.`);

  for (const product of products) {
    const docId = `prod_${product.id}`;
    const docRef = doc(db, "products", docId);
    
    const productData = {
      name: product.name,
      description: product.description || `High-quality ${product.name} designed by RamCart.`,
      category: product.category,
      newPrice: Number(product.new_price),
      oldPrice: Number(product.old_price),
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black', 'White'],
      variants: product.variants || [],
      stockCount: Number(product.stockCount || 100),
      image: product.image,
      available: product.available !== false,
      createdAt: serverTimestamp()
    };

    console.log(`Uploading ${product.name} (ID: ${product.id}) as ${docId}...`);
    await setDoc(docRef, productData);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error seeding Firestore:", err);
  process.exit(1);
});
