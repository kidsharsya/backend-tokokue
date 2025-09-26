import prisma from '../prisma.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: { include: { user: true } }, items: { include: { product: true } }, payments: true },
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Dapatkan customer profile dari user yang sedang login
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    // VALIDASI: Cek apakah user adalah 'admin' ATAU pemilik order tersebut
    if (req.user.role === 'admin' || (customer && order.customerId === customer.id)) {
      res.status(200).json(order);
    } else {
      res.status(403).json({ error: 'Not authorized to view this order' }); // 403 Forbidden
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    // req.user.id didapat dari middleware 'authenticate' setelah verifikasi token
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found for this user.' });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create order
export const createOrder = async (req, res) => {
  // 1. Dapatkan data esensial dari body. Jangan terima `totalAmount`.
  const { customerId, shippingAddress, customerNotes, items } = req.body;

  // Validasi input dasar
  if (!customerId || !shippingAddress || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: customerId, shippingAddress, and items.' });
  }

  try {
    // 2. Ambil semua product ID dari 'items' untuk divalidasi ke database
    const productIds = items.map((item) => item.productId);

    // Ambil data produk yang relevan dari database dalam satu query
    const productsInDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Cek jika ada produk yang tidak ditemukan atau tidak tersedia
    if (productsInDb.length !== productIds.length) {
      return res.status(404).json({ error: 'One or more products not found.' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // 3. Kalkulasi totalAmount dan siapkan data untuk OrderItem
    for (const item of items) {
      const product = productsInDb.find((p) => p.id === item.productId);

      if (!product) {
        // Seharusnya tidak terjadi karena sudah dicek di atas, tapi sebagai pengaman tambahan
        return res.status(404).json({ error: `Product with id ${item.productId} not found.` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ error: `Product '${product.name}' is not available.` });
      }

      const pricePerItem = product.price;
      const subTotal = pricePerItem * item.quantity;
      totalAmount += subTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        pricePerItem: pricePerItem, // Harga diambil dari DB, bukan dari klien!
      });
    }

    // 4. Gunakan Prisma Transaction untuk memastikan konsistensi data
    const newOrder = await prisma.$transaction(async (tx) => {
      // Buat record Order terlebih dahulu
      const order = await tx.order.create({
        data: {
          customerId,
          orderDate: new Date(),
          totalAmount, // totalAmount hasil kalkulasi server
          status: 'pending', // Status awal
          shippingAddress,
          customerNotes,
        },
      });

      // Siapkan data OrderItem dengan orderId yang baru dibuat
      const itemsToCreate = orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      // Buat semua record OrderItem sekaligus
      await tx.orderItem.createMany({
        data: itemsToCreate,
      });

      // Kembalikan order yang sudah lengkap dengan item-itemnya
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true, // Sertakan detail produk jika perlu
            },
          },
        },
      });
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update order
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  // Biasanya yang diupdate hanya status, atau alamat jika belum dikirim
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
