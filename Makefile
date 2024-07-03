all:
	@sudo docker compose -f docker-compose.yml up -d
down:
	@sudo docker compose -f docker-compose.yml down
	@sudo docker system prune -a -f 
	@sudo docker volume rm $$(sudo docker volume ls -q)
stop:
	@sudo docker compose -f docker-compose.yml stop

re:
	@make down
	@make all
