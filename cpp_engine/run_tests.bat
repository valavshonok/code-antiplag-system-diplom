@echo off

set pybind11_DIR=C:\Users\Vitalii\AppData\Roaming\Python\Python314\site-packages\pybind11\share\cmake\pybind11

cmake -B build -S .
cmake --build build

echo RUN TESTS

set PYTHONPATH=%cd%\build\Debug;%cd%\build\Release;%cd%\build

python -m pytest -v tests