// // Authentication utilities
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { prisma } from './database.js';
// Authentication utilities
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Hash password
export const hashPassword = async (password) => {
	return bcrypt.hash(password, 12);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
	return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId, email, role) => {
	return jwt.sign(
		{ userId, email, role },
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

// Verify JWT token
export const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
};

// Create admin user if not exists
export const createAdminUser = async () => {
	try {
		const adminEmail = process.env.ADMIN_EMAIL || 'admin@quotationcrm.local';
		const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
		// Check if admin user already exists
		const existingAdmin = await prisma.user.findUnique({
			where: { email: adminEmail }
		});
    
		if (existingAdmin) {
			console.log('Admin user already exists');
			return existingAdmin;
		}
    
		// Create admin user
		const hashedPassword = await hashPassword(adminPassword);
    
		const adminUser = await prisma.user.create({
			data: {
				email: adminEmail,
				password: hashedPassword,
				name: 'System Administrator',
				role: 'ADMIN',
				isActive: true
			}
		});
    
		console.log('Admin user created successfully');
		console.log(`Email: ${adminEmail}`);
		console.log(`Password: ${adminPassword}`);
    
		return adminUser;
	} catch (error) {
		console.error('Error creating admin user:', error);
		throw error;
	}
};

// Authenticate user
export const authenticateUser = async (email, password) => {
	try {
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email }
		});
    
		if (!user) {
			return { success: false, error: 'Invalid email or password' };
		}
    
		if (!user.isActive) {
			return { success: false, error: 'Account is deactivated' };
		}
    
		// Verify password
		const isValidPassword = await verifyPassword(password, user.password);
    
		if (!isValidPassword) {
			return { success: false, error: 'Invalid email or password' };
		}
    
		// Update last login
		await prisma.user.update({
			where: { id: user.id },
			data: { lastLogin: new Date() }
		});
    
		// Generate token
		const token = generateToken(user.id, user.email, user.role);
    
		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			},
			token
		};
	} catch (error) {
		console.error('Authentication error:', error);
		return { success: false, error: 'Authentication failed' };
	}
};

// Register new user (only admin can do this)
export const registerUser = async (userData, adminUserId) => {
	try {
		// Verify admin privileges
		const adminUser = await prisma.user.findUnique({
			where: { id: adminUserId }
		});
    
		if (!adminUser || adminUser.role !== 'ADMIN') {
			return { success: false, error: 'Unauthorized: Admin access required' };
		}
    
		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: userData.email }
		});
    
		if (existingUser) {
			return { success: false, error: 'Email already exists' };
		}
    
		// Hash password
		const hashedPassword = await hashPassword(userData.password);
    
		// Create new user
		const newUser = await prisma.user.create({
			data: {
				email: userData.email,
				password: hashedPassword,
				name: userData.name,
				role: userData.role || 'USER',
				isActive: true
			}
		});
    
		return {
			success: true,
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role
			}
		};
	} catch (error) {
		console.error('Registration error:', error);
		return { success: false, error: 'Registration failed' };
	}
};

// Get user by token
export const getUserFromToken = async (token) => {
	try {
		const decoded = verifyToken(token);
    
		if (!decoded) {
			return null;
		}
    
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true
			}
		});
    
		return user?.isActive ? user : null;
	} catch (error) {
		console.error('Token verification error:', error);
		return null;
	}
};

// Change password
export const changePassword = async (userId, oldPassword, newPassword) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});
    
		if (!user) {
			return { success: false, error: 'User not found' };
		}
    
		// Verify old password
		const isValidPassword = await verifyPassword(oldPassword, user.password);
    
		if (!isValidPassword) {
			return { success: false, error: 'Invalid current password' };
		}
    
		// Hash new password
		const hashedNewPassword = await hashPassword(newPassword);
    
		// Update password
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedNewPassword }
		});
    
		return { success: true, message: 'Password changed successfully' };
	} catch (error) {
		console.error('Password change error:', error);
		return { success: false, error: 'Password change failed' };
	}
};

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// // Hash password
// export const hashPassword = async (password) => {
//   return bcrypt.hash(password, 12);
// };

// // Verify password
// export const verifyPassword = async (password, hashedPassword) => {
//   return bcrypt.compare(password, hashedPassword);
// };

// // Generate JWT token
// export const generateToken = (userId, email, role) => {
//   return jwt.sign(
//     { userId, email, role },
//     JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// // Verify JWT token
// export const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch (error) {
//     return null;
//   }
// };

// // Create admin user if not exists
// export const createAdminUser = async () => {
//   try {
//     const adminEmail = process.env.ADMIN_EMAIL || 'admin@quotationcrm.local';
//     const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
//     // Check if admin user already exists
//     const existingAdmin = await prisma.user.findUnique({
//       where: { email: adminEmail }
//     });
    
//     if (existingAdmin) {
//       console.log('Admin user already exists');
//       return existingAdmin;
//     }
    
//     // Create admin user
//     const hashedPassword = await hashPassword(adminPassword);
    
//     const adminUser = await prisma.user.create({
//       data: {
//         email: adminEmail,
//         password: hashedPassword,
//         name: 'System Administrator',
//         role: 'ADMIN',
//         isActive: true
//       }
//     });
    
//     console.log('Admin user created successfully');
//     console.log(`Email: ${adminEmail}`);
//     console.log(`Password: ${adminPassword}`);
    
//     return adminUser;
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//     throw error;
//   }
// };

// // Authenticate user
// export const authenticateUser = async (email, password) => {
//   try {
//     // Find user by email
//     const user = await prisma.user.findUnique({
//       where: { email }
//     });
    
//     if (!user) {
//       return { success: false, error: 'Invalid email or password' };
//     }
    
//     if (!user.isActive) {
//       return { success: false, error: 'Account is deactivated' };
//     }
    
//     // Verify password
//     const isValidPassword = await verifyPassword(password, user.password);
    
//     if (!isValidPassword) {
//       return { success: false, error: 'Invalid email or password' };
//     }
    
//     // Update last login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLogin: new Date() }
//     });
    
//     // Generate token
//     const token = generateToken(user.id, user.email, user.role);
    
//     return {
//       success: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role
//       },
//       token
//     };
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return { success: false, error: 'Authentication failed' };
//   }
// };

// // Register new user (only admin can do this)
// export const registerUser = async (userData, adminUserId) => {
//   try {
//     // Verify admin privileges
//     const adminUser = await prisma.user.findUnique({
//       where: { id: adminUserId }
//     });
    
//     if (!adminUser || adminUser.role !== 'ADMIN') {
//       return { success: false, error: 'Unauthorized: Admin access required' };
//     }
    
//     // Check if email already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email: userData.email }
//     });
    
//     if (existingUser) {
//       return { success: false, error: 'Email already exists' };
//     }
    
//     // Hash password
//     const hashedPassword = await hashPassword(userData.password);
    
//     // Create new user
//     const newUser = await prisma.user.create({
//       data: {
//         email: userData.email,
//         password: hashedPassword,
//         name: userData.name,
//         role: userData.role || 'USER',
//         isActive: true
//       }
//     });
    
//     return {
//       success: true,
//       user: {
//         id: newUser.id,
//         email: newUser.email,
//         name: newUser.name,
//         role: newUser.role
//       }
//     };
//   } catch (error) {
//     console.error('Registration error:', error);
//     return { success: false, error: 'Registration failed' };
//   }
// };

// // Get user by token
// export const getUserFromToken = async (token) => {
//   try {
//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       return null;
//     }
    
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true
//       }
//     });
    
//     return user?.isActive ? user : null;
//   } catch (error) {
//     console.error('Token verification error:', error);
//     return null;
//   }
// };

// // Change password
// export const changePassword = async (userId, oldPassword, newPassword) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId }
//     });
    
//     if (!user) {
//       return { success: false, error: 'User not found' };
//     }
    
//     // Verify old password
//     const isValidPassword = await verifyPassword(oldPassword, user.password);
    
//     if (!isValidPassword) {
//       return { success: false, error: 'Invalid current password' };
//     }
    
//     // Hash new password
//     const hashedNewPassword = await hashPassword(newPassword);
    
//     // Update password
//     await prisma.user.update({
//       where: { id: userId },
//       data: { password: hashedNewPassword }
//     });
    
//     return { success: true, message: 'Password changed successfully' };
//   } catch (error) {
//     console.error('Password change error:', error);
//     return { success: false, error: 'Password change failed' };
//   }
// };

// // Get all users (admin only)
// export const getAllUsers = async (adminUserId) => {
//   try {
//     // Verify admin privileges
//     const adminUser = await prisma.user.findUnique({
//       where: { id: adminUserId }
//     });
    
//     if (!adminUser || adminUser.role !== 'ADMIN') {
//       return { success: false, error: 'Unauthorized: Admin access required' };
//     }
    
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         lastLogin: true,
//         _count: {
//           select: {
//             quotations: true
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });
    
//     return { success: true, users };
//   } catch (error) {
//     console.error('Get users error:', error);
//     return { success: false, error: 'Failed to fetch users' };
//   }
// };

// // Toggle user active status (admin only)
// export const toggleUserStatus = async (userId, adminUserId) => {
//   try {
//     // Verify admin privileges
//     const adminUser = await prisma.user.findUnique({
//       where: { id: adminUserId }
//     });
    
//     if (!adminUser || adminUser.role !== 'ADMIN') {
//       return { success: false, error: 'Unauthorized: Admin access required' };
//     }
    
//     // Cannot deactivate admin
//     if (userId === adminUserId) {
//       return { success: false, error: 'Cannot deactivate admin account' };
//     }
    
//     const user = await prisma.user.findUnique({
//       where: { id: userId }
//     });
    
//     if (!user) {
//       return { success: false, error: 'User not found' };
//     }
    
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { isActive: !user.isActive }
//     });
    
//     return {
//       success: true,
//       message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
//     };
//   } catch (error) {
//     console.error('Toggle user status error:', error);
//     return { success: false, error: 'Failed to update user status' };
//   }
// };