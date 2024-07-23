all:
	@docker compose up --build
down:
	@docker compose -f docker-compose.yml down
	@docker system prune -a -f
	@docker volume prune -f
	@docker network prune -f
stop:
	@docker compose -f docker-compose.yml stop

env:
	@chmod -R 667 ./data/*
	@touch .env
	@docker compose -f gen_env/docker-compose-env.yml up --build
	@docker system prune -a -f
	@docker network prune -f
	
re:
	@make down
	@make all

req:
	@sudo apt-get remove docker docker-engine docker.io containerd runc docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
	@sudo apt-get autoremove -y
	@sudo apt-get update
	@sudo apt-get install ca-certificates curl -y
	@sudo install -m 0755 -d /etc/apt/keyrings
	@sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
	@sudo chmod a+r /etc/apt/keyrings/docker.asc
	@echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $$(. /etc/os-release && echo "$$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
	@sudo apt-get update
	@sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

mp_setup:
	@git remote get-url oneRepo 2>/dev/null || git remote add oneRepo git@github.com:fZpHr/ft_transcendence_42.git
	@git remote get-url secondRepo 2>/dev/null || git remote add secondRepo git@github.com:BenjaminBerkrouber/ft_transendence.git
	@git remote get-url thirdRepo 2>/dev/null || git remote add thirdRepo git@github.com:eyJvcy/transcendence.git
	@git remote get-url fourthRepo 2>/dev/null || git remote add fourthRepo git@github.com:Ezuker/ft_transcendence.git
	@git remote get-url fiveRepo 2>/dev/null || git remote add fiveRepo git@github.com:Ehlzz/ft_transcendence.git
	@git remote get-url fiveRepo 2>/dev/null || git remote add fiveRepo git@github.com:Ehlzz/ft_transcendence.git
	@git remote -v
mp:
	@git add .
	@git commit -m "$(msg)"
	-git push origin main || git push origin main:backup_main
	-git push oneRepo main || git push oneRepo main:backup_main
	-git push secondRepo main || git push secondRepo main:backup_main
	-git push thirdRepo main || git push thirdRepo main:backup_main
	-git push fourthRepo main || git push fourthRepo main:backup_main
	-git push fiveRepo main || git push fiveRepo main:backup_main
	