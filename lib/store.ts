import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  selectedDeal: any | null; 
  setSelectedDeal: (deal: any | null) => void;
  drawerMode: 'details' | 'metrics' | 'votes' | 'chat';
  setDrawerMode: (mode: 'details' | 'metrics' | 'votes' | 'chat') => void;
  
  // Phase 5, 6 & 8 Modal states
  authModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  newDealModalOpen: boolean;
  setNewDealModalOpen: (isOpen: boolean) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (isOpen: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (isOpen: boolean) => void;
  profileUserId: string | null;
  setProfileUserId: (id: string | null) => void;
  profileTab: 'deals' | 'saved';
  setProfileTab: (tab: 'deals' | 'saved') => void;
  adminModalOpen: boolean;
  setAdminModalOpen: (isOpen: boolean) => void;
  filtersModalOpen: boolean;
  setFiltersModalOpen: (isOpen: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (isOpen: boolean) => void;
  settingsTab: 'profile' | 'notifications' | 'appearance' | 'account';
  setSettingsTab: (tab: 'profile' | 'notifications' | 'appearance' | 'account') => void;
  user: any | null;
  setUser: (user: any | null) => void;
  
  // Phase 11 Moderation Report
  reportModalOpen: boolean;
  setReportModalOpen: (isOpen: boolean) => void;
  reportTargetId: string | null;
  setReportTargetId: (id: string | null) => void;
  reportTargetType: 'deal' | 'comment' | 'user' | null;
  setReportTargetType: (type: 'deal' | 'comment' | 'user' | null) => void;
  
  // Real-time synchronization cache for Votes and Saves
  dealTemps: Record<string, number>;
  setDealTemp: (dealId: string, temp: number) => void;
  dealVotes: Record<string, number | null>;
  setDealVote: (dealId: string, vote: number | null) => void;
  savedDeals: Record<string, boolean>;
  setSavedDeal: (dealId: string, saved: boolean) => void;
  dealViews: Record<string, number>;
  setDealView: (dealId: string, views: number) => void;
  dealComments: Record<string, number>;
  setDealComment: (dealId: string, comments: number) => void;
  
  // Real-time Feed Filters
  activeFilter: 'home' | 'saved' | 'profile' | 'category';
  setActiveFilter: (filter: 'home' | 'saved' | 'profile' | 'category') => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  activeTab: 'hot' | 'new' | 'commented' | 'coupons';
  setActiveTab: (tab: 'hot' | 'new' | 'commented' | 'coupons') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
  isDarkMode: true, // Default to Dark Mode Premium
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  selectedDeal: null,
  setSelectedDeal: (deal) => set({ selectedDeal: deal }),
  
  drawerMode: 'details',
  setDrawerMode: (mode) => set({ drawerMode: mode }),

  authModalOpen: false,
  setAuthModalOpen: (isOpen) => set({ authModalOpen: isOpen }),
  
  newDealModalOpen: false,
  setNewDealModalOpen: (isOpen) => set({ newDealModalOpen: isOpen }),

  searchModalOpen: false,
  setSearchModalOpen: (isOpen) => set({ searchModalOpen: isOpen }),

  profileModalOpen: false,
  setProfileModalOpen: (isOpen) => set({ profileModalOpen: isOpen }),
  profileUserId: null,
  setProfileUserId: (id) => set({ profileUserId: id }),
  profileTab: 'deals',
  setProfileTab: (tab) => set({ profileTab: tab }),
  adminModalOpen: false,
  setAdminModalOpen: (isOpen) => set({ adminModalOpen: isOpen }),
  filtersModalOpen: false,
  setFiltersModalOpen: (isOpen) => set({ filtersModalOpen: isOpen }),
  settingsModalOpen: false,
  setSettingsModalOpen: (isOpen) => set({ settingsModalOpen: isOpen }),
  settingsTab: 'profile',
  setSettingsTab: (tab) => set({ settingsTab: tab }),
  
  user: null,
  setUser: (user) => set({ user }),

  reportModalOpen: false,
  setReportModalOpen: (isOpen) => set({ reportModalOpen: isOpen }),
  reportTargetId: null,
  setReportTargetId: (id) => set({ reportTargetId: id }),
  reportTargetType: null,
  setReportTargetType: (type) => set({ reportTargetType: type }),
  
  dealTemps: {},
  setDealTemp: (dealId, temp) => set((state) => ({ dealTemps: { ...state.dealTemps, [dealId]: temp } })),
  
  dealVotes: {},
  setDealVote: (dealId, vote) => set((state) => ({ dealVotes: { ...state.dealVotes, [dealId]: vote } })),
  
  savedDeals: {},
  setSavedDeal: (dealId, saved) => set((state) => ({ savedDeals: { ...state.savedDeals, [dealId]: saved } })),
  dealViews: {},
  setDealView: (dealId, views) => set((state) => ({ dealViews: { ...state.dealViews, [dealId]: views } })),
  dealComments: {},
  setDealComment: (dealId, comments) => set((state) => ({ dealComments: { ...state.dealComments, [dealId]: comments } })),
  
  activeFilter: 'home',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  activeTab: 'hot',
  setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'cupoferta-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        savedDeals: state.savedDeals, 
        dealVotes: state.dealVotes,
        isDarkMode: state.isDarkMode
      }),
    }
  )
);
