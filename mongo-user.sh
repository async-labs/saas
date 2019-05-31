#!/bin/bash
set -e;
# FROM: https://github.com/docker-library/mongo/issues/329#issuecomment-460858099
# a default non-root role
MONGO_NON_ROOT_ROLE="${MONGO_NON_ROOT_ROLE:-readWrite}"

if [ -n "${MONGO_NON_ROOT_USERNAME:-}" ] && [ -n "${MONGO_NON_ROOT_PASSWORD:-}" ]; then
	"${mongo[@]}" "$MONGO_INITDB_DATABASE" <<-EOJS
		db.createUser({
			user: $(_js_escape "$MONGO_NON_ROOT_USERNAME"),
			pwd: $(_js_escape "$MONGO_NON_ROOT_PASSWORD"),
			roles: [ { role: $(_js_escape "$MONGO_NON_ROOT_ROLE"), db: $(_js_escape "$MONGO_INITDB_DATABASE") } ]
			})
	EOJS
else
	# print warning or kill temporary mongo and exit non-zero
  exit 1
fi
