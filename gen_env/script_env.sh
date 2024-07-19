#!/bin/sh
apk add jq
vault server -config=/vault/config/config.hcl &

sleep 1

vault operator unseal BVDDQaB5bvC8JL3j5DVqRYI0jHX0cDfD4rzTi0DVNs7+
vault operator unseal WAZWCbX9ggE4URlIdeqED28NI6cjpT4/r8rYyw2KFUKI
vault operator unseal Ww+w2J+QoNyrqkcEHzTd6j+WRAKwoxKa+/LxBUDJYStT
vault login hvs.w4oPCidnWWdUPw4j5t6Gvazf
vault kv get -format=json -mount="env" "myenv" | jq -r '"\(.data.data | to_entries[] | .key + "=" + .value)"' >> .env
