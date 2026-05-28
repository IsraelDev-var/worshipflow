import { Response } from 'express';
import { EventService } from '@/services/event.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import {
  CreateEventSchema,
  UpdateEventSchema,
  AssignMemberSchema,
  UpdateMemberSchema,
  RespondToAssignmentSchema,
  EventQuerySchema,
} from '@/dtos/event.dto';

export class EventController {
  static list = asyncHandler(async (req: AppRequest, res: Response) => {
    const query = EventQuerySchema.parse(req.query);
    const data = await EventService.list(req.organizationId!, query);
    res.json({ success: true, data });
  });

  static findById = asyncHandler(async (req: AppRequest, res: Response) => {
    const event = await EventService.findById(req.params.id, req.organizationId!);
    res.json({ success: true, data: event });
  });

  static create = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateEventSchema.parse(req.body);
    const event = await EventService.create(dto, req.userId!, req.organizationId!);
    res.status(201).json({ success: true, data: event });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateEventSchema.parse(req.body);
    const event = await EventService.update(req.params.id, dto, req.organizationId!);
    res.json({ success: true, data: event });
  });

  static delete = asyncHandler(async (req: AppRequest, res: Response) => {
    await EventService.delete(req.params.id, req.organizationId!);
    res.status(204).send();
  });

  // ── Members ───────────────────────────────────────────────────

  static assignMember = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = AssignMemberSchema.parse(req.body);
    const member = await EventService.assignMember(req.params.id, dto, req.organizationId!);
    res.status(201).json({ success: true, data: member });
  });

  static updateMember = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateMemberSchema.parse(req.body);
    const member = await EventService.updateMember(
      req.params.id,
      req.params.memberId,
      dto,
      req.organizationId!,
    );
    res.json({ success: true, data: member });
  });

  static removeMember = asyncHandler(async (req: AppRequest, res: Response) => {
    await EventService.removeMember(req.params.id, req.params.memberId, req.organizationId!);
    res.status(204).send();
  });

  static respondToAssignment = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = RespondToAssignmentSchema.parse(req.body);
    const member = await EventService.respondToAssignment(
      req.params.id,
      req.params.memberId,
      dto,
      req.userId!,
      req.organizationId!,
    );
    res.json({ success: true, data: member });
  });
}
