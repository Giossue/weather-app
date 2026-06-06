import { eq } from "drizzle-orm";
import { deviceProfiles, userPreferences } from "@weather-app/db";
import { db } from "../../db/client";

export const ensureDeviceProfile = async (deviceToken: string) => {
  const existing = await db.select().from(deviceProfiles).where(eq(deviceProfiles.deviceToken, deviceToken)).limit(1);
  if (existing[0]) return existing[0];

  const created = await db
    .insert(deviceProfiles)
    .values({ deviceToken })
    .onConflictDoNothing()
    .returning();

  const profile = created[0] ?? (await db.select().from(deviceProfiles).where(eq(deviceProfiles.deviceToken, deviceToken)).limit(1))[0];
  if (!profile) throw new Error("No se pudo crear el perfil del dispositivo");

  await db.insert(userPreferences).values({ deviceProfileId: profile.id }).onConflictDoNothing();
  return profile;
};
