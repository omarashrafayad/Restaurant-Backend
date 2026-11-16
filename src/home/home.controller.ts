import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { HomeService } from './home.service.js';
import { Public } from '../auth/decorator/public.decorator.js';

@ApiTags(APi_TAGS.HOME)
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiOperation({ summary: 'Get home page featured sections' })
  @ApiResponse({ status: 200, description: 'shopByCategory, newCollections, and trendingNow' })
  @Public()
  @Get()
  async getHomeData() {
    return this.homeService.getHomeData();
  }
}
