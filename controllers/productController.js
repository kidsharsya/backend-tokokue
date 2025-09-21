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

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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

export const createProduct = async (req, res) => {
  const { name, categoryId, description, price, isAvailable } = req.body;
  const slug = slugify(name, { lower: true }); // generate slug otomatis

  try {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ error: 'Product already exists' });

    const product = await prisma.product.create({
      data: { name, slug, categoryId, description, price, isAvailable },
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, description, price, isAvailable } = req.body;
  const slug = slugify(name, { lower: true });

  try {
    // Cek apakah slug sudah ada di category lain
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return res.status(400).json({ error: 'Slug already in use' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { name, slug, categoryId, description, price, isAvailable },
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
