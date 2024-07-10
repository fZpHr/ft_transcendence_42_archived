all:
	@sudo chmod -R 777 ./data/*
	@sudo docker compose -f docker-compose.yml up -d
down:
	@sudo docker compose -f docker-compose.yml down
	@sudo docker system prune -a -f
	@sudo docker network prune -f
stop:
	@sudo docker compose -f docker-compose.yml stop

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
	@git remote get-url secondRepo 2>/dev/null || git remote add secondRepo git@github.com:BenjaminBerkrouber/ft_transendence.git
	@git remote get-url thirdRepo 2>/dev/null || git remote add thirdRepo git@github.com:eyJvcy/transcendence.git
	@git remote get-url fourthRepo 2>/dev/null || git remote add fourthRepo git@github.com:Ezuker/ft_transcendence.git
	@git remote -v
mp:
	@git add .
	@git commit -m "$(msg)"
	@git push origin main
	@git push secondRepo main
	@git push thirdRepo main
	@git push fourthRepo main