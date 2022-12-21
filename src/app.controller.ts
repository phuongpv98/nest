import { Controller, Post, Req, HttpCode, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(200)
  async getHello(@Req() req, @Res() res: Response): Promise<string> {
    return this.appService.getHello(req.body);
  }
}
