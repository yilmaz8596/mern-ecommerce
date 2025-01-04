const actualProducts = [
  {
    name: "Slim Fit Jeans",
    description: "Comfortable slim-fit jeans made from stretchable denim.",
    price: 49.99,
    category: "jeans",
    isFeatured: true,
    countInStock: 25,
    imageUrl:
      "https://ae01.alicdn.com/kf/H5c9fd013545748b4baee77cdc1eabe93n.jpg_640x640q90.jpg",
  },
  {
    name: "Relaxed Fit T-Shirt",
    description: "Soft cotton T-shirt with a relaxed fit and vibrant colors.",
    price: 19.99,
    category: "t-shirt",
    isFeatured: true,
    countInStock: 50,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk8M188JH-jZqyG1LL-0qgmTOtA1qD84wZ0w&s",
  },
  {
    name: "Running Shoes",
    description:
      "Lightweight running shoes with excellent grip and durability.",
    price: 79.99,
    category: "shoes",
    isFeatured: false,
    countInStock: 40,
    imageUrl:
      "https://s3.amazonaws.com/www.irunfar.com/wp-content/uploads/2023/06/08094434/Best-Trail-Running-Shoes-for-Mud-Saucony-Peregrine-13-ST-product-photo.jpg",
  },
  {
    name: "Aviator Sunglasses",
    description: "Classic aviator sunglasses with UV400 protection.",
    price: 29.99,
    category: "glasses",
    isFeatured: true,
    countInStock: 30,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlsCPDwbc32CJ9QoMXrSfr5DZzhB6cbiaLwg&s",
  },
  {
    name: "Puffer Jacket",
    description: "Insulated puffer jacket for ultimate warmth and comfort.",
    price: 89.99,
    category: "jackets",
    isFeatured: true,
    countInStock: 15,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPyLiQRnRFOD7dWwAfjoCjco_4v2jxAqcWng&s",
  },
  {
    name: "3-Piece Suit",
    description: "Elegant 3-piece suit tailored from premium fabric.",
    price: 199.99,
    category: "Suits",
    isFeatured: false,
    countInStock: 10,
    imageUrl: "https://andreemilio.com/wp-content/uploads/2019/08/28.jpg",
  },
  {
    name: "Leather Tote Bag",
    description: "Stylish leather tote bag with ample storage space.",
    price: 59.99,
    category: "Bags",
    isFeatured: false,
    countInStock: 20,
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVjG43jbtMI03rdCxa1KOvzuD0vV-DRnXeTg&s",
  },
];

const seedProducts = async () => {
  try {
    // Bağlantı zaten varsa tekrar bağlanmaya çalışma
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to database for seeding");
    }

    await Product.deleteMany();
    console.log("Cleared existing products");

    await Product.insertMany(actualProducts);
    console.log("Inserted actual products");

    // Sadece biz bağlandıysak bağlantıyı kapat
    if (process.env.NODE_ENV !== "production") {
      await mongoose.disconnect();
      console.log("Disconnected from database after seeding");
    }
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error; // Hatayı yukarı fırlat
  }
};

seedProducts();
