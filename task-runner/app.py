from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from celery_app import celery_app
from tasks.comparison.comparison import comparison
from tasks.condition.condition import condition
from tasks.import_contest_cf.import_contest_cf import import_contest_cf
from tasks.import_yandex_contest.import_yandex_contest import import_yandex_contest
app = FastAPI()

@app.post("/start/import_yandex_contest/{process_id}")
async def start_import_yandex_contest(
    process_id: str,
    file: UploadFile = File(...)
):
    if not process_id.isdigit():
        raise HTTPException(status_code=400, detail="process_id must be an integer")

    process_id_int = int(process_id)

    try:
        submission_bytes = await file.read()

        import_yandex_contest.apply_async(
            args=[process_id_int, submission_bytes],
            task_id=process_id
        )

        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error starting import_yandex_contest: {str(e)}"
        )

@app.post("/start/condition/{process_id}")
async def start_condition(
    process_id: str
):
    if not process_id.isdigit():
        raise HTTPException(status_code=400, detail="process_id must be an integer")
    
    process_id_int = int(process_id)

    try:
        condition.apply_async(args=[process_id_int], task_id=process_id)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting condition: {str(e)}")

@app.post("/start/import_contest_cf/{process_id}")
async def start_import_contest_cf(
    process_id: str,
    cf_api_key: str = Form(...),
    cf_api_secret: str = Form(...),
    cf_contest_id: str = Form(...),
    file: UploadFile = File(...)
):
    if not process_id.isdigit():
        raise HTTPException(status_code=400, detail="process_id must be an integer")
    
    process_id_int = int(process_id)

    try:
        file_bytes = await file.read() 
        import_contest_cf.apply_async(
            args=[process_id_int, cf_api_key, cf_api_secret, cf_contest_id, file_bytes],
            task_id=process_id
        )
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting import_contest_cf: {str(e)}")
    
@app.post("/start/{process_type}/{process_id}")
async def start_process(process_type: str, process_id: str):
    if not process_id.isdigit():
        raise HTTPException(status_code=400, detail="process_id must be an integer")
    process_id_int = int(process_id)
    try:
        if process_type == "comparison":
            comparison.apply_async(args=[process_id_int], task_id=process_id)
        else:
            raise HTTPException(status_code=400, detail="Unknown process type")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in {process_type} module: {str(e)}")

@app.post("/stop/{process_id}")
async def stop_process(process_id: str):
    celery_app.control.revoke(process_id, terminate=True)
    return {"status": "ok"}
