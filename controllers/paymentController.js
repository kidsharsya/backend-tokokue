import prisma from '../prisma.js';

// Asumsi ini adalah fungsi simulasi interaksi dengan payment gateway
const processPaymentGateway = async (amount) => {
  console.log(`Processing payment for amount: ${amount}`);
  // Dalam aplikasi nyata, di sini ada logika untuk berkomunikasi dengan Midtrans, Stripe, dll.
  // Jika berhasil, ia akan mengembalikan ID transaksi unik.
  return { success: true, transactionId: `TXN_${Date.now()}` };
};

// =======================================================
// CREATE PAYMENT (PALING PENTING)
// =======================================================
export const createPayment = async (req, res) => {
  // 1. Hanya terima orderId dan paymentMethod dari klien
  const { orderId, paymentMethod } = req.body;

  if (!orderId || !paymentMethod) {
    return res.status(400).json({ error: 'orderId and paymentMethod are required.' });
  }

  try {
    // 2. Cari order yang akan dibayar di database
    const orderToPay = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderToPay) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // 3. Validasi status order
    if (orderToPay.status !== 'pending') {
      return res.status(400).json({ error: `Cannot process payment for an order with status '${orderToPay.status}'.` });
    }

    // 4. Ambil amount dari DATABASE, bukan dari req.body!
    const amountToPay = orderToPay.totalAmount;

    // 5. Proses ke payment gateway (simulasi)
    const paymentGatewayResponse = await processPaymentGateway(amountToPay);

    if (!paymentGatewayResponse.success) {
      // Jika gagal, buat record payment dengan status 'failed' dan JANGAN ubah status order
      await prisma.payment.create({
        data: {
          orderId,
          paymentMethod,
          amount: amountToPay,
          paymentStatus: 'failed', // <-- Catat sebagai gagal
          transactionId: paymentGatewayResponse.transactionId || `FAILED_${Date.now()}`,
          paymentDate: new Date(),
        },
      });
      return res.status(400).json({ error: 'Payment failed at payment gateway.' });
    }

    // 6. Gunakan transaction jika pembayaran berhasil
    const result = await prisma.$transaction(async (tx) => {
      // a. Buat record payment dengan status 'success'
      const payment = await tx.payment.create({
        data: {
          orderId,
          paymentMethod,
          amount: amountToPay,
          paymentStatus: 'success',
          transactionId: paymentGatewayResponse.transactionId,
          paymentDate: new Date(),
        },
      });

      // b. Update status order menjadi 'paid'
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
        },
      });

      return { payment, updatedOrder };
    });

    res.status(201).json({ message: 'Payment successful', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =======================================================
// FUNGSI LAINNYA (dengan perbaikan keamanan)
// =======================================================

// Get all payments (HANYA UNTUK ADMIN)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment by ID (HANYA UNTUK ADMIN ATAU PEMILIK ORDER)
export const getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: { customer: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Dapatkan customer profile dari user yang sedang login
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    // Cek apakah user adalah 'admin' ATAU pemilik order dari payment ini
    if (req.user.role === 'admin' || (customer && payment.order.customerId === customer.id)) {
      res.status(200).json(payment);
    } else {
      res.status(403).json({ error: 'Not authorized to view this payment' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PENTING: updatePayment dan deletePayment TIDAK DIREKOMENDASIKAN
// Catatan finansial seperti pembayaran seharusnya bersifat 'immutable' (tidak bisa diubah/dihapus).
// Jika ada kesalahan, proses yang benar adalah 'refund' atau 'cancel' yang akan membuat transaksi baru,
// bukan mengubah atau menghapus data lama. Untuk saat ini, sebaiknya jangan ekspos fungsi ini ke API.
