'use client'
import { useBoardStore } from '@/store/BoardStore';
import React from 'react';
import { useEffect } from 'react';
import {DragDropContext, DropResult, Droppable} from "react-beautiful-dnd";
import Column from './Column';

const Board = () => {

    const [getboard,board,setBoardState,updateTodoinDb] = useBoardStore((state) => [
        state.getBoard,
        state.board,
        state.setBoardState,
        state.updateTodoinDb
    ])
    useEffect(() => {
        getboard();
    },[getboard]);

    console.log("board",board);

    const handleOnDragEnd = (result:DropResult) => {
        const {destination, source, draggableId, type} = result;
        if(!destination) return;
        // if(destination.droppableId === source.droppableId && destination.index === source.index) return;
        if(type === 'column'){
          const entries = Array.from(board.columns.entries());
          const [removed] = entries.splice(source.index,1);
          entries.splice(destination.index,0,removed);
          const rearrangedColumns = new Map(entries);
          setBoardState({
              ...board,
              columns: rearrangedColumns
          })
        }

        const columns = Array.from(board.columns);
        const startColIndex = columns[Number(source.droppableId)];
        const finishColIndex = columns[Number(destination.droppableId)];

        const startCol: Column = {
          id: startColIndex[1].id,
          todos: startColIndex[1].todos,
        };
        const finishCol: Column = {
          id: finishColIndex[1].id,
          todos: finishColIndex[1].todos,
        };

        if(!startCol || !finishCol) return; 

        if(source.index === destination.index && startCol === finishCol) return;

        const newTodos = startCol.todos;
        const [todoMoved] = newTodos.splice(source.index,1);

        if(startCol.id === finishCol.id){
          newTodos.splice(destination.index,0,todoMoved);
          const newCol:Column = {
            id: startCol.id,
            todos: newTodos
          };
          const newColumns = new Map(board.columns);
          newColumns.set(startCol.id,newCol);

          setBoardState({...board,columns:newColumns});
        }
        else{
          //dragging to another column
          const finishTodos = Array.from(finishCol.todos);
          finishTodos.splice(destination.index,0,todoMoved);
          const newCol:Column = {
            id: startCol.id,
            todos: newTodos
          };
          const newColumns = new Map(board.columns);

          newColumns.set(startCol.id,newCol);
          newColumns.set(finishCol.id,{
            id: finishCol.id,
            todos: finishTodos
          });

          //update in db
          updateTodoinDb(todoMoved,finishCol.id);

          setBoardState({...board,columns:newColumns});
        }
      };

      console.log("board",board.columns.entries());
  return (
  
    <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='board' direction='horizontal' type='column'>
            {(provided) => (
                <div
                className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto '
                {...provided.droppableProps}
                ref={provided.innerRef}>
                  {Array.from(board.columns.entries()).map(([id, colunm], index) => (
              <Column key={id} id={id} todos={colunm.todos} index={index} />
            ))}
          </div>
        )}
        </Droppable>
    </DragDropContext>
  )
}

export default Board;