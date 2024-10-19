import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes } from 'date-fns';
import { IdentificationManager } from 'src/common/functions/identification-manager';
import { PasswordManager } from 'src/common/functions/password-manager';
import { User, UserRole } from 'src/database/entities/user.entity';
import { MailsService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailsService,
  ) {}

 

  async createUser(user: Partial<User>): Promise<User> {
    try {
      this.logger.debug(`Creating user with data ${JSON.stringify(user)}`);
      const existingUser = await this.findUserByEmail(user.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      const newUser = this.userRepository.create({
        ...user,
        isVerified: true,
        password: await PasswordManager.hash(user.password),
      });
      const data = await this.userRepository.save(newUser);



     

     

     

      return this.sanitizeUser(update) as unknown as User;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      this.logger.debug(`Finding user with email ${email}`);
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          username,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user with id ${id}`);
      const user = await this.userRepository.findOne(id);
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<null> {
    try {
      this.logger.debug(`Deleting company with id ${id}`);
      const user = await this.userRepository.findOne(id);
      await this.userRepository.delete(id);

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteAdmin(): Promise<null> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          role: UserRole.ADMIN,
        },
      });
      if (user) {
        await this.userRepository.delete(user.id);
      }

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createAdmin(): Promise<User> {
    try {
      return await this.createUser({
        email: 'karan.prajapati@aeliusventure.com',
        password: 'Karan@A123',
        name: 'Karan Prajapati',
        role: UserRole.ADMIN,
        isVerified: true,
      });
    } catch (err) {
      throw err;
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    try {
      this.logger.debug(`Updating user with id ${id}`);
      Object.assign(user, { id });
      const updatedUser = await this.userRepository.save(user);
      return this.findUserById(id);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async sanitizeUser(user: User): Promise<Partial<User>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      throw error;
    }
  }
}
