import { ResponseDto } from '@gowagr/common/interface/response.interface';
import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { UpdateUserDto } from '../dto/index.dto';
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
    @GetCurrentUser('uid') uid: string,
    payload: UpdateUserDto,
  ): Promise<ResponseDto> {
    const profile = await this.userService.updateUser(uid, payload);
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }

  @Delete()
  async deleteUser(@GetCurrentUser('uid') uid: string): Promise<ResponseDto> {
    const profile = await this.userService.deleteUser(uid);
    return {
      statusCode: 200,
      message: 'success',
      data: profile,
    };
  }
}
