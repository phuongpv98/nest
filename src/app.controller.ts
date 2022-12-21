import { Controller, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("copyByIds")
  async getHello(@Req() req): Promise<string> {
    return this.appService.getHello(req.body);
  }
}
