import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { Roles, RolesGuard } from '../auth/roles.guard'

const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

@Controller('media')
export class MediaController {
  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator', 'user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${unique}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    const base =
      process.env.MEDIA_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}/uploads`
    return {
      url: `${base}/${file.filename}`,
      filename: file.filename,
    }
  }
}
