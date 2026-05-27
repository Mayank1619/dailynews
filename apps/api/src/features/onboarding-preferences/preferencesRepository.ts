/**
 * Preferences Repository - Firestore data access layer
 * Handles persistence of preference profiles and onboarding state
 */

import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "firebase-admin/firestore";
import type {
  PreferenceProfile,
  OnboardingState,
  Region
} from "./types";

export interface IPreferencesRepository {
  getPreferenceProfile(userId: string): Promise<PreferenceProfile | null>;
  getOnboardingState(userId: string): Promise<OnboardingState | null>;
  savePreferenceProfile(profile: PreferenceProfile): Promise<void>;
  updatePreferenceProfile(userId: string, updates: Partial<PreferenceProfile>): Promise<PreferenceProfile>;
  getOnboardingStateOrDefault(userId: string): Promise<OnboardingState>;
  updateOnboardingState(userId: string, state: Partial<OnboardingState>): Promise<OnboardingState>;
}

export class FirestorePreferencesRepository implements IPreferencesRepository {
  private db = getFirestore();
  private preferencesCollection = "preferences";
  private onboardingCollection = "onboarding";

  async getPreferenceProfile(userId: string): Promise<PreferenceProfile | null> {
    const docRef = doc(this.db, this.preferencesCollection, userId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as PreferenceProfile;
  }

  async getOnboardingState(userId: string): Promise<OnboardingState | null> {
    const docRef = doc(this.db, this.onboardingCollection, userId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as OnboardingState;
  }

  async savePreferenceProfile(profile: PreferenceProfile): Promise<void> {
    const docRef = doc(this.db, this.preferencesCollection, profile.userId);
    await setDoc(docRef, profile, { merge: true });
  }

  async updatePreferenceProfile(
    userId: string,
    updates: Partial<PreferenceProfile>
  ): Promise<PreferenceProfile> {
    const docRef = doc(this.db, this.preferencesCollection, userId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, updateData);

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error("Failed to update preference profile");
    }

    return updated.data() as PreferenceProfile;
  }

  async getOnboardingStateOrDefault(userId: string): Promise<OnboardingState> {
    const existing = await this.getOnboardingState(userId);
    
    if (existing) {
      return existing;
    }

    const defaultState: OnboardingState = {
      userId,
      step: 1,
      completed: false,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(this.db, this.onboardingCollection, userId);
    await setDoc(docRef, defaultState);

    return defaultState;
  }

  async updateOnboardingState(
    userId: string,
    state: Partial<OnboardingState>
  ): Promise<OnboardingState> {
    const docRef = doc(this.db, this.onboardingCollection, userId);
    const updateData = {
      ...state,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, updateData);

    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error("Failed to update onboarding state");
    }

    return updated.data() as OnboardingState;
  }
}

// Mock repository for testing
export class MockPreferencesRepository implements IPreferencesRepository {
  private profiles: Map<string, PreferenceProfile> = new Map();
  private states: Map<string, OnboardingState> = new Map();

  async getPreferenceProfile(userId: string): Promise<PreferenceProfile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async getOnboardingState(userId: string): Promise<OnboardingState | null> {
    return this.states.get(userId) ?? null;
  }

  async savePreferenceProfile(profile: PreferenceProfile): Promise<void> {
    this.profiles.set(profile.userId, profile);
  }

  async updatePreferenceProfile(
    userId: string,
    updates: Partial<PreferenceProfile>
  ): Promise<PreferenceProfile> {
    const existing = this.profiles.get(userId);
    if (!existing) {
      throw new Error("Profile not found");
    }

    const updated: PreferenceProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.profiles.set(userId, updated);
    return updated;
  }

  async getOnboardingStateOrDefault(userId: string): Promise<OnboardingState> {
    const existing = this.states.get(userId);
    
    if (existing) {
      return existing;
    }

    const defaultState: OnboardingState = {
      userId,
      step: 1,
      completed: false,
      updatedAt: new Date().toISOString()
    };

    this.states.set(userId, defaultState);
    return defaultState;
  }

  async updateOnboardingState(
    userId: string,
    state: Partial<OnboardingState>
  ): Promise<OnboardingState> {
    const existing = this.states.get(userId) ?? {
      userId,
      step: 1,
      completed: false,
      updatedAt: new Date().toISOString()
    };

    const updated: OnboardingState = {
      ...existing,
      ...state,
      updatedAt: new Date().toISOString()
    };

    this.states.set(userId, updated);
    return updated;
  }
}
