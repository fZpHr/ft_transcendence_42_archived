all:
	@sudo docker compose -f ./srcs/docker-compose.yml up -d
down:
	@sudo docker compose -f ./srcs/docker-compose.yml down
	@sudo docker volume rm srcs_portainer_data
	@sudo docker rmi $$(docker images -a -q) -f

stop:
	@sudo docker compose -f ./srcs/docker-compose.yml stop

re:
	@make down
	@make all
