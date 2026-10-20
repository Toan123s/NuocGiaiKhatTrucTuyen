// TV3 — Bootstrap/CORS/env dùng chung; phối hợp TV1 khi chạy Docker local và TV6 khi triển khai production.
import "reflect-metadata";
import "./config/environment";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000), "0.0.0.0");
}
bootstrap().catch(() => {
  console.error("Không khởi động được API. Kiểm tra cấu hình môi trường.");
  process.exitCode = 1;
});
