import prisma from '../prisma.js';
import slugify from 'slugify';
import multer from 'multer';
import path from 'path';

// === Konfigurasi Multer untuk upload ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `images-${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });

// === CREATE PRODUCT ===
export const createProduct = async (req, res) => {
  try {
    const { categoryId, name, description, price, isAvailable } = req.body;

    const slug = slugify(name, { lower: true, strict: true });

    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        slug,
        description,
        price: parseFloat(price),
        isAvailable: isAvailable === 'true',
      },
    });

    // Jika ada gambar diupload
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(
        req.files.map((file, index) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: `/images/${file.filename}`,
              isThumbnail: index === 0, // default gambar pertama jadi thumbnail
            },
          })
        )
      );
      product.images = images;
    }

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat produk' });
  }
};

// === GET ALL ===
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
};

// === GET ONE by SLUG ===
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true },
    });
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
};

// === UPDATE PRODUCT ===
export const updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const { categoryId, name, description, price, isAvailable, imagesToDelete } = req.body;

    const product = await prisma.product.update({
      where: { slug },
      data: {
        categoryId,
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description,
        price: parseFloat(price),
        isAvailable: isAvailable === 'true',
      },
    });

    // Hapus gambar jika diminta
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      await prisma.productImage.deleteMany({
        where: { id: { in: imagesToDelete } },
      });
    }

    // Tambah gambar baru
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: `/images/${file.filename}`,
            },
          })
        )
      );
    }

    const updated = await prisma.product.findUnique({
      where: { slug: product.slug },
      include: { images: true, category: true },
    });

    res.json({ product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update produk' });
  }
};

// === DELETE PRODUCT ===
export const deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    // Cari dulu produknya
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    // Hapus dulu semua image terkait
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    // Baru hapus product
    await prisma.product.delete({
      where: { slug },
    });

    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hapus produk' });
  }
};
