all:
	@sudo docker compose -f docker-compose.yml up -d
	@sudo chmod -R 777 ./data/*
down:
	@sudo docker compose -f docker-compose.yml down
	@sudo docker system prune -a -f
	@sudo docker network prune -f
stop:
	@sudo docker compose -f docker-compose.yml stop

re:
	@make down
	@make all
