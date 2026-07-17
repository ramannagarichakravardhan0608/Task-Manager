from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def list_tasks(db: Session) -> list[Task]:
    stmt = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
    return list(db.scalars(stmt).all())


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def create_task(db: Session, payload: TaskCreate) -> Task:
    task = Task(
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        priority=payload.priority.value,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, payload: TaskUpdate) -> Task:
    task.title = payload.title.strip()
    task.description = payload.description.strip() if payload.description else None
    task.priority = payload.priority.value
    task.status = payload.status.value
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def complete_task(db: Session, task: Task) -> Task:
    task.status = "completed"
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
