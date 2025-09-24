import prisma from '../prisma.js';
import slugify from 'slugify';

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProductWithImages = async (req, res) => {
  // 1. Ambil data teks dari form (req.body)
  const { name, categoryId, description, price, isAvailable } = req.body;

  // 2. Ambil data file-file yang di-upload (req.files dari multer)
  const images = req.files;

  // Validasi sederhana
  if (!name || !categoryId || !price) {
    return res.status(400).json({ error: 'Name, category, and price are required.' });
  }
  if (!images || images.length === 0) {
    return res.status(400).json({ error: 'At least one image must be uploaded.' });
  }

  // Generate slug
  const slug = slugify(name, { lower: true });

  try {
    // Gunakan Prisma Transaction untuk memastikan semua operasi berhasil atau tidak sama sekali
    const result = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat entitas produk terlebih dahulu
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          categoryId,
          // Pastikan price dikonversi menjadi angka (Decimal)
          price: parseFloat(price),
          isAvailable: isAvailable ? JSON.parse(isAvailable) : true,
        },
      });

      // Langkah B: Siapkan data gambar berdasarkan produk yang baru dibuat
      const imageData = images.map((file, index) => ({
        productId: product.id,
        imageUrl: `/images/${file.filename}`, // Simpan path relatif ke gambar
        // Jadikan gambar pertama sebagai thumbnail/gambar utama
        isThumbnail: index === 0,
      }));

      // Langkah C: Simpan semua data gambar ke database
      await tx.productImage.createMany({
        data: imageData,
      });

      // Kembalikan produk yang sudah dibuat beserta gambarnya
      // Kita query ulang agar mendapatkan data produk lengkap dengan relasi images
      const completeProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: true,
          category: true,
        },
      });

      return completeProduct;
    });

    res.status(201).json({ message: 'Product created successfully', product: result });
  } catch (error) {
    console.error('Error creating product:', error);
    // Jika ada error di slug (duplikat) atau error lainnya, transaksi akan di-rollback
    // Data produk dan gambar tidak akan tersimpan.
    res.status(500).json({ error: 'Failed to create product. ' + error.message });
  }
};

export const updateProductWithImages = async (req, res) => {
  // Ambil ID produk dari parameter URL
  const { slug } = req.params;

  // Ambil data teks, file baru, dan daftar gambar yang akan dihapus
  const { name, categoryId, description, price, isAvailable, imagesToDelete } = req.body;
  const newImages = req.files;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Langkah 1: Hapus gambar yang ditandai untuk dihapus
      if (imagesToDelete && imagesToDelete.length > 0) {
        // pastikan imagesToDelete adalah array
        const idsToDelete = Array.isArray(imagesToDelete) ? imagesToDelete : [imagesToDelete];

        await tx.productImage.deleteMany({
          where: {
            id: {
              in: idsToDelete,
            },
          },
        });
      }

      // Langkah 2: Tambahkan gambar baru jika ada
      if (newImages && newImages.length > 0) {
        const newImageData = newImages.map((file) => ({
          productId: id,
          imageUrl: `/images/${file.filename}`,
        }));

        await tx.productImage.createMany({
          data: newImageData,
        });
      }

      // Langkah 3: Update data utama produk
      const updatedProductData = {};
      if (name) {
        updatedProductData.name = name;
        updatedProductData.slug = slugify(name, { lower: true });
      }
      if (categoryId) updatedProductData.categoryId = categoryId;
      if (description) updatedProductData.description = description;
      if (price) updatedProductData.price = parseFloat(price);
      if (isAvailable) updatedProductData.isAvailable = JSON.parse(isAvailable);

      const updatedProduct = await tx.product.update({
        where: { slug },
        data: updatedProductData,
        include: {
          images: true, // Sertakan gambar terbaru dalam respons
          category: true,
        },
      });

      return updatedProduct;
    });

    res.status(200).json({ message: 'Product updated successfully', product: result });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product. ' + error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { slug } = req.params;

  try {
    // Kita butuh transaksi untuk memastikan kedua operasi delete berhasil
    await prisma.$transaction(async (tx) => {
      // 1. Cari dulu produknya untuk mendapatkan ID-nya
      const product = await tx.product.findUnique({
        where: { slug },
        select: { id: true }, // Cukup ambil ID-nya saja
      });

      if (!product) {
        // Lemparkan error agar transaksi di-rollback
        throw new Error('Product not found');
      }

      // 2. Hapus dulu semua ProductImage yang terkait dengan produk ini
      await tx.productImage.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // 3. Setelah semua gambar dihapus, baru hapus produknya
      await tx.product.delete({
        where: {
          slug: slug,
        },
      });
    });

    res.json({ message: 'Product and its images deleted successfully' });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to delete product. ' + error.message });
  }
};
