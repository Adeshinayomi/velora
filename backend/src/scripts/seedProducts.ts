
import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.model";
import Category from "../models/Category.model";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  tags: string[];
}

interface DummyResponse {
  products: DummyProduct[];
  total: number;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const seedProducts = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const response = await fetch(
      "https://dummyjson.com/products?limit=100"
    );

    if (!response.ok) {
      throw new Error("Could not retrieve products from DummyJSON");
    }

    const result = (await response.json()) as DummyResponse;

    if (!result.products?.length) {
      throw new Error("No products were returned by DummyJSON");
    }

    console.log(`Retrieved ${result.products.length} products`);

    // Create or reuse categories.
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    const categoryNames = [
      ...new Set(result.products.map((product) => product.category)),
    ];

    for (const categoryName of categoryNames) {
      const slug = slugify(categoryName);

      const category = await Category.findOneAndUpdate(
        { slug },
        {
          $set: {
            name: categoryName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            slug,
            description: `Explore our ${categoryName.replace(/-/g, " ")} collection.`,
            isActive: true,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      categoryMap.set(categoryName, category._id);
    }

    console.log(`Processed ${categoryNames.length} categories`);

    let created = 0;
    let updated = 0;

    for (const item of result.products) {
      const categoryId = categoryMap.get(item.category);

      if (!categoryId) {
        console.warn(`Skipping ${item.title}: category not found`);
        continue;
      }

      const slug = slugify(`${item.title}-${item.id}`);
      const sku = `VEL-DJ-${item.id}`;

      const imageUrl = item.thumbnail || item.images?.[0];

      const productData = {
        name: item.title,
        slug,
        description: item.description,
        shortDescription: item.description.slice(0, 200),
        sku: sku,
        price: item.price,
        category: categoryId,
        stock: Math.max(0, item.stock),
        lowStockThreshold: 5,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                publicId: "",
                alt: item.title,
              },
            ]
          : [],
        tags: item.tags || [],
        isFeatured: item.rating >= 4.5,
        status: "active",
      };

      const existingProduct = await Product.findOne({ sku: sku });

      await Product.findOneAndUpdate(
        { sku: sku },
        { $set: productData },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      if (existingProduct) {
        updated++;
      } else {
        created++;
      }
    }

    console.log("\nProduct seeding completed!");
    console.log({
      totalFetched: result.products.length,
      categories: categoryNames.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
