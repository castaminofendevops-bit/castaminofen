import { Injectable, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SetMetadata } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export function Auth(...roles: string[]) {
  const decorators = [UseGuards(AuthGuard('jwt'), RolesGuard), ApiBearerAuth()];
  if (roles.length) decorators.push(Roles(...roles));
  return applyDecorators(...decorators);
}
