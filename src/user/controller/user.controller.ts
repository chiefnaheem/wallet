import { GetCurrentUser } from '@gowagr/common/decorators/get-current-user.decorator';
import { ResponseDto } from '@gowagr/common/interface/response.interface';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/index.dto';
import { UserService } from '../service/user.service';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth('Bearer')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile of a logged in user',
  })
  async getSelfProfile(
    @GetCurrentUser('uid', ParseUUIDPipe) uid: string,
  ): Promise<ResponseDto> {
    const profile = await this.userService.findUserById(uid);
    return {
      statusCode: 200,
      message: 'successfully fetched profile',
      data: profile,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile of a user',
  })
  async getProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDto> {
    const profile = await this.userService.findUserById(id);
    return {
      statusCode: 200,
      message: 'successfully fetched profile',
      data: profile,
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Logged in user update their profile',
  })
  async updateUser(
    @GetCurrentUser('uid') uid: string,
    payload: UpdateUserDto,
  ): Promise<ResponseDto> {
    const profile = await this.userService.updateUser(uid, payload);
    return {
      statusCode: 200,
      message: 'successfully updated user',
      data: profile,
    };
  }

  @ApiOperation({
    summary: 'Logged in user delete their profile',
  })
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
