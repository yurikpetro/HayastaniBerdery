import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { isAbsolute, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { AppModule } from './app.module'

async function bootstrap() {
  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
  const uploadPath = isAbsolute(uploadDir) ? uploadDir : resolve(process.cwd(), uploadDir)

  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  })
  app.useStaticAssets(uploadPath, { prefix: '/uploads/' })

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
  console.log(`API running on http://localhost:${port}/api`)
}

bootstrap()
