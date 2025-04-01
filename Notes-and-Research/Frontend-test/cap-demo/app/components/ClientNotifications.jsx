"use client";

import { useFirebaseNotifications } from "../hooks/useFirebaseNotifications";
import { useMessageListener } from "../hooks/useMessageListener";

export default function ClientNotifications() {
  useFirebaseNotifications();
  useMessageListener();
  return null;
}
