 import {create } from 'zustand';

 interface ModalState{
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    editModalOpen: boolean;
    openEditModal: () => void;
    closeEditModal: () => void;
    currentTodoId: Todo | null;
  setcurrentTodoId: (currentTodoId: Todo | null) => void;
 }

    export const useModalStore = create<ModalState>((set) => ({
        isOpen: false,
        editModalOpen: false,
        openModal: () => set({isOpen: true}),
        closeModal: () => set({isOpen: false}),
        openEditModal: () => set({editModalOpen: true}),
        closeEditModal: () => set({editModalOpen: false}),
         currentTodoId:null,
         setcurrentTodoId: (currentTodoId) => set({ currentTodoId }),
    }));