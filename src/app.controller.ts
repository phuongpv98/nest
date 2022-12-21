import { Controller, Post, Req, HttpCode, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("copyByIds")
  @HttpCode(200)
  async getHello(@Req() req): Promise<string> {
    return this.appService.getHello(req.body);
  }

  @Get()
  @HttpCode(200)
  async get(): Promise<string> {
    return "ok";
  }
}
