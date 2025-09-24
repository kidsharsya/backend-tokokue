import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Cek duplikat email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role default user kalau tidak dikirim
    let finalRoleId = roleId;
    if (!roleId) {
      const defaultRole = await prisma.role.findFirst({ where: { name: 'user' } });
      if (!defaultRole) {
        return res.status(400).json({ error: 'Default role user not found, please seed roles first' });
      }
      finalRoleId = defaultRole.id;
    }

    // Simpan user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: finalRoleId,
      },
      select: { id: true, name: true, email: true, roleId: true }, // hide password
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(404).json({ error: 'Email atau Password Salah' });

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { role: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // dapet dari middleware authenticate
    const { name, email, password } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) {
      // cek apakah email sudah dipakai user lain
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      dataToUpdate.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 character long' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true }, // jangan kirim password
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id: userIdToUpdate } = req.params;
    // TAMBAHKAN roleId DI SINI
    const { name, email, password, roleId } = req.body;

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) {
      // Logika cek email unik (sudah benar)
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userIdToUpdate) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      dataToUpdate.email = email;
    }
    if (password) {
      // Logika hash password (sudah benar)
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    // ✅ TAMBAHKAN LOGIKA UNTUK UPDATE ROLE
    if (roleId) {
      dataToUpdate.roleId = roleId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'No data provided to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: dataToUpdate,
      // Pastikan Anda include 'role' di select agar data yang kembali lengkap
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ message: 'User profile updated successfully by admin', user: updatedUser });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
