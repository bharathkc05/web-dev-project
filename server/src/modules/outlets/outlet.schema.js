import { z } from 'zod';

export const getNearestOutletSchema = z.object({
  lat: z.coerce.number({ invalid_type_error: 'Invalid coordinates format' })
    .min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce.number({ invalid_type_error: 'Invalid coordinates format' })
    .min(-180).max(180, 'Longitude must be between -180 and 180'),
});
