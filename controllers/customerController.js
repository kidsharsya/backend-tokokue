import prisma from '../prisma.js';

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        orders: true,
      },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  const { userId, phoneNumber, address } = req.body;

  try {
    // optional: cek kalau userId sudah punya customer
    const existing = await prisma.customer.findUnique({ where: { userId } });
    if (existing) return res.status(400).json({ error: 'User already has a customer profile' });

    const customer = await prisma.customer.create({
      data: { userId, phoneNumber, address },
    });

    res.status(201).json({ message: 'Customer created', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { phoneNumber, address } = req.body;

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { phoneNumber, address },
    });

    res.json({ message: 'Customer updated', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.customer.delete({ where: { id } });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
