import prisma from '../prisma.js';

// GET all images for a product
export const getImagesByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const images = await prisma.productImage.findMany({ where: { productId } });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD new image to a product
export const addProductImage = async (req, res) => {
  const { productId } = req.params; // Ambil productId dari URL

  // Pastikan file di-upload
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const image = await prisma.productImage.create({
      data: {
        productId: productId,
        imageUrl: `/images/${req.file.filename}`, // URL dibuat dari hasil upload multer
        isThumbnail: false, // Default thumbnail adalah false saat menambah satu gambar
      },
    });
    res.status(201).json({ message: 'Image added successfully', image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE product image
export const updateProductImage = async (req, res) => {
  const { id } = req.params;
  const { isThumbnail } = req.body; // Kita fokus pada update thumbnail

  // Hanya jalankan logika kompleks jika isThumbnail di-set menjadi true
  if (isThumbnail === true || isThumbnail === 'true') {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Cari produk dari gambar yang mau dijadikan thumbnail
        const imageToUpdate = await tx.productImage.findUnique({
          where: { id },
          select: { productId: true },
        });

        if (!imageToUpdate) {
          throw new Error('Image not found');
        }

        const { productId } = imageToUpdate;

        // 2. Set SEMUA gambar untuk produk ini menjadi isThumbnail: false
        await tx.productImage.updateMany({
          where: { productId: productId },
          data: { isThumbnail: false },
        });

        // 3. Set gambar yang ditargetkan menjadi isThumbnail: true
        const updatedImage = await tx.productImage.update({
          where: { id: id },
          data: { isThumbnail: true },
        });

        return updatedImage;
      });

      res.json({ message: 'Thumbnail updated successfully', image: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update thumbnail. ' + error.message });
    }
  } else {
    // Jika hanya update biasa (misal: ganti alt text di masa depan, bukan thumbnail)
    // Untuk saat ini kita anggap tidak ada update lain
    res.status(200).json({ message: 'No changes applied.' });
  }
};

// DELETE product image
export const deleteProductImage = async (req, res) => {
  const { slug } = req.params;

  try {
    await prisma.productImage.delete({ where: { slug } });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
