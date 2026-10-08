cmake_minimum_required(VERSION 3.15)
project(comparison_engine)

set(CMAKE_CXX_STANDARD 17)

find_package(pybind11 REQUIRED)

pybind11_add_module(comparison_engine comparison_engine.cpp)