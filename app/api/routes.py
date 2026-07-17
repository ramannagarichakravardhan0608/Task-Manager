from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.task import TaskCreate, TaskListResponse, TaskRead, TaskUpdate
from app.services.task_service import (
    complete_task,
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/tasks", response_model=TaskListResponse)
def read_tasks(db: Session = Depends(get_db)) -> TaskListResponse:
    tasks = list_tasks(db)
    return TaskListResponse(items=[TaskRead.model_validate(task) for task in tasks], total=len(tasks))


@router.get("/tasks/{task_id}", response_model=TaskRead)
def read_task(task_id: int, db: Session = Depends(get_db)) -> TaskRead:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskRead.model_validate(task)


@router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_new_task(payload: TaskCreate, db: Session = Depends(get_db)) -> TaskRead:
    task = create_task(db, payload)
    return TaskRead.model_validate(task)


@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_existing_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskRead:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    updated_task = update_task(db, task, payload)
    return TaskRead.model_validate(updated_task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(task_id: int, db: Session = Depends(get_db)) -> None:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    delete_task(db, task)


@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
def mark_task_complete(task_id: int, db: Session = Depends(get_db)) -> TaskRead:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskRead.model_validate(complete_task(db, task))
