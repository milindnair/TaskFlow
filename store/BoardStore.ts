import { ID, database, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import uploadImage from "@/lib/uploadImage";
import { create } from "zustand";

interface BoardState {
  board: Board;
  newTaskType: TypedColumn;
  setNewTaskType: (columnId: TypedColumn) => void;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoinDb: (todo: Todo, columnId: TypedColumn) => void;
  searchString: string;
  setSearchString: (searchString: string) => void;
  newTaskInput: string;
  setNewTaskInput: (newTaskInput: string) => void;
  editTaskInput: string;
    setEditTaskInput: (editTaskInput: string) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
  deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;
  editTodo: (todo: Todo, newTitle: string, newImage?: File | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  searchString: "",
  setSearchString: (searchString) => set({ searchString }),
  newTaskInput: "",
  setNewTaskInput: (newTaskInput) => set({ newTaskInput }),
    editTaskInput: "",
    setEditTaskInput: (editTaskInput) => set({ editTaskInput }),
  newTaskType: "todo",
  setNewTaskType: (newTaskType) => set({ newTaskType }),
  image: null,
  setImage: (image) => set({ image }),

  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
  setBoardState: (board) => set({ board }),

  updateTodoinDb: async (todo, columnId) => {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
  deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(useBoardStore.getState().board.columns);
    // Delete todoId from the newColumns.
    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({ board: { columns: newColumns } });
    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }
    await database.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  addTask: async (todo, columnId, image) => {
    let file: Image | undefined;
    if (image) {
      const fileUploaded = await uploadImage(image);
      file = {
        bucketId: fileUploaded?.bucketId!,
        fileId: fileUploaded?.$id!,
      };
    }
    const { $id } = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        // Include image if it exists.
        ...(file && { image: JSON.stringify(file) }),
      }
    );
    set({ newTaskInput: "" });
    set((state) => {
      const updatedColumns = new Map(state.board.columns);
      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        // Include image if it exists.
        ...(file && { image: file }),
      };
      const column = updatedColumns.get(columnId);
      if (column) {
        updatedColumns.get(columnId)?.todos.push(newTodo);
      } else {
        updatedColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      }
      return {
        board: {
          columns: updatedColumns,
        },
      };
    });
  },
  editTodo: async (todo, newTitle, newImage = null) => {
    try {
      // Fetch the existing todo item from the database.
      const existingTodo = await database.getDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
        todo.$id
      );

      if (existingTodo) {
        // Update the todo item with the new title.
        existingTodo.title = newTitle;
        

        // If newImage is provided, update the image.
        // if (newImage) {
        //   const fileUploaded = await uploadImage(newImage);
        //   console.log(fileUploaded);
        //   if (fileUploaded) {
        //     const file = {
        //       bucketId: fileUploaded.bucketId!,
        //       fileId: fileUploaded.$id!,
        //     };
        //     existingTodo.image = JSON.stringify(file);
        //   }
        // }

        // Exclude the $collectionId attribute.
        const { $collectionId, $databaseId,documentId, ...updatedTodo } = existingTodo;

        console.log(existingTodo);

        // Update the todo item document in the database.
        const res = await database.updateDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
          todo.$id,
          updatedTodo
        );

        console.log("Updated todo item:", res);

        // Update the local state if necessary.
        set((prevState) => {
            // Clone the previous state and update the specific todo item.
            const updatedBoard = {
              ...prevState.board,
              columns: new Map(prevState.board.columns),
            };
            const columnId = updatedTodo.status;
            const updatedColumn:any = {
              ...updatedBoard.columns.get(columnId),
              todos: updatedBoard.columns
                .get(columnId)
                ?.todos.map((item) =>
                  item.$id === todo.$id ? updatedTodo : item
                ),
            };
            updatedBoard.columns.set(columnId, updatedColumn);
    
            // Return the updated state.
            return {
              ...prevState,
              board: updatedBoard,
            };
          });
        }
    } catch (error) {
      console.error("Error editing todo item:", error);
      // Handle errors here if needed.
    }
  },
}));
