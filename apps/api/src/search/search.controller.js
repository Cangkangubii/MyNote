import {
  Controller,
  Dependencies,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard)
@Dependencies(SearchService)
export class SearchController {
  constructor(searchService) {
    this.searchService = searchService;
  }

  @Get()
  async search(@CurrentUser() user, @Query('q') query) {
    const data = await this.searchService.search(user.sub, query);
    return { data };
  }
}
