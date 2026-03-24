import { z } from 'zod';
import { BUSINESS_INDUSTRY_OPTIONS } from './constants/profile.constants';

const businessIndustryValues = BUSINESS_INDUSTRY_OPTIONS.map((option) => option.value);

export const personalDataSchema = z.object({
  full_name: z.string().trim().min(2, 'Ingresá tu nombre completo.'),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s-]*$/, 'Usá solo números, espacios, + o guiones.')
    .or(z.literal(''))
});

export const businessDataSchema = z.object({
  business_name: z.string().trim().min(2, 'Ingresá el nombre de tu negocio.'),
  business_industry: z.enum(businessIndustryValues as [string, ...string[]], {
    message: 'Seleccioná un rubro válido.'
  })
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: z.string().trim().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().trim().min(8, 'Confirmá tu nueva contraseña.')
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword']
  });
