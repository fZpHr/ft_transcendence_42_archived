all:
	@sudo docker swarm init
	@sudo docker compose -f docker-compose.yml up -d
	
down:
	@sudo docker swarm leave --force
	@sudo docker compose -f docker-compose.yml down
	@sudo docker system prune -a -f
	@sudo docker network prune -f

stop:
	@sudo docker compose -f docker-compose.yml stop

re:
	@make down
	@make all
