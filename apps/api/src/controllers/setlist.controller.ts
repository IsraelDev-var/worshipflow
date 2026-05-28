import { Response } from 'express';
import { SetlistService } from '@/services/setlist.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import {
  CreateSetlistSchema,
  UpdateSetlistSchema,
  AddSongToSetlistSchema,
  UpdateSetlistSongSchema,
  ReorderSetlistSchema,
  SetlistQuerySchema,
} from '@/dtos/setlist.dto';

export class SetlistController {
  static list = asyncHandler(async (req: AppRequest, res: Response) => {
    const query = SetlistQuerySchema.parse(req.query);
    const data = await SetlistService.list(req.organizationId!, query);
    res.json({ success: true, data });
  });

  static findById = asyncHandler(async (req: AppRequest, res: Response) => {
    const setlist = await SetlistService.findById(req.params.id, req.organizationId!);
    res.json({ success: true, data: setlist });
  });

  static create = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateSetlistSchema.parse(req.body);
    const setlist = await SetlistService.create(dto, req.userId!, req.organizationId!);
    res.status(201).json({ success: true, data: setlist });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateSetlistSchema.parse(req.body);
    const setlist = await SetlistService.update(req.params.id, dto, req.organizationId!);
    res.json({ success: true, data: setlist });
  });

  static delete = asyncHandler(async (req: AppRequest, res: Response) => {
    await SetlistService.delete(req.params.id, req.organizationId!);
    res.status(204).send();
  });

  static duplicate = asyncHandler(async (req: AppRequest, res: Response) => {
    const setlist = await SetlistService.duplicate(req.params.id, req.organizationId!);
    res.status(201).json({ success: true, data: setlist });
  });

  static publish = asyncHandler(async (req: AppRequest, res: Response) => {
    const setlist = await SetlistService.publish(req.params.id, req.organizationId!);
    res.json({ success: true, data: setlist });
  });

  // ── Songs ─────────────────────────────────────────────────────

  static addSong = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = AddSongToSetlistSchema.parse(req.body);
    const entry = await SetlistService.addSong(req.params.id, dto, req.organizationId!);
    res.status(201).json({ success: true, data: entry });
  });

  static updateSong = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateSetlistSongSchema.parse(req.body);
    const entry = await SetlistService.updateSong(
      req.params.id,
      req.params.songId,
      dto,
      req.organizationId!,
    );
    res.json({ success: true, data: entry });
  });

  static removeSong = asyncHandler(async (req: AppRequest, res: Response) => {
    await SetlistService.removeSong(req.params.id, req.params.songId, req.organizationId!);
    res.status(204).send();
  });

  static reorder = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = ReorderSetlistSchema.parse(req.body);
    const setlist = await SetlistService.reorder(req.params.id, dto, req.organizationId!);
    res.json({ success: true, data: setlist });
  });
}
