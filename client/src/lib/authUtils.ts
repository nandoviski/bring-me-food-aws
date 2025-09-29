"use server";

import { fakeLoggedUser } from "@/hooks/mock-data";

export async function loggedChefId() {
  const loggedChef = fakeLoggedUser();
  return loggedChef?.chef?.id;
}
