import prisma from '../prisma.js';

export const getRoles = async (req, res) => {
  try {
    const role = await prisma.role.findMany();
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRole = async (req, res) => {
  const { name } = req.body;
  try {
    const role = await prisma.role.create({ data: { name } });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
