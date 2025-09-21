import prisma from '../prisma.js';
import slugify from 'slugify';

export const getAllCategory = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) return res.status(404).json({ error: 'Category not found' });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true }); // generate slug otomatis

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ error: 'Category already exists' });

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true });

  try {
    // Cek apakah slug sudah ada di category lain
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return res.status(400).json({ error: 'Slug already in use' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description },
    });

    res.json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
