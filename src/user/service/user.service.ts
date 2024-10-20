import { PasswordManager } from '@gowagr/common/functions/password-manager';
import { UserEntity } from '@gowagr/server/database/entities/user.entity';
import { WalletEntity } from '@gowagr/server/database/entities/wallet.entity';
import { TransactionService } from '@gowagr/transactions/service/transactions.service';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Creates a new user and a wallet within a single transaction to maintain ACID principles.
   */
  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    return await this.userRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        try {
          this.logger.debug(
            `Creating user with data ${JSON.stringify(userData)}`,
          );

          if (!userData.email) {
            throw new BadRequestException('Email is required');
          }

          const existingUser = await this.findUserByEmail(userData.email);
          if (existingUser) {
            throw new ConflictException('User already exists');
          }

          const hashedPassword = await PasswordManager.hash(userData.password);
          let username = await this.getUserName(
            userData.firstName,
            userData.lastName,
          );

          let isUsernameTaken = true;
          while (isUsernameTaken) {
            const userWithSameUsername = await this.userRepository.findOneBy({
              username,
            });

            if (!userWithSameUsername) {
              isUsernameTaken = false;
            } else {
              // If username is taken, append a random number
              username = `${username}${Math.floor(Math.random() * 10000)}`;
            }
          }

          // Create new user entity
          const newUser = entityManager.create(UserEntity, {
            ...userData,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            username,
            email: userData.email,
            password: hashedPassword,
          });

          const savedUser = await entityManager.save(UserEntity, newUser);

          const wallet = await this.transactionService.createWallet(
            savedUser,
            entityManager,
          );

          // await this.updateUserWithWallet(savedUser.id, wallet);

          savedUser.wallet = wallet;
          savedUser.id = savedUser.id;
          await entityManager.save(UserEntity, savedUser);

          return this.sanitizeUser(savedUser) as unknown as UserEntity;
        } catch (error) {
          this.logger.error(`Failed to create user: ${error.message}`);

          if (error instanceof ConflictException) {
            throw error;
          }

          throw new BadRequestException(error.message);
        }
      },
    );
  }

  async getUserName(firstName: string, lastName: string): Promise<string> {
    let userName = `${firstName}${lastName}`.replace(/\s/g, '');

    let baseUserName = userName.toLowerCase();

    // Check if the base username already exists
    let isUserNameExist = await this.findUserByUsername(baseUserName);
    let attempts = 0;

    while (isUserNameExist) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      userName = `${baseUserName}${randomSuffix}`;
      isUserNameExist = await this.findUserByUsername(userName.toLowerCase());

      attempts++;
      if (attempts > 10) {
        throw new BadRequestException('Failed to generate a unique username');
      }
    }

    return userName;
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
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

  async findUserByUsername(username: string): Promise<UserEntity | null> {
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

  async findUserById(id: string): Promise<UserEntity> {
    try {
      this.logger.debug(`Finding user with id ${id}`);
      const user = await this.userRepository.findOneOrFail({
        where: { id },
        relations: ['wallet'],
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<null> {
    try {
      this.logger.debug(`Deleting company with id ${id}`);
      const user = await this.findUserById(id);
      await this.userRepository.delete(id);

      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    user: Partial<UserEntity>,
  ): Promise<UserEntity | undefined> {
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

  async sanitizeUser(user: UserEntity): Promise<Partial<UserEntity>> {
    try {
      if (!user) {
        return {};
      }
      const { password, ...rest } = user || {};
      return rest;
    } catch (error) {
      throw error;
    }
  }
}
