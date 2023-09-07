"use client";

import getUrl from "@/lib/getUrl";
import { useBoardStore } from "@/store/BoardStore";
import { useModalStore } from "@/store/ModalStore";
import { XCircleIcon,PencilIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { MouseEventHandler, useEffect, useState } from "react";
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "react-beautiful-dnd";
import EditModal from "./EditModal";

type Props = {
  todo: Todo;
  index: number;
  id: TypedColumn;
  innerRef: React.Ref<any>;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

const TodoCard = ({
  todo,
  index,
  id,
  innerRef,
  draggableProps,
  dragHandleProps,
}: Props) => {
  const [deleteTask, editTodo] = useBoardStore((state) => [
    state.deleteTask,
    state.editTodo,
  ]);

  const [openEditModal, openModal, currentTodoId, setcurrentTodoId] =
    useModalStore((state) => [
      state.openEditModal,
      state.openModal,
      state.currentTodoId,
      state.setcurrentTodoId,
    ]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (todo.image) {
      const fetchImage = async () => {
        const url = await getUrl(todo.image!);
        if (url) {
          setImageUrl(url.toString());
        }
      };
      fetchImage();
    }
  }, [todo]);

  const handleOpenModal = () => {
    const id = todo;
    setcurrentTodoId(id); // Use setcurrentTodoId to set the currentTodoId
    openEditModal(); // Open the edit modal
  };

  return (
    <div
    className="bg-white rounded-md space-y-2 drop-shadow-md"
    {...draggableProps}
    {...dragHandleProps}
    ref={innerRef}
  >
    <div className="p-5 flex items-center justify-between">
      <p className="flex-grow">{todo.title}</p>
      <div className="flex space-x-2">
        <button className="text-red-500 hover:text-red-600">
          <PencilIcon className="h-8 w-8" onClick={handleOpenModal} />
        </button>
        <button className="text-red-500 hover:text-red-600">
          <XCircleIcon
            className="h-8 w-8"
            onClick={() => deleteTask(index, todo, id)}
          />
        </button>
      </div>
    </div>
    {imageUrl && (
      <div className="relative h-full w-full rounded-b-md">
        <Image
          src={imageUrl}
          alt="Uploaded Image"
          width={400}
          height={200}
          className="rounded-b-md w-full object-contain"
        />
      </div>
    )}
    {/* <EditModal todo={todo} index={index} id={id} /> */}
  </div>
);
};

export default TodoCard;
