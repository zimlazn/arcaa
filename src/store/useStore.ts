import { create } from 'zustand';
import { UserProfile, Couple } from '../types';
import { User } from 'firebase/auth';

interface AppState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  partnerProfile: UserProfile | null;
  couple: Couple | null;
  isLoading: boolean;
  
  setCurrentUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setPartnerProfile: (profile: UserProfile | null) => void;
  setCouple: (couple: Couple | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  userProfile: null,
  partnerProfile: null,
  couple: null,
  isLoading: true,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setPartnerProfile: (profile) => set({ partnerProfile: profile }),
  setCouple: (couple) => set({ couple: couple }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
