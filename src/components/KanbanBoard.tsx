import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon"
import { Column, Id, Task } from "../Type";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";




const defaultCols: Column[] = [
    {
        id: "todo",
        title: "Assignments & Projects",
    },
    {
        id: "doing",
        title: "In progress",
    },
    {
        id: "done",
        title: "Completed",
    },
];


const defaultTasks: Task[] = [
    {
        id: "1",
        columnId: "todo",
        content: "BCH 404 due Dec 8",
    },
    {
        id: "2",
        columnId: "todo",
        content:
            "Research on Embryology",
    },
    {
        id: "3",
        columnId: "doing",
        content: "Community adolescent mental health",
    },
    {
        id: "4",
        columnId: "doing",
        content: "Analyze Lab Samples",
    },
    {
        id: "5",
        columnId: "done",
        content: "Obtain Samples",
    },
    {
        id: "6",
        columnId: "done",
        content: "Group meeting",
    },
    {
        id: "7",
        columnId: "done",
        content: "BCH 402 Project",
    },
    {
        id: "8",
        columnId: "todo",
        content: "Report to the Lab",
    },
    {
        id: "9",
        columnId: "todo",
        content: "Implement data validation and Visualization",
    },
    // {
    //     id: "10",
    //     columnId: "todo",
    //     content: "Design database schema",
    // },
    // {
    //     id: "11",
    //     columnId: "todo",
    //     content: "Integrate SSL web certificates into workflow",
    // },
    // {
    //     id: "12",
    //     columnId: "doing",
    //     content: "Implement error logging and monitoring",
    // },
    // {
    //     id: "13",
    //     columnId: "doing",
    //     content: "Design and implement responsive UI",
    // },
];

function KanbanBoard() {

    const [columns, setColumns] = useState<Column[]>(defaultCols);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    console.log(columns); //I left this here, not necessary

    const [tasks, setTasks] = useState<Task[]>(defaultTasks);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3 px iimplying we have to move 3px before the drag event starts.
            },
        })
    );

    return (
        <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] container" >

            <DndContext
                sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>

                <div className="m-auto flex flex-col-reverse gap-4 organizer">

                    <div className="flex gap-4  layout">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (<ColumnContainer key={col.id} column={col} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} tasks={tasks.filter((task) => task.columnId === col.id)} deleteTask={deleteTask} updateTask={updateTask} />))}
                        </SortableContext>
                    </div>

                    <button
                        onClick={() => { createNewColumn(); }}

                        // I am adding an absolute, top, left classes here to reposition the button on desktop screen
                        className="h-[60px]
        w-[350px]
        cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-red-500 hover:ring-2 flex justify-center gap-2 button">

                        <PlusIcon />
                        Add Column</button>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && <ColumnContainer column={activeColumn} deleteColumn={deleteColumn} updateColumn={updateColumn}
                            createTask={createTask} deleteTask={deleteTask} updateTask={updateTask}
                            tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                        />}
                        {
                            activeTask && <TaskCard deleteTask={deleteTask} updateTask={updateTask} task={activeTask} />
                        }
                    </DragOverlay>, document.body
                )}

            </DndContext>

        </div>
    )

    function createTask(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };

        setTasks([...tasks, newTask]);
    }

    function deleteTask(id: Id) {
        const newTasks = tasks.filter((task) => task.id !== id);

        setTasks(newTasks);
    }

    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map(task => {
            if (task.id !== id) return task;
            return { ...task, content };
        });

        setTasks(newTasks);
    }

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };

        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id: Id) {
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns);

        const newTasks = tasks.filter((t) => t.columnId != id);
        setTasks(newTasks);
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });

        setColumns(newColumns);
    }

    function onDragStart(event: DragStartEvent) {
        console.log("DRAG START", event);
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex(
                (col) => col.id === activeId
            );

            const overColumnIndex = columns.findIndex(
                (col) => col.id === overId
            );

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }



    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        // I'm dropping a Task over another  Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                const overIndex = tasks.findIndex((t) => t.id === overId);

                // Simplified approach immediately below

                // if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                //     tasks[activeIndex].columnId = tasks[overIndex].columnId;
                // }

                tasks[activeIndex].columnId = tasks[overIndex].columnId;

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";

        // I'm dropping a Task over a column
        if (isActiveATask && isOverAColumn) {

            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                tasks[activeIndex].columnId = overId;


                // Triggers a re-renndering of task because I am creating a new array!
                return arrayMove(tasks, activeIndex, activeIndex);
            });

        }


    }


    // function onDragOver (event: DragOverEvent) {
    //     // This removes our drag overlay when dragging ends
    //     setActiveColumn(null);
    //     setActiveTask(null);

    //     const { active, over } = event;
    //     if (!over) return;

    //     const activeId = active.id;
    //     const overId = over.id;

    //     if (activeId === overId) return;

    //     const isActiveATask = active.data.current?.type === "Task";
    //     const isOverATask = over.data.current?.type === "Task";

    //     if (!isActiveATask) return;

    //     //Two Possible events 

    //     // I'm dropping a Task over another Task
    //     if (isActiveATask && isOverATask) {
    //         setTasks((tasks) => {
    //             const activeIndex = tasks.findIndex((t) => t.id === activeId);

    //             const overIndex = tasks.findIndex((t) => t.id === overId);

    //             tasks[activeIndex].columnId = tasks[overIndex].columnId;

    //             return arrayMove(tasks, activeIndex, overIndex);
    //         } );
    //     }

    //     const isOverAColumn = over.data.current?.type === "Column";

    //     // I'm dropping a Task over a Column
    //     if (isActiveATask && isOverAColumn) {
    //         setTasks((tasks) => {
    //             const activeIndex = tasks.findIndex((t) => t.id === activeId);

    //             tasks[activeIndex].columnId = overId;

    //             return arrayMove(tasks, activeIndex, activeIndex);
    //         } );

    //     }

    // }
}


function generateId() {
    /* Generate a random number between 0 and 10000 */

    return Math.floor(Math.random() * 10001);
}

export default KanbanBoard