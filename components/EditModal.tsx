"use client";
import { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useModalStore } from "@/store/ModalStore";
import { useBoardStore } from "@/store/BoardStore";
import TaskTypeRadioGroup from "./TaskTypeRadioGroup";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function EditModal(todo: Todo | any) {
  
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [editModalOpen, openEditModal, closeEditModal,currentTodoId,setcurrentTodoId] = useModalStore(
    (state) => [state.editModalOpen, state.openEditModal, state.closeEditModal,state.currentTodoId,state.setcurrentTodoId]
  );

  const [editTaskInput, setEditTaskInput, image, setImage, editTodo] =
    useBoardStore((state) => [
      state.editTaskInput,
      state.setEditTaskInput,
      state.image,
      state.setImage,
      state.editTodo,
    ]);

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(currentTodoId);    
    if (!editTaskInput) return;
    console.log(image);
    editTodo(currentTodoId as Todo, editTaskInput, image);
    setImage(null);
    setEditTaskInput("");
    closeEditModal();
  };

  return (
    // Use the `Transition` component at the root level
    <Transition show={editModalOpen} as={Fragment}>
      <Dialog
        as="form"
        className="relative z-10"
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 p-2"
                >
                  Edit Task
                </Dialog.Title>
                <div className="mt-2">
                  <input
                    type="text"
                    value={editTaskInput}
                    onChange={(e) => setEditTaskInput(e.target.value)}
                    className="border border-gray-300 rounded-md w-full p-5 outline-none"
                    placeholder="Enter a title for this task..."
                  />
                </div>
                <TaskTypeRadioGroup />
                <div className="mt-3">
                  <button
                    type="button"
                    className="w-full border border-gray-300 rounded-md outline-none p-5 focus-visible:ring-2
                  focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => imagePickerRef.current?.click()}
                  >
                    <PhotoIcon className="h-6 w-6 mr-2 inline-block" />
                    Upload Image
                  </button>
                  {image && (
                    <Image
                      alt="Uploaded Image"
                      width={200}
                      height={200}
                      className="w-full h-44 object-cover mt-2 filter hover:grayscale
                      transition-all duration-150 cursor-not-allowed"
                      src={URL.createObjectURL(image)}
                      onClick={() => setImage(null)}
                      priority={true}
                    />
                  )}
                  <input
                    type="file"
                    ref={imagePickerRef}
                    hidden
                    onChange={(e) => {
                      e.stopPropagation();
                      // Check if e is an image.
                      if (!e.target.files![0].type.startsWith("image/")) {
                        return;
                      }
                      setImage(e.target.files![0]);
                    }}
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={!editTaskInput}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2
                  text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible: ring-2
                  focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-300
                  disabled:cursor-not-allowed"
                  >
                    Edit Task
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}