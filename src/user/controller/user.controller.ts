import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseDto } from 'src/common/interface/response.interface';
import { UpdateUserDto } from '../dto/user.dto';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<ResponseDto> {
    const profile = await this.userService.findUserById(id);
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }

  @Patch()
  async updateUser(
    @GetCurrentUser('id') id: string,
    payload: UpdateUserDto,
  ): Promise<ResponseDto> {
    const profile = await this.userService.updateUser(id, payload);
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }

  @Delete(':id')
  async deleteUser(
    @GetCurrentUser('id') id: string,
    payload: UpdateUserDto,
  ): Promise<ResponseDto> {
    const profile = await this.userService.deleteUser(id);
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }

  @Public()
  @Post('create-admin')
  async createAdmin(): Promise<ResponseDto> {
    const profile = await this.userService.createAdmin();
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }
}
