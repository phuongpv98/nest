import { Controller, Post, Req, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(200)
  async getHello(@Req() req): Promise<string> {
    return this.appService.getHello(req.body);
  }
}
