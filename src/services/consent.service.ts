import { storage } from "@/data/storage";

export interface ConsentStatus {
  hasResponded: boolean;
  accepted: boolean;
  timestamp?: string;
}

const CONSENT_KEY = "student_helper.consent";

export const consentService = {
  getConsent(): ConsentStatus {
    return storage.get<ConsentStatus>(CONSENT_KEY, { hasResponded: false, accepted: false });
  },

  accept(): void {
    storage.set<ConsentStatus>(CONSENT_KEY, {
      hasResponded: true,
      accepted: true,
      timestamp: new Date().toISOString(),
    });
  },

  decline(): void {
    storage.set<ConsentStatus>(CONSENT_KEY, {
      hasResponded: true,
      accepted: false,
      timestamp: new Date().toISOString(),
    });
  },

  reset(): void {
    storage.remove(CONSENT_KEY);
  },

  hasConsented(): boolean {
    const consent = this.getConsent();
    return consent.hasResponded && consent.accepted;
  },
};
