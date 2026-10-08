BUILD_DIR=build

.PHONY: build test clean

build:
	cmake -B $(BUILD_DIR) -S .

	cmake --build $(BUILD_DIR)

test: build
	PYTHONPATH=$(BUILD_DIR) pytest -v tests

clean:
	rm -rf $(BUILD_DIR)