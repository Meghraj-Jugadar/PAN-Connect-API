import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository.js';
import { LOGGER } from '../utils/logger.js';

export class BootstrapService {
  private static validateEnvironment(): void {
    const required = ['ADMIN_ACCOUNT_EMAIL', 'ADMIN_ACCOUNT_PASSWORD', 'ADMIN_ROLE', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      LOGGER.error(`Missing required environment variables: ${missing.join(', ')}`);
      process.exit(1); 
    }
  }

  static async createAdminAccount(): Promise<void> {
    this.validateEnvironment();
    try {
      const adminEmail = process.env.ADMIN_ACCOUNT_EMAIL;
      const adminPassword = process.env.ADMIN_ACCOUNT_PASSWORD;
      const adminRole = process.env.ADMIN_ROLE;
      
      if (!adminEmail || !adminPassword || !adminRole) {
        LOGGER.error('Admin account environment variables not configured');
        return;
      }
      
      LOGGER.info('Checking for admin account...');
      
      const existingAdmin = await UserRepository.findUserByEmail(adminEmail);
      
      if (!existingAdmin.data) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await UserRepository.createUser(
          adminEmail, 
          hashedPassword, 
          adminRole,
          adminRole
        );
        LOGGER.info(`Created admin account. Email: ${adminEmail}`);
        LOGGER.info('Admin account setup completed');
      } else {
        LOGGER.info(`Admin account already exists: ${adminEmail}`);
      }
    
    } catch (error) {
      LOGGER.error('Failed to create admin account:', error);
    }
  }
}
