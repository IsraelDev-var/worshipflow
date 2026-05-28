import { Response } from 'express';
import { SongService } from '@/services/song.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import {
  CreateSongSchema,
  UpdateSongSchema,
  CreateSectionSchema,
  SongQuerySchema,
} from '@/dtos/song.dto';

export class SongController {
  static list = asyncHandler(async (req: AppRequest, res: Response) => {
    const query = SongQuerySchema.parse(req.query);
    const data = await SongService.list(req.organizationId!, query);
    res.json({ success: true, data });
  });

  static findById = asyncHandler(async (req: AppRequest, res: Response) => {
    const song = await SongService.findById(req.params.id, req.organizationId!);
    res.json({ success: true, data: song });
  });

  static create = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateSongSchema.parse(req.body);
    const song = await SongService.create(dto, req.userId!, req.organizationId!);
    res.status(201).json({ success: true, data: song });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateSongSchema.parse(req.body);
    const song = await SongService.update(req.params.id, dto, req.organizationId!);
    res.json({ success: true, data: song });
  });

  static delete = asyncHandler(async (req: AppRequest, res: Response) => {
    await SongService.delete(req.params.id, req.organizationId!);
    res.status(204).send();
  });

  static transpose = asyncHandler(async (req: AppRequest, res: Response) => {
    const result = await SongService.transpose(
      req.params.id,
      req.organizationId!,
      req.params.targetKey,
    );
    res.json({ success: true, data: result });
  });

  // ── Sections ──────────────────────────────────────────────────

  static getSections = asyncHandler(async (req: AppRequest, res: Response) => {
    const sections = await SongService.getSections(req.params.id, req.organizationId!);
    res.json({ success: true, data: sections });
  });

  static createSection = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateSectionSchema.parse(req.body);
    const section = await SongService.createSection(req.params.id, dto, req.organizationId!);
    res.status(201).json({ success: true, data: section });
  });

  static updateSection = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateSectionSchema.partial().parse(req.body);
    const section = await SongService.updateSection(req.params.sectionId, dto, req.organizationId!);
    res.json({ success: true, data: section });
  });

  static deleteSection = asyncHandler(async (req: AppRequest, res: Response) => {
    await SongService.deleteSection(req.params.sectionId, req.organizationId!);
    res.status(204).send();
  });
}
