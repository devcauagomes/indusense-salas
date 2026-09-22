import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return '🚀 API InduSense a rodar com sucesso!';  }
}
