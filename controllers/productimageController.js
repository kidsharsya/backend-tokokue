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
  const { productId, imageUrl, isThumbnail } = req.body;

  try {
    const image = await prisma.productImage.create({
      data: { productId, imageUrl, isThumbnail: isThumbnail || false },
    });
    res.status(201).json({ message: 'Image added', image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE product image
export const updateProductImage = async (req, res) => {
  const { id } = req.params;
  const { imageUrl, isThumbnail } = req.body;

  try {
    const image = await prisma.productImage.update({
      where: { id },
      data: { imageUrl, isThumbnail },
    });
    res.json({ message: 'Image updated', image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE product image
export const deleteProductImage = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.productImage.delete({ where: { id } });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
