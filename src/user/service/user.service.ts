import { PasswordManager } from '@gowagr/common/functions/password-manager';
import { UserEntity } from '@gowagr/server/database/entities/user.entity';
import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

 

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    try {
      this.logger.debug(`Creating user with data ${JSON.stringify(user)}`);
      const existingUser = await this.findUserByEmail(user.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      const username = await this.getUserName(user.firstName, user.lastName)
      const newUser = this.userRepository.create({
        ...user,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        username,
        password: await PasswordManager.hash(user.password),
      });
      const data = await this.userRepository.save(newUser);



      return this.sanitizeUser(data)
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getUserName(firstName: string, lastName: string) {
    let userName = `${firstName}${lastName}`.replace(/\s/g, '');

    let isUserNameExist = await this.findUserByUsername(
      userName.toLowerCase(),
    );
    while (isUserNameExist) {
      const random = Math.floor(1000 + Math.random() * 9000);
      userName = `${firstName}${lastName}${random}`.replace(/\s/g, '');
      isUserNameExist = await this.findUserByUsername(
        userName.toLowerCase(),
      );
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
        where: {id},
        relations: ['wallet']
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

 

 

  async updateUser(id: string, user: Partial<UserEntity>): Promise<UserEntity | undefined> {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      throw error;
    }
  }
}
