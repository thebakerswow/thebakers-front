.PHONY: dev build format preview docker-up docker-down docker-build

dev:
	docker-compose up

build:
	npm run build

format:
	npm run format

preview:
	npm run preview

docker-build:
	docker-compose build

run:
	docker-compose up -d

clean:
	docker-compose down