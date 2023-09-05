'use client'
import { useBoardStore } from '@/store/BoardStore';
import React from 'react';
import { useEffect } from 'react';
import {DragDropContext, DropResult, Droppable} from "react-beautiful-dnd";
import Column from './Column';

const Board = () => {

    const [getboard,board] = useBoardStore((state) => [
        state.getBoard,
        state.board
    ])
    useEffect(() => {
        getboard();
    },[getboard]);

    const handleOnDragEnd = (result:DropResult) => {
        // const {destination, source, draggableId, type} = result;
        // if(!destination) return;
        // if(destination.droppableId === source.droppableId && destination.index === source.index) return;
        // if(type === 'column'){
        //     const newColumnOrder = Array.from(board.columnOrder);
        //     newColumnOrder.splice(source.index,1);
        //     newColumnOrder.splice(destination.index,0,draggableId);
        //     const newBoard = {
        //         ...board,
        //         columnOrder: newColumnOrder
        //     }
        //     console.log(newBoard);
            return;
        }
  return (
  
    <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='board' direction='horizontal' type='column'>
            {(provided) => (
                <div
                className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto '
                {...provided.droppableProps}
                ref={provided.innerRef}>
                  {
                    Array.from(board.columns.entries()).map(([id,column] , index)=>(
                      <Column 
                      key={id}
                      id={id}
                      todos={column.todos}
                      index={index}/>
                    ))
                  }
                </div>
            )}
        </Droppable>
    </DragDropContext>
  )
}

export default Board;