import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { SettingsService } from './settings.service.js';
import { ToggleOrdersDto, UpdateSettingsDto } from './dtos/update-settings.dto.js';

@ApiTags(APi_TAGS.SETTINGS)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Restaurant profile, contact numbers, opening hours and open/closed status' })
  @Public()
  @Get()
  getPublic() {
    return this.settingsService.getPublic();
  }

  @ApiOperation({ summary: 'Full settings (staff)' })
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get('admin')
  getAll() {
    return this.settingsService.get();
  }

  @ApiOperation({ summary: 'Update restaurant settings' })
  @Authorize(Roles.ADMIN)
  @Patch()
  update(@Body() body: UpdateSettingsDto) {
    return this.settingsService.update(body);
  }

  @ApiOperation({ summary: 'Pause / resume receiving orders (quick switch for the cashier)' })
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch('accepting-orders')
  toggleOrders(@Body() body: ToggleOrdersDto) {
    return this.settingsService.toggleOrders(body);
  }
}
